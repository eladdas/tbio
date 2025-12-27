
import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

console.log("Starting manual DB repair...");

// 1. Create payment_methods if not exists
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS payment_methods (
            id text PRIMARY KEY NOT NULL,
            name text NOT NULL,
            name_ar text NOT NULL,
            type text NOT NULL,
            icon text,
            is_active integer DEFAULT true NOT NULL,
            config text,
            display_order integer DEFAULT 0 NOT NULL,
            created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
    `).run();
    console.log("Verified payment_methods table.");
} catch (e) {
    console.error("Error creating payment_methods:", e.message);
}

// 2. Create paymob_transactions if not exists
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS paymob_transactions (
            id text PRIMARY KEY NOT NULL,
            user_id text NOT NULL,
            subscription_id text,
            plan_id text NOT NULL,
            paymob_order_id text,
            paymob_transaction_id text,
            amount_cents integer NOT NULL,
            currency text DEFAULT 'EGP' NOT NULL,
            status text DEFAULT 'pending' NOT NULL,
            payment_method text,
            billing_data text,
            created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON UPDATE no action ON DELETE no action,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE no action ON DELETE no action
        )
    `).run();
    console.log("Verified paymob_transactions table.");
} catch (e) {
    console.error("Error creating paymob_transactions:", e.message);
}

// 3. Create ip_limits if not exists (from 0001)
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS ip_limits (
            ip text PRIMARY KEY NOT NULL,
            count integer DEFAULT 0 NOT NULL,
            last_request_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
    `).run();
    console.log("Verified ip_limits table.");
} catch (e) {
    console.error("Error creating ip_limits:", e.message);
}

// 4. Add role to users if not exists
try {
    // Check if column exists first to avoid error
    const cols = db.prepare("PRAGMA table_info(users)").all();
    const hasRole = cols.some(c => c.name === 'role');

    if (!hasRole) {
        db.prepare("ALTER TABLE users ADD role text DEFAULT 'user' NOT NULL").run();
        console.log("Added role column to users.");
    } else {
        console.log("Role column already exists in users.");
    }
} catch (e) {
    console.error("Error adding role to users:", e.message);
}

console.log("Repair complete.");
