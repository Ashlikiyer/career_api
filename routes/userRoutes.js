const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerificationCode } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);

module.exports = router;