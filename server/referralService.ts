import { storage } from "./storage";

export function generateReferralCode(userId: string): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}

export async function trackReferralClick(
  referralCode: string,
  ipAddress?: string,
  userAgent?: string,
  referrerUrl?: string
): Promise<void> {
  const referral = await storage.getUserReferralByCode(referralCode);
  
  if (!referral) {
    return;
  }

  await storage.createReferralClick({
    referral_code: referralCode,
    ip_address: ipAddress,
    user_agent: userAgent,
    referrer_url: referrerUrl,
  });

  const currentStats = await storage.getUserReferral(referral.user_id);
  if (currentStats) {
    await storage.updateUserReferralStats(referral.user_id, {
      total_clicks: currentStats.total_clicks + 1,
    });
  }
}

export async function calculateCommission(
  planPrice: number,
  isFree: boolean
): Promise<{ amount: number; type: "percentage" | "fixed" }> {
  const settings = await storage.getReferralSettings();
  
  if (!settings) {
    return { amount: 0, type: "percentage" };
  }

  if (isFree) {
    return {
      amount: settings.free_plan_reward || 0,
      type: "fixed",
    };
  }

  const commissionType = settings.commission_type || 'percentage';
  const commissionValue = settings.commission_value || 0;

  if (commissionType === 'percentage') {
    const commissionAmount = Math.round((planPrice * commissionValue) / 100);
    return {
      amount: commissionAmount,
      type: "percentage",
    };
  } else {
    return {
      amount: Math.round(commissionValue * 100),
      type: "fixed",
    };
  }
}

export async function processReferralConversion(
  referralCode: string,
  newUserId: string,
  subscriptionId: string,
  planId: string,
  planPrice: number,
  isFree: boolean
): Promise<void> {
  const settings = await storage.getReferralSettings();
  
  if (!settings || !settings.is_enabled) {
    return;
  }

  const referral = await storage.getUserReferralByCode(referralCode);
  
  if (!referral) {
    return;
  }

  const commission = await calculateCommission(planPrice, isFree);

  await storage.createReferralConversion({
    referrer_id: referral.user_id,
    referred_user_id: newUserId,
    subscription_id: isFree ? null : subscriptionId,
    plan_id: planId,
    commission_amount: commission.amount,
    commission_type: commission.type,
    status: "pending",
  });

  const currentStats = await storage.getUserReferral(referral.user_id);
  if (currentStats) {
    await storage.updateUserReferralStats(referral.user_id, {
      total_conversions: currentStats.total_conversions + 1,
      total_earnings: currentStats.total_earnings + commission.amount,
      pending_earnings: currentStats.pending_earnings + commission.amount,
    });
  }
}
