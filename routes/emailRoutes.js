const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/generate', emailController.generatePersonalizedEmail);

module.exports = router;