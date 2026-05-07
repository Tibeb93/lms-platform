const Review = require('../models/Review');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create review
// @route   POST /api/reviews/:courseId
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return next(new AppError('Course not found', 404));

  // Check enrollment
  const user = await User.findById(req.user.id);
  const isEnrolled = user.enrolledCourses.some(
    (e) => e.course.toString() === course._id.toString()
  );
  if (!isEnrolled) return next(new AppError('You must be enrolled to review this course', 403));

  // Check if already reviewed
  const existingReview = await Review.findOne({ user: req.user.id, course: course._id });
  if (existingReview) return next(new AppError('You have already reviewed this course', 400));

  // Check if completed enough of the course
  const progress = await Progress.findOne({ user: req.user.id, course: course._id });
  if (!progress || progress.completionPercentage < 10) {
    return next(new AppError('Please complete at least 10% of the course before reviewing', 400));
  }

  const review = await Review.create({
    user: req.user.id,
    course: course._id,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
    isVerifiedPurchase: true,
  });

  // Notify instructor
  await Notification.create({
    recipient: course.instructor,
    sender: req.user.id,
    type: 'review_received',
    title: 'New Review Received',
    message: `${user.name} left a ${req.body.rating}-star review on "${course.title}"`,
    link: `/instructor/courses/${course._id}/reviews`,
  });

  const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

  res.status(201).json({ success: true, review: populatedReview });
});

// @desc    Get course reviews
// @route   GET /api/reviews/:courseId
// @access  Public
exports.getCourseReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { course: req.params.courseId };
  if (req.query.rating) query.rating = parseInt(req.query.rating);

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name avatar')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt'),
    Review.countDocuments(query),
  ]);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { course: require('mongoose').Types.ObjectId.createFromHexString(req.params.courseId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    distribution,
    reviews,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  if (review.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this review', 403));
  }

  const allowedUpdates = ['rating', 'title', 'comment'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) review[field] = req.body[field];
  });

  await review.save();
  res.status(200).json({ success: true, review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  const index = review.helpful.indexOf(req.user.id);
  if (index > -1) {
    review.helpful.splice(index, 1);
  } else {
    review.helpful.push(req.user.id);
  }

  await review.save();
  res.status(200).json({ success: true, helpfulCount: review.helpful.length });
});

// @desc    Instructor reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private (Instructor)
exports.replyToReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate('course');
  if (!review) return next(new AppError('Review not found', 404));

  if (review.course.instructor.toString() !== req.user.id) {
    return next(new AppError('Not authorized', 403));
  }

  review.instructorReply = { content: req.body.content, repliedAt: Date.now() };
  await review.save();

  // Notify reviewer
  await Notification.create({
    recipient: review.user,
    sender: req.user.id,
    type: 'reply_received',
    title: 'Instructor replied to your review',
    message: `The instructor replied to your review on "${review.course.title}"`,
    link: `/courses/${review.course.slug}#reviews`,
  });

  res.status(200).json({ success: true, review });
});
