
import * as cheerio from "cheerio";

const apiKey = "1041414c-935d-48d6-a5e8-f4f6301a07bb";
const SCRAPINGROBOT_API_URL = "https://api.scrapingrobot.com/";

async function run() {
    const keyword = "السعودية";
    const targetHostname = "wikipedia.org";

    console.log(`Testing keyword: ${keyword} for domain: ${targetHostname}`);

    const params = new URLSearchParams({
        token: apiKey,
        url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100`,
        module: "GoogleScraper",
        json: "1",
        country: "SA"
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

            let resultsFound = false;

            // Try standard .g selector
            $('.g').each((i, el) => {
                const titleEl = $(el).find('h3');
                const linkEl = $(el).find('a').first();
                const descEl = $(el).find('.VwiC3b, .IsZvec, .BmP5tf').first();

                const title = titleEl.text().trim();
                const link = linkEl.attr('href');
                const description = descEl.text().trim();

                if (i < 3) console.log(`[DEBUG] .g[${i}] Title: "${title}" Link: "${link}"`);

                if (title && link && link.startsWith('http')) {
                    resultsFound = true;
                    organicResults.push({
                        position: organicResults.length + 1,
                        title,
                        link
                    });
                }
            });
            console.log(`.g results found: ${resultsFound}`);

            // Fallback to .MjjYud
            if (!resultsFound) {
                console.log("Fallback to .MjjYud");
                const mContainers = $('.MjjYud');
                console.log(`Found ${mContainers.length} .MjjYud containers`);

                mContainers.each((i, el) => {
                    const titleEl = $(el).find('h3');
                    const linkEl = $(el).find('a').first();
                    const descEl = $(el).find('.VwiC3b, .IsZvec, .BmP5tf').first();

                    const title = titleEl.text().trim();
                    const link = linkEl.attr('href');

                    if (i < 3) console.log(`[DEBUG] MjjYud[${i}] Title: "${title}" Link: "${link}"`);
                    if (i < 3) console.log(`[DEBUG] MjjYud[${i}] HTML length: ${$(el).html()?.length}`);


                    if (title && link && link.startsWith('http') && !link.includes('google.com/search')) {
                        organicResults.push({
                            position: organicResults.length + 1,
                            title,
                            link
                        });
                    }
                });
            }

        } else {
            console.log("Response is already object or null");
        }

        console.log(`Parsed ${organicResults.length} organic results`);

        let position = null;
        let found = false;

        for (const result of organicResults) {
            try {
                const resultHostname = new URL(result.link).hostname.replace(/^www\./, "").toLowerCase();
                console.log(`Checking ${resultHostname} against ${targetHostname}`);

                if (resultHostname === targetHostname || resultHostname.endsWith(`.${targetHostname}`)) {
                    position = result.position;
                    found = true;
                    console.log(`MATCH FOUND at position ${position}`);
                    break;
                }
            } catch (e) {
                // ignore
            }
        }

        if (!found) console.log("NO MATCH FOUND");

    } catch (err) {
        console.error("Error:", err);
    }
}

run();
