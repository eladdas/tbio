
const apiKey = "1041414c-935d-48d6-a5e8-f4f6301a07bb";
const SCRAPINGROBOT_API_URL = "https://api.scrapingrobot.com/";

async function run() {
    const keyword = "pizza";
    // Mimic server/scrapingRobotService.ts params exactly
    const params = new URLSearchParams({
        token: apiKey,
        url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100`,
        module: "GoogleScraper", // Using GoogleScraper as in the service
        json: "1",
        country: "US",
    });

    const fullUrl = `${SCRAPINGROBOT_API_URL}?${params.toString()}`;
    console.log("Fetching:", fullUrl);

    try {
        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Response not OK:", response.status, response.statusText);
            const text = await response.text();
            console.error("Body:", text);
            return;
        }

        const data = await response.json();

        // Check if data.result is an object or string
        const isResultObject = typeof data.result === 'object' && data.result !== null;
        console.log("data.result type:", typeof data.result);

        if (isResultObject) {
            console.log("data.result keys:", Object.keys(data.result));
            if (data.result.organic_results) {
                console.log("organic_results count:", data.result.organic_results.length);
                console.log("First result:", data.result.organic_results[0]);
            } else if (data.result.organicResults) {
                console.log("organicResults count:", data.result.organicResults.length);
                console.log("First result:", data.result.organicResults[0]);
            } else {
                console.log("No organic results found in data.result");
            }
        } else {
            console.log("data.result is not an object. Preview:", String(data.result).substring(0, 100));
        }

        const fs = await import('fs');
        fs.writeFileSync('response_service.json', JSON.stringify(data, null, 2));
        console.log("Wrote response to response_service.json");

    } catch (err) {
        console.error("Error:", err);
    }
}

run();
