const mongoose = require('mongoose');
const slugify = require('slugify');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    type: { type: String, enum: ['video', 'text', 'quiz', 'resource'], default: 'video' },
    video: {
      public_id: String,
      url: String,
      duration: Number, // in seconds
      thumbnail: String,
    },
    content: String, // for text lessons
    resources: [
      {
        name: String,
        url: String,
        public_id: String,
        type: String,
        size: Number,
      },
    ],
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    order: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    duration: { type: Number, default: 0 }, // in seconds
  },
  { timestamps: true }
);

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  order: { type: Number, default: 0 },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course title is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true },
    subtitle: { type: String, maxlength: 200 },
    description: { type: String, required: [true, 'Course description is required'] },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
        'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design', 'Graphic Design',
        'Digital Marketing', 'Business', 'Finance', 'Photography', 'Music',
        'Health & Fitness', 'Language Learning', 'Personal Development', 'Other',
      ],
    },
    subcategory: String,
    tags: [String],
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },
    language: { type: String, default: 'English' },
    thumbnail: {
      public_id: String,
      url: { type: String, default: '' },
    },
    previewVideo: {
      public_id: String,
      url: String,
      duration: Number,
    },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    discountExpiry: Date,
    isFree: { type: Boolean, default: false },
    currency: { type: String, default: 'USD' },
    sections: [sectionSchema],
    // Stats
    totalDuration: { type: Number, default: 0 }, // in seconds
    totalLessons: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    // Requirements & outcomes
    requirements: [String],
    whatYouWillLearn: [String],
    targetAudience: [String],
    // Status
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Certificate
    hasCertificate: { type: Boolean, default: true },
    completionThreshold: { type: Number, default: 80 }, // percentage
    // SEO
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Generate slug before saving
courseSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  // Calculate totals
  let totalDuration = 0;
  let totalLessons = 0;
  this.sections.forEach((section) => {
    section.lessons.forEach((lesson) => {
      totalLessons++;
      totalDuration += lesson.duration || 0;
    });
  });
  this.totalDuration = totalDuration;
  this.totalLessons = totalLessons;
});

// Virtual for effective price
courseSchema.virtual('effectivePrice').get(function () {
  if (this.isFree) return 0;
  if (this.discountPrice && this.discountExpiry && this.discountExpiry > Date.now()) {
    return this.discountPrice;
  }
  return this.price;
});

module.exports = mongoose.model('Course', courseSchema);
