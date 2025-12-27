import { db } from "./db";
import {
  users, domains, keywords, plans, subscriptions, keywordRankings, systemSettings, notifications, whiteLabelSettings, keywordResearch,
  referralSettings, userReferrals, referralClicks, referralConversions, payoutRequests, paymentMethods, paymobTransactions, pages,
  type User, type InsertUser, type UpsertUser,
  type Domain, type InsertDomain,
  type Keyword, type InsertKeyword,
  type Plan, type InsertPlan,
  type Subscription, type InsertSubscription,
  type KeywordRanking, type InsertKeywordRanking,
  type SystemSetting, type InsertSystemSetting,
  type Notification, type InsertNotification,
  type WhiteLabelSetting, type InsertWhiteLabelSetting,
  type KeywordResearch, type InsertKeywordResearch,
  type ReferralSettings, type InsertReferralSettings,
  type UserReferral, type InsertUserReferral,
  type ReferralClick, type InsertReferralClick,
  type ReferralConversion, type InsertReferralConversion,
  type PayoutRequest, type InsertPayoutRequest,
  type PaymentMethod, type InsertPaymentMethod,
  type PaymobTransaction, type InsertPaymobTransaction,
  type Page, type InsertPage,
  type IpLimit, type InsertIpLimit,
  ipLimits
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  toggleUserStatus(id: string, isActive: boolean): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Plans
  getAllPlans(): Promise<Plan[]>;
  getActivePlans(): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  getDefaultPlan(): Promise<Plan | undefined>;
  setDefaultPlan(planId: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<void>;

  // Subscriptions
  getUserSubscription(userId: string): Promise<(Subscription & { plan: Plan }) | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  cancelSubscription(id: string): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<(Subscription & { user: User; plan: Plan })[]>;

  // Domains
  getUserDomains(userId: string): Promise<Domain[]>;
  getDomain(id: string): Promise<Domain | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  deleteDomain(id: string): Promise<void>;
  getUserDomainsCount(userId: string): Promise<number>;

  // Keywords
  getUserKeywords(userId: string): Promise<Keyword[]>;
  getUserKeywordsEnriched(userId: string): Promise<any[]>;
  getDomainKeywords(domainId: string): Promise<Keyword[]>;
  getKeyword(id: string): Promise<Keyword | undefined>;
  createKeyword(keyword: InsertKeyword): Promise<Keyword>;
  createKeywordsBulk(keywords: InsertKeyword[]): Promise<Keyword[]>;
  updateKeyword(id: string, keyword: Partial<InsertKeyword>): Promise<Keyword | undefined>;
  deleteKeyword(id: string): Promise<void>;
  getUserKeywordsCount(userId: string): Promise<number>;

  // Keyword Rankings
  getKeywordRankings(keywordId: string, limit?: number): Promise<KeywordRanking[]>;
  getLatestKeywordRanking(keywordId: string): Promise<KeywordRanking | undefined>;
  createKeywordRanking(ranking: InsertKeywordRanking): Promise<KeywordRanking>;
  getKeywordWithDomain(keywordId: string): Promise<(Keyword & { domain: Domain }) | undefined>;
  getActiveKeywordsWithDomain(): Promise<(Keyword & { domain: Domain })[]>;

  // Statistics
  getTotalUsersCount(): Promise<number>;
  getTotalSubscriptionsCount(): Promise<number>;
  getMonthlyRevenue(): Promise<number>;

  // Analytics
  getUserAnalytics(userId: string): Promise<{
    improved: number;
    declined: number;
    avgChange: number;
    domainStats: Array<{
      domain: string;
      keywords: number;
      avgPosition: number;
      improving: number;
      declining: number;
    }>;
    keywordCharts: Array<{
      keyword: string;
      data: Array<{ date: string; position: number }>;
    }>;
  }>;

  // System Settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  getAllSystemSettings(): Promise<SystemSetting[]>;
  upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  deleteSystemSetting(key: string): Promise<void>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<(Notification & { keyword?: Keyword & { domain: Domain } })[]>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;

  // White Label Settings
  getUserWhiteLabelSettings(userId: string): Promise<WhiteLabelSetting | undefined>;
  upsertWhiteLabelSettings(settings: InsertWhiteLabelSetting): Promise<WhiteLabelSetting>;
  deleteWhiteLabelSettings(userId: string): Promise<void>;

  // Keyword Research
  createKeywordResearch(research: InsertKeywordResearch): Promise<KeywordResearch>;
  getUserKeywordResearch(userId: string, limit?: number): Promise<KeywordResearch[]>;
  getKeywordResearchById(id: string): Promise<KeywordResearch | undefined>;
  deleteKeywordResearch(id: string): Promise<void>;

  // Referral System
  getReferralSettings(): Promise<ReferralSettings | undefined>;
  updateReferralSettings(settings: Partial<InsertReferralSettings>): Promise<ReferralSettings>;
  initializeReferralSettings(): Promise<ReferralSettings>;

  getUserReferral(userId: string): Promise<UserReferral | undefined>;
  getUserReferralByCode(code: string): Promise<UserReferral | undefined>;
  createUserReferral(referral: InsertUserReferral): Promise<UserReferral>;
  updateUserReferralStats(userId: string, stats: { total_clicks?: number; total_conversions?: number; total_earnings?: number; pending_earnings?: number }): Promise<UserReferral | undefined>;

  createReferralClick(click: InsertReferralClick): Promise<ReferralClick>;
  getReferralClicks(referralCode: string, limit?: number): Promise<ReferralClick[]>;

  createReferralConversion(conversion: InsertReferralConversion): Promise<ReferralConversion>;
  getUserReferralConversions(userId: string): Promise<ReferralConversion[]>;
  getAllReferralConversions(): Promise<Array<ReferralConversion & { referrer: User; referred_user: User; plan: Plan }>>;

  createPayoutRequest(request: InsertPayoutRequest): Promise<PayoutRequest>;
  getUserPayoutRequests(userId: string): Promise<PayoutRequest[]>;
  getAllPayoutRequests(): Promise<Array<PayoutRequest & { user: User }>>;
  updatePayoutRequest(id: string, update: Partial<InsertPayoutRequest>): Promise<PayoutRequest | undefined>;

  // Payment Methods
  getAllPaymentMethods(): Promise<PaymentMethod[]>;
  getActivePaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: string): Promise<void>;

  // Paymob Transactions
  createPaymobTransaction(transaction: InsertPaymobTransaction): Promise<PaymobTransaction>;
  getPaymobTransaction(id: string): Promise<PaymobTransaction | undefined>;
  getPaymobTransactionByOrderId(orderId: string): Promise<PaymobTransaction | undefined>;
  updatePaymobTransaction(id: string, updates: Partial<InsertPaymobTransaction>): Promise<PaymobTransaction | undefined>;
  getUserPaymobTransactions(userId: string): Promise<PaymobTransaction[]>;

  // Pages
  getAllPages(): Promise<Page[]>;
  getActivePages(): Promise<Page[]>;
  getFooterPages(): Promise<Page[]>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  getPage(id: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: string): Promise<void>;
  deletePage(id: string): Promise<void>;

  // IP Limits
  getIpLimit(ip: string): Promise<IpLimit | undefined>;
  incrementIpLimit(ip: string): Promise<IpLimit>;
}

