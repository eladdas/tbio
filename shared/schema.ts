import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper for boolean columns
const boolean = (name: string) => integer(name, { mode: "boolean" });
// Helper for timestamp columns
const timestamp = (name: string) => integer(name, { mode: "timestamp" });
// Helper for json columns
const json = (name: string) => text(name, { mode: "json" });

// Session storage table - Required for persistent login sessions
// Note: connect-sqlite3 manages its own table usually, but defining it here is fine for Drizzle awareness
export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: integer("expire").notNull(),
});

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  password: text("password"),
  first_name: text("first_name"),
  last_name: text("last_name"),
  profile_image_url: text("profile_image_url"),
  phone: text("phone"),
  account_type: text("account_type").default("individual"),
  company_name: text("company_name"),
  billing_address: json("billing_address"),
  is_admin: boolean("is_admin").default(false).notNull(),
  role: text("role").default("user").notNull(), // admin, receptionist, finance, user
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Plans table
export const plans = sqliteTable("plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  name_ar: text("name_ar").notNull(),
  description: text("description"),
  price_monthly: integer("price_monthly").notNull(),
  price_yearly: integer("price_yearly").notNull(),
  keywords_limit: integer("keywords_limit").notNull(),
  domains_limit: integer("domains_limit").notNull(),
  update_frequency_hours: integer("update_frequency_hours").notNull().default(24),
  features: json("features").$type<{ text: string; included: boolean }[]>(),
  is_active: boolean("is_active").default(true).notNull(),
  is_default: boolean("is_default").default(false).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  created_at: true,
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

// Subscriptions table
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan_id: text("plan_id").notNull().references(() => plans.id),
  stripe_subscription_id: text("stripe_subscription_id"),
  stripe_customer_id: text("stripe_customer_id"),
  status: text("status").notNull().default("active"),
  current_period_start: timestamp("current_period_start"),
  current_period_end: timestamp("current_period_end"),
  cancel_at_period_end: boolean("cancel_at_period_end").default(false).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Domains table
export const domains = sqliteTable("domains", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  created_at: true,
});

export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;

