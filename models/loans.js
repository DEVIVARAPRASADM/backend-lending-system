const db = require("./db");
const { v4: uuidv4 } = require("uuid");

function createLoan(data, callback) {
  const loan_id = uuidv4();
  const totalAmount = data.principal_amount + (data.principal_amount * data.interest_rate * data.loan_period_years) / 100;
  const monthlyEMI = totalAmount / (data.loan_period_years * 12);

  const sql = `
    INSERT INTO Loans (
      loan_id, customer_id, principal_amount, total_amount, interest_rate,
      loan_period_years, monthly_emi, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    loan_id,
    data.customer_id,
    data.principal_amount,
    totalAmount,
    data.interest_rate,
    data.loan_period_years,
    monthlyEMI,
    'ACTIVE',
  ];

  db.run(sql, values, function (err) {
    callback(err, { loan_id });
  });
}

module.exports = { createLoan };
