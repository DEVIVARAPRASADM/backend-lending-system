const express = require('express');
const router = express.Router();
const { createCustomer, getAllCustomers, getCustomerOverview } = require('../controllers/customerController');

// existing routes...

router.get('/:customer_id/overview', getCustomerOverview);  

// POST /api/v1/customers
router.post('/', createCustomer);

// GET /api/v1/customers
router.get('/', getAllCustomers);

module.exports = router;
