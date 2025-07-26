const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

exports.createCustomer = (req, res) => {
  const { name } = req.body;
  const customer_id = uuidv4();

  const query = `INSERT INTO Customers (customer_id, name) VALUES (?, ?)`;
  db.run(query, [customer_id, name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ customer_id });
  });
};

exports.getAllCustomers = (req, res) => {
  const query = `SELECT * FROM Customers`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
};
exports.getCustomerOverview = (req, res) => {
  const { customer_id } = req.params;

  const query = `SELECT * FROM Loans WHERE customer_id = ?`;

  db.all(query, [customer_id], (err, loans) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch loans.' });
    if (!loans || loans.length === 0) return res.status(404).json({ error: 'No loans found for customer.' });

    const results = [];

    let processed = 0;
    loans.forEach((loan) => {
      db.all(`SELECT amount FROM Payments WHERE loan_id = ?`, [loan.loan_id], (err, payments) => {
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalInterest = loan.total_amount - loan.principal_amount;
        const emisLeft = Math.ceil((loan.total_amount - totalPaid) / loan.monthly_emi);

        results.push({
          loan_id: loan.loan_id,
          principal: loan.principal_amount,
          total_amount: loan.total_amount,
          total_interest: totalInterest,
          emi_amount: loan.monthly_emi,
          amount_paid: totalPaid,
          emis_left: emisLeft
        });

        processed++;
        if (processed === loans.length) {
          res.status(200).json({
            customer_id,
            total_loans: loans.length,
            loans: results
          });
        }
      });
    });
  });
};
