import "dotenv/config";
import { db } from "../server/db";
import { users, plans } from "../shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function main() {
    console.log("Initializing database...");

    try {
        await migrate(db, { migrationsFolder: "./migrations" });
        console.log("Migrations applied successfully!");
    } catch (error) {
        console.error("Error applying migrations:", error);
        // Continue anyway as tables might exist
    }

    // 1. Seed Plans
    console.log("Checking plans...");
    const existingPlans = await db.select().from(plans);
    if (existingPlans.length === 0) {
        console.log("Creating default plans...");
        await db.insert(plans).values([
            {
                name: "Basic",
                name_ar: "أساسي",
                description: "Perfect for starters",
                price_monthly: 29,
                price_yearly: 290,
                keywords_limit: 100,
                domains_limit: 1,
                users_limit: 1,
                features: [
                    { text: "Daily Ranking Updates", included: true },
                    { text: "1 Domain", included: true },
                    { text: "100 Keywords", included: true },
                    { text: "Mobile & Desktop Tracking", included: true }
                ],
                stripe_price_id_monthly: "price_1QTSjKKnfMLk7ClZ2tN7X3gC",
                stripe_price_id_yearly: "price_1QTSjKKnfMLk7ClZ2tN7X3gD",
                is_active: true,
                is_default: true,
            },
            {
                name: "Pro",
                name_ar: "محترف",
                description: "For growing businesses",
                price_monthly: 79,
                price_yearly: 790,
                keywords_limit: 500,
                domains_limit: 5,
                users_limit: 3,
                features: [
                    { text: "Daily Ranking Updates", included: true },
                    { text: "5 Domains", included: true },
                    { text: "500 Keywords", included: true },
                    { text: "Mobile & Desktop Tracking", included: true },
                    { text: "Competitor Analysis", included: true },
                    { text: "White Label Reports", included: true }
                ],
                stripe_price_id_monthly: "price_1QTSjKKnfMLk7ClZ2tN7X3gE",
                stripe_price_id_yearly: "price_1QTSjKKnfMLk7ClZ2tN7X3gF",
                is_active: true,
                is_default: false,
            },
            {
                name: "Agency",
                name_ar: "وكالة",
                description: "For agencies and large teams",
                price_monthly: 199,
                price_yearly: 1990,
                keywords_limit: 2000,
                domains_limit: 20,
                users_limit: 10,
                features: [
                    { text: "Daily Ranking Updates", included: true },
                    { text: "20 Domains", included: true },
                    { text: "2000 Keywords", included: true },
                    { text: "Mobile & Desktop Tracking", included: true },
                    { text: "Competitor Analysis", included: true },
                    { text: "White Label Reports", included: true },
                    { text: "API Access", included: true },
                    { text: "Priority Support", included: true }
                ],
                stripe_price_id_monthly: "price_1QTSjKKnfMLk7ClZ2tN7X3gG",
                stripe_price_id_yearly: "price_1QTSjKKnfMLk7ClZ2tN7X3gH",
                is_active: true,
                is_default: false,
            },
        ]);
        console.log("Default plans created.");
    } else {
        console.log("Plans already exist.");
    }

    // 2. Seed Admin User
    console.log("Checking users...");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const existingUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existingUser.length === 0) {
        console.log(`Creating admin user (${adminEmail})...`);
        const password = process.env.ADMIN_PASSWORD || "admin123";
        const hashedPassword = await hashPassword(password);

        await db.insert(users).values({
            email: adminEmail,
            password: hashedPassword,
            first_name: "Admin",
            last_name: "User",
            is_admin: true,
            is_active: true,
        });
        console.log("Admin user created.");
    } else {
        // Ensure existing user is admin
        if (!existingUser[0].is_admin) {
            console.log(`Promoting user ${adminEmail} to admin...`);
            await db.update(users).set({ is_admin: true }).where(eq(users.email, adminEmail));
        }
        console.log("Admin user exists.");
    }

    console.log("Database initialization completed.");
}

main().catch((err) => {
    console.error("Initialization failed:", err);
    process.exit(1);
});
