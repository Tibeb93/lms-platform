const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verificationId: {
      type: String,
      unique: true,
      default: () => uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase(),
    },
    issuedAt: { type: Date, default: Date.now },
    completionDate: Date,
    grade: String, // e.g., "Distinction", "Merit", "Pass"
    score: Number, // final quiz score if applicable
    pdfUrl: String,
    pdfPublicId: String,
    // Metadata for PDF generation
    studentName: String,
    courseName: String,
    instructorName: String,
    isValid: { type: Boolean, default: true },
    revokedAt: Date,
    revokeReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
