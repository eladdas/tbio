
import * as cheerio from "cheerio";

const apiKey = "1041414c-935d-48d6-a5e8-f4f6301a07bb";
const SCRAPINGROBOT_API_URL = "https://api.scrapingrobot.com/";

async function run() {
    const keyword = "pizza";
    const params = new URLSearchParams({
        token: apiKey,
        url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100`,
        module: "GoogleScraper",
        json: "1",
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
            return;
        }

        const data = await response.json();
        const organicResults = [];

        if (typeof data.result === 'string') {
            console.log("Response is HTML string. Parsing...");
            const $ = cheerio.load(data.result);

            const containers = $('.MjjYud');
            console.log("Found MjjYud containers:", containers.length);

            // Loop through containers and look for results
            let foundG = false;
            containers.each((i, el) => {
                const g = $(el).find('.g');
                if (g.length > 0) {
                    foundG = true;
                }
            });
            console.log("Found containers with .g:", foundG);

            // Standard parsing attempt with .g
            $('.g').each((i, el) => {
                const titleEl = $(el).find('h3');
                const linkEl = $(el).find('a').first();
                const descEl = $(el).find('.VwiC3b, .IsZvec, .BmP5tf').first();

                const title = titleEl.text().trim();
                const link = linkEl.attr('href');
                const description = descEl.text().trim();

                if (title && link) {
                    organicResults.push({
                        position: organicResults.length + 1,
                        title,
                        link,
                        description
                    });
                }
            });

            // If .g failed, try parsing from MjjYud directly
            if (organicResults.length === 0) {
                console.log("Fallback to direct MjjYud parsing");
                $('.MjjYud').each((i, el) => {
                    const titleEl = $(el).find('h3');
                    const linkEl = $(el).find('a').first();

                    const title = titleEl.text().trim();
                    const link = linkEl.attr('href');

                    if (title && link && link.startsWith('http') && !link.includes('google.com/search')) {
                        organicResults.push({
                            position: organicResults.length + 1,
                            title,
                            link,
                            description: ''
                        });
                    }
                });
            }

        } else {
            console.log("Response is already object or null");
        }

        console.log("Parsed organic results:", organicResults.length);
        if (organicResults.length > 0) {
            console.log("First result:", organicResults[0]);
        } else {
            console.log("No results parsed.");
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

run();
