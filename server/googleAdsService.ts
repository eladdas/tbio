
import { storage } from "./storage";

interface GoogleAdsSettings {
    developerToken: string;
    customerId: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
}

async function getGoogleAdsSettings(): Promise<GoogleAdsSettings> {
    const [
        devToken,
        customerId,
        clientId,
        clientSecret,
        refreshToken
    ] = await Promise.all([
        storage.getSystemSetting("google_ads_developer_token"),
        storage.getSystemSetting("google_ads_customer_id"),
        storage.getSystemSetting("google_ads_client_id"),
        storage.getSystemSetting("google_ads_client_secret"),
        storage.getSystemSetting("google_ads_refresh_token")
    ]);

    if (!devToken?.value || !customerId?.value || !clientId?.value || !clientSecret?.value || !refreshToken?.value) {
        throw new Error("Google Ads API credentials are not fully configured");
    }

    return {
        developerToken: devToken.value,
        customerId: customerId.value.replace(/-/g, ""),
        clientId: clientId.value,
        clientSecret: clientSecret.value,
        refreshToken: refreshToken.value
    };
}

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token"
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to refresh access token: ${error.error_description || error.error}`);
    }

    const data = await response.json();
    return data.access_token;
}

// Simple mapping for demonstration. In production, use GeoTargetConstantService.
const LOCATION_IDS: Record<string, string> = {
    "SA": "2682", // Saudi Arabia
    "EG": "2818", // Egypt
    "AE": "2784", // UAE
    "KW": "2414", // Kuwait
    "QA": "2634", // Qatar
    "BH": "2048", // Bahrain
    "OM": "2512", // Oman
    "JO": "2400", // Jordan
    "LB": "2422", // Lebanon
    "IQ": "2368", // Iraq
    "US": "2840", // USA
    "UK": "2826", // United Kingdom
    "GB": "2826", // United Kingdom
};

export async function generateKeywordsWithGoogleAds(
    seedKeywords: string[],
    targetLocation: string,
    languageId: string = "1019" // Arabic default. English is 1000.
) {
    const settings = await getGoogleAdsSettings();
    const accessToken = await getAccessToken(
        settings.clientId,
        settings.clientSecret,
        settings.refreshToken
    );

    const locationId = LOCATION_IDS[targetLocation.toUpperCase()] || "2682"; // Default to SA

    const url = `https://googleads.googleapis.com/v14/customers/${settings.customerId}:generateKeywordIdeas`;

    const requestBody = {
        customerId: settings.customerId,
        includeAdultKeywords: false,
        keywordSeed: {
            keywords: seedKeywords
        },
        geoTargetConstants: [`geoTargetConstants/${locationId}`],
        language: `languageConstants/${languageId}`,
        keywordPlanNetwork: "GOOGLE_SEARCH",
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "developer-token": settings.developerToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Google Ads API Error:", errorText);
        throw new Error(`Google Ads API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results) {
        return [];
    }

    // Transform results to match our application's Expected format
    return data.results.map((result: any) => {
        const metrics = result.keywordIdeaMetrics;
        const avgMonthlySearches = metrics?.avgMonthlySearches || 0;
        const competition = metrics?.competition || "UNKNOWN";
        const cpc = metrics?.averageCpcMicros ? (parseInt(metrics.averageCpcMicros) / 1000000).toFixed(2) : "0";

        return {
            keyword: result.text,
            metrics: {
                avgMonthlySearches,
                competition,
                competitionIndex: metrics?.competitionIndex,
                lowTopOfPageBid: metrics?.lowTopOfPageBidMicros ? (parseInt(metrics.lowTopOfPageBidMicros) / 1000000).toFixed(2) : "0",
                highTopOfPageBid: metrics?.highTopOfPageBidMicros ? (parseInt(metrics.highTopOfPageBidMicros) / 1000000).toFixed(2) : "0",
            },
            // Adapt to our generic result format if needed
            searchIntent: "Unknown", // Google doesn't provide this directly
            difficulty: mapCompetitionToDifficulty(competition),
            estimatedVolume: mapVolumeToLabel(avgMonthlySearches),
            reasoning: "Data from Google Keyword Planner"
        };
    });
}

function mapCompetitionToDifficulty(competition: string): string {
    switch (competition) {
        case "LOW": return "سهل";
        case "MEDIUM": return "متوسط";
        case "HIGH": return "صعب";
        default: return "متوسط";
    }
}

function mapVolumeToLabel(volume: number): string {
    if (volume < 500) return "منخفض";
    if (volume < 5000) return "متوسط";
    return "عالي";
}
