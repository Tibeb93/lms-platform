const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getCourseDiscussions, createDiscussion, addReply, toggleLike,
  togglePin, toggleResolve, deleteDiscussion,
} = require('../controllers/discussionController');

router.use(protect);

router.get('/:courseId', getCourseDiscussions);
router.post('/:courseId', createDiscussion);
router.post('/:courseId/:discussionId/reply', addReply);
router.put('/:courseId/:discussionId/like', toggleLike);
router.put('/:courseId/:discussionId/pin', restrictTo('instructor', 'admin'), togglePin);
router.put('/:courseId/:discussionId/resolve', toggleResolve);
router.delete('/:courseId/:discussionId', deleteDiscussion);

module.exports = router;
