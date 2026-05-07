const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { uploadProfileImage } = require('../config/cloudinary');
const {
  updateProfile, uploadAvatar, getStudentDashboard, getInstructorDashboard,
  getAllUsers, getUserById, toggleBanUser, updateUserRole, deleteUser,
  toggleWishlist, getPlatformAnalytics,
} = require('../controllers/userController');

router.use(protect);

router.put('/profile', updateProfile);
router.put('/avatar', uploadProfileImage.single('avatar'), uploadAvatar);
router.get('/dashboard', getStudentDashboard);
router.get('/instructor-dashboard', restrictTo('instructor', 'admin'), getInstructorDashboard);
router.put('/wishlist/:courseId', toggleWishlist);

// Admin routes
router.get('/', restrictTo('admin'), getAllUsers);
router.get('/admin/analytics', restrictTo('admin'), getPlatformAnalytics);
router.get('/:id', restrictTo('admin'), getUserById);
router.put('/:id/ban', restrictTo('admin'), toggleBanUser);
router.put('/:id/role', restrictTo('admin'), updateUserRole);
router.delete('/:id', restrictTo('admin'), deleteUser);

module.exports = router;
