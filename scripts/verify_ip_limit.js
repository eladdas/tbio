
import fetch from 'node-fetch';

async function verifyRateLimit() {
    const url = 'http://localhost:5000/api/keyword-lookup';
    const payload = {
        keyword: 'test',
        domain: 'example.com',
        location: 'sa',
        device: 'desktop'
    };

    console.log('Starting rate limit verification...');

    for (let i = 1; i <= 12; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log(`Request ${i}: Status ${response.status}`);

            if (response.status === 429) {
                console.log('SUCCESS: Rate limit hit as expected.');
                const data = await response.json();
                console.log('Error message:', data.message);
                break;
            }

            if (i > 10 && response.status !== 429) {
                console.log('FAILURE: Request should have been blocked.');
            }

        } catch (error) {
            console.error(`Request ${i} failed:`, error.message);
        }
    }
}

verifyRateLimit();
