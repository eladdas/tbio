import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { checkKeywordRanking, checkMultipleKeywordRankings, getSearchResults, instantKeywordLookup } from "./rankingService";
import { insertDomainSchema, insertKeywordSchema, insertPlanSchema, insertPageSchema } from "@shared/schema";

// Middleware to check if user is admin
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);

    if (!user || (!user.is_admin && user.role !== 'admin')) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Middleware to check for specific roles
const checkRole = (allowedRoles: string[]) => async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Admins have all permissions
    if (user.is_admin || user.role === 'admin' || allowedRoles.includes(user.role)) {
      return next();
    }

    res.status(403).json({ message: `Forbidden: One of these roles required: ${allowedRoles.join(', ')}` });
  } catch (error) {
    console.error("Error in checkRole middleware:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { first_name, last_name, phone, account_type, company_name, billing_address } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        ...(first_name !== undefined && { first_name }),
        ...(last_name !== undefined && { last_name }),
        ...(phone !== undefined && { phone }),
        ...(account_type !== undefined && { account_type }),
        ...(company_name !== undefined && { company_name }),
        ...(billing_address !== undefined && { billing_address }),
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Domains routes
  app.get('/api/domains', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const domains = await storage.getUserDomains(userId);
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  app.post('/api/domains', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { domain } = req.body;

      if (!domain) {
        return res.status(400).json({ message: "Domain is required" });
      }

      // Check user's subscription and domain limit
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.status(403).json({ message: "No active subscription" });
      }

      const currentDomainsCount = await storage.getUserDomainsCount(userId);
      if (currentDomainsCount >= subscription.plan.domains_limit) {
        return res.status(403).json({
          message: `Domain limit reached. Your plan allows ${subscription.plan.domains_limit} domains.`
        });
      }

      const newDomain = await storage.createDomain({
        user_id: userId,
        domain: domain,
        is_active: true,
      });

      res.status(201).json(newDomain);
    } catch (error) {
      console.error("Error creating domain:", error);
      res.status(500).json({ message: "Failed to create domain" });
    }
  });

  app.delete('/api/domains/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const domainId = req.params.id;

      // Verify domain belongs to user
      const domain = await storage.getDomain(domainId);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      if (domain.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this domain" });
      }

      await storage.deleteDomain(domainId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting domain:", error);
      res.status(500).json({ message: "Failed to delete domain" });
    }
  });

  // Keywords routes
  app.get('/api/keywords', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keywords = await storage.getUserKeywordsEnriched(userId);
      res.json(keywords);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      res.status(500).json({ message: "Failed to fetch keywords" });
    }
  });

  app.get('/api/keywords/domain/:domainId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const domainId = req.params.domainId;

      // Verify domain belongs to user
      const domain = await storage.getDomain(domainId);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      if (domain.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to access this domain's keywords" });
      }

      const keywords = await storage.getDomainKeywords(domainId);
      res.json(keywords);
    } catch (error) {
      console.error("Error fetching domain keywords:", error);
      res.status(500).json({ message: "Failed to fetch domain keywords" });
    }
  });

  app.post('/api/keywords', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { keyword, domain_id, target_location, device_type, tags } = req.body;

      if (!keyword || !domain_id) {
        return res.status(400).json({ message: "Keyword and domain_id are required" });
      }

      // Verify domain belongs to user
      const domain = await storage.getDomain(domain_id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      if (domain.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to add keywords to this domain" });
      }

      // Check user's subscription and keyword limit
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.status(403).json({ message: "No active subscription" });
      }

      const currentKeywordsCount = await storage.getUserKeywordsCount(userId);
      if (currentKeywordsCount >= subscription.plan.keywords_limit) {
        return res.status(403).json({
          message: `Keyword limit reached. Your plan allows ${subscription.plan.keywords_limit} keywords.`
        });
      }

      const newKeyword = await storage.createKeyword({
        user_id: userId,
        domain_id,
        keyword,
        target_location: target_location || "SA",
        device_type: device_type || "desktop",
        tags: tags || [],
        is_active: true,
      });

      res.status(201).json(newKeyword);
    } catch (error) {
      console.error("Error creating keyword:", error);
      res.status(500).json({ message: "Failed to create keyword" });
    }
  });

  app.post('/api/keywords/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { keywords: keywordList, domain_id, target_location, device_type } = req.body;

      if (!keywordList || !Array.isArray(keywordList) || keywordList.length === 0) {
        return res.status(400).json({ message: "Keywords array is required and must not be empty" });
      }

      if (!domain_id) {
        return res.status(400).json({ message: "domain_id is required" });
      }

      // Verify domain belongs to user
      const domain = await storage.getDomain(domain_id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      if (domain.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to add keywords to this domain" });
      }

      // Check user's subscription and keyword limit
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.status(403).json({ message: "No active subscription" });
      }

      const currentKeywordsCount = await storage.getUserKeywordsCount(userId);
      const newKeywordsCount = keywordList.length;

      if (currentKeywordsCount + newKeywordsCount > subscription.plan.keywords_limit) {
        return res.status(400).json({
          message: `لا يمكنك إضافة ${newKeywordsCount} كلمة مفتاحية. لديك ${currentKeywordsCount} كلمة حالياً والحد الأقصى هو ${subscription.plan.keywords_limit} كلمة في باقتك`
        });
      }

      // Prepare keywords for bulk insert - remove duplicates
      const uniqueKeywords = Array.from(new Set(keywordList.map((kw: string) => kw.trim())))
        .filter(kw => kw.length > 0);

      const keywordsToInsert = uniqueKeywords.map((kw: string) => ({
        keyword: kw,
        domain_id,
        target_location: target_location || "SA",
        device_type: device_type || "desktop",
        user_id: userId,
        is_active: true,
      }));

      if (keywordsToInsert.length === 0) {
        return res.status(400).json({ message: "No valid keywords provided" });
      }

      const createdKeywords = await storage.createKeywordsBulk(keywordsToInsert);

      res.status(201).json({
        message: `تم إضافة ${createdKeywords.length} كلمة مفتاحية بنجاح`,
        keywords: createdKeywords,
        count: createdKeywords.length,
      });
    } catch (error) {
      console.error("Error creating keywords in bulk:", error);
      res.status(500).json({ message: "Failed to create keywords" });
    }
  });

  app.patch('/api/keywords/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keywordId = req.params.id;
      const { keyword, target_location, device_type, is_active, tags } = req.body;

      // Verify keyword belongs to user
      const existingKeyword = await storage.getKeyword(keywordId);
      if (!existingKeyword) {
        return res.status(404).json({ message: "Keyword not found" });
      }

      if (existingKeyword.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this keyword" });
      }

      const updatedKeyword = await storage.updateKeyword(keywordId, {
        ...(keyword && { keyword }),
        ...(target_location && { target_location }),
        ...(device_type && { device_type }),
        ...(is_active !== undefined && { is_active }),
        ...(tags !== undefined && { tags }),
      });

      res.json(updatedKeyword);
    } catch (error) {
      console.error("Error updating keyword:", error);
      res.status(500).json({ message: "Failed to update keyword" });
    }
  });

  app.delete('/api/keywords/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keywordId = req.params.id;

      // Verify keyword belongs to user
      const keyword = await storage.getKeyword(keywordId);
      if (!keyword) {
        return res.status(404).json({ message: "Keyword not found" });
      }

      if (keyword.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this keyword" });
      }

      await storage.deleteKeyword(keywordId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting keyword:", error);
      res.status(500).json({ message: "Failed to delete keyword" });
    }
  });

  // Refresh all user keywords
  app.post('/api/keywords/refresh-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      // Get all user's keywords with domains
      const userKeywords = await storage.getUserKeywordsEnriched(userId);
      const activeKeywords = userKeywords.filter(k => k.is_active);

      if (activeKeywords.length === 0) {
        return res.json({
          message: "No active keywords to check",
          checked: 0,
          total: 0
        });
      }

      // Check rankings in batches
      const batchSize = 5;
      let checkedCount = 0;

      for (let i = 0; i < activeKeywords.length; i += batchSize) {
        const batch = activeKeywords.slice(i, i + batchSize).map(k => ({
          ...k,
          domain: { domain: k.domain }
        }));

        try {
          const results = await checkMultipleKeywordRankings(batch);

          for (const result of results) {
            const keyword = batch.find(k => k.id === result.keyword_id);
            if (!keyword) continue;

            const previousRanking = await storage.getLatestKeywordRanking(result.keyword_id);
            const previousPosition = previousRanking?.position || null;
            const currentPosition = result.position;

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
                type = 'position_improved';
                title = 'تحسن الترتيب';
                message = `الكلمة المفتاحية "${keyword.keyword}" تحسنت من الترتيب ${previousPosition} إلى ${currentPosition}`;
              } else {
                type = 'position_declined';
                title = 'تراجع الترتيب';
                message = `الكلمة المفتاحية "${keyword.keyword}" تراجعت من الترتيب ${previousPosition} إلى ${currentPosition}`;
              }

              await storage.createNotification({
                user_id: userId,
                keyword_id: keyword.id,
                type,
                title,
                message,
                old_position: previousPosition,
                new_position: currentPosition,
                is_read: false,
              });
            } else if (previousPosition === null && currentPosition !== null) {
              await storage.createNotification({
                user_id: userId,
                keyword_id: keyword.id,
                type: 'position_found',
                title: 'تم العثور على الموقع',
                message: `الكلمة المفتاحية "${keyword.keyword}" ظهرت في نتائج البحث بالترتيب ${currentPosition}`,
                old_position: null,
                new_position: currentPosition,
                is_read: false,
              });
            } else if (previousPosition !== null && currentPosition === null) {
              await storage.createNotification({
                user_id: userId,
                keyword_id: keyword.id,
                type: 'position_lost',
                title: 'فقدان الترتيب',
                message: `الكلمة المفتاحية "${keyword.keyword}" لم تعد تظهر في أول 100 نتيجة بحث`,
                old_position: previousPosition,
                new_position: null,
                is_read: false,
              });
            }

            checkedCount++;
          }
        } catch (error) {
          console.error(`Error checking batch:`, error);
        }

        // Small delay between batches
        if (i + batchSize < activeKeywords.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      res.json({
        message: "Keywords refreshed successfully",
        checked: checkedCount,
        total: activeKeywords.length
      });
    } catch (error) {
      console.error("Error refreshing keywords:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to refresh keywords",
      });
    }
  });

  // Check keyword ranking manually
  app.post('/api/keywords/:id/check-ranking', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keywordId = req.params.id;

      // Verify keyword belongs to user
      const keyword = await storage.getKeyword(keywordId);
      if (!keyword) {
        return res.status(404).json({ message: "Keyword not found" });
      }

      if (keyword.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to check this keyword" });
      }

      // Get keyword with domain
      const keywordWithDomain = await storage.getKeywordWithDomain(keywordId);
      if (!keywordWithDomain) {
        return res.status(404).json({ message: "Keyword or domain not found" });
      }

      // Check ranking using Serper API
      const result = await checkKeywordRanking(keywordWithDomain);

      // Save the ranking for audit trail
      await storage.createKeywordRanking({
        keyword_id: keywordId,
        position: result.position, // Will be null if not found
      });

      res.json(result);
    } catch (error) {
      console.error("Error checking keyword ranking:", error);
      // Don't save null position on API errors - let the error propagate to the client
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to check keyword ranking",
        error: true
      });
    }
  });

  // Get single keyword
  app.get('/api/keywords/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keywordId = req.params.id;

      const keywordWithDomain = await storage.getKeywordWithDomain(keywordId);
      if (!keywordWithDomain) {
        return res.status(404).json({ message: "Keyword not found" });
      }

      if (keywordWithDomain.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to access this keyword" });
      }

      // Get latest ranking
      const latestRanking = await storage.getLatestKeywordRanking(keywordId);

      res.json({
        id: keywordWithDomain.id,
        keyword: keywordWithDomain.keyword,
        domain: keywordWithDomain.domain.domain,
        target_location: keywordWithDomain.target_location,
        position: latestRanking?.position || null,
      });
    } catch (error) {
      console.error("Error fetching keyword:", error);
      res.status(500).json({ message: "Failed to fetch keyword" });
    }
  });

  // Get keyword rankings history
  app.get('/api/keywords/:id/rankings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keywordId = req.params.id;
      const limit = parseInt(req.query.limit as string) || 30;

      // Verify keyword belongs to user
      const keyword = await storage.getKeyword(keywordId);
      if (!keyword) {
        return res.status(404).json({ message: "Keyword not found" });
      }

      if (keyword.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized to access this keyword's rankings" });
      }

      const rankings = await storage.getKeywordRankings(keywordId, limit);
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching keyword rankings:", error);
      res.status(500).json({ message: "Failed to fetch keyword rankings" });
    }
  });

  // Get SERP preview for keyword
  app.post('/api/keywords/:id/serp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keywordId = req.params.id;

      const keywordWithDomain = await storage.getKeywordWithDomain(keywordId);
      if (!keywordWithDomain) {
        return res.status(404).json({ message: "Keyword not found" });
      }

      if (keywordWithDomain.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Call Search API to get SERP
      const serpResults = await getSearchResults(keywordWithDomain);

      // Find position if exists
      const domainUrl = keywordWithDomain.domain.domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const foundResult = serpResults.find((result: any) => {
        const resultDomain = result.link.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        return resultDomain === domainUrl;
      });

      res.json({
        results: serpResults,
        found: !!foundResult,
        position: foundResult?.position || null,
      });
    } catch (error: any) {
      console.error("Error fetching SERP:", error);

      // Check if it's a configuration error
      if (error.message?.includes("SERPER_API_KEY is not configured")) {
        return res.status(500).json({
          message: "Search API is not configured. Please contact support."
        });
      }

      // Check if it's a Serper API error
      if (error.message?.includes("Serper API error")) {
        return res.status(502).json({
          message: "Search service is temporarily unavailable. Please try again later."
        });
      }

      // Generic error
      res.status(500).json({
        message: "Failed to fetch search results. Please try again."
      });
    }
  });

  // Instant keyword lookup (without saving to database)
  app.post('/api/keyword-lookup', async (req: any, res) => {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const limit = await storage.incrementIpLimit(ip);

      if (limit.count > 10) {
        return res.status(429).json({
          message: "عذراً، لقد تجاوزت الحد المسموح به للتجربة المجانية (10 محاولات). يرجى التسجيل للمتابعة."
        });
      }

      const { keyword, domain, location = 'sa', device = 'desktop' } = req.body;

      // Validate input
      if (!keyword || !domain) {
        return res.status(400).json({
          message: "Keyword and domain are required"
        });
      }

      // Use the dedicated instant lookup function
      const deviceType = device === 'mobile' ? 'mobile' : 'desktop';
      const result = await instantKeywordLookup(keyword, domain, location, deviceType);

      res.json({
        keyword,
        domain,
        location,
        device,
        position: result.position,
        found: result.found,
        matchedUrl: result.matchedUrl,
        searchVolume: result.searchVolume,
        totalResults: result.totalResults,
        remaining: 10 - limit.count
      });
    } catch (error: any) {
      console.error("Error performing keyword lookup:", error);

      if (error.message?.includes("API_KEY is not configured") ||
        error.message?.includes("API key") ||
        error.message?.includes("not configured")) {
        return res.status(500).json({
          message: "Search API is not configured. Please contact support."
        });
      }

      if (error.message?.includes("API error")) {
        return res.status(502).json({
          message: "Search service is temporarily unavailable. Please try again later."
        });
      }

      res.status(500).json({
        message: "Failed to perform keyword lookup. Please try again."
      });
    }
  });

  // Plans routes
  app.get('/api/plans', async (req, res) => {
    try {
      const plans = await storage.getActivePlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get('/api/plans/all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.is_admin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching all plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  // Admin Plans Management
  app.post('/api/admin/plans', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validation = insertPlanSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid plan data",
          errors: validation.error.flatten().fieldErrors
        });
      }

      const plan = await storage.createPlan(validation.data);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(500).json({ message: "Failed to create plan" });
    }
  });

  app.put('/api/admin/plans/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validation = insertPlanSchema.partial().safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid plan data",
          errors: validation.error.flatten().fieldErrors
        });
      }

      const plan = await storage.updatePlan(id, validation.data);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  app.delete('/api/admin/plans/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;

      // Check if plan exists
      const plan = await storage.getPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      await storage.deletePlan(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Set default plan (Admin)
  app.post('/api/admin/plans/:id/set-default', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;

      // Check if plan exists
      const plan = await storage.getPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const updatedPlan = await storage.setDefaultPlan(id);
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error setting default plan:", error);
      res.status(500).json({ message: "Failed to set default plan" });
    }
  });

  // Subscription routes
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const subscription = await storage.getUserSubscription(userId);

      if (!subscription) {
        return res.status(404).json({ message: "No active subscription" });
      }

      // Get usage stats
      const domainsCount = await storage.getUserDomainsCount(userId);
      const keywordsCount = await storage.getUserKeywordsCount(userId);

      res.json({
        ...subscription,
        usage: {
          domains: domainsCount,
          keywords: keywordsCount,
        }
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, checkRole(['admin', 'finance', 'receptionist']), async (req: any, res) => {
    try {
      const stats = {
        totalUsers: await storage.getTotalUsersCount(),
        totalSubscriptions: await storage.getTotalSubscriptionsCount(),
        monthlyRevenue: await storage.getMonthlyRevenue(),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, checkRole(['admin', 'receptionist']), async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/subscriptions', isAuthenticated, checkRole(['admin', 'finance']), async (req: any, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email, first_name, last_name, is_admin, role } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const newUser = await storage.createUser({
        email,
        first_name: first_name || null,
        last_name: last_name || null,
        is_admin: is_admin || (role === 'admin') || false,
        role: role || (is_admin ? 'admin' : 'user'),
        is_active: true,
        profile_image_url: null,
      });

      // Create default subscription
      const plans = await storage.getActivePlans();
      const basicPlan = plans.find(p => p.name === 'Basic') || plans[0];

      if (basicPlan) {
        const now = new Date();
        const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await storage.createSubscription({
          user_id: newUser.id,
          plan_id: basicPlan.id,
          status: 'active',
          current_period_start: now,
          current_period_end: oneMonthLater,
          cancel_at_period_end: false,
        });
      }

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch('/api/admin/users/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { is_admin, role, is_active, first_name, last_name } = req.body;

      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateData: any = {};
      if (typeof is_admin === 'boolean') updateData.is_admin = is_admin;
      if (role !== undefined) {
        updateData.role = role;
        if (role === 'admin') updateData.is_admin = true;
      }
      if (typeof is_active === 'boolean') updateData.is_active = is_active;
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;

      const updatedUser = await storage.updateUser(id, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Prevent deleting own account
      if (id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.patch('/api/admin/users/:id/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.is_admin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { plan_id } = req.body;

      if (!plan_id) {
        return res.status(400).json({ message: "plan_id is required" });
      }

      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const plan = await storage.getPlan(plan_id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const subscription = await storage.getUserSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "User has no subscription" });
      }

      const updatedSubscription = await storage.updateSubscription(subscription.id, {
        plan_id: plan_id,
      });

      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // System Settings routes (Admin only)
  app.get('/api/settings', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getAllSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get('/api/settings/:key', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSystemSetting(key);

      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.put('/api/settings/:key', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { key } = req.params;
      const { value, description } = req.body;

      const setting = await storage.upsertSystemSetting({
        key,
        value,
        description,
        updated_by: userId,
      });

      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // White Label Settings routes
  app.get('/api/white-label', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const settings = await storage.getUserWhiteLabelSettings(userId);

      if (!settings) {
        return res.json({
          user_id: userId,
          company_name: null,
          company_domain: null,
          company_email: null,
          company_logo_url: null,
          report_primary_color: "#4caf50",
        });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error fetching white label settings:", error);
      res.status(500).json({ message: "Failed to fetch white label settings" });
    }
  });

  app.put('/api/white-label', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { company_name, company_domain, company_email, company_logo_url, report_primary_color } = req.body;

      const settings = await storage.upsertWhiteLabelSettings({
        user_id: userId,
        company_name,
        company_domain,
        company_email,
        company_logo_url,
        report_primary_color,
      });

      res.json(settings);
    } catch (error) {
      console.error("Error updating white label settings:", error);
      res.status(500).json({ message: "Failed to update white label settings" });
    }
  });

  // Keyword Research routes
  app.post('/api/keyword-research', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { seedKeywords, targetLocation, strategy } = req.body;

      if (!seedKeywords || !Array.isArray(seedKeywords) || seedKeywords.length === 0) {
        return res.status(400).json({ message: "يرجى إدخال كلمات مفتاحية أساسية" });
      }

      if (!targetLocation) {
        return res.status(400).json({ message: "يرجى تحديد الدولة المستهدفة" });
      }

      if (!strategy) {
        return res.status(400).json({ message: "يرجى تحديد الاستراتيجية" });
      }

      const { generateKeywordsWithStrategy } = await import("./keywordResearchService");

      const result = await generateKeywordsWithStrategy(
        seedKeywords,
        targetLocation,
        strategy
      );

      const research = await storage.createKeywordResearch({
        user_id: userId,
        seed_keywords: seedKeywords,
        target_location: targetLocation,
        strategy,
        results: result,
      });

      res.json(research);
    } catch (error) {
      console.error("Error creating keyword research:", error);
      res.status(500).json({ message: "فشل في إنشاء البحث عن الكلمات المفتاحية" });
    }
  });

  app.post('/api/keyword-research/lsi-cluster', isAuthenticated, async (req: any, res) => {
    try {
      const { mainKeyword, targetLocation, contentType } = req.body;

      if (!mainKeyword) {
        return res.status(400).json({ message: "يرجى إدخال الكلمة المفتاحية الرئيسية" });
      }

      if (!targetLocation) {
        return res.status(400).json({ message: "يرجى تحديد الدولة المستهدفة" });
      }

      const { generateLSICluster } = await import("./keywordResearchService");

      const result = await generateLSICluster(
        mainKeyword,
        targetLocation,
        contentType || "مقال شامل"
      );

      res.json(result);
    } catch (error) {
      console.error("Error generating LSI cluster:", error);
      res.status(500).json({ message: "فشل في توليد مجموعة الكلمات المفتاحية LSI" });
    }
  });

  app.get('/api/keyword-research', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const research = await storage.getUserKeywordResearch(userId, limit);
      res.json(research);
    } catch (error) {
      console.error("Error getting keyword research:", error);
      res.status(500).json({ message: "فشل في جلب البحث عن الكلمات المفتاحية" });
    }
  });

  app.get('/api/keyword-research/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const research = await storage.getKeywordResearchById(id);

      if (!research) {
        return res.status(404).json({ message: "البحث غير موجود" });
      }

      res.json(research);
    } catch (error) {
      console.error("Error getting keyword research:", error);
      res.status(500).json({ message: "فشل في جلب البحث عن الكلمات المفتاحية" });
    }
  });

  app.delete('/api/keyword-research/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const research = await storage.getKeywordResearchById(id);
      if (!research) {
        return res.status(404).json({ message: "البحث غير موجود" });
      }

      if (research.user_id !== userId) {
        return res.status(403).json({ message: "غير مصرح لك بحذف هذا البحث" });
      }

      await storage.deleteKeywordResearch(id);
      res.json({ message: "تم حذف البحث بنجاح" });
    } catch (error) {
      console.error("Error deleting keyword research:", error);
      res.status(500).json({ message: "فشل في حذف البحث" });
    }
  });

  // Reports routes
  app.post('/api/reports/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { keywordIds, format: exportFormat, useWhiteLabel } = req.body;

      const { generateKeywordsReportHTML } = await import("./reportService");
      const html = await generateKeywordsReportHTML(userId, keywordIds || [], useWhiteLabel || false);

      if (exportFormat === 'html') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.html`);
        return res.send(html);
      }

      if (exportFormat === 'pdf') {
        const htmlToPdf = await import('html-pdf-node');
        const options = { format: 'A4', margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } };
        const file = { content: html };

        const pdfBuffer = await htmlToPdf.generatePdf(file, options);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.pdf`);
        return res.send(pdfBuffer);
      }

      res.status(400).json({ message: "Invalid format. Use 'html' or 'pdf'" });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Referral System Middleware - Track referral code from query param
  app.use(async (req: any, res, next) => {
    const ref = req.query.ref;

    if (ref && typeof ref === 'string') {
      const { trackReferralClick } = await import("./referralService");

      res.cookie('ref_code', ref, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
      });

      await trackReferralClick(
        ref,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent'),
        req.get('referer')
      );
    }

    next();
  });

  // Referral System Routes

  // Initialize referral settings (ensure settings exist)
  app.post('/api/admin/referrals/init-settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.initializeReferralSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error initializing referral settings:", error);
      res.status(500).json({ message: "Failed to initialize settings" });
    }
  });

  // Get referral settings (Admin)
  app.get('/api/admin/referrals/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      let settings = await storage.getReferralSettings();

      if (!settings) {
        settings = await storage.initializeReferralSettings();
      }

      res.json(settings);
    } catch (error) {
      console.error("Error fetching referral settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update referral settings (Admin)
  app.patch('/api/admin/referrals/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { is_enabled, commission_type, commission_value, free_plan_reward, cookie_duration_days, min_payout_threshold } = req.body;

      const updated = await storage.updateReferralSettings({
        ...(is_enabled !== undefined && { is_enabled }),
        ...(commission_type !== undefined && { commission_type }),
        ...(commission_value !== undefined && { commission_value }),
        ...(free_plan_reward !== undefined && { free_plan_reward }),
        ...(cookie_duration_days !== undefined && { cookie_duration_days }),
        ...(min_payout_threshold !== undefined && { min_payout_threshold }),
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating referral settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Get all referral conversions (Admin)
  app.get('/api/admin/referrals/conversions', isAuthenticated, checkRole(['admin', 'finance']), async (req, res) => {
    try {
      const conversions = await storage.getAllReferralConversions();
      res.json(conversions);
    } catch (error) {
      console.error("Error fetching conversions:", error);
      res.status(500).json({ message: "Failed to fetch conversions" });
    }
  });

  // Get all payout requests (Admin)
  app.get('/api/admin/referrals/payouts', isAuthenticated, checkRole(['admin', 'finance']), async (req, res) => {
    try {
      const payouts = await storage.getAllPayoutRequests();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  // Update payout request status (Admin)
  app.patch('/api/admin/referrals/payouts/:id', isAuthenticated, checkRole(['admin', 'finance']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updated = await storage.updatePayoutRequest(id, {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      });

      if (!updated) {
        return res.status(404).json({ message: "Payout request not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating payout:", error);
      res.status(500).json({ message: "Failed to update payout" });
    }
  });

  // User Routes

  // Get user's referral stats
  app.get('/api/referrals/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      let referral = await storage.getUserReferral(userId);

      if (!referral) {
        const { generateReferralCode } = await import("./referralService");
        const code = generateReferralCode(userId);

        referral = await storage.createUserReferral({
          user_id: userId,
          referral_code: code,
          total_earnings: 0,
          pending_earnings: 0,
          total_clicks: 0,
          total_conversions: 0,
        });
      }

      const conversions = await storage.getUserReferralConversions(userId);

      const totalCommission = conversions.reduce((sum, c) => sum + c.commission_amount, 0);
      const pendingCommission = conversions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.commission_amount, 0);
      const paidCommission = conversions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.commission_amount, 0);

      res.json({
        referral_code: referral.referral_code,
        total_clicks: referral.total_clicks,
        total_conversions: referral.total_conversions,
        total_commission: totalCommission,
        pending_commission: pendingCommission,
        paid_commission: paidCommission,
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  // Get user's payout requests
  app.get('/api/referrals/payout-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const payouts = await storage.getUserPayoutRequests(userId);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      res.status(500).json({ message: "Failed to fetch payout requests" });
    }
  });

  // Get user's referral data
  app.get('/api/referrals/my-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      let referral = await storage.getUserReferral(userId);

      if (!referral) {
        const subscription = await storage.getUserSubscription(userId);

        if (!subscription || subscription.plan.price_monthly === 0) {
          return res.status(403).json({
            message: "برنامج الإحالة متاح فقط للمشتركين في الباقات المدفوعة"
          });
        }

        const { generateReferralCode } = await import("./referralService");
        const code = generateReferralCode(userId);

        referral = await storage.createUserReferral({
          user_id: userId,
          referral_code: code,
          total_earnings: 0,
          pending_earnings: 0,
          total_clicks: 0,
          total_conversions: 0,
        });
      }

      const conversions = await storage.getUserReferralConversions(userId);
      const clicks = await storage.getReferralClicks(referral.referral_code, 100);
      const payouts = await storage.getUserPayoutRequests(userId);
      const settings = await storage.getReferralSettings();

      res.json({
        referral,
        conversions,
        clicks: clicks.length,
        payouts,
        settings,
      });
    } catch (error) {
      console.error("Error fetching referral data:", error);
      res.status(500).json({ message: "Failed to fetch referral data" });
    }
  });

  // Create payout request (new endpoint matching frontend)
  app.post('/api/referrals/payout-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { payment_method, payment_details } = req.body;

      if (!payment_method || !payment_details) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      const conversions = await storage.getUserReferralConversions(userId);
      const pendingCommission = conversions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.commission_amount, 0);

      if (pendingCommission === 0) {
        return res.status(400).json({ message: "لا توجد عمولات معلقة للسحب" });
      }

      const settings = await storage.getReferralSettings();

      if (!settings) {
        return res.status(500).json({ message: "إعدادات البرنامج غير متوفرة" });
      }

      if (pendingCommission < settings.min_payout_threshold) {
        return res.status(400).json({
          message: `الحد الأدنى للسحب هو ${settings.min_payout_threshold / 100} دولار`
        });
      }

      const payout = await storage.createPayoutRequest({
        user_id: userId,
        amount: pendingCommission,
        payout_method: payment_method,
        payout_details: payment_details,
        status: "pending",
      });

      res.json(payout);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Create payout request (legacy endpoint)
  app.post('/api/referrals/request-payout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { amount, payout_method, payout_details } = req.body;

      if (!amount || !payout_method || !payout_details) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      const referral = await storage.getUserReferral(userId);

      if (!referral) {
        return res.status(404).json({ message: "لم يتم العثور على بيانات الإحالة" });
      }

      const settings = await storage.getReferralSettings();

      if (!settings) {
        return res.status(500).json({ message: "إعدادات البرنامج غير متوفرة" });
      }

      if (amount < settings.min_payout_threshold) {
        return res.status(400).json({
          message: `الحد الأدنى للسحب هو ${settings.min_payout_threshold / 100} دولار`
        });
      }

      if (amount > referral.pending_earnings) {
        return res.status(400).json({
          message: "المبلغ المطلوب أكبر من الأرباح المتاحة"
        });
      }

      const payout = await storage.createPayoutRequest({
        user_id: userId,
        amount,
        payout_method,
        payout_details,
        status: "pending",
      });

      await storage.updateUserReferralStats(userId, {
        pending_earnings: referral.pending_earnings - amount,
      });

      res.json(payout);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Payment Methods Routes (Admin only)
  app.get('/api/admin/payment-methods', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const methods = await storage.getAllPaymentMethods();
      res.json(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post('/api/admin/payment-methods', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { name, name_ar, type, icon, is_active, config, display_order } = req.body;

      const method = await storage.createPaymentMethod({
        name,
        name_ar,
        type,
        icon,
        is_active,
        config,
        display_order: display_order || 0,
      });

      res.json(method);
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  app.patch('/api/admin/payment-methods/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const method = await storage.updatePaymentMethod(id, updates);

      if (!method) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      res.json(method);
    } catch (error) {
      console.error("Error updating payment method:", error);
      res.status(500).json({ message: "Failed to update payment method" });
    }
  });

  app.delete('/api/admin/payment-methods/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePaymentMethod(id);
      res.json({ message: "Payment method deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

  // Paymob Payment Routes
  app.post('/api/payment/paymob/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { plan_id, billing_data } = req.body;

      if (!plan_id) {
        return res.status(400).json({ message: "Plan ID is required" });
      }

      const plan = await storage.getPlan(plan_id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const { paymobService } = await import("./paymobService");

      const authToken = await paymobService.getAuthToken();
      const amountCents = plan.price_monthly;
      const currency = "EGP";

      const orderId = await paymobService.registerOrder(
        authToken,
        amountCents,
        currency,
        userId,
        plan_id
      );

      const paymentKey = await paymobService.getPaymentKey(
        authToken,
        orderId,
        amountCents,
        currency,
        billing_data
      );

      const transaction = await storage.createPaymobTransaction({
        user_id: userId,
        plan_id: plan_id,
        paymob_order_id: orderId.toString(),
        amount_cents: amountCents,
        currency: currency,
        status: "pending",
        billing_data: billing_data,
      });

      const iframeUrl = await paymobService.getIframeUrl(paymentKey);

      res.json({
        transaction_id: transaction.id,
        iframe_url: iframeUrl,
        payment_token: paymentKey,
      });
    } catch (error: any) {
      console.error("Error initiating Paymob payment:", error);
      res.status(500).json({ message: error.message || "Failed to initiate payment" });
    }
  });

  app.post('/api/payment/paymob/webhook', async (req, res) => {
    try {
      const { paymobService } = await import("./paymobService");
      const config = await paymobService.getConfig();

      const receivedHmac = req.query.hmac as string;
      const transactionData = req.body;

      if (!receivedHmac) {
        return res.status(400).json({ message: "HMAC signature missing" });
      }

      const isValid = paymobService.verifyWebhookSignature(
        transactionData.obj,
        receivedHmac,
        config.hmacSecret
      );

      if (!isValid) {
        console.error("Invalid HMAC signature");
        return res.status(403).json({ message: "Invalid signature" });
      }

      await paymobService.processPaymentCallback(transactionData);

      res.json({ message: "Webhook processed successfully" });
    } catch (error: any) {
      console.error("Error processing Paymob webhook:", error);
      res.status(500).json({ message: error.message || "Failed to process webhook" });
    }
  });

  app.get('/api/payment/paymob/callback', isAuthenticated, async (req: any, res: any) => {
    try {
      const { success, order } = req.query;

      if (success === "true") {
        res.redirect(`/subscription?payment=success&order=${order}`);
      } else {
        res.redirect(`/subscription?payment=failed&order=${order}`);
      }
    } catch (error) {
      console.error("Error handling Paymob callback:", error);
      res.redirect('/subscription?payment=error');
    }
  });

  // Pages Admin Routes
  app.get('/api/admin/pages', isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const allPages = await storage.getAllPages();
      res.json(allPages);
    } catch (error) {
      console.error("Error fetching all pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.post('/api/admin/pages', isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log("[API] POST /api/admin/pages - Request body:", req.body);
      const validation = insertPageSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("[API] POST /api/admin/pages - Validation failed:", validation.error.flatten().fieldErrors);
        return res.status(400).json({
          message: "Invalid page data",
          errors: validation.error.flatten().fieldErrors
        });
      }

      console.log("[API] POST /api/admin/pages - Validation success, creating page...");
      const newPage = await storage.createPage(validation.data);
      console.log("[API] POST /api/admin/pages - Page created successfully:", newPage.id);
      res.status(201).json(newPage);
    } catch (error) {
      console.error("[API] POST /api/admin/pages - Error creating page:", error);
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.put('/api/admin/pages/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`[API] PUT /api/admin/pages/${id} - Request body:`, req.body);
      const validation = insertPageSchema.partial().safeParse(req.body);
      if (!validation.success) {
        console.error(`[API] PUT /api/admin/pages/${id} - Validation failed:`, validation.error.flatten().fieldErrors);
        return res.status(400).json({
          message: "Invalid page data",
          errors: validation.error.flatten().fieldErrors
        });
      }

      const updatedPage = await storage.updatePage(id, validation.data);
      if (!updatedPage) {
        console.warn(`[API] PUT /api/admin/pages/${id} - Page not found`);
        return res.status(404).json({ message: "Page not found" });
      }

      console.log(`[API] PUT /api/admin/pages/${id} - Page updated successfully`);
      res.json(updatedPage);
    } catch (error) {
      console.error(`[API] PUT /api/admin/pages/${id} - Error updating page:`, error);
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete('/api/admin/pages/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePage(id);
      res.json({ message: "Page deleted successfully" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // Public Pages Routes
  app.get('/api/pages', async (_req, res) => {
    try {
      const footerPages = await storage.getFooterPages();
      res.json(footerPages);
    } catch (error) {
      console.error("Error fetching footer pages:", error);
      res.status(500).json({ message: "Failed to fetch footer pages" });
    }
  });

  app.get('/api/pages/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getPageBySlug(slug);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
