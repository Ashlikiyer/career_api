const express = require('express');
const router = express.Router();
const { getSavedCareers } = require('../controllers/savedCareerController');

router.get('/', getSavedCareers);

module.exports = router;