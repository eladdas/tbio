
const apiKey = "1041414c-935d-48d6-a5e8-f4f6301a07bb";
const SCRAPINGROBOT_API_URL = "https://api.scrapingrobot.com/";

async function run() {
    const keyword = "pizza";
    const params = new URLSearchParams({
        token: apiKey,
        // For GoogleSearchScraper, sometimes 'q' is used instead of 'url', but let's try 'url' first as it's common.
        // Actually, many SERP APIs use 'q' directly for structured scrapers.
        // Let's stick to the pattern but change module.
        url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100`,
        module: "GoogleSearchScraper",
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
        console.log("data.result type:", typeof data.result);

        if (typeof data.result === 'object' && data.result !== null) {
            console.log("data.result keys:", Object.keys(data.result));
            if (data.result.organic_results) {
                console.log("organic_results count:", data.result.organic_results.length);
            }
        } else {
            console.log("data.result preview:", String(data.result).substring(0, 100));
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

run();
