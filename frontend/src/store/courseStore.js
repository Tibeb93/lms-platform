import { create } from 'zustand';
import { courseService } from '../services/api';
import toast from 'react-hot-toast';

const useCourseStore = create((set, get) => ({
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  categories: [],
  isLoading: false,
  pagination: { total: 0, pages: 1, currentPage: 1 },
  filters: {
    search: '',
    category: '',
    level: '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    isFree: false,
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: { search: '', category: '', level: '', sort: 'newest', minPrice: '', maxPrice: '', isFree: false } }),

  fetchCourses: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const { data } = await courseService.getCourses({ ...filters, ...params });
      set({
        courses: data.courses,
        pagination: { total: data.total, pages: data.pages, currentPage: data.currentPage },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to load courses');
    }
  },

  fetchFeaturedCourses: async () => {
    try {
      const { data } = await courseService.getFeaturedCourses();
      set({ featuredCourses: data.courses });
    } catch (error) {
      console.error('Failed to load featured courses');
    }
  },

  fetchCourse: async (slug) => {
    set({ isLoading: true, currentCourse: null });
    try {
      const { data } = await courseService.getCourse(slug);
      set({ currentCourse: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Course not found');
      return null;
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await courseService.getCategories();
      set({ categories: data.categories });
    } catch (error) {
      console.error('Failed to load categories');
    }
  },
}));

export default useCourseStore;
