
import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

console.log("Tables:");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables.map(t => t.name));

console.log("\nUsers columns:");
const usersCols = db.prepare("PRAGMA table_info(users)").all();
console.log(usersCols.map(c => c.name));

console.log("\nPlans columns:");
const plansCols = db.prepare("PRAGMA table_info(plans)").all();
console.log(plansCols.map(c => c.name));
