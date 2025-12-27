
const apiKey = "1041414c-935d-48d6-a5e8-f4f6301a07bb";
const SCRAPINGROBOT_API_URL = "https://api.scrapingrobot.com/";

async function run() {
    const keyword = "pizza";
    const params = new URLSearchParams({
        token: apiKey,
        url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100`,
        module: "GoogleKeywordSearchScraper",
        json: "1",
        country: "US",
        num: "100"
    });

    const fullUrl = `${SCRAPINGROBOT_API_URL}?${params.toString()}`;
    console.log("Fetching:", fullUrl);

    try {
        const response = await fetch(fullUrl, { // Using native fetch
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

        const jsonStr = JSON.stringify(data, null, 2);
        console.log("Response Data Length:", jsonStr.length);
        const fs = await import('fs');
        fs.writeFileSync('response.json', jsonStr);
        console.log("Wrote response to response.json");
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
