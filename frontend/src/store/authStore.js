import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.login(credentials);
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success(`Welcome back, ${data.user.name}!`);
          return { success: true, user: data.user };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.register(userData);
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success('Account created successfully!');
          return { success: true, user: data.user };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (e) {}
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      fetchMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const { data } = await authService.getMe();
          set({ user: data.user, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      isInstructor: () => {
        const { user } = get();
        return user?.role === 'instructor' || user?.role === 'admin';
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
