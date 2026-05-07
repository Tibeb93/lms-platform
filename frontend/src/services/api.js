import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('token', data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Auth Services ────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// ─── User Services ────────────────────────────────────────────────────────────
export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard: () => api.get('/users/dashboard'),
  getInstructorDashboard: () => api.get('/users/instructor-dashboard'),
  toggleWishlist: (courseId) => api.put(`/users/wishlist/${courseId}`),
  // Admin
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  toggleBanUser: (id, reason) => api.put(`/users/${id}/ban`, { reason }),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getPlatformAnalytics: () => api.get('/users/admin/analytics'),
};

// ─── Course Services ──────────────────────────────────────────────────────────
export const courseService = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (slug) => api.get(`/courses/${slug}`),
  getFeaturedCourses: () => api.get('/courses/featured'),
  getCategories: () => api.get('/courses/categories'),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  uploadThumbnail: (id, formData) => api.put(`/courses/${id}/thumbnail`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  togglePublish: (id) => api.put(`/courses/${id}/publish`),
  approveCourse: (id, data) => api.put(`/courses/${id}/approve`, data),
  getInstructorCourses: () => api.get('/courses/instructor/my-courses'),
  // Sections
  addSection: (courseId, data) => api.post(`/courses/${courseId}/sections`, data),
  updateSection: (courseId, sectionId, data) => api.put(`/courses/${courseId}/sections/${sectionId}`, data),
  deleteSection: (courseId, sectionId) => api.delete(`/courses/${courseId}/sections/${sectionId}`),
  // Lessons
  addLesson: (courseId, sectionId, data) => api.post(`/courses/${courseId}/sections/${sectionId}/lessons`, data),
  updateLesson: (courseId, sectionId, lessonId, data) => api.put(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, sectionId, lessonId) => api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`),
  uploadVideo: (courseId, sectionId, lessonId, formData, onProgress) =>
    api.put(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
};

// ─── Enrollment Services ──────────────────────────────────────────────────────
export const enrollmentService = {
  enrollFree: (courseId) => api.post(`/enrollments/${courseId}`),
  getProgress: (courseId) => api.get(`/enrollments/${courseId}/progress`),
  updateProgress: (courseId, data) => api.put(`/enrollments/${courseId}/progress`, data),
  getNotes: (courseId) => api.get(`/enrollments/${courseId}/notes`),
  saveNote: (courseId, data) => api.post(`/enrollments/${courseId}/notes`, data),
  deleteNote: (courseId, noteId) => api.delete(`/enrollments/${courseId}/notes/${noteId}`),
};

// ─── Payment Services ─────────────────────────────────────────────────────────
export const paymentService = {
  createCheckout: (courseId) => api.post(`/payments/checkout/${courseId}`),
  verifyPayment: (sessionId) => api.get(`/payments/verify/${sessionId}`),
  getHistory: () => api.get('/payments/history'),
  getEarnings: () => api.get('/payments/earnings'),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data),
};

// ─── Quiz Services ────────────────────────────────────────────────────────────
export const quizService = {
  createQuiz: (data) => api.post('/quizzes', data),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  submitQuiz: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  updateQuiz: (id, data) => api.put(`/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  getResults: (id) => api.get(`/quizzes/${id}/results`),
};

// ─── Review Services ──────────────────────────────────────────────────────────
export const reviewService = {
  getReviews: (courseId, params) => api.get(`/reviews/${courseId}`, { params }),
  createReview: (courseId, data) => api.post(`/reviews/${courseId}`, data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
  replyToReview: (id, content) => api.post(`/reviews/${id}/reply`, { content }),
};

// ─── Certificate Services ─────────────────────────────────────────────────────
export const certificateService = {
  getMyCertificates: () => api.get('/certificates'),
  getCertificate: (id) => api.get(`/certificates/${id}`),
  verifyCertificate: (verificationId) => api.get(`/certificates/verify/${verificationId}`),
};

// ─── Notification Services ────────────────────────────────────────────────────
export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

// ─── Discussion Services ──────────────────────────────────────────────────────
export const discussionService = {
  getDiscussions: (courseId, params) => api.get(`/discussions/${courseId}`, { params }),
  createDiscussion: (courseId, data) => api.post(`/discussions/${courseId}`, data),
  addReply: (courseId, discussionId, data) => api.post(`/discussions/${courseId}/${discussionId}/reply`, data),
  toggleLike: (courseId, discussionId) => api.put(`/discussions/${courseId}/${discussionId}/like`),
  togglePin: (courseId, discussionId) => api.put(`/discussions/${courseId}/${discussionId}/pin`),
  toggleResolve: (courseId, discussionId) => api.put(`/discussions/${courseId}/${discussionId}/resolve`),
  deleteDiscussion: (courseId, discussionId) => api.delete(`/discussions/${courseId}/${discussionId}`),
};
