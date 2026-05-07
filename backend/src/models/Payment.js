const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    stripePaymentIntentId: { type: String, unique: true, sparse: true },
    stripeSessionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'disputed'],
      default: 'pending',
    },
    paymentMethod: String,
    // Revenue split
    platformFee: { type: Number, default: 0 }, // 30% platform fee
    instructorEarnings: { type: Number, default: 0 }, // 70% to instructor
    // Refund
    refundedAt: Date,
    refundReason: String,
    refundAmount: Number,
    // Coupon
    couponCode: String,
    discountAmount: { type: Number, default: 0 },
    originalAmount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
