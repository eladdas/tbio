import Database from "better-sqlite3";
const db = new Database("sqlite.db");
try {
    db.prepare("ALTER TABLE plans ADD COLUMN description TEXT").run();
    console.log("Successfully added description column to plans table");
} catch (e: any) {
    console.log("Error or column already exists:", e.message);
}
