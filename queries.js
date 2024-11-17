const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./flight.db');

// Query execution func
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Queries
(async () => {
  try {
    // (1a) All types of planes used on a connection from BRU
    const queryA = `
      SELECT DISTINCT t.type
      FROM flight f
      JOIN plane p ON f.flight_nr = p.flight_nr
      JOIN type t ON p.plane_nr = t.plane_nr
      WHERE f.dept = 'BRU';
    `;
    console.log('Query (1a):', await executeQuery(queryA));

    // (1b) All planes not involved in any flight
    const queryB = `
      SELECT t.plane_nr
      FROM type t
      LEFT JOIN plane p ON t.plane_nr = p.plane_nr
      WHERE p.flight_nr IS NULL;
    `;
    console.log('Query (1b):', await executeQuery(queryB));

    // (1c) All types of planes involved in all flights
    const queryC = `
      SELECT t.type
      FROM type t
      JOIN plane p ON t.plane_nr = p.plane_nr
      GROUP BY t.type
      HAVING COUNT(DISTINCT p.flight_nr) = (SELECT COUNT(*) FROM flight);
    `;
    console.log('Query (1c):', await executeQuery(queryC));

    // Add other queries as needed...

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    db.close();
  }
})();
