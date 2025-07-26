const fs = require('fs');
const path = require('path');
const db = require('./index');

const initDb = async () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  try {
    await db.exec(schema);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

module.exports = initDb;
