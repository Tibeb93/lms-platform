const Discussion = require('../models/Discussion');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get discussions for a course
// @route   GET /api/discussions/:courseId
// @access  Private
exports.getCourseDiscussions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { course: req.params.courseId };
  if (req.query.lessonId) query.lesson = req.query.lessonId;

  const [discussions, total] = await Promise.all([
    Discussion.find(query)
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role')
      .skip(skip)
      .limit(limit)
      .sort({ isPinned: -1, createdAt: -1 }),
    Discussion.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: discussions.length,
    total,
    pages: Math.ceil(total / limit),
    discussions,
  });
});

// @desc    Create discussion
// @route   POST /api/discussions/:courseId
// @access  Private
exports.createDiscussion = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.create({
    course: req.params.courseId,
    lesson: req.body.lessonId,
    user: req.user.id,
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags,
  });

  const populated = await Discussion.findById(discussion._id)
    .populate('user', 'name avatar role');

  res.status(201).json({ success: true, discussion: populated });
});

// @desc    Add reply to discussion
// @route   POST /api/discussions/:courseId/:discussionId/reply
// @access  Private
exports.addReply = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.discussionId)
    .populate('user', 'name');

  if (!discussion) return next(new AppError('Discussion not found', 404));

  const reply = {
    user: req.user.id,
    content: req.body.content,
    isInstructorReply: req.user.role === 'instructor',
  };

  discussion.replies.push(reply);
  await discussion.save();

  // Notify discussion author
  if (discussion.user._id.toString() !== req.user.id) {
    await Notification.create({
      recipient: discussion.user._id,
      sender: req.user.id,
      type: 'reply_received',
      title: 'New reply to your discussion',
      message: `Someone replied to your discussion "${discussion.title}"`,
      link: `/learn/${req.params.courseId}/discussions/${discussion._id}`,
    });
  }

  const updatedDiscussion = await Discussion.findById(discussion._id)
    .populate('user', 'name avatar role')
    .populate('replies.user', 'name avatar role');

  res.status(201).json({ success: true, discussion: updatedDiscussion });
});

// @desc    Like/Unlike discussion
// @route   PUT /api/discussions/:courseId/:discussionId/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.discussionId);
  if (!discussion) return next(new AppError('Discussion not found', 404));

  const index = discussion.likes.indexOf(req.user.id);
  if (index > -1) {
    discussion.likes.splice(index, 1);
  } else {
    discussion.likes.push(req.user.id);
  }

  await discussion.save();
  res.status(200).json({ success: true, likes: discussion.likes.length });
});

// @desc    Pin/Unpin discussion (Instructor/Admin)
// @route   PUT /api/discussions/:courseId/:discussionId/pin
// @access  Private (Instructor/Admin)
exports.togglePin = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.discussionId);
  if (!discussion) return next(new AppError('Discussion not found', 404));

  discussion.isPinned = !discussion.isPinned;
  await discussion.save();

  res.status(200).json({ success: true, isPinned: discussion.isPinned });
});

// @desc    Mark discussion as resolved
// @route   PUT /api/discussions/:courseId/:discussionId/resolve
// @access  Private
exports.toggleResolve = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.discussionId);
  if (!discussion) return next(new AppError('Discussion not found', 404));

  if (discussion.user.toString() !== req.user.id && req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  discussion.isResolved = !discussion.isResolved;
  await discussion.save();

  res.status(200).json({ success: true, isResolved: discussion.isResolved });
});

// @desc    Delete discussion
// @route   DELETE /api/discussions/:courseId/:discussionId
// @access  Private
exports.deleteDiscussion = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.discussionId);
  if (!discussion) return next(new AppError('Discussion not found', 404));

  if (discussion.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  await discussion.deleteOne();
  res.status(200).json({ success: true, message: 'Discussion deleted' });
});
