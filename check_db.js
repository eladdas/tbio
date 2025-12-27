
import Database from 'better-sqlite3';
const db = new Database('sqlite.db');

try {
    const row = db.prepare("SELECT value FROM system_settings WHERE key = 'scrapingrobot_api_key'").get();
    if (row) {
        console.log('API Key Value:', row.value);
    } else {
        console.log('API Key not found in DB');
    }
} catch (error) {
    console.error('Error reading DB:', error);
}
