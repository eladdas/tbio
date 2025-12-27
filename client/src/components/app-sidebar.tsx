import { Home, TrendingUp, Globe, Settings, BarChart3, Users, Crown, CreditCard, Package, SearchCheck, Palette, Sparkles, Gift, Wallet, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Plan, Subscription } from "@shared/schema";

type SubscriptionResponse = Subscription & {
  plan: Plan;
  usage: {
    domains: number;
    keywords: number;
  };
};

interface AppSidebarProps {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();

  // Fetch subscription data
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery<SubscriptionResponse>({
    queryKey: ['/api/subscription'],
    retry: false,
  });

  // Calculate keyword usage percentage
  const keywordUsage = subscriptionData?.usage?.keywords || 0;
  const keywordLimit = subscriptionData?.plan?.keywords_limit || 0;
  const keywordPercentage = keywordLimit > 0
    ? Math.min((keywordUsage / keywordLimit) * 100, 100)
    : 100;

  const mainItems = [
    {
      title: t("sidebar.dashboard"),
      url: "/",
      icon: Home,
    },
    {
      title: t("sidebar.keywords"),
      url: "/keywords",
      icon: TrendingUp,
    },
    {
      title: t("sidebar.lookup"),
      url: "/keyword-lookup",
      icon: SearchCheck,
    },
    {
      title: t("sidebar.research"),
      url: "/keyword-research",
      icon: Sparkles,
    },
    {
      title: t("sidebar.domains"),
      url: "/domains",
      icon: Globe,
    },
    {
      title: t("sidebar.analytics"),
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: t("sidebar.subscription"),
      url: "/subscription",
      icon: CreditCard,
    },
    {
      title: t("sidebar.referrals"),
      url: "/referrals",
      icon: Gift,
    },
    {
      title: t("sidebar.settings"),
      url: "/settings",
      icon: Settings,
    },
    {
      title: t("sidebar.whiteLabel"),
      url: "/white-label",
      icon: Palette,
    },
  ];

  const adminItems = [
    {
      title: t("sidebar.adminDashboard"),
      url: "/admin",
      icon: Users,
    },
    {
      title: t("sidebar.plans"),
      url: "/admin/plans",
      icon: Package,
    },
    {
      title: t("sidebar.referralSystem"),
      url: "/admin/referrals",
      icon: Gift,
    },
    {
      title: t("sidebar.subscriptions"),
      url: "/admin/subscriptions",
      icon: CreditCard,
    },
    {
      title: t("sidebar.paymentMethods"),
      url: "/admin/payment-methods",
      icon: CreditCard,
    },
    {
      title: t("sidebar.paymobSettings"),
      url: "/admin/paymob-settings",
      icon: Wallet,
    },
    {
      title: t("sidebar.pages"),
      url: "/admin/pages",
      icon: FileText,
    },
  ];

  return (
    <Sidebar side={i18n.language === 'ar' ? "right" : "left"} collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold">{t("sidebar.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("sidebar.subtitle")}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.mainMenu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("sidebar.management")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        <Link href="/subscription">
          <div className="rounded-md bg-card p-3 border border-card-border hover-elevate cursor-pointer transition-all">
            {isLoadingSubscription ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full" />
                <Skeleton className="h-8 w-full mt-3" />
              </div>
            ) : subscriptionData ? (
              <>
                <div className="flex items-center gap-2 mb-2 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:justify-center">
                  <Crown className="h-4 w-4 text-chart-4" />
                  <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden" data-testid="sidebar-plan-name">
                    {i18n.language === 'ar' ? subscriptionData.plan.name_ar : subscriptionData.plan.name}
                  </span>
                </div>
                <div className="space-y-1 group-data-[collapsible=icon]:hidden">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t("common.keywords")}</span>
                    <span className="font-medium" data-testid="sidebar-keyword-usage">
                      {keywordUsage}/{keywordLimit}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${keywordPercentage}%` }}
                      data-testid="sidebar-keyword-progress"
                    />
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3 group-data-[collapsible=icon]:hidden" variant="outline" data-testid="button-manage-plan">
                  <CreditCard className="me-2 h-3 w-3" />
                  {t("sidebar.managePlan")}
                </Button>
              </>
            ) : (
              <div className="text-center py-2 group-data-[collapsible=icon]:hidden">
                <p className="text-xs text-muted-foreground">{t("sidebar.noActiveSubscription")}</p>
                <Button size="sm" className="w-full mt-2" variant="outline">
                  <CreditCard className="me-2 h-3 w-3" />
                  {t("sidebar.subscribeNow")}
                </Button>
              </div>
            )}
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
