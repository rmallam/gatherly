import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gatherly',
  password: 'admin',
  port: 5432,
});

async function run() {
  try {
    const res = await pool.query(`SELECT e.*, u.name as user_name,
            (SELECT json_agg(g.*) FROM (SELECT * FROM guests WHERE event_id = e.id ORDER BY created_at DESC LIMIT 500) g) as guests,
    'organizer' as role
             FROM events e 
             LEFT JOIN users u ON e.user_id = u.id
             ORDER BY e.created_at DESC
             LIMIT 1`);
    console.log("Created Events OK");
  } catch (e) {
    console.error("Created Events FAILED", e);
  }

  try {
    const res2 = await pool.query(`SELECT e.*, u.name as user_name,
    (SELECT json_agg(g.*) FROM (SELECT * FROM guests WHERE event_id = e.id ORDER BY created_at DESC LIMIT 500) g) as guests,
        'guest' as role,
        g.id as guest_id,
        g.rsvp,
        g.attended
             FROM events e
             LEFT JOIN users u ON e.user_id = u.id
             JOIN guests g ON g.event_id = e.id
             ORDER BY e.date DESC
             LIMIT 1`);
    console.log("Invited Events OK");
  } catch (e) {
    console.error("Invited Events FAILED", e);
  }
  process.exit(0);
}
run();
