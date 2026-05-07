const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendEnrollmentEmail } = require('../utils/sendEmail');

// @desc    Create Stripe checkout session
// @route   POST /api/payments/checkout/:courseId
// @access  Private
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).populate('instructor', 'name');
  if (!course) return next(new AppError('Course not found', 404));
  if (!course.isPublished) return next(new AppError('Course is not available', 400));

  // Check if already enrolled
  const user = await User.findById(req.user.id);
  const alreadyEnrolled = user.enrolledCourses.some(
    (e) => e.course.toString() === course._id.toString()
  );
  if (alreadyEnrolled) return next(new AppError('Already enrolled in this course', 400));

  const effectivePrice = course.isFree ? 0 : (course.discountPrice && course.discountExpiry > Date.now() ? course.discountPrice : course.price);

  if (effectivePrice === 0) {
    return next(new AppError('This is a free course. Use the free enrollment endpoint.', 400));
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/courses/${course.slug}`,
    customer_email: req.user.email,
    metadata: {
      courseId: course._id.toString(),
      userId: req.user.id,
      instructorId: course.instructor._id.toString(),
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.subtitle || course.description.substring(0, 200),
            images: course.thumbnail.url ? [course.thumbnail.url] : [],
          },
          unit_amount: Math.round(effectivePrice * 100), // cents
        },
        quantity: 1,
      },
    ],
  });

  // Create pending payment record
  await Payment.create({
    user: req.user.id,
    course: course._id,
    instructor: course.instructor._id,
    amount: effectivePrice,
    originalAmount: course.price,
    stripeSessionId: session.id,
    status: 'pending',
    platformFee: effectivePrice * 0.3,
    instructorEarnings: effectivePrice * 0.7,
  });

  res.status(200).json({ success: true, sessionId: session.id, url: session.url });
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
exports.stripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await handleSuccessfulPayment(session);
  }

  if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object;
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: dispute.payment_intent },
      { status: 'disputed' }
    );
  }

  res.status(200).json({ received: true });
});

// @desc    Verify payment and enroll
// @route   GET /api/payments/verify/:sessionId
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

  if (session.payment_status !== 'paid') {
    return next(new AppError('Payment not completed', 400));
  }

  const payment = await Payment.findOne({ stripeSessionId: req.params.sessionId });
  if (!payment) return next(new AppError('Payment record not found', 404));

  if (payment.status === 'completed') {
    return res.status(200).json({ success: true, message: 'Already enrolled', payment });
  }

  await handleSuccessfulPayment(session);

  res.status(200).json({ success: true, message: 'Payment verified and enrolled', payment });
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate('course', 'title thumbnail slug')
    .sort('-createdAt');

  res.status(200).json({ success: true, payments });
});

// @desc    Get instructor earnings
// @route   GET /api/payments/earnings
// @access  Private (Instructor)
exports.getInstructorEarnings = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ instructor: req.user.id, status: 'completed' })
    .populate('course', 'title thumbnail')
    .populate('user', 'name avatar')
    .sort('-createdAt');

  const totalEarnings = payments.reduce((acc, p) => acc + p.instructorEarnings, 0);
  const thisMonthEarnings = payments
    .filter((p) => {
      const now = new Date();
      const payDate = new Date(p.createdAt);
      return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear();
    })
    .reduce((acc, p) => acc + p.instructorEarnings, 0);

  res.status(200).json({
    success: true,
    totalEarnings,
    thisMonthEarnings,
    payments,
  });
});

// @desc    Refund payment (Admin)
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
exports.refundPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return next(new AppError('Payment not found', 404));
  if (payment.status !== 'completed') return next(new AppError('Payment cannot be refunded', 400));

  // Process Stripe refund
  if (payment.stripePaymentIntentId) {
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round((req.body.amount || payment.amount) * 100),
    });
  }

  payment.status = 'refunded';
  payment.refundedAt = Date.now();
  payment.refundReason = req.body.reason;
  payment.refundAmount = req.body.amount || payment.amount;
  await payment.save();

  // Remove enrollment
  await User.findByIdAndUpdate(payment.user, {
    $pull: { enrolledCourses: { course: payment.course } },
  });

  // Update instructor earnings
  await User.findByIdAndUpdate(payment.instructor, {
    $inc: { totalEarnings: -payment.instructorEarnings },
  });

  res.status(200).json({ success: true, message: 'Refund processed', payment });
});

// Helper: Handle successful payment
const handleSuccessfulPayment = async (session) => {
  const { courseId, userId, instructorId } = session.metadata;

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      status: 'completed',
      stripePaymentIntentId: session.payment_intent,
    },
    { new: true }
  );

  if (!payment) return;

  // Enroll user
  const user = await User.findById(userId);
  const alreadyEnrolled = user.enrolledCourses.some(
    (e) => e.course.toString() === courseId
  );

  if (!alreadyEnrolled) {
    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: { course: courseId } },
    });

    // Create progress record
    await Progress.create({ user: userId, course: courseId });

    // Update course student count
    await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });

    // Update instructor earnings
    await User.findByIdAndUpdate(instructorId, {
      $inc: { totalEarnings: payment.instructorEarnings },
    });

    // Send notifications
    const course = await Course.findById(courseId);
    await Notification.create({
      recipient: userId,
      type: 'payment_success',
      title: 'Payment Successful!',
      message: `You've successfully enrolled in "${course.title}"`,
      link: `/learn/${course.slug}`,
    });

    await Notification.create({
      recipient: instructorId,
      type: 'new_student',
      title: 'New Student Enrolled!',
      message: `A new student enrolled in "${course.title}"`,
      link: `/instructor/courses/${courseId}`,
    });

    // Send enrollment email
    try {
      await sendEnrollmentEmail(user, course);
    } catch (err) {
      console.error('Enrollment email failed:', err.message);
    }
  }
};
