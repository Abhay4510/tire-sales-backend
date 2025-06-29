const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/', companyController.getAllCompanies);

router.get('/:identifier', companyController.getCompanyById);

module.exports = router;
