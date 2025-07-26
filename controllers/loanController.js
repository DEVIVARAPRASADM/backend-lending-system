const { v4: uuidv4 } = require('uuid');
const db = require('../db');

exports.createLoan = (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

  if (!customer_id || !loan_amount || !loan_period_years || !interest_rate_yearly) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const principal = parseFloat(loan_amount);
  const years = parseInt(loan_period_years);
  const rate = parseFloat(interest_rate_yearly);

  const interest = principal * years * (rate / 100);
  const totalAmount = principal + interest;
  const monthlyEmi = parseFloat((totalAmount / (years * 12)).toFixed(2));

  const loan_id = uuidv4();

  db.run(
    `INSERT INTO Loans (
      loan_id, customer_id, principal_amount, total_amount, interest_rate,
      loan_period_years, monthly_emi
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [loan_id, customer_id, principal, totalAmount, rate, years, monthlyEmi],
    function (err) {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).json({ error: 'Failed to create loan.' });
      }

      return res.status(201).json({
        loan_id,
        customer_id,
        total_amount_payable: totalAmount,
        monthly_emi: monthlyEmi
      });
    }
  );
};
exports.getLoanLedger = (req, res) => {
  const { loan_id } = req.params;


  db.get(`SELECT * FROM Loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (err || !loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    db.all(`SELECT * FROM Payments WHERE loan_id = ? ORDER BY payment_date ASC`, [loan_id], (err, payments) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching payments' });
      }

      const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const balanceAmount = loan.total_amount;
      const emisLeft = Math.ceil(balanceAmount / loan.monthly_emi);

      res.json({
        loan_id: loan.loan_id,
        customer_id: loan.customer_id,
        principal: loan.principal_amount,
        total_amount: loan.total_amount + amountPaid,
        monthly_emi: loan.monthly_emi,
        amount_paid: amountPaid,
        balance_amount: balanceAmount,
        emis_left: emisLeft,
        transactions: payments.map((p) => ({
          transaction_id: p.payment_id,
          date: p.payment_date,
          amount: p.amount,
          type: p.payment_type
        }))
      });
    });
  });
};
exports.getAllLoans = (req, res) => {
  db.all(`SELECT * FROM Loans`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching loans:", err);
      return res.status(500).json({ error: 'Failed to retrieve loans.' });
    }

    res.json(rows);
  });
};
