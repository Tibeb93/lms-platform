const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [
      {
        lesson: { type: mongoose.Schema.Types.ObjectId },
        completedAt: { type: Date, default: Date.now },
        watchTime: Number, // seconds watched
      },
    ],
    quizAttempts: [
      {
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: Number,
        totalPoints: Number,
        percentage: Number,
        passed: Boolean,
        answers: [
          {
            question: mongoose.Schema.Types.ObjectId,
            selectedOption: mongoose.Schema.Types.ObjectId,
            isCorrect: Boolean,
          },
        ],
        attemptNumber: Number,
        startedAt: Date,
        completedAt: Date,
        timeTaken: Number, // seconds
      },
    ],
    lastWatched: {
      lesson: { type: mongoose.Schema.Types.ObjectId },
      section: { type: mongoose.Schema.Types.ObjectId },
      timestamp: { type: Number, default: 0 }, // video position in seconds
      updatedAt: { type: Date, default: Date.now },
    },
    completionPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    totalWatchTime: { type: Number, default: 0 }, // seconds
    notes: [
      {
        lesson: { type: mongoose.Schema.Types.ObjectId },
        timestamp: Number,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for fast lookups
progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
