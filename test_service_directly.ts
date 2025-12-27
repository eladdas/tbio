
import { checkKeywordRanking, getScrapingRobotResults } from "./server/scrapingRobotService";
import { storage } from "./server/storage";

// Mock storage to return API key
storage.getSystemSetting = async (key) => {
    if (key === 'scrapingrobot_api_key') return { id: 1, key: 'scrapingrobot_api_key', value: '1041414c-935d-48d6-a5e8-f4f6301a07bb' };
    return undefined;
};

async function test() {
    console.log("Testing checkKeywordRanking...");
    const mockKeyword = {
        id: "test-1",
        keyword: "pizza",
        target_location: "US",
        device_type: "desktop",
        user_id: "test-user",
        active: true,
        domain_id: "test-domain",
        domain: {
            id: "test-domain",
            domain: "pizzahut.com",
            user_id: "test-user",
            active: true
        }
    };

    try {
        const result = await checkKeywordRanking(mockKeyword);
        console.log("Ranking Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Ranking Error:", e);
    }

    console.log("\nTesting getScrapingRobotResults...");
    try {
        const results = await getScrapingRobotResults(mockKeyword);
        console.log("Organic Results Count:", results.length);
        if (results.length > 0) {
            console.log("First Result:", results[0]);
        }
    } catch (e) {
        console.error("Results Error:", e);
    }
}

test();
