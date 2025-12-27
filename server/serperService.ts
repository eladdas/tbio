import type { Keyword, Domain } from "@shared/schema";
import { storage } from "./storage";

interface SerperSearchResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
}

interface SerperResponse {
  searchParameters: {
    q: string;
    gl?: string;
    hl?: string;
    num?: number;
  };
  organic?: SerperSearchResult[];
  searchInformation?: {
    totalResults?: string;
  };
}

export interface KeywordRankingResult {
  keyword_id: string;
  position: number | null;
  search_volume: number | null;
  found: boolean;
  domain: string;
  error?: string;
}

export interface SerperOrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  date?: string;
  rating?: number;
  reviews?: number;
}

const SERPER_API_URL = "https://google.serper.dev/search";

// Get API key from database or fall back to environment variable
async function getSerperApiKey(): Promise<string> {
  try {
    const setting = await storage.getSystemSetting('serper_api_key');
    if (setting && setting.value) {
      return setting.value;
    }
  } catch (error) {
    console.warn("Failed to load Serper API key from database, using environment variable");
  }
  
  return process.env.SERPER_API_KEY || '';
}

/**
 * Check keyword ranking for a specific domain using Serper.dev API
 */
export async function checkKeywordRanking(
  keyword: Keyword & { domain: Domain }
): Promise<KeywordRankingResult> {
  const apiKey = await getSerperApiKey();
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  try {
    const response = await fetch(SERPER_API_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: keyword.keyword,
        num: 100, // Check up to 100 results
        gl: keyword.target_location.toLowerCase(), // Country code (e.g., 'sa' for Saudi Arabia)
        hl: "ar", // Arabic language
        ...(keyword.device_type === "mobile" && { device: "mobile" }), // Add device parameter for mobile searches
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serper API error: ${response.status} - ${errorText}`);
    }

    const data: SerperResponse = await response.json();

    // Extract hostname from target domain
    let targetHostname: string;
    try {
      // Ensure domain has protocol for URL parsing
      const domainUrl = keyword.domain.domain.startsWith('http') 
        ? keyword.domain.domain 
        : `https://${keyword.domain.domain}`;
      targetHostname = new URL(domainUrl).hostname.replace(/^www\./, "").toLowerCase();
    } catch (error) {
      // If URL parsing fails, use simple cleaning
      targetHostname = keyword.domain.domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .toLowerCase()
        .split('/')[0]; // Remove any path
    }

    // Search for the domain in organic results
    let position: number | null = null;
    let found = false;

    if (data.organic && data.organic.length > 0) {
      for (const result of data.organic) {
        try {
          const resultHostname = new URL(result.link).hostname
            .replace(/^www\./, "")
            .toLowerCase();

          // Exact match or subdomain match
          if (resultHostname === targetHostname || 
              resultHostname.endsWith(`.${targetHostname}`)) {
            position = result.position;
            found = true;
            break;
          }
        } catch (error) {
          // Skip invalid URLs
          continue;
        }
      }
    }

    // Extract search volume from search information if available
    const search_volume = data.searchInformation?.totalResults
      ? parseInt(data.searchInformation.totalResults.replace(/,/g, ""))
      : null;

    return {
      keyword_id: keyword.id,
      position,
      search_volume,
      found,
      domain: keyword.domain.domain,
    };
  } catch (error) {
    console.error(`Error checking ranking for keyword ${keyword.id}:`, error);
    // Re-throw the error so it can be handled by the caller
    throw error;
  }
}

/**
 * Check rankings for multiple keywords in batch
 */
export async function checkMultipleKeywordRankings(
  keywords: (Keyword & { domain: Domain })[]
): Promise<KeywordRankingResult[]> {
  // Process keywords one by one to avoid rate limiting
  // We can add delay between requests if needed
  const results: KeywordRankingResult[] = [];

  for (const keyword of keywords) {
    const result = await checkKeywordRanking(keyword);
    results.push(result);

    // Add a small delay to avoid rate limiting (500ms between requests)
    if (keywords.indexOf(keyword) < keywords.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

export async function getSerperResults(
  keyword: Keyword & { domain: Domain }
): Promise<SerperOrganicResult[]> {
  const apiKey = await getSerperApiKey();
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  const response = await fetch(SERPER_API_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: keyword.keyword,
      num: 100, // Check up to 100 results
      gl: keyword.target_location.toLowerCase(), // Country code
      hl: "ar", // Arabic language
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Serper API error: ${response.status} - ${errorText}`);
  }

  const data: SerperResponse = await response.json();
  return data.organic || [];
}
