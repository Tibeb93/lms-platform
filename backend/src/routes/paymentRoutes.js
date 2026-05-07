const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  createCheckoutSession, stripeWebhook, verifyPayment,
  getPaymentHistory, getInstructorEarnings, refundPayment,
} = require('../controllers/paymentController');

// Stripe webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.use(protect);

router.post('/checkout/:courseId', createCheckoutSession);
router.get('/verify/:sessionId', verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/earnings', restrictTo('instructor', 'admin'), getInstructorEarnings);
router.post('/:id/refund', restrictTo('admin'), refundPayment);

module.exports = router;
