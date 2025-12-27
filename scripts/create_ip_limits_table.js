
import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

try {
    console.log('Creating ip_limits table...');
    db.exec(`
    CREATE TABLE IF NOT EXISTS ip_limits (
      ip TEXT PRIMARY KEY NOT NULL,
      count INTEGER DEFAULT 0 NOT NULL,
      last_request_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
    );
  `);
    console.log('Table created successfully.');

    // Verify
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ip_limits'").all();
    console.log('Verification:', tables);

} catch (error) {
    console.error('Error creating table:', error);
}
