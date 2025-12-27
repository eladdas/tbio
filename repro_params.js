
const apiKey = "1041414c-935d-48d6-a5e8-f4f6301a07bb";
const SCRAPINGROBOT_API_URL = "https://api.scrapingrobot.com/";

async function run() {
    const keyword = "pizza";
    // Try GoogleScraper with browserHtml=false
    const params = new URLSearchParams({
        token: apiKey,
        url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100`,
        module: "GoogleScraper",
        json: "1",
        browserHtml: "false", // Try explicitly disabling browserHtml
        country: "US"
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
            console.log("SUCCESS: Received object in result");
            console.log("Keys:", Object.keys(data.result));
        } else {
            console.log("data.result preview:", String(data.result).substring(0, 100));
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

run();
