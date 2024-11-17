const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./flight.db');

db.serialize(() => {
  // Drop existing tables if they exist (to reset the database)
  db.run(`DROP TABLE IF EXISTS flight;`);
  db.run(`DROP TABLE IF EXISTS plane;`);
  db.run(`DROP TABLE IF EXISTS type;`);
  db.run(`DROP TABLE IF EXISTS G;`); // Add table for graph queries

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

  db.run(`
    CREATE TABLE G (
      A TEXT,
      B TEXT
    ); -- Directed graph table
  `);

  // Insert test data into `flight`
  db.run(`
    INSERT INTO flight VALUES 
    ('AA89', 'BRU', 'LAX'), 
    ('AA89', 'BRU', 'JFK'), 
    ('AA90', 'BRU', 'JFK'), 
    ('UA04', 'LAX', 'JFK'), 
    ('BB12', 'JFK', 'LAX'), 
    ('CC34', 'LAX', 'BRU'),
    ('DD56', 'JFK', 'BRU');
  `);

  // Insert test data into `plane`
  db.run(`
    INSERT INTO plane VALUES 
    ('AA89', 'P1078'), 
    ('AA90', 'P1078'), 
    ('UA04', 'P1078'), 
    ('BB12', 'P1078'), 
    ('CC34', 'P1078'),
    ('DD56', 'P1078'),
    ('AA90', 'P1079'), 
    ('UA04', 'P1079');
  `);

  // Insert test data into `type`
  db.run(`
    INSERT INTO type VALUES 
    ('P1078', '747'), 
    ('P1079', '737'), 
    ('P1080', 'A320'), 
    ('P2000', 'Concorde'), 
    ('P3000', '757');
  `);

  // Insert test data into `G` for graph queries
  db.run(`
    INSERT INTO G VALUES 
    ('A', 'B'), 
    ('B', 'C'), 
    ('C', 'D'), 
    ('D', 'E'), 
    ('A', 'C'), -- Shortcut path
    ('E', 'A'), -- Cycle
    ('F', 'A'), -- Node F has no incoming edges
    ('A', 'F'), -- A now points to F
    ('E', 'F'); -- E also points to F
  `);

  console.log('Database setup complete.');
});

db.close();
