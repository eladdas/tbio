
import Database from "better-sqlite3";

const db = new Database("sqlite.db");

try {
    const info = db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run("local-user");
    console.log(`Updated ${info.changes} user(s) to admin.`);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get("local-user");
    console.log("User record:", user);
} catch (error) {
    console.error("Error updating user:", error);
}
