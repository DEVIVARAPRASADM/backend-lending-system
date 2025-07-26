const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/:loan_id', paymentController.recordPayment);        
router.get('/:loan_id', paymentController.getPaymentsByLoanId);    

module.exports = router;
