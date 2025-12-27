import type { Keyword, Domain } from "@shared/schema";
import * as cheerio from "cheerio";

import { storage } from "./storage";

interface ScrapingRobotSearchResult {
  position: number;
  title: string;
  link: string;
  description?: string;
}

interface ScrapingRobotResponse {
  result?: {
    organicResults?: ScrapingRobotSearchResult[];
    organic_results?: ScrapingRobotSearchResult[];
    searchInformation?: {
      totalResults?: number;
    };
    search_information?: {
      total_results?: number;
    };
  };
  error?: string;
}

export interface KeywordRankingResult {
  keyword_id: string;
  position: number | null;
  search_volume: number | null;
  found: boolean;
  domain: string;
  error?: string;
}

export interface ScrapingRobotOrganicResult {
  position: number;
  title: string;
  link: string;
  description?: string;
}

const SCRAPINGROBOT_API_URL = "https://api.scrapingrobot.com/";

async function getScrapingRobotApiKey(): Promise<string> {
  try {
    const setting = await storage.getSystemSetting('scrapingrobot_api_key');
    if (setting && setting.value) {
      return setting.value;
    }
  } catch (error) {
    console.warn("Failed to load ScrapingRobot API key from database, using environment variable");
  }

  return process.env.SCRAPINGROBOT_API_KEY || '';
}

/**
 * Check keyword ranking for a specific domain using ScrapingRobot API
 */
