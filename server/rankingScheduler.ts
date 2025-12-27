import { storage } from "./storage";
import { checkMultipleKeywordRankings } from "./serperService";

let schedulerInterval: NodeJS.Timeout | null = null;
let isRunning = false;

/**
 * Check all active keywords and update their rankings
 */
export async function checkAllActiveKeywords() {
  if (isRunning) {
    console.log("Ranking check already in progress, skipping...");
    return;
  }

  try {
    isRunning = true;
    console.log("Starting automatic keyword ranking check...");

    // Get all active keywords with their domains
    const keywords = await storage.getActiveKeywordsWithDomain();

    if (keywords.length === 0) {
      console.log("No active keywords to check");
      return;
    }

    console.log(`Checking rankings for ${keywords.length} keywords...`);

    // Check rankings in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      
      try {
        const results = await checkMultipleKeywordRankings(batch);

        // Save all rankings to database (including not found)
        for (const result of results) {
          const keyword = batch.find(k => k.id === result.keyword_id);
          if (!keyword) continue;

          // Get previous ranking to detect changes
          const previousRanking = await storage.getLatestKeywordRanking(result.keyword_id);
          const previousPosition = previousRanking?.position || null;
          const currentPosition = result.position;

          // Save the new ranking
          await storage.createKeywordRanking({
            keyword_id: result.keyword_id,
            position: currentPosition,
          });
          
          // Create notification if there's a significant change
          if (previousPosition !== null && currentPosition !== null && previousPosition !== currentPosition) {
            let type: string;
            let title: string;
            let message: string;

            if (currentPosition < previousPosition) {
              // Improved
              type = 'position_improved';
              title = 'تحسن الترتيب';
              message = `الكلمة المفتاحية "${keyword.keyword}" تحسنت من الترتيب ${previousPosition} إلى ${currentPosition}`;
            } else {
              // Declined
              type = 'position_declined';
              title = 'تراجع الترتيب';
              message = `الكلمة المفتاحية "${keyword.keyword}" تراجعت من الترتيب ${previousPosition} إلى ${currentPosition}`;
            }

            await storage.createNotification({
              user_id: keyword.user_id,
              keyword_id: keyword.id,
              type,
              title,
              message,
              old_position: previousPosition,
              new_position: currentPosition,
              is_read: false,
            });
          } else if (previousPosition === null && currentPosition !== null) {
            // Found for the first time
            await storage.createNotification({
              user_id: keyword.user_id,
              keyword_id: keyword.id,
              type: 'position_found',
              title: 'تم العثور على الموقع',
              message: `الكلمة المفتاحية "${keyword.keyword}" ظهرت في نتائج البحث بالترتيب ${currentPosition}`,
              old_position: null,
              new_position: currentPosition,
              is_read: false,
            });
          } else if (previousPosition !== null && currentPosition === null) {
            // Lost ranking
            await storage.createNotification({
              user_id: keyword.user_id,
              keyword_id: keyword.id,
              type: 'position_lost',
              title: 'فقدان الترتيب',
              message: `الكلمة المفتاحية "${keyword.keyword}" لم تعد تظهر في أول 100 نتيجة بحث`,
              old_position: previousPosition,
              new_position: null,
              is_read: false,
            });
          }
          
          if (result.found && result.position !== null) {
            console.log(`✓ Saved ranking for keyword ${result.keyword_id}: position ${result.position}`);
          } else {
            console.log(`✓ Saved ranking for keyword ${result.keyword_id}: not found in top 100`);
          }
        }
      } catch (error) {
        console.error(`✗ Error checking batch ${i / batchSize + 1}:`, error);
        // Continue with next batch despite error
      }

      // Wait a bit between batches to avoid rate limiting
      if (i + batchSize < keywords.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log("Finished automatic keyword ranking check");
  } catch (error) {
    console.error("Error during automatic ranking check:", error);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the ranking scheduler
 * Checks rankings every 6 hours by default
 */
export function startRankingScheduler(intervalHours: number = 6) {
  if (schedulerInterval) {
    console.log("Ranking scheduler is already running");
    return;
  }

  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`Starting ranking scheduler (checking every ${intervalHours} hours)...`);

  // Run immediately on startup
  checkAllActiveKeywords();

  // Then schedule recurring checks
  schedulerInterval = setInterval(() => {
    checkAllActiveKeywords();
  }, intervalMs);
}

/**
 * Stop the ranking scheduler
 */
export function stopRankingScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("Ranking scheduler stopped");
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    isRunning: schedulerInterval !== null,
    isChecking: isRunning,
  };
}
