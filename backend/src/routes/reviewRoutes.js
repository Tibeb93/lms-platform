const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  createReview, getCourseReviews, updateReview, deleteReview, markHelpful, replyToReview,
} = require('../controllers/reviewController');

router.get('/:courseId', getCourseReviews);

router.use(protect);

router.post('/:courseId', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.put('/:id/helpful', markHelpful);
router.post('/:id/reply', restrictTo('instructor', 'admin'), replyToReview);

module.exports = router;
