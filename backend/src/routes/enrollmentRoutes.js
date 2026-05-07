const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  enrollFree, updateProgress, getCourseProgress,
  saveNote, getNotes, deleteNote,
} = require('../controllers/enrollmentController');

router.use(protect);

router.post('/:courseId', enrollFree);
router.get('/:courseId/progress', getCourseProgress);
router.put('/:courseId/progress', updateProgress);
router.get('/:courseId/notes', getNotes);
router.post('/:courseId/notes', saveNote);
router.delete('/:courseId/notes/:noteId', deleteNote);

module.exports = router;
