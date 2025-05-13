const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profileController');

// Fetch the user's profile (requires authentication)
router.get('/', authMiddleware, getProfile);

// Update the user's profile (requires authentication)
router.put('/', authMiddleware, updateProfile);

module.exports = router;