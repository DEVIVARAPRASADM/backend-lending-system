const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.recordPayment = (req, res) => {
  const { loan_id } = req.params;
  const { amount, payment_type } = req.body;

  if (!amount || !payment_type) {
    return res.status(400).json({ error: 'Amount and payment_type are required.' });
  }

  db.get(`SELECT * FROM Loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (err || !loan) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    const payment_id = uuidv4();
    const newBalance = parseFloat(loan.total_amount) - parseFloat(amount);
    const emisLeft = Math.ceil(newBalance / loan.monthly_emi);

    db.run(
      `INSERT INTO Payments (payment_id, loan_id, amount, payment_type) VALUES (?, ?, ?, ?)`,
      [payment_id, loan_id, amount, payment_type],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to record payment.' });
        }

        db.run(
          `UPDATE Loans SET total_amount = ? WHERE loan_id = ?`,
          [newBalance, loan_id],
          function (updateErr) {
            if (updateErr) {
              return res.status(500).json({ error: 'Failed to update loan balance.' });
            }

            return res.status(200).json({
              payment_id,
              loan_id,
              message: 'Payment recorded successfully.',
              remaining_balance: newBalance.toFixed(2),
              emis_left: emisLeft
            });
          }
        );
      }
    );
  });
};

exports.getPaymentsByLoanId = (req, res) => {
  const { loan_id } = req.params;

  db.all(`SELECT * FROM Payments WHERE loan_id = ? ORDER BY created_at DESC`, [loan_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch payments.' });
    }

    return res.status(200).json({
      loan_id,
      payments: rows
    });
  });
};
