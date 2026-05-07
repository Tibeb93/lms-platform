const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  createQuiz, getQuiz, submitQuiz, updateQuiz, deleteQuiz, getQuizResults,
} = require('../controllers/quizController');

router.use(protect);

router.post('/', restrictTo('instructor', 'admin'), createQuiz);
router.get('/:id', getQuiz);
router.post('/:id/submit', submitQuiz);
router.put('/:id', restrictTo('instructor', 'admin'), updateQuiz);
router.delete('/:id', restrictTo('instructor', 'admin'), deleteQuiz);
router.get('/:id/results', restrictTo('instructor', 'admin'), getQuizResults);

module.exports = router;
