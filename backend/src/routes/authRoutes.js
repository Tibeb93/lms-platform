const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register, login, logout, getMe, verifyEmail, resendVerification,
  forgotPassword, resetPassword, updatePassword, refreshToken,
} = require('../controllers/authController');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);
router.post('/forgot-password', body('email').isEmail(), validate, forgotPassword);
router.put('/reset-password/:token', body('password').isLength({ min: 6 }), validate, resetPassword);
router.put('/update-password', protect, updatePassword);
router.post('/refresh-token', refreshToken);

module.exports = router;
