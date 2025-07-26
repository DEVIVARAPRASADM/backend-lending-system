const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.post('/', loanController.createLoan);
router.get('/', loanController.getAllLoans);
router.get('/:loan_id/ledger', loanController.getLoanLedger);

module.exports = router;
