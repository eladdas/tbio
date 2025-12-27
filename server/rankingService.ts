import type { Keyword, Domain } from "@shared/schema";
import { storage } from "./storage";
import * as serperService from "./serperService";
import * as scrapingRobotService from "./scrapingRobotService";

export interface KeywordRankingResult {
  keyword_id: string;
  position: number | null;
  search_volume: number | null;
  found: boolean;
  domain: string;
  error?: string;
}

export interface OrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  description?: string;
}

/**
 * Get the configured search engine provider
 */
async function getSearchEngineProvider(): Promise<string> {
  try {
    const setting = await storage.getSystemSetting('search_engine_provider');
    if (setting && setting.value) {
      return setting.value;
    }
  } catch (error) {
    console.warn("Failed to load search engine provider from database, defaulting to serper");
  }

  return 'scrapingrobot'; // Default to ScrapingRobot
}

/**
 * Check keyword ranking for a specific domain using the configured search engine
 */
export async function checkKeywordRanking(
  keyword: Keyword & { domain: Domain }
): Promise<KeywordRankingResult> {
  const provider = await getSearchEngineProvider();

  if (provider === 'scrapingrobot') {
    return await scrapingRobotService.checkKeywordRanking(keyword);
  } else {
    return await serperService.checkKeywordRanking(keyword);
  }
}

/**
 * Check rankings for multiple keywords in batch
 */
export async function checkMultipleKeywordRankings(
  keywords: (Keyword & { domain: Domain })[]
): Promise<KeywordRankingResult[]> {
  const provider = await getSearchEngineProvider();

  if (provider === 'scrapingrobot') {
    return await scrapingRobotService.checkMultipleKeywordRankings(keywords);
  } else {
    return await serperService.checkMultipleKeywordRankings(keywords);
  }
}

/**
 * Get search results for instant lookup
 */
export async function getSearchResults(
  keyword: Keyword & { domain: Domain }
): Promise<OrganicResult[]> {
  const provider = await getSearchEngineProvider();

  if (provider === 'scrapingrobot') {
    return await scrapingRobotService.getScrapingRobotResults(keyword);
  } else {
    return await serperService.getSerperResults(keyword);
  }
}

/**
 * Instant keyword lookup - lightweight version without full keyword object
 */
export async function instantKeywordLookup(
  keywordText: string,
  domainUrl: string,
  location: string,
  deviceType: 'desktop' | 'mobile'
): Promise<{
  position: number | null;
  found: boolean;
  matchedUrl: string | null;
  totalResults: number;
  searchVolume: number | null;
}> {
  const provider = await getSearchEngineProvider();

  // Create minimal keyword object for the lookup
  const tempKeyword: any = {
    id: 'instant-lookup',
    keyword: keywordText,
    target_location: location,
    device_type: deviceType,
    domain: {
      id: 'temp',
      domain: domainUrl,
      user_id: 'temp',
      active: true,
    },
    user_id: 'temp',
    active: true,
  };

  // Use checkKeywordRanking which returns both position and search volume
  let rankingResult: KeywordRankingResult;
  if (provider === 'scrapingrobot') {
    rankingResult = await scrapingRobotService.checkKeywordRanking(tempKeyword);
  } else {
    rankingResult = await serperService.checkKeywordRanking(tempKeyword);
  }

  // Get full results for matched URL (we need the actual URL, not just position)
  let matchedUrl: string | null = null;
  if (rankingResult.found && rankingResult.position) {
    // Get results to find the matched URL
    let results: OrganicResult[];
    if (provider === 'scrapingrobot') {
      results = await scrapingRobotService.getScrapingRobotResults(tempKeyword);
    } else {
      results = await serperService.getSerperResults(tempKeyword);
    }

    // Find the matched result
    const targetHostname = domainUrl
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .toLowerCase()
      .split('/')[0];

    for (const result of results) {
      try {
        const resultHostname = new URL(result.link).hostname
          .replace(/^www\./, "")
          .toLowerCase();

        if (resultHostname === targetHostname ||
          resultHostname.endsWith(`.${targetHostname}`)) {
          matchedUrl = result.link;
          break;
        }
      } catch (error) {
        continue;
      }
    }
  }

  return {
    position: rankingResult.position,
    found: rankingResult.found,
    matchedUrl,
    totalResults: 100, // Both APIs check up to 100 results
    searchVolume: rankingResult.search_volume,
  };
}