export async function checkKeywordRanking(
  keyword: Keyword & { domain: Domain }
): Promise<KeywordRankingResult> {
  const apiKey = await getScrapingRobotApiKey();

  if (!apiKey) {
    throw new Error("SCRAPINGROBOT_API_KEY is not configured");
  }

  try {
    const params = new URLSearchParams({
      token: apiKey,
      url: `https://www.google.com/search?q=${encodeURIComponent(keyword.keyword)}&num=100`,
      module: "GoogleScraper",
      json: "1",
      country: keyword.target_location.toUpperCase(),
      ...(keyword.device_type === "mobile" && { mobile: "1" }),
    });

    const response = await fetch(`${SCRAPINGROBOT_API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ScrapingRobot API error: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();

    if (data.error) {
      throw new Error(`ScrapingRobot API error: ${data.error}`);
    }

    let targetHostname: string;
    try {
      const domainUrl = keyword.domain.domain.startsWith('http')
        ? keyword.domain.domain
        : `https://${keyword.domain.domain}`;
      targetHostname = new URL(domainUrl).hostname.replace(/^www\./, "").toLowerCase();
    } catch (error) {
      targetHostname = keyword.domain.domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .toLowerCase()
        .split('/')[0];
    }

    let position: number | null = null;
    let found = false;

    const organicResults: any[] = [];

    // Handle HTML result (string) or JSON result (object)
    if (typeof data.result === 'string') {
      const $ = cheerio.load(data.result);

      let resultsFound = false;


      // Select organic results
      $('.g').each((i, el) => {
        // ... (existing code, just wrapped)

        const titleEl = $(el).find('h3');
        const linkEl = $(el).find('a').first();

        const title = titleEl.text().trim();
        const link = linkEl.attr('href');

        if (title && link && link.startsWith('http')) {
          resultsFound = true;
          organicResults.push({
            position: organicResults.length + 1,
            title,
            link
          });
        }
      });

      // Fallback to .MjjYud if no .g results found
      if (!resultsFound) {
        const mContainers = $('.MjjYud');

        mContainers.each((i, el) => {
          const titleEl = $(el).find('h3').first();
          let linkEl = $(el).find('a').has('h3').first();

          if (linkEl.length === 0) {
            linkEl = $(el).find('a[href^="http"]').first();
          }

          const title = titleEl.text().trim();
          const link = linkEl.attr('href');

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
      const results = data.result?.organic_results || data.result?.organicResults || [];
      organicResults.push(...results);
    }



    if (organicResults.length > 0) {

      for (const result of organicResults) {
        try {
          const resultHostname = new URL(result.link).hostname
            .replace(/^www\./, "")
            .toLowerCase();

          if (resultHostname === targetHostname ||
            resultHostname.endsWith(`.${targetHostname}`)) {
            position = result.position;
            found = true;
            break;
          }


        } catch (error) {
          continue;
        }
      }
    }

    const search_volume =
      data.result?.search_information?.total_results ||
      data.result?.searchInformation?.totalResults ||
      null;

    return {
      keyword_id: keyword.id,
      position,
      search_volume,
      found,
      domain: keyword.domain.domain,
    };
  } catch (error) {
    console.error(`Error checking ranking for keyword ${keyword.id}:`, error);
    throw error;
  }
}

/**
 * Check rankings for multiple keywords in batch
 */
export async function checkMultipleKeywordRankings(
  keywords: (Keyword & { domain: Domain })[]
): Promise<KeywordRankingResult[]> {
  const results: KeywordRankingResult[] = [];

  for (const keyword of keywords) {
    const result = await checkKeywordRanking(keyword);
    results.push(result);

    if (keywords.indexOf(keyword) < keywords.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export async function getScrapingRobotResults(
  keyword: Keyword & { domain: Domain }
): Promise<ScrapingRobotOrganicResult[]> {
  const apiKey = await getScrapingRobotApiKey();

  if (!apiKey) {
    throw new Error("SCRAPINGROBOT_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    token: apiKey,
    url: `https://www.google.com/search?q=${encodeURIComponent(keyword.keyword)}&num=100`,
    module: "GoogleScraper",
    json: "1",
    country: keyword.target_location.toUpperCase(),
    ...(keyword.device_type === "mobile" && { mobile: "1" }),
  });

  const response = await fetch(`${SCRAPINGROBOT_API_URL}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ScrapingRobot API error: ${response.status} - ${errorText}`);
  }

  const data: any = await response.json();

  if (data.error) {
    throw new Error(`ScrapingRobot API error: ${data.error}`);
  }

  const organicResults: ScrapingRobotOrganicResult[] = [];

  // Handle HTML result (string) or JSON result (object)
  if (typeof data.result === 'string') {
    const $ = cheerio.load(data.result);
    let resultsFound = false;

    // Select organic results
    $('.g').each((i, el) => {
      const titleEl = $(el).find('h3');
      const linkEl = $(el).find('a').first();
      const descEl = $(el).find('.VwiC3b, .IsZvec, .BmP5tf').first();

      const title = titleEl.text().trim();
      const link = linkEl.attr('href');
      const description = descEl.text().trim();

      if (title && link && link.startsWith('http')) {
        resultsFound = true;
        organicResults.push({
          position: organicResults.length + 1,
          title,
          link,
          description: description || undefined
        });
      }
    });

    // Fallback to .MjjYud if no .g results found
    if (!resultsFound) {
      $('.MjjYud').each((i, el) => {
        const titleEl = $(el).find('h3').first();
        let linkEl = $(el).find('a').has('h3').first();

        if (linkEl.length === 0) {
          linkEl = $(el).find('a[href^="http"]').first();
        }

        const title = titleEl.text().trim();
        const link = linkEl.attr('href');
        const descEl = $(el).find('.VwiC3b, .IsZvec, .BmP5tf').first();
        const description = descEl.text().trim();

        if (title && link && link.startsWith('http') && !link.includes('google.com/search')) {
          organicResults.push({
            position: organicResults.length + 1,
            title,
            link,
            description: description || undefined
          });
        }
      });
    }
  } else {


    const results = data.result?.organic_results || data.result?.organicResults || [];
    results.forEach((r: any) => {
      organicResults.push({
        position: r.position,
        title: r.title,
        link: r.link,
        description: r.description
      });
    });
  }

  return organicResults;

}