// Keywords table
export const keywords = sqliteTable("keywords", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  domain_id: text("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
  target_location: text("target_location").default("SA").notNull(),
  device_type: text("device_type").default("desktop").notNull(),
  tags: json("tags").default([]), // SQLite doesn't behave well with arrays, using JSON
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertKeywordSchema = createInsertSchema(keywords).omit({
  id: true,
  created_at: true,
});

export type InsertKeyword = z.infer<typeof insertKeywordSchema>;
export type Keyword = typeof keywords.$inferSelect;

// Keyword Rankings table
export const keywordRankings = sqliteTable("keyword_rankings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  keyword_id: text("keyword_id").notNull().references(() => keywords.id, { onDelete: "cascade" }),
  position: integer("position"),
  url: text("url"),
  previous_position: integer("previous_position"),
  checked_at: timestamp("checked_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertKeywordRankingSchema = createInsertSchema(keywordRankings).omit({
  id: true,
  checked_at: true,
});

export type InsertKeywordRanking = z.infer<typeof insertKeywordRankingSchema>;
export type KeywordRanking = typeof keywordRankings.$inferSelect;

// System Settings table
export const systemSettings = sqliteTable("system_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_by: text("updated_by").references(() => users.id),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updated_at: true,
});

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  keyword_id: text("keyword_id").references(() => keywords.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  old_position: integer("old_position"),
  new_position: integer("new_position"),
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// White Label Settings table
export const whiteLabelSettings = sqliteTable("white_label_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  company_name: text("company_name"),
  company_domain: text("company_domain"),
  company_email: text("company_email"),
  company_logo_url: text("company_logo_url"),
  report_primary_color: text("report_primary_color").default("#4caf50"),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertWhiteLabelSettingSchema = createInsertSchema(whiteLabelSettings).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertWhiteLabelSetting = z.infer<typeof insertWhiteLabelSettingSchema>;
export type WhiteLabelSetting = typeof whiteLabelSettings.$inferSelect;

// Keyword Research table
export const keywordResearch = sqliteTable("keyword_research", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  seed_keywords: json("seed_keywords").notNull(), // Was array, use json
  target_location: text("target_location").notNull(),
  strategy: text("strategy").notNull(),
  results: json("results").notNull(),
  status: text("status").default("completed").notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertKeywordResearchSchema = createInsertSchema(keywordResearch).omit({
  id: true,
  created_at: true,
});

export type InsertKeywordResearch = z.infer<typeof insertKeywordResearchSchema>;
export type KeywordResearch = typeof keywordResearch.$inferSelect;

// Referral Settings
export const referralSettings = sqliteTable("referral_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  is_enabled: boolean("is_enabled").default(true).notNull(),
  commission_type: text("commission_type").default('percentage').notNull(),
  commission_value: real("commission_value").default(20).notNull(),
  free_plan_reward: integer("free_plan_reward").default(500).notNull(),
  min_payout_threshold: integer("min_payout_threshold").default(10000).notNull(),
  cookie_duration_days: integer("cookie_duration_days").default(30).notNull(),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertReferralSettingsSchema = createInsertSchema(referralSettings).omit({
  id: true,
  updated_at: true,
});

export type InsertReferralSettings = z.infer<typeof insertReferralSettingsSchema>;
export type ReferralSettings = typeof referralSettings.$inferSelect;

// User Referrals
export const userReferrals = sqliteTable("user_referrals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  referral_code: text("referral_code").notNull().unique(),
  total_earnings: integer("total_earnings").default(0).notNull(),
  pending_earnings: integer("pending_earnings").default(0).notNull(),
  total_clicks: integer("total_clicks").default(0).notNull(),
  total_conversions: integer("total_conversions").default(0).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserReferralSchema = createInsertSchema(userReferrals).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUserReferral = z.infer<typeof insertUserReferralSchema>;
export type UserReferral = typeof userReferrals.$inferSelect;

// Referral Clicks
export const referralClicks = sqliteTable("referral_clicks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referral_code: text("referral_code").notNull(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  referrer_url: text("referrer_url"),
  clicked_at: timestamp("clicked_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertReferralClickSchema = createInsertSchema(referralClicks).omit({
  id: true,
  clicked_at: true,
});

export type InsertReferralClick = z.infer<typeof insertReferralClickSchema>;
export type ReferralClick = typeof referralClicks.$inferSelect;

// Referral Conversions
export const referralConversions = sqliteTable("referral_conversions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referrer_id: text("referrer_id").notNull().references(() => users.id),
  referred_user_id: text("referred_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscription_id: text("subscription_id").references(() => subscriptions.id),
  plan_id: text("plan_id").notNull().references(() => plans.id),
  commission_amount: integer("commission_amount").notNull(),
  commission_type: text("commission_type").notNull(),
  status: text("status").default("pending").notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertReferralConversionSchema = createInsertSchema(referralConversions).omit({
  id: true,
  created_at: true,
});

export type InsertReferralConversion = z.infer<typeof insertReferralConversionSchema>;
export type ReferralConversion = typeof referralConversions.$inferSelect;

// Payout Requests
export const payoutRequests = sqliteTable("payout_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  payout_method: text("payout_method").notNull(),
  payout_details: json("payout_details").notNull(),
  status: text("status").default("pending").notNull(),
  processed_at: timestamp("processed_at"),
  notes: text("notes"),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).omit({
  id: true,
  created_at: true,
});

export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;
export type PayoutRequest = typeof payoutRequests.$inferSelect;

// Payment Methods table
export const paymentMethods = sqliteTable("payment_methods", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  name_ar: text("name_ar").notNull(),
  type: text("type").notNull(), // 'ewallet' or 'instapay'
  icon: text("icon"),
  is_active: boolean("is_active").default(true).notNull(),
  config: json("config").$type<Record<string, any>>(),
  display_order: integer("display_order").default(0).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Paymob Transactions table
export const paymobTransactions = sqliteTable("paymob_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscription_id: text("subscription_id").references(() => subscriptions.id),
  plan_id: text("plan_id").notNull().references(() => plans.id),
  paymob_order_id: text("paymob_order_id"),
  paymob_transaction_id: text("paymob_transaction_id"),
  amount_cents: integer("amount_cents").notNull(),
  currency: text("currency").default("EGP").notNull(),
  status: text("status").default("pending").notNull(), // pending, success, failed, refunded
  payment_method: text("payment_method"), // card, wallet, etc.
  billing_data: json("billing_data"),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPaymobTransactionSchema = createInsertSchema(paymobTransactions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertPaymobTransaction = z.infer<typeof insertPaymobTransactionSchema>;
export type PaymobTransaction = typeof paymobTransactions.$inferSelect;

// Pages table
export const pages = sqliteTable("pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  title_ar: text("title_ar").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  content_ar: text("content_ar").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  show_in_footer: boolean("show_in_footer").default(false).notNull(),
  display_order: integer("display_order").default(0).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;


// IP Limits table for rate limiting
export const ipLimits = sqliteTable("ip_limits", {
  ip: text("ip").primaryKey(),
  count: integer("count").default(0).notNull(),
  last_request_at: timestamp("last_request_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertIpLimitSchema = createInsertSchema(ipLimits);
export type InsertIpLimit = z.infer<typeof insertIpLimitSchema>;
export type IpLimit = typeof ipLimits.$inferSelect;
