-- Customers table
CREATE TABLE IF NOT EXISTS Customers (
  customer_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE IF NOT EXISTS Loans (
  loan_id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  principal_amount REAL NOT NULL,
  total_amount REAL NOT NULL,
  interest_rate REAL NOT NULL,
  loan_period_years INTEGER NOT NULL,
  monthly_emi REAL NOT NULL,
  status TEXT CHECK(status IN ('ACTIVE', 'CLOSED')) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS Payments (
  payment_id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_type TEXT CHECK(payment_type IN ('EMI', 'FORECLOSURE')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES Loans(loan_id)
);
