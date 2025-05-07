const express = require('express');
const router = express.Router();
const { getProfiles } = require('../controllers/profileController');

router.get('/', getProfiles);

module.exports = router;