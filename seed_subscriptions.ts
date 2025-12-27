
import { db } from "./server/db";
import { users, plans, subscriptions } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Seeding subscriptions...");

    // 1. Get users
    const allUsers = await db.select().from(users);
    let targetUser;

    if (allUsers.length === 0) {
        console.log("No users found. Creating a dummy user...");
        const [newUser] = await db.insert(users).values({
            email: "subscriber@example.com",
            password: "password123", // In real app, hash this
            first_name: "Subscriber",
            last_name: "User",
            is_active: true,
            is_admin: false,
        }).returning();
        targetUser = newUser;
    } else {
        targetUser = allUsers[0];
        console.log(`Using existing user: ${targetUser.email} (${targetUser.id})`);
    }

    // 2. Get plans
    const allPlans = await db.select().from(plans).where(eq(plans.is_active, true));
    let targetPlan;

    if (allPlans.length === 0) {
        console.warn("No active plans found! Cannot seed subscription.");
        // Optional: create a dummy plan if needed
        process.exit(1);
    } else {
        targetPlan = allPlans[0];
        console.log(`Using plan: ${targetPlan.name} (${targetPlan.id})`);
    }

    // 3. Create subscription
    // Check if user already has subscription to avoid duplicates for this test
    const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.user_id, targetUser.id));

    if (existingSub.length > 0) {
        console.log("User already has a subscription. Skipping.");
        process.exit(0);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const [newSub] = await db.insert(subscriptions).values({
        user_id: targetUser.id,
        plan_id: targetPlan.id,
        status: "active",
        current_period_start: startDate,
        current_period_end: endDate,
        cancel_at_period_end: false,
    }).returning();

    console.log("Subscription created:", newSub);
    console.log("Seeding completed successfully.");
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
