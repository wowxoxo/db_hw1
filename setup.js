const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./flight.db');

db.serialize(() => {
  // Drop existing tables if they exist (to reset the database)
  db.run(`DROP TABLE IF EXISTS flight;`);
  db.run(`DROP TABLE IF EXISTS plane;`);
  db.run(`DROP TABLE IF EXISTS type;`);

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

  // Insert test data into `flight`
  db.run(`
    INSERT INTO flight VALUES 
    ('AA89', 'BRU', 'LAX'), 
    ('AA90', 'BRU', 'JFK'), 
    ('UA04', 'BRU', 'LAX'), 
    ('BB12', 'LAX', 'JFK'), 
    ('CC34', 'JFK', 'BRU'),
    ('DD56', 'LAX', 'BRU');  -- Add flights with circular and non-overlapping connections
  `);

  // Insert test data into `plane`
  db.run(`
    INSERT INTO plane VALUES 
    ('AA89', 'P1078'), 
    ('AA90', 'P1079'), 
    ('UA04', 'P1078'), 
    ('BB12', 'P1080'), 
    ('CC34', 'P1081'),
    ('DD56', 'P1079');  -- Planes shared across multiple flights and some unique
  `);

  // Insert test data into `type`
  db.run(`
    INSERT INTO type VALUES 
    ('P1078', '747'), 
    ('P1079', '737'), 
    ('P1080', 'A320'), 
    ('P1081', 'A380'),
    ('P2000', 'Concorde'), -- Plane with no flights to test edge cases
    ('P3000', '757');      -- Another unused plane
  `);

  console.log('Database setup with edge case data complete.');
});

db.close();
