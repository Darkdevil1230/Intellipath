const express = require('express');
const router = express.Router();
const { getCareers, getCareerById } = require('../controllers/careerController');

router.get('/', getCareers);
router.get('/:id', getCareerById);

module.exports = router;
