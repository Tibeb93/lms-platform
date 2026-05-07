const express = require('express');
const router = express.Router();
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { uploadThumbnail, uploadVideo, uploadResource } = require('../config/cloudinary');
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  uploadThumbnail: uploadCourseThumbnail, togglePublish, addSection, updateSection,
  deleteSection, addLesson, uploadLessonVideo, updateLesson, deleteLesson,
  getInstructorCourses, getFeaturedCourses, getCategories, approveCourse,
} = require('../controllers/courseController');

// Public routes
router.get('/', optionalAuth, getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/categories', getCategories);
router.get('/:slug', optionalAuth, getCourse);

// Protected routes
router.use(protect);

router.post('/', restrictTo('instructor', 'admin'), createCourse);
router.get('/instructor/my-courses', restrictTo('instructor', 'admin'), getInstructorCourses);

router.put('/:id', restrictTo('instructor', 'admin'), updateCourse);
router.delete('/:id', restrictTo('instructor', 'admin'), deleteCourse);
router.put('/:id/thumbnail', restrictTo('instructor', 'admin'), uploadThumbnail.single('thumbnail'), uploadCourseThumbnail);
router.put('/:id/publish', restrictTo('instructor', 'admin'), togglePublish);
router.put('/:id/approve', restrictTo('admin'), approveCourse);

// Section routes
router.post('/:id/sections', restrictTo('instructor', 'admin'), addSection);
router.put('/:id/sections/:sectionId', restrictTo('instructor', 'admin'), updateSection);
router.delete('/:id/sections/:sectionId', restrictTo('instructor', 'admin'), deleteSection);

// Lesson routes
router.post('/:id/sections/:sectionId/lessons', restrictTo('instructor', 'admin'), addLesson);
router.put('/:id/sections/:sectionId/lessons/:lessonId', restrictTo('instructor', 'admin'), updateLesson);
router.delete('/:id/sections/:sectionId/lessons/:lessonId', restrictTo('instructor', 'admin'), deleteLesson);
router.put(
  '/:id/sections/:sectionId/lessons/:lessonId/video',
  restrictTo('instructor', 'admin'),
  uploadVideo.single('video'),
  uploadLessonVideo
);

module.exports = router;
