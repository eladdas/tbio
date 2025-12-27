
import { checkKeywordRanking } from "./server/scrapingRobotService";
import { storage } from "./server/storage";
import * as cheerio from "cheerio";

// Mock storage
storage.getSystemSetting = async (key) => {
    if (key === 'scrapingrobot_api_key') return { id: 1, key: 'scrapingrobot_api_key', value: '1041414c-935d-48d6-a5e8-f4f6301a07bb' };
    return undefined;
};

async function testArabic() {
    console.log("Testing Arabic Keyword...");
    // Common Arabic keyword "saudi arabia" -> domain "wikipedia.org" (usually top result)
    const mockKeyword = {
        id: "test-ar",
        keyword: "السعودية",
        target_location: "SA", // Saudi Arabia
        device_type: "desktop",
        user_id: "test-user",
        active: true,
        domain_id: "test-domain",
        domain: {
            id: "test-domain",
            domain: "wikipedia.org",
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
}

testArabic();
