import { Switch, Route, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { LogOut, Settings as SettingsIcon, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Pricing from "@/pages/pricing";
import Contact from "@/pages/contact";
import Dashboard from "@/pages/dashboard";
import Keywords from "@/pages/keywords";
import KeywordPreview from "@/pages/keyword-preview";
import KeywordLookup from "@/pages/keyword-lookup";
import KeywordResearch from "@/pages/keyword-research";
import Domains from "@/pages/domains";
import Analytics from "@/pages/analytics";
import Subscription from "@/pages/subscription";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import WhiteLabelSettings from "@/pages/white-label-settings";
import Referrals from "@/pages/referrals";
import Admin from "@/pages/admin";
import AdminPlans from "@/pages/admin-plans";
import AdminSubscriptions from "@/pages/admin-subscriptions";
import AdminReferrals from "@/pages/admin-referrals";
import AdminPaymentMethods from "@/pages/admin-payment-methods";
import AdminPaymobSettings from "@/pages/admin-paymob-settings";
import AdminPages from "@/pages/admin-pages";
import PageViewer from "@/pages/page";
import NotFound from "@/pages/not-found";
import { Footer } from "@/components/footer";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/page/:slug" component={PageViewer} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/keywords" component={Keywords} />
          <Route path="/keywords/:id/preview" component={KeywordPreview} />
          <Route path="/keyword-lookup" component={KeywordLookup} />
          <Route path="/keyword-research" component={KeywordResearch} />
          <Route path="/domains" component={Domains} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/settings" component={Settings} />
          <Route path="/white-label" component={WhiteLabelSettings} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/plans" component={AdminPlans} />
          <Route path="/admin/subscriptions" component={AdminSubscriptions} />
          <Route path="/admin/referrals" component={AdminReferrals} />
          <Route path="/admin/payment-methods" component={AdminPaymentMethods} />
          <Route path="/admin/paymob-settings" component={AdminPaymobSettings} />
          <Route path="/admin/pages" component={AdminPages} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const getUserInitial = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        {isAuthenticated && !isLoading && (
          <AppSidebar isAdmin={user?.is_admin || false} />
        )}
        <SidebarInset className="flex flex-col flex-1">
          {isAuthenticated && !isLoading && (
            <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 md:gap-4 border-b bg-background/80 backdrop-blur-md px-2 md:px-4 shadow-sm">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="h-6 w-px bg-border hidden sm:block" />
                <h2 className="text-xs sm:text-sm font-bold hidden sm:block bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                  {t("common.appName")} - {t("sidebar.subtitle")}
                </h2>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <NotificationDropdown />
                <LanguageSwitcher />
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" data-testid="button-user-menu">
                      <Avatar className="h-7 w-7 md:h-8 md:w-8">
                        {user?.profile_image_url && (
                          <AvatarImage
                            src={user.profile_image_url}
                            alt={user.first_name || user.email || "User"}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback>
                          {getUserInitial()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" data-testid="dropdown-user-menu">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none" data-testid="text-user-name">
                          {user?.first_name && user?.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user?.first_name || t("common.user")}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer" data-testid="link-settings">
                        <SettingsIcon className="me-2 h-4 w-4" />
                        <span>{t("common.settings")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscription" className="cursor-pointer" data-testid="link-subscription">
                        <CreditCard className="me-2 h-4 w-4" />
                        <span>{t("common.subscription")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await fetch('/api/logout', { method: 'POST' });
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Logout failed:', error);
                        }
                      }}
                      className="cursor-pointer"
                      data-testid="link-logout"
                    >
                      <LogOut className="me-2 h-4 w-4" />
                      <span>{t("common.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
          )}
          <main className="flex-1 overflow-auto">
            <div className={isAuthenticated && !isLoading ? "container max-w-7xl py-4 px-4 md:py-6" : ""}>
              <Router />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AppContent />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
