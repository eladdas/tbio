
import { db } from "./server/db";
import { users, plans, subscriptions } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Diagnosing subscriptions...");

    // 1. Get all subscriptions
    const allSubs = await db.select().from(subscriptions);
    console.log(`Total subscriptions in DB: ${allSubs.length}`);

    if (allSubs.length === 0) {
        console.log("No subscriptions found in raw DB table.");
        process.exit(0);
    }

    // 2. Check each subscription
    for (const sub of allSubs) {
        console.log("--- Subscription ---");
        console.log(`ID: ${sub.id}`);
        console.log(`User ID: ${sub.user_id}`);
        console.log(`Plan ID: ${sub.plan_id}`);
        console.log(`Status: ${sub.status}`);

        const user = await db.select().from(users).where(eq(users.id, sub.user_id));
        console.log(`User Found: ${user.length > 0}`);

        const plan = await db.select().from(plans).where(eq(plans.id, sub.plan_id));
        console.log(`Plan Found: ${plan.length > 0}`);

        if (plan.length === 0) {
            console.error("CRITICAL: Plan ID in subscription does NOT exist in plans table!");
        }
    }
}

main().catch(console.error);
