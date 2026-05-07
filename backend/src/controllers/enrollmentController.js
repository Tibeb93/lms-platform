const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Payment = require('../models/Payment');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendEnrollmentEmail, sendCertificateEmail } = require('../utils/sendEmail');
const { generateCertificatePDF } = require('../utils/generateCertificate');

// @desc    Enroll in free course
// @route   POST /api/enrollments/:courseId
// @access  Private
exports.enrollFree = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return next(new AppError('Course not found', 404));
  if (!course.isPublished) return next(new AppError('Course is not available', 400));
  if (!course.isFree && course.price > 0) {
    return next(new AppError('This is a paid course. Please complete payment.', 400));
  }

  const user = await User.findById(req.user.id);
  const alreadyEnrolled = user.enrolledCourses.some(
    (e) => e.course.toString() === course._id.toString()
  );

  if (alreadyEnrolled) {
    return next(new AppError('Already enrolled in this course', 400));
  }

  // Enroll user
  user.enrolledCourses.push({ course: course._id });
  await user.save({ validateBeforeSave: false });

  // Create progress record
  await Progress.create({ user: req.user.id, course: course._id });

  // Update course student count
  await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });

  // Send notification
  await Notification.create({
    recipient: req.user.id,
    type: 'enrollment',
    title: 'Enrollment Confirmed!',
    message: `You've successfully enrolled in "${course.title}"`,
    link: `/learn/${course.slug}`,
  });

  // Send email
  try {
    await sendEnrollmentEmail(user, course);
  } catch (err) {
    console.error('Enrollment email failed:', err.message);
  }

  res.status(200).json({ success: true, message: 'Enrolled successfully' });
});

// @desc    Update lesson progress
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private
exports.updateProgress = asyncHandler(async (req, res, next) => {
  const { lessonId, sectionId, watchTime, timestamp } = req.body;

  const course = await Course.findById(req.params.courseId);
  if (!course) return next(new AppError('Course not found', 404));

  let progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
  if (!progress) return next(new AppError('Not enrolled in this course', 403));

  // Mark lesson as completed
  const alreadyCompleted = progress.completedLessons.some(
    (l) => l.lesson.toString() === lessonId
  );

  if (!alreadyCompleted) {
    progress.completedLessons.push({ lesson: lessonId, watchTime });
  }

  // Update last watched
  progress.lastWatched = { lesson: lessonId, section: sectionId, timestamp: timestamp || 0, updatedAt: Date.now() };
  progress.totalWatchTime = (progress.totalWatchTime || 0) + (watchTime || 0);

  // Calculate completion percentage
  const totalLessons = course.totalLessons || 1;
  progress.completionPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);

  // Check if course is completed
  if (progress.completionPercentage >= (course.completionThreshold || 80) && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = Date.now();

    // Update user enrollment
    await User.updateOne(
      { _id: req.user.id, 'enrolledCourses.course': course._id },
      { $set: { 'enrolledCourses.$.completedAt': Date.now() } }
    );

    // Generate certificate
    await generateAndIssueCertificate(req.user, course);
  }

  await progress.save();

  // Award points for completing a lesson
  if (!alreadyCompleted) {
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });
  }

  res.status(200).json({
    success: true,
    progress: {
      completionPercentage: progress.completionPercentage,
      isCompleted: progress.isCompleted,
      completedLessons: progress.completedLessons.length,
      lastWatched: progress.lastWatched,
    },
  });
});

// @desc    Get course progress
// @route   GET /api/enrollments/:courseId/progress
// @access  Private
exports.getCourseProgress = asyncHandler(async (req, res, next) => {
  const progress = await Progress.findOne({
    user: req.user.id,
    course: req.params.courseId,
  });

  if (!progress) return next(new AppError('Not enrolled in this course', 403));

  res.status(200).json({ success: true, progress });
});

// @desc    Save note
// @route   POST /api/enrollments/:courseId/notes
// @access  Private
exports.saveNote = asyncHandler(async (req, res, next) => {
  const { lessonId, timestamp, content } = req.body;

  const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
  if (!progress) return next(new AppError('Not enrolled in this course', 403));

  progress.notes.push({ lesson: lessonId, timestamp, content });
  await progress.save();

  res.status(201).json({ success: true, note: progress.notes[progress.notes.length - 1] });
});

// @desc    Get notes for a course
// @route   GET /api/enrollments/:courseId/notes
// @access  Private
exports.getNotes = asyncHandler(async (req, res, next) => {
  const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
  if (!progress) return next(new AppError('Not enrolled in this course', 403));

  res.status(200).json({ success: true, notes: progress.notes });
});

// @desc    Delete note
// @route   DELETE /api/enrollments/:courseId/notes/:noteId
// @access  Private
exports.deleteNote = asyncHandler(async (req, res, next) => {
  const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
  if (!progress) return next(new AppError('Not enrolled in this course', 403));

  progress.notes = progress.notes.filter((n) => n._id.toString() !== req.params.noteId);
  await progress.save();

  res.status(200).json({ success: true, message: 'Note deleted' });
});

// Helper: Generate and issue certificate
const generateAndIssueCertificate = async (user, course) => {
  try {
    const populatedCourse = await Course.findById(course._id).populate('instructor', 'name');

    const certData = {
      studentName: user.name,
      courseName: course.title,
      instructorName: populatedCourse.instructor.name,
      completionDate: new Date(),
      verificationId: '',
      grade: 'Completion',
    };

    // Create certificate record first to get verificationId
    const certificate = await Certificate.create({
      user: user._id,
      course: course._id,
      instructor: course.instructor,
      completionDate: new Date(),
      studentName: user.name,
      courseName: course.title,
      instructorName: populatedCourse.instructor.name,
    });

    certData.verificationId = certificate.verificationId;

    // Generate PDF
    try {
      const { url, public_id } = await generateCertificatePDF(certData);
      certificate.pdfUrl = url;
      certificate.pdfPublicId = public_id;
      await certificate.save();
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
    }

    // Add certificate to user
    await User.findByIdAndUpdate(user._id, {
      $push: { certificates: certificate._id },
      $inc: { points: 100 },
    });

    // Send notification
    await Notification.create({
      recipient: user._id,
      type: 'certificate_issued',
      title: 'Certificate Earned!',
      message: `Congratulations! You've earned a certificate for completing "${course.title}"`,
      link: `/certificates/${certificate._id}`,
    });

    // Send email
    try {
      await sendCertificateEmail(user, course, certificate);
    } catch (emailErr) {
      console.error('Certificate email failed:', emailErr.message);
    }

    return certificate;
  } catch (err) {
    console.error('Certificate generation error:', err.message);
  }
};
