const express = require('express');
const router = express.Router();
const { getRoadmaps } = require('../controllers/roadmapController');

router.get('/', getRoadmaps);

module.exports = router;