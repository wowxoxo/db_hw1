const sqlite3 = require('sqlite3').verbose();

// Initialize database
const db = new sqlite3.Database('./flight.db');

// Create tables and populate them
db.serialize(() => {
  // Create tables
  db.run(`
    CREATE TABLE flight (
      flight_nr TEXT,
      dept TEXT,
      dest TEXT
    );
  `);

  db.run(`
    CREATE TABLE plane (
      flight_nr TEXT,
      plane_nr TEXT
    );
  `);

  db.run(`
    CREATE TABLE type (
      plane_nr TEXT,
      type TEXT
    );
  `);

  // Insert test data
  db.run(`INSERT INTO flight VALUES ('AA89', 'BRU', 'LAX'), ('AA90', 'BRU', 'JFK'), ('UA04', 'BRU', 'LAX');`);
  db.run(`INSERT INTO plane VALUES ('AA89', 'P1078'), ('AA90', 'P1079'), ('UA04', 'P1078');`);
  db.run(`INSERT INTO type VALUES ('P1078', '747'), ('P1079', '737');`);
});

db.close(() => {
  console.log('Database setup complete.');
});
