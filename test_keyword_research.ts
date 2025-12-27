
import { generateKeywordsWithStrategy } from "./server/keywordResearchService";
import "dotenv/config";

async function test() {
    console.log("Testing Keyword Research...");
    try {
        const result = await generateKeywordsWithStrategy(
            ["seo tools"],
            "US",
            "longtail"
        );
        console.log("Success:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Failure:", e);
    }
}
test();
