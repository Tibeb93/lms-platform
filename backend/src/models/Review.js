const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 1000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reported: { type: Boolean, default: false },
    reportReason: String,
    instructorReply: {
      content: String,
      repliedAt: Date,
    },
  },
  { timestamps: true }
);

// One review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

// Update course average rating after save
reviewSchema.post('save', async function () {
  const Course = mongoose.model('Course');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { course: this.course } },
    { $group: { _id: '$course', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(this.course, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