export class DBStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updated_at: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set({
      ...user,
      updated_at: new Date(),
    }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const isAdmin = role === 'admin';
    const result = await db.update(users).set({
      role,
      is_admin: isAdmin,
      updated_at: new Date(),
    }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<User | undefined> {
    const result = await db.update(users).set({
      is_active: isActive,
      updated_at: new Date(),
    }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Plans
  async getAllPlans(): Promise<Plan[]> {
    return await db.select().from(plans);
  }

  async getActivePlans(): Promise<Plan[]> {
    return await db.select().from(plans).where(eq(plans.is_active, true));
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return result[0];
  }

  async getDefaultPlan(): Promise<Plan | undefined> {
    const result = await db.select().from(plans).where(eq(plans.is_default, true)).limit(1);
    return result[0];
  }

  async setDefaultPlan(planId: string): Promise<Plan | undefined> {
    await db.update(plans).set({ is_default: false }).where(eq(plans.is_default, true));
    const result = await db.update(plans).set({ is_default: true }).where(eq(plans.id, planId)).returning();
    return result[0];
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const result = await db.insert(plans).values(plan as any).returning();
    return result[0];
  }

  async updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan | undefined> {
    const result = await db.update(plans).set(plan as any).where(eq(plans.id, id)).returning();
    return result[0];
  }

  async deletePlan(id: string): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }

  // Subscriptions
  async getUserSubscription(userId: string): Promise<(Subscription & { plan: Plan }) | undefined> {
    const result = await db
      .select()
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.plan_id, plans.id))
      .where(eq(subscriptions.user_id, userId))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].subscriptions,
      plan: result[0].plans
    };
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const result = await db.update(subscriptions).set({
      ...subscription,
      updated_at: new Date()
    }).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  async cancelSubscription(id: string): Promise<Subscription | undefined> {
    const result = await db.update(subscriptions).set({
      cancel_at_period_end: true,
      updated_at: new Date()
    }).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  // Domains
  async getUserDomains(userId: string): Promise<Domain[]> {
    return await db.select().from(domains).where(eq(domains.user_id, userId));
  }

  async getDomain(id: string): Promise<Domain | undefined> {
    const result = await db.select().from(domains).where(eq(domains.id, id)).limit(1);
    return result[0];
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const result = await db.insert(domains).values(domain).returning();
    return result[0];
  }

  async deleteDomain(id: string): Promise<void> {
    await db.delete(domains).where(eq(domains.id, id));
  }

  async getUserDomainsCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(domains)
      .where(eq(domains.user_id, userId));
    return Number(result[0]?.count || 0);
  }

  // Keywords
  async getUserKeywords(userId: string): Promise<Keyword[]> {
    return await db.select().from(keywords).where(eq(keywords.user_id, userId));
  }

  async getUserKeywordsEnriched(userId: string): Promise<any[]> {
    const userKeywords = await db
      .select({
        id: keywords.id,
        keyword: keywords.keyword,
        domain_id: keywords.domain_id,
        target_location: keywords.target_location,
        is_active: keywords.is_active,
        created_at: keywords.created_at,
        domain: domains.domain,
      })
      .from(keywords)
      .innerJoin(domains, eq(keywords.domain_id, domains.id))
      .where(eq(keywords.user_id, userId));

    // For each keyword, get its latest ranking
    const enrichedKeywords = await Promise.all(
      userKeywords.map(async (kw) => {
        const latestRanking = await this.getLatestKeywordRanking(kw.id);
        const rankings = await this.getKeywordRankings(kw.id, 2);

        const position = latestRanking?.position || null;
        const previousPosition = rankings.length > 1 ? rankings[1].position : position;

        return {
          ...kw,
          position,
          previousPosition,
          searchVolume: 0, // Placeholder - would need external API
          lastChecked: latestRanking?.checked_at || null,
        };
      })
    );

    return enrichedKeywords;
  }

  async getDomainKeywords(domainId: string): Promise<Keyword[]> {
    return await db.select().from(keywords).where(eq(keywords.domain_id, domainId));
  }

  async getKeyword(id: string): Promise<Keyword | undefined> {
    const result = await db.select().from(keywords).where(eq(keywords.id, id)).limit(1);
    return result[0];
  }

  async createKeyword(keyword: InsertKeyword): Promise<Keyword> {
    const result = await db.insert(keywords).values(keyword).returning();
    return result[0];
  }

  async createKeywordsBulk(keywordList: InsertKeyword[]): Promise<Keyword[]> {
    if (keywordList.length === 0) {
      return [];
    }
    const result = await db.insert(keywords).values(keywordList).returning();
    return result;
  }

  async updateKeyword(id: string, keyword: Partial<InsertKeyword>): Promise<Keyword | undefined> {
    const result = await db.update(keywords).set(keyword).where(eq(keywords.id, id)).returning();
    return result[0];
  }

  async deleteKeyword(id: string): Promise<void> {
    await db.delete(keywords).where(eq(keywords.id, id));
  }

  async getUserKeywordsCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(keywords)
      .where(eq(keywords.user_id, userId));
    return Number(result[0]?.count || 0);
  }

  // Keyword Rankings
  async getKeywordRankings(keywordId: string, limit: number = 30): Promise<KeywordRanking[]> {
    return await db
      .select()
      .from(keywordRankings)
      .where(eq(keywordRankings.keyword_id, keywordId))
      .orderBy(desc(keywordRankings.checked_at))
      .limit(limit);
  }

  async getLatestKeywordRanking(keywordId: string): Promise<KeywordRanking | undefined> {
    const result = await db
      .select()
      .from(keywordRankings)
      .where(eq(keywordRankings.keyword_id, keywordId))
      .orderBy(desc(keywordRankings.checked_at))
      .limit(1);
    return result[0];
  }

  async createKeywordRanking(ranking: InsertKeywordRanking): Promise<KeywordRanking> {
    const result = await db.insert(keywordRankings).values(ranking).returning();
    return result[0];
  }

  async getKeywordWithDomain(keywordId: string): Promise<(Keyword & { domain: Domain }) | undefined> {
    const result = await db
      .select()
      .from(keywords)
      .innerJoin(domains, eq(keywords.domain_id, domains.id))
      .where(eq(keywords.id, keywordId))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].keywords,
      domain: result[0].domains
    };
  }

  async getActiveKeywordsWithDomain(): Promise<(Keyword & { domain: Domain })[]> {
    const result = await db
      .select()
      .from(keywords)
      .innerJoin(domains, eq(keywords.domain_id, domains.id))
      .where(and(eq(keywords.is_active, true), eq(domains.is_active, true)));

    return result.map(row => ({
      ...row.keywords,
      domain: row.domains
    }));
  }

  // Subscriptions Management
  async getAllSubscriptions(): Promise<(Subscription & { user: User; plan: Plan })[]> {
    const result = await db
      .select()
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.user_id, users.id))
      .innerJoin(plans, eq(subscriptions.plan_id, plans.id))
      .orderBy(desc(subscriptions.created_at));

    return result.map(row => ({
      ...row.subscriptions,
      user: row.users,
      plan: row.plans
    }));
  }

  // Statistics
  async getTotalUsersCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return Number(result[0]?.count || 0);
  }

  async getTotalSubscriptionsCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    return Number(result[0]?.count || 0);
  }

  async getMonthlyRevenue(): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`sum(${plans.price_monthly})`
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.plan_id, plans.id))
      .where(eq(subscriptions.status, 'active'));
    return Number(result[0]?.total || 0);
  }

  // Analytics
  async getUserAnalytics(userId: string): Promise<{
    improved: number;
    declined: number;
    avgChange: number;
    domainStats: Array<{
      domain: string;
      keywords: number;
      avgPosition: number;
      improving: number;
      declining: number;
    }>;
    keywordCharts: Array<{
      keyword: string;
      data: Array<{ date: string; position: number }>;
    }>;
  }> {
    // Get all user keywords with their latest rankings
    const enrichedKeywords = await this.getUserKeywordsEnriched(userId);

    // Calculate improved and declined keywords using last 2 rankings
    let improved = 0;
    let declined = 0;
    let totalChange = 0;
    let changedCount = 0;

    enrichedKeywords.forEach(kw => {
      if (kw.position !== null && kw.previousPosition !== null && kw.position !== kw.previousPosition) {
        const change = kw.previousPosition - kw.position;
        totalChange += change;
        changedCount++;

        if (change > 0) improved++;
        else if (change < 0) declined++;
      }
    });

    const avgChange = changedCount > 0 ? totalChange / changedCount : 0;

    // Get domain statistics
    const userDomains = await this.getUserDomains(userId);
    const domainStats = await Promise.all(
      userDomains.map(async (domain) => {
        const domainKeywords = enrichedKeywords.filter(kw => kw.domain_id === domain.id);
        const rankedKeywords = domainKeywords.filter(kw => kw.position !== null);

        let improving = 0;
        let declining = 0;

        domainKeywords.forEach(kw => {
          if (kw.position !== null && kw.previousPosition !== null && kw.position !== kw.previousPosition) {
            const change = kw.previousPosition - kw.position;
            if (change > 0) improving++;
            else if (change < 0) declining++;
          }
        });

        const avgPosition = rankedKeywords.length > 0
          ? rankedKeywords.reduce((sum, kw) => sum + (kw.position || 0), 0) / rankedKeywords.length
          : 0;

        return {
          domain: domain.domain,
          keywords: domainKeywords.length,
          avgPosition: Math.round(avgPosition * 10) / 10,
          improving,
          declining,
        };
      })
    );

    // Get chart data for top 2 keywords using real dates
    const topKeywords = enrichedKeywords
      .filter(kw => kw.position !== null)
      .sort((a, b) => (a.position || 100) - (b.position || 100))
      .slice(0, 2);

    const keywordCharts = await Promise.all(
      topKeywords.map(async (kw) => {
        const rankings = await this.getKeywordRankings(kw.id, 7);
        const data = rankings
          .reverse()
          .map((r) => {
            const date = new Date(r.checked_at);
            return {
              date: date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
              position: r.position !== null ? r.position : 100,
            };
          });

        return {
          keyword: kw.keyword,
          data,
        };
      })
    );

    return {
      improved,
      declined,
      avgChange: Math.round(avgChange * 10) / 10,
      domainStats,
      keywordCharts,
    };
  }

  // System Settings
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [result] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return result;
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(setting.key);

    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({
          value: setting.value,
          description: setting.description,
          updated_by: setting.updated_by,
          updated_at: new Date()
        })
        .where(eq(systemSettings.key, setting.key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values(setting)
        .returning();
      return created;
    }
  }

  async deleteSystemSetting(key: string): Promise<void> {
    await db.delete(systemSettings).where(eq(systemSettings.key, key));
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications).values(notification).returning();
    return result;
  }

  async getUserNotifications(userId: string, limit: number = 10): Promise<(Notification & { keyword?: Keyword & { domain: Domain } })[]> {
    const results = await db
      .select()
      .from(notifications)
      .leftJoin(keywords, eq(notifications.keyword_id, keywords.id))
      .leftJoin(domains, eq(keywords.domain_id, domains.id))
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at))
      .limit(limit);

    return results.map(row => ({
      ...row.notifications,
      keyword: row.keywords && row.domains ? {
        ...row.keywords,
        domain: row.domains
      } : undefined
    }));
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)));
    return Number(result[0]?.count || 0);
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [result] = await db
      .update(notifications)
      .set({ is_read: true })
      .where(eq(notifications.id, id))
      .returning();
    return result;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ is_read: true })
      .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)));
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // White Label Settings
  async getUserWhiteLabelSettings(userId: string): Promise<WhiteLabelSetting | undefined> {
    const [result] = await db
      .select()
      .from(whiteLabelSettings)
      .where(eq(whiteLabelSettings.user_id, userId))
      .limit(1);
    return result;
  }

  async upsertWhiteLabelSettings(settings: InsertWhiteLabelSetting): Promise<WhiteLabelSetting> {
    const [result] = await db
      .insert(whiteLabelSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: whiteLabelSettings.user_id,
        set: {
          ...settings,
          updated_at: new Date(),
        },
      })
      .returning();
    return result;
  }

  async deleteWhiteLabelSettings(userId: string): Promise<void> {
    await db.delete(whiteLabelSettings).where(eq(whiteLabelSettings.user_id, userId));
  }

  // Keyword Research
  async createKeywordResearch(research: InsertKeywordResearch): Promise<KeywordResearch> {
    const [result] = await db
      .insert(keywordResearch)
      .values(research)
      .returning();
    return result;
  }

  async getUserKeywordResearch(userId: string, limit: number = 50): Promise<KeywordResearch[]> {
    return await db
      .select()
      .from(keywordResearch)
      .where(eq(keywordResearch.user_id, userId))
      .orderBy(desc(keywordResearch.created_at))
      .limit(limit);
  }

  async getKeywordResearchById(id: string): Promise<KeywordResearch | undefined> {
    const [result] = await db
      .select()
      .from(keywordResearch)
      .where(eq(keywordResearch.id, id))
      .limit(1);
    return result;
  }

  async deleteKeywordResearch(id: string): Promise<void> {
    await db.delete(keywordResearch).where(eq(keywordResearch.id, id));
  }

  // Referral System
  async getReferralSettings(): Promise<ReferralSettings | undefined> {
    const [result] = await db
      .select()
      .from(referralSettings)
      .limit(1);
    return result;
  }

  async updateReferralSettings(settings: Partial<InsertReferralSettings>): Promise<ReferralSettings> {
    const existing = await this.getReferralSettings();

    if (existing) {
      const [updated] = await db
        .update(referralSettings)
        .set({
          ...settings,
          updated_at: new Date(),
        })
        .where(eq(referralSettings.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(referralSettings)
      .values(settings as InsertReferralSettings)
      .returning();
    return created;
  }

  async initializeReferralSettings(): Promise<ReferralSettings> {
    const existing = await this.getReferralSettings();
    if (existing) return existing;

    const [created] = await db
      .insert(referralSettings)
      .values({
        is_enabled: true,
        commission_type: 'percentage',
        commission_value: 20,
        free_plan_reward: 500,
        cookie_duration_days: 30,
        min_payout_threshold: 10000,
      })
      .returning();
    return created;
  }

  async getUserReferral(userId: string): Promise<UserReferral | undefined> {
    const [result] = await db
      .select()
      .from(userReferrals)
      .where(eq(userReferrals.user_id, userId))
      .limit(1);
    return result;
  }

  async getUserReferralByCode(code: string): Promise<UserReferral | undefined> {
    const [result] = await db
      .select()
      .from(userReferrals)
      .where(eq(userReferrals.referral_code, code))
      .limit(1);
    return result;
  }

  async createUserReferral(referral: InsertUserReferral): Promise<UserReferral> {
    const [result] = await db
      .insert(userReferrals)
      .values(referral)
      .returning();
    return result;
  }

  async updateUserReferralStats(
    userId: string,
    stats: { total_clicks?: number; total_conversions?: number; total_earnings?: number; pending_earnings?: number }
  ): Promise<UserReferral | undefined> {
    const [updated] = await db
      .update(userReferrals)
      .set({
        ...stats,
        updated_at: new Date(),
      })
      .where(eq(userReferrals.user_id, userId))
      .returning();
    return updated;
  }

  async createReferralClick(click: InsertReferralClick): Promise<ReferralClick> {
    const [result] = await db
      .insert(referralClicks)
      .values(click)
      .returning();
    return result;
  }

  async getReferralClicks(referralCode: string, limit: number = 100): Promise<ReferralClick[]> {
    return await db
      .select()
      .from(referralClicks)
      .where(eq(referralClicks.referral_code, referralCode))
      .orderBy(desc(referralClicks.clicked_at))
      .limit(limit);
  }

  async createReferralConversion(conversion: InsertReferralConversion): Promise<ReferralConversion> {
    const [result] = await db
      .insert(referralConversions)
      .values(conversion)
      .returning();
    return result;
  }

  async getUserReferralConversions(userId: string): Promise<ReferralConversion[]> {
    return await db
      .select()
      .from(referralConversions)
      .where(eq(referralConversions.referrer_id, userId))
      .orderBy(desc(referralConversions.created_at));
  }

  async getAllReferralConversions(): Promise<Array<ReferralConversion & { referrer: User; referred_user: User; plan: Plan }>> {
    const results = await db
      .select({
        conversion: referralConversions,
        referrer: users,
        referred_user: users,
        plan: plans,
      })
      .from(referralConversions)
      .leftJoin(users, eq(referralConversions.referrer_id, users.id))
      .leftJoin(users, eq(referralConversions.referred_user_id, users.id))
      .leftJoin(plans, eq(referralConversions.plan_id, plans.id))
      .orderBy(desc(referralConversions.created_at));

    return results.map((row) => ({
      ...row.conversion,
      referrer: row.referrer!,
      referred_user: row.referred_user!,
      plan: row.plan!,
    }));
  }

  async createPayoutRequest(request: InsertPayoutRequest): Promise<PayoutRequest> {
    const [result] = await db
      .insert(payoutRequests)
      .values(request)
      .returning();
    return result;
  }

  async getUserPayoutRequests(userId: string): Promise<PayoutRequest[]> {
    return await db
      .select()
      .from(payoutRequests)
      .where(eq(payoutRequests.user_id, userId))
      .orderBy(desc(payoutRequests.created_at));
  }

  async getAllPayoutRequests(): Promise<Array<PayoutRequest & { user: User }>> {
    const results = await db
      .select({
        payout: payoutRequests,
        user: users,
      })
      .from(payoutRequests)
      .leftJoin(users, eq(payoutRequests.user_id, users.id))
      .orderBy(desc(payoutRequests.created_at));

    return results.map((row) => ({
      ...row.payout,
      user: row.user!,
    }));
  }

  async updatePayoutRequest(id: string, update: Partial<InsertPayoutRequest>): Promise<PayoutRequest | undefined> {
    const [updated] = await db
      .update(payoutRequests)
      .set({
        ...update,
        ...(update.status === "completed" ? { processed_at: new Date() } : {}),
      })
      .where(eq(payoutRequests.id, id))
      .returning();
    return updated;
  }

  // Payment Methods
  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).orderBy(paymentMethods.display_order);
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.is_active, true))
      .orderBy(paymentMethods.display_order);
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return method;
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [created] = await db.insert(paymentMethods).values(method).returning();
    return created;
  }

  async updatePaymentMethod(id: string, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const [updated] = await db
      .update(paymentMethods)
      .set({ ...method, updated_at: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning();
    return updated;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  // Paymob Transactions
  async createPaymobTransaction(transaction: InsertPaymobTransaction): Promise<PaymobTransaction> {
    const [created] = await db.insert(paymobTransactions).values(transaction).returning();
    return created;
  }

  async getPaymobTransaction(id: string): Promise<PaymobTransaction | undefined> {
    const [transaction] = await db.select().from(paymobTransactions).where(eq(paymobTransactions.id, id));
    return transaction;
  }

  async getPaymobTransactionByOrderId(orderId: string): Promise<PaymobTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(paymobTransactions)
      .where(eq(paymobTransactions.paymob_order_id, orderId));
    return transaction;
  }

  async updatePaymobTransaction(id: string, updates: Partial<InsertPaymobTransaction>): Promise<PaymobTransaction | undefined> {
    const [updated] = await db
      .update(paymobTransactions)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(paymobTransactions.id, id))
      .returning();
    return updated;
  }

  async getUserPaymobTransactions(userId: string): Promise<PaymobTransaction[]> {
    return await db
      .select()
      .from(paymobTransactions)
      .where(eq(paymobTransactions.user_id, userId))
      .orderBy(desc(paymobTransactions.created_at));
  }

  // Pages
  async getAllPages(): Promise<Page[]> {
    return await db
      .select()
      .from(pages)
      .orderBy(desc(pages.created_at));
  }

  async getActivePages(): Promise<Page[]> {
    return await db
      .select()
      .from(pages)
      .where(eq(pages.is_active, true))
      .orderBy(pages.display_order);
  }

  async getFooterPages(): Promise<Page[]> {
    return await db
      .select()
      .from(pages)
      .where(and(eq(pages.is_active, true), eq(pages.show_in_footer, true)))
      .orderBy(pages.display_order);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [result] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.slug, slug), eq(pages.is_active, true)))
      .limit(1);
    return result;
  }

  async getPage(id: string): Promise<Page | undefined> {
    const [result] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);
    return result;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [result] = await db
      .insert(pages)
      .values(page)
      .returning();
    return result;
  }

  async updatePage(id: string, page: Partial<InsertPage>): Promise<Page | undefined> {
    const [result] = await db
      .update(pages)
      .set({ ...page, updated_at: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return result;
  }

  async deletePage(id: string): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  // IP Limits
  async getIpLimit(ip: string): Promise<IpLimit | undefined> {
    const [result] = await db.select().from(ipLimits).where(eq(ipLimits.ip, ip));
    return result;
  }

  async incrementIpLimit(ip: string): Promise<IpLimit> {
    const existing = await this.getIpLimit(ip);

    if (existing) {
      const [updated] = await db
        .update(ipLimits)
        .set({
          count: existing.count + 1,
          last_request_at: new Date()
        })
        .where(eq(ipLimits.ip, ip))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(ipLimits)
        .values({
          ip,
          count: 1,
          last_request_at: new Date()
        })
        .returning();
      return created;
    }
  }
}

export const storage = new DBStorage();
