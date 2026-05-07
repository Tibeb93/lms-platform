import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const LearnCourse = lazy(() => import('./pages/student/LearnCourse'));
const StudentProgress = lazy(() => import('./pages/student/Progress'));
const MyCertificates = lazy(() => import('./pages/student/Certificates'));
const Wishlist = lazy(() => import('./pages/student/Wishlist'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const PaymentSuccess = lazy(() => import('./pages/student/PaymentSuccess'));
const PaymentHistory = lazy(() => import('./pages/student/PaymentHistory'));
const QuizPage = lazy(() => import('./pages/student/QuizPage'));

// Instructor pages
const InstructorDashboard = lazy(() => import('./pages/instructor/Dashboard'));
const CourseManagement = lazy(() => import('./pages/instructor/CourseManagement'));
const CourseEditor = lazy(() => import('./pages/instructor/CourseEditor'));
const InstructorAnalytics = lazy(() => import('./pages/instructor/Analytics'));
const InstructorEarnings = lazy(() => import('./pages/instructor/Earnings'));
const StudentManagement = lazy(() => import('./pages/instructor/StudentManagement'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminCourses = lazy(() => import('./pages/admin/Courses'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  const { fetchMe, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', background: '#333', color: '#fff' },
          success: { style: { background: '#10b981' } },
          error: { style: { background: '#ef4444' } },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/verify-certificate/:id" element={<VerifyCertificate />} />
          </Route>

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']} />}>
            <Route element={<DashboardLayout role="student" />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/progress" element={<StudentProgress />} />
              <Route path="/certificates" element={<MyCertificates />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<StudentProfile />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/history" element={<PaymentHistory />} />
            </Route>
            <Route path="/learn/:slug" element={<LearnCourse />} />
            <Route path="/quiz/:quizId" element={<QuizPage />} />
          </Route>

          {/* Instructor routes */}
          <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
            <Route element={<DashboardLayout role="instructor" />}>
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/instructor/courses" element={<CourseManagement />} />
              <Route path="/instructor/courses/new" element={<CourseEditor />} />
              <Route path="/instructor/courses/:id/edit" element={<CourseEditor />} />
              <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
              <Route path="/instructor/earnings" element={<InstructorEarnings />} />
              <Route path="/instructor/students" element={<StudentManagement />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout role="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
