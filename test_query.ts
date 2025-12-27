
import { db } from "./server/db";
import { users, plans, subscriptions } from "./shared/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
    console.log("Testing getAllSubscriptions query...");

    try {
        const result = await db
            .select()
            .from(subscriptions)
            .innerJoin(users, eq(subscriptions.user_id, users.id))
            .innerJoin(plans, eq(subscriptions.plan_id, plans.id))
            .orderBy(desc(subscriptions.created_at));

        console.log(`Query result length: ${result.length}`);
        if (result.length > 0) {
            console.log("First row keys:", Object.keys(result[0]));
            console.log("First row:", JSON.stringify(result[0], null, 2));
        } else {
            console.log("Query returned no results.");
        }
    } catch (error) {
        console.error("Query failed:", error);
    }
}

main().catch(console.error);
