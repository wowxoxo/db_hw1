const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./flight.db');

const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

(async () => {
  try {
    // (1a) All types of planes used on a connection from BRU
    const query1A = `
      SELECT DISTINCT t.type
      FROM flight f
      JOIN plane p ON f.flight_nr = p.flight_nr
      JOIN type t ON p.plane_nr = t.plane_nr
      WHERE f.dept = 'BRU';
    `;
    console.log('Query (1a) - Types from BRU:', await executeQuery(query1A));

    // (1b) All planes not involved in any flight
    const query1B = `
      SELECT t.plane_nr
      FROM type t
      LEFT JOIN plane p ON t.plane_nr = p.plane_nr
      WHERE p.flight_nr IS NULL;
    `;
    console.log('Query (1b) - Unused planes:', await executeQuery(query1B));

    // (1c) All types of planes involved in all flights
    // const queryC = `
    //   SELECT t.type
    //   FROM type t
    //   JOIN plane p ON t.plane_nr = p.plane_nr
    //   GROUP BY t.type
    //   HAVING COUNT(DISTINCT p.flight_nr) = (SELECT COUNT(*) FROM flight);
    // `;
    // console.log('Query (1c) - Types on all flights:', await executeQuery(queryC));
    const query1C = `
      SELECT t.type
      FROM type t
      JOIN plane p ON t.plane_nr = p.plane_nr
      GROUP BY t.type
      HAVING COUNT(DISTINCT p.flight_nr) = (SELECT COUNT(DISTINCT flight_nr) FROM flight);
    `;
    console.log('Query (1c) - Types on all flights:', await executeQuery(query1C));

    // (1d) All connections where not all plane types are used
    const query1D = `
      WITH connection_types AS (
        SELECT f.dept, f.dest, t.type
        FROM flight f
        JOIN plane p ON f.flight_nr = p.flight_nr
        JOIN type t ON p.plane_nr = t.plane_nr
      ),
      all_types AS (SELECT DISTINCT type FROM type)
      SELECT c.dept, c.dest
      FROM connection_types c
      GROUP BY c.dept, c.dest
      HAVING COUNT(DISTINCT c.type) < (SELECT COUNT(*) FROM all_types);
    `;
    console.log('Query (1d) - Connections missing some plane types:', await executeQuery(query1D));

    // (e) All flight numbers used multiple times
    // const queryE = `
    //   SELECT f.flight_nr
    //   FROM flight f
    //   GROUP BY f.flight_nr
    //   HAVING COUNT(DISTINCT CONCAT(f.dept, '-', f.dest)) > 1;
    // `;
    // console.log('Query (e) - Flights used multiple times:', await executeQuery(queryE));
    const query1E = `
      SELECT f.flight_nr
      FROM flight f
      GROUP BY f.flight_nr
      HAVING COUNT(*) > 1;
    `;
    console.log('Query (1e) - Flights used multiple times:', await executeQuery(query1E));

    // (f) All pairs of different flight numbers used on the same connection
    const query1F = `
      SELECT f1.flight_nr, f2.flight_nr
      FROM flight f1
      JOIN flight f2 ON f1.dept = f2.dept AND f1.dest = f2.dest AND f1.flight_nr < f2.flight_nr;
    `;
    console.log('Query (1f) - Flight pairs on same connection:', await executeQuery(query1F));

    // (1g) All planes with a type used at least once for every connection
    const query1G = `
    WITH all_connections AS (
        SELECT dept, dest FROM flight
        ),
    plane_types_used AS (
        SELECT DISTINCT t.type, f.dept, f.dest
        FROM type t
        JOIN plane p ON t.plane_nr = p.plane_nr
        JOIN flight f ON p.flight_nr = f.flight_nr
    ),
    valid_types AS (
        SELECT pt.type
        FROM all_connections ac
        LEFT JOIN plane_types_used pt ON ac.dept = pt.dept AND ac.dest = pt.dest
        GROUP BY pt.type
        HAVING COUNT(ac.dept) = (SELECT COUNT(*) FROM all_connections)
    )
    SELECT p.plane_nr
    FROM plane p
    JOIN type t ON p.plane_nr = t.plane_nr
    WHERE t.type IN (SELECT type FROM valid_types);

    `;
    console.log('Query (1g) - Planes used on all connections:', await executeQuery(query1G));

    // Point 2 (a) - True or false: every relational algebra expression without negation is monotone
    console.log('Point 2 (a): True. Adding tuples to input relations cannot decrease output when negation is absent.');

    // Point 2 (b) - True or false: ∩ and ∪ are redundant
    console.log('Point 2 (b): False. While ∩ and ∪ can be expressed through joins and set differences, they are not practically redundant as their absence complicates expressions.');

    // Point 3 (a) - Nodes with no incoming edges
    const query3A = `
    SELECT DISTINCT G1.A
    FROM G G1
    WHERE G1.A NOT IN (SELECT B FROM G);
    `;
    console.log('Query (3a) - Nodes with no incoming edges:', await executeQuery(query3A));

    // Point 3 (b) - Pairs (x, y) such that they point to all other nodes
    const query3B = `
    SELECT DISTINCT x.A, y.A
    FROM G x, G y
    WHERE NOT EXISTS (
      SELECT n.A
      FROM G n
      WHERE n.A NOT IN (SELECT G1.B FROM G G1 WHERE G1.A = x.A OR G1.A = y.A)
    );
  `;
    console.log('Query (3b) - Node pairs pointing to all other nodes:', await executeQuery(query3B));

    // Point 3 (c) - Pairs (x, y) with distance ≤ 4
    const query3C = `
    WITH RECURSIVE Path AS (
        SELECT A, B, 1 AS length FROM G
        UNION ALL
        SELECT p.A, g.B, p.length + 1
        FROM Path p
        JOIN G g ON p.B = g.A
        WHERE p.length < 4
    )
    SELECT DISTINCT A, B FROM Path WHERE length <= 4;
    `;
    console.log('Query (3c) - Node pairs with distance ≤ 4:', await executeQuery(query3C));

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    db.close();
  }
})();
