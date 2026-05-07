const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { AppError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ['name', 'bio', 'headline', 'website', 'socialLinks', 'language', 'notifications', 'theme'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
});

// @desc    Upload profile image
// @route   PUT /api/users/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  // Delete old avatar from Cloudinary
  const user = await User.findById(req.user.id);
  if (user.avatar && user.avatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      avatar: {
        public_id: req.file.filename,
        url: req.file.path,
      },
    },
    { new: true }
  );

  res.status(200).json({ success: true, user: updatedUser });
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private (Student)
exports.getStudentDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId)
    .populate('enrolledCourses.course', 'title thumbnail slug totalLessons')
    .populate('certificates');

  const progressData = await Progress.find({ user: userId })
    .populate('course', 'title thumbnail slug');

  const totalCourses = user.enrolledCourses.length;
  const completedCourses = progressData.filter((p) => p.isCompleted).length;
  const totalCertificates = user.certificates.length;
  const totalWatchTime = progressData.reduce((acc, p) => acc + (p.totalWatchTime || 0), 0);

  // Recent activity
  const recentProgress = progressData
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  res.status(200).json({
    success: true,
    stats: {
      totalCourses,
      completedCourses,
      inProgressCourses: totalCourses - completedCourses,
      totalCertificates,
      totalWatchTime: Math.round(totalWatchTime / 3600), // hours
      points: user.points,
      level: user.level,
      badges: user.badges,
    },
    recentProgress,
    enrolledCourses: user.enrolledCourses,
  });
});

// @desc    Get instructor dashboard stats
// @route   GET /api/users/instructor-dashboard
// @access  Private (Instructor)
exports.getInstructorDashboard = asyncHandler(async (req, res, next) => {
  const instructorId = req.user.id;

  const courses = await Course.find({ instructor: instructorId })
    .select('title thumbnail totalStudents averageRating totalReviews isPublished createdAt');

  const totalStudents = courses.reduce((acc, c) => acc + c.totalStudents, 0);
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const totalRevenue = req.user.totalEarnings;

  // Monthly revenue (last 6 months)
  const Payment = require('../models/Payment');
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        instructor: req.user._id,
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$instructorEarnings' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalCourses,
      publishedCourses,
      totalStudents,
      totalRevenue,
      averageRating:
        courses.length > 0
          ? (courses.reduce((acc, c) => acc + c.averageRating, 0) / courses.length).toFixed(1)
          : 0,
    },
    courses,
    monthlyRevenue,
  });
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).select('-password').skip(skip).limit(limit).sort('-createdAt'),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    users,
  });
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({ success: true, user });
});

// @desc    Ban/Unban user (Admin)
// @route   PUT /api/users/:id/ban
// @access  Private (Admin)
exports.toggleBanUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  if (user.role === 'admin') return next(new AppError('Cannot ban an admin', 400));

  user.isBanned = !user.isBanned;
  user.banReason = user.isBanned ? req.body.reason : undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
    user,
  });
});

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!['student', 'instructor', 'admin'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({ success: true, user });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  if (user.role === 'admin') return next(new AppError('Cannot delete an admin', 400));

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

// @desc    Add/Remove from wishlist
// @route   PUT /api/users/wishlist/:courseId
// @access  Private
exports.toggleWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const courseId = req.params.courseId;

  const index = user.wishlist.indexOf(courseId);
  if (index > -1) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(courseId);
  }

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
    wishlist: user.wishlist,
  });
});

// @desc    Get platform analytics (Admin)
// @route   GET /api/users/admin/analytics
// @access  Private (Admin)
exports.getPlatformAnalytics = asyncHandler(async (req, res, next) => {
  const Payment = require('../models/Payment');

  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    totalRevenue,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    User.find().select('name email role createdAt avatar').sort('-createdAt').limit(10),
  ]);

  // Monthly signups
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySignups = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    recentUsers,
    monthlySignups,
  });
});
