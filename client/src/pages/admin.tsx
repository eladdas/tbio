import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Users,
  Activity,
  CreditCard,
  AlertCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  UserCog,
  Shield,
  Ban,
  CheckCircle,
  Settings,
  Key,
} from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Plan } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
}

interface SystemSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  updated_at: Date;
  updated_by: string | null;
}

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [serperApiKey, setSerperApiKey] = useState("");
  const [scrapingRobotApiKey, setScrapingRobotApiKey] = useState("");
  const [searchEngineProvider, setSearchEngineProvider] = useState("serper");
  const [googleGeminiApiKey, setGoogleGeminiApiKey] = useState("");

  const [googleAdsDeveloperToken, setGoogleAdsDeveloperToken] = useState("");
  const [googleAdsCustomerId, setGoogleAdsCustomerId] = useState("");
  const [googleAdsClientId, setGoogleAdsClientId] = useState("");
  const [googleAdsClientSecret, setGoogleAdsClientSecret] = useState("");
  const [googleAdsRefreshToken, setGoogleAdsRefreshToken] = useState("");

  const [newUser, setNewUser] = useState({
    email: "",
    first_name: "",
    last_name: "",
    is_admin: false,
    role: "user",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: plans } = useQuery<Plan[]>({
    queryKey: ["/api/plans/all"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: serperSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/serper_api_key"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: scrapingRobotSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/scrapingrobot_api_key"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: providerSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/search_engine_provider"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: geminiSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/google_gemini_api_key"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000,
  });

  const { data: adsDevTokenSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/google_ads_developer_token"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000,
  });

  const { data: adsCustomerIdSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/google_ads_customer_id"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000,
  });

  const { data: adsClientIdSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/google_ads_client_id"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000,
  });

  const { data: adsClientSecretSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/google_ads_client_secret"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000,
  });

  const { data: adsRefreshTokenSetting } = useQuery<SystemSetting>({
    queryKey: ["/api/settings/google_ads_refresh_token"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000,
  });

  // Update state when settings are loaded
  useEffect(() => {
    if (serperSetting?.value) {
      setSerperApiKey(serperSetting.value);
    }
  }, [serperSetting]);

  useEffect(() => {
    if (scrapingRobotSetting?.value) {
      setScrapingRobotApiKey(scrapingRobotSetting.value);
    }
  }, [scrapingRobotSetting]);

  useEffect(() => {
    if (providerSetting?.value) {
      setSearchEngineProvider(providerSetting.value);
    }
  }, [providerSetting]);

  useEffect(() => {
    if (geminiSetting?.value) {
      setGoogleGeminiApiKey(geminiSetting.value);
    }
  }, [geminiSetting]);

  useEffect(() => {
    if (adsDevTokenSetting?.value) setGoogleAdsDeveloperToken(adsDevTokenSetting.value);
  }, [adsDevTokenSetting]);

  useEffect(() => {
    if (adsCustomerIdSetting?.value) setGoogleAdsCustomerId(adsCustomerIdSetting.value);
  }, [adsCustomerIdSetting]);

  useEffect(() => {
    if (adsClientIdSetting?.value) setGoogleAdsClientId(adsClientIdSetting.value);
  }, [adsClientIdSetting]);

  useEffect(() => {
    if (adsClientSecretSetting?.value) setGoogleAdsClientSecret(adsClientSecretSetting.value);
  }, [adsClientSecretSetting]);

  useEffect(() => {
    if (adsRefreshTokenSetting?.value) setGoogleAdsRefreshToken(adsRefreshTokenSetting.value);
  }, [adsRefreshTokenSetting]);

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setAddUserOpen(false);
      setNewUser({ email: "", first_name: "", last_name: "", is_admin: false, role: "user" });
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء المستخدم الجديد",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل إنشاء المستخدم",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<User>;
    }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUserOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المستخدم",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تحديث المستخدم",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteUserOpen(false);
      setSelectedUser(null);
      toast({
        title: "تم بنجاح",
        description: "تم حذف المستخدم",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل حذف المستخدم",
      });
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: async ({ userId, planId }: { userId: string; planId: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan_id: planId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change plan");
      }
      return response.json();
    },
    onSuccess: () => {
      setChangePlanOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم تغيير الباقة",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تغيير الباقة",
      });
    },
  });

  const updateSerperKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await fetch("/api/settings/serper_api_key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          value: apiKey,
          description: "Serper.dev API key for keyword ranking checks"
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update API key");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/serper_api_key"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث مفتاح Serper API بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تحديث مفتاح API",
      });
    },
  });

  const updateScrapingRobotKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await fetch("/api/settings/scrapingrobot_api_key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          value: apiKey,
          description: "ScrapingRobot API key for keyword ranking checks"
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update API key");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/scrapingrobot_api_key"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث مفتاح ScrapingRobot API بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تحديث مفتاح API",
      });
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch("/api/settings/search_engine_provider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          value: provider,
          description: "Search engine provider (serper or scrapingrobot)"
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update provider");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/search_engine_provider"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث محرك البحث بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تحديث محرك البحث",
      });
    },
  });


  const updateGeminiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await fetch("/api/settings/google_gemini_api_key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          value: apiKey,
          description: "Google Gemini API key for keyword research"
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update API key");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/google_gemini_api_key"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث مفتاح Google Gemini API بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تحديث مفتاح API",
      });
    },
  });

  const updateAdsSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch(`/api/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          value,
          description: "Google Ads API setting"
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update setting");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${variables.key}`] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الإعداد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تحديث الإعداد",
      });
    },
  });

  if (!user?.is_admin && user?.role !== 'admin' && user?.role !== 'finance' && user?.role !== 'receptionist') {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="unauthorized-message">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-semibold">غير مصرح</h2>
              <p className="text-muted-foreground">
                ليس لديك صلاحيات الوصول إلى لوحة الإدارة. هذه الصفحة مخصصة للمشرفين فقط.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers =
    users?.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const formatCurrency = (cents: number) => {
    const dollars = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(dollars);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ar-SA").format(num);
  };

  const handleToggleStatus = (user: User) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { is_active: !user.is_active },
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
          لوحة المشرف
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
          لوحة الإدارة
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          إدارة المستخدمين ومراقبة صحة النظام والإشراف على جميع المستأجرين
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="إجمالي المستخدمين"
              value={formatNumber(stats?.totalUsers || 0)}
              icon={Users}
              subtitle="جميع المستخدمين المسجلين"
              data-testid="card-total-users"
            />
            <MetricCard
              title="الاشتراكات النشطة"
              value={formatNumber(stats?.totalSubscriptions || 0)}
              icon={Activity}
              subtitle="الاشتراكات الحالية"
              data-testid="card-active-subscriptions"
            />
            <MetricCard
              title="الإيرادات الشهرية"
              value={formatCurrency(stats?.monthlyRevenue || 0)}
              icon={CreditCard}
              subtitle="الإيرادات المتكررة"
              data-testid="card-monthly-revenue"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg md:text-xl">إعدادات محرك البحث</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="search_engine_provider">محرك البحث المستخدم</Label>
              <div className="flex gap-2">
                <Select
                  value={searchEngineProvider}
                  onValueChange={setSearchEngineProvider}
                >
                  <SelectTrigger id="search_engine_provider" className="flex-1" data-testid="select-search-provider">
                    <SelectValue placeholder="اختر محرك البحث" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serper">Serper.dev</SelectItem>
                    <SelectItem value="scrapingrobot">ScrapingRobot</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => updateProviderMutation.mutate(searchEngineProvider)}
                  disabled={updateProviderMutation.isPending}
                  data-testid="button-save-provider"
                >
                  {updateProviderMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                اختر محرك البحث الذي سيتم استخدامه لفحص ترتيب الكلمات المفتاحية
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="serper_api_key">مفتاح Serper.dev API</Label>
              <div className="flex gap-2">
                <Input
                  id="serper_api_key"
                  type="password"
                  value={serperApiKey}
                  onChange={(e) => setSerperApiKey(e.target.value)}
                  placeholder="أدخل مفتاح Serper API"
                  className="flex-1"
                  data-testid="input-serper-api-key"
                />
                <Button
                  onClick={() => updateSerperKeyMutation.mutate(serperApiKey)}
                  disabled={updateSerperKeyMutation.isPending || !serperApiKey}
                  data-testid="button-save-serper-key"
                >
                  {updateSerperKeyMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                يمكنك الحصول على مفتاح من{" "}
                <a
                  href="https://serper.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  serper.dev
                </a>
                {" "}(يُستخدم عند اختيار Serper كمحرك البحث)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scrapingrobot_api_key">مفتاح ScrapingRobot API</Label>
              <div className="flex gap-2">
                <Input
                  id="scrapingrobot_api_key"
                  type="password"
                  value={scrapingRobotApiKey}
                  onChange={(e) => setScrapingRobotApiKey(e.target.value)}
                  placeholder="أدخل مفتاح ScrapingRobot API"
                  className="flex-1"
                  data-testid="input-scrapingrobot-api-key"
                />
                <Button
                  onClick={() => updateScrapingRobotKeyMutation.mutate(scrapingRobotApiKey)}
                  disabled={updateScrapingRobotKeyMutation.isPending || !scrapingRobotApiKey}
                  data-testid="button-save-scrapingrobot-key"
                >
                  {updateScrapingRobotKeyMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                يمكنك الحصول على مفتاح من{" "}
                <a
                  href="https://scrapingrobot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  scrapingrobot.com
                </a>
                {" "}(يُستخدم عند اختيار ScrapingRobot كمحرك البحث)
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="google_gemini_api_key">مفتاح Google Gemini API</Label>
              <div className="flex gap-2">
                <Input
                  id="google_gemini_api_key"
                  type="password"
                  value={googleGeminiApiKey}
                  onChange={(e) => setGoogleGeminiApiKey(e.target.value)}
                  placeholder="أدخل مفتاح Google Gemini API"
                  className="flex-1"
                  data-testid="input-gemini-api-key"
                />
                <Button
                  onClick={() => updateGeminiKeyMutation.mutate(googleGeminiApiKey)}
                  disabled={updateGeminiKeyMutation.isPending || !googleGeminiApiKey}
                  data-testid="button-save-gemini-key"
                >
                  {updateGeminiKeyMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                مطلوب لأداة البحث عن الكلمات المفتاحية الذكية. يمكنك الحصول عليه من{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">إعدادات Google Ads (Keyword Planner)</h3>

              <div className="space-y-2">
                <Label htmlFor="google_ads_developer_token">Developer Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="google_ads_developer_token"
                    type="password"
                    value={googleAdsDeveloperToken}
                    onChange={(e) => setGoogleAdsDeveloperToken(e.target.value)}
                    placeholder="Developer Token"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => updateAdsSettingMutation.mutate({ key: "google_ads_developer_token", value: googleAdsDeveloperToken })}
                    disabled={updateAdsSettingMutation.isPending}
                  >
                    حفظ
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_ads_customer_id">Customer ID (Without dashes)</Label>
                <div className="flex gap-2">
                  <Input
                    id="google_ads_customer_id"
                    value={googleAdsCustomerId}
                    onChange={(e) => setGoogleAdsCustomerId(e.target.value)}
                    placeholder="1234567890"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => updateAdsSettingMutation.mutate({ key: "google_ads_customer_id", value: googleAdsCustomerId })}
                    disabled={updateAdsSettingMutation.isPending}
                  >
                    حفظ
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_ads_client_id">Client ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="google_ads_client_id"
                    value={googleAdsClientId}
                    onChange={(e) => setGoogleAdsClientId(e.target.value)}
                    placeholder="Client ID"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => updateAdsSettingMutation.mutate({ key: "google_ads_client_id", value: googleAdsClientId })}
                    disabled={updateAdsSettingMutation.isPending}
                  >
                    حفظ
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_ads_client_secret">Client Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="google_ads_client_secret"
                    type="password"
                    value={googleAdsClientSecret}
                    onChange={(e) => setGoogleAdsClientSecret(e.target.value)}
                    placeholder="Client Secret"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => updateAdsSettingMutation.mutate({ key: "google_ads_client_secret", value: googleAdsClientSecret })}
                    disabled={updateAdsSettingMutation.isPending}
                  >
                    حفظ
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_ads_refresh_token">Refresh Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="google_ads_refresh_token"
                    type="password"
                    value={googleAdsRefreshToken}
                    onChange={(e) => setGoogleAdsRefreshToken(e.target.value)}
                    placeholder="Refresh Token"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => updateAdsSettingMutation.mutate({ key: "google_ads_refresh_token", value: googleAdsRefreshToken })}
                    disabled={updateAdsSettingMutation.isPending}
                  >
                    حفظ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg md:text-xl">إدارة المستخدمين</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن المستخدمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                  data-testid="input-user-search"
                />
              </div>
              <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-user">
                    <Plus className="h-4 w-4 ms-2" />
                    إضافة مستخدم
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    <DialogDescription>
                      سيتم إنشاء المستخدم مع اشتراك Basic بشكل افتراضي
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        placeholder="user@example.com"
                        data-testid="input-new-user-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">الاسم الأول</Label>
                      <Input
                        id="first_name"
                        value={newUser.first_name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, first_name: e.target.value })
                        }
                        placeholder="محمد"
                        data-testid="input-new-user-firstname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">اسم العائلة</Label>
                      <Input
                        id="last_name"
                        value={newUser.last_name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, last_name: e.target.value })
                        }
                        placeholder="أحمد"
                        data-testid="input-new-user-lastname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">الصلاحيات</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) =>
                          setNewUser({ ...newUser, role: value, is_admin: value === 'admin' })
                        }
                      >
                        <SelectTrigger id="role" data-testid="select-new-user-role">
                          <SelectValue placeholder="اختر الصلاحية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">مستخدم عادي</SelectItem>
                          <SelectItem value="admin">مشرف (Admin)</SelectItem>
                          <SelectItem value="receptionist">موظف استقبال (Receptionist)</SelectItem>
                          <SelectItem value="finance">موظف مالية (Finance)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createUserMutation.mutate(newUser)}
                      disabled={createUserMutation.isPending || !newUser.email}
                      data-testid="button-submit-new-user"
                    >
                      {createUserMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-32" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "لم يتم العثور على مستخدمين" : "لا يوجد مستخدمين"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((usr) => (
                    <TableRow key={usr.id} data-testid={`row-user-${usr.id}`}>
                      <TableCell className="font-medium" data-testid={`text-name-${usr.id}`}>
                        {[usr.first_name, usr.last_name].filter(Boolean).join(" ") ||
                          "بدون اسم"}
                      </TableCell>
                      <TableCell data-testid={`text-email-${usr.id}`}>
                        {usr.email || "بدون بريد"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {usr.is_admin || usr.role === 'admin' ? (
                            <Badge variant="default" data-testid={`badge-admin-${usr.id}`}>
                              <Shield className="h-3 w-3 ms-1" />
                              مشرف
                            </Badge>
                          ) : usr.role === 'finance' ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100" data-testid={`badge-finance-${usr.id}`}>
                              <CreditCard className="h-3 w-3 ms-1" />
                              مالية
                            </Badge>
                          ) : usr.role === 'receptionist' ? (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100" data-testid={`badge-receptionist-${usr.id}`}>
                              <Users className="h-3 w-3 ms-1" />
                              استقبال
                            </Badge>
                          ) : (
                            <Badge variant="outline" data-testid={`badge-user-${usr.id}`}>
                              مستخدم
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {usr.is_active ? (
                          <Badge variant="default" className="bg-chart-2" data-testid={`badge-active-${usr.id}`}>
                            <CheckCircle className="h-3 w-3 ms-1" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="destructive" data-testid={`badge-inactive-${usr.id}`}>
                            <Ban className="h-3 w-3 ms-1" />
                            معطل
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground text-sm"
                        data-testid={`text-date-${usr.id}`}
                      >
                        {usr.created_at ? formatDate(usr.created_at) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(usr);
                              setEditUserOpen(true);
                            }}
                            data-testid={`button-edit-${usr.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(usr);
                              setChangePlanOpen(true);
                            }}
                            data-testid={`button-plan-${usr.id}`}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(usr)}
                            disabled={updateUserMutation.isPending}
                            data-testid={`button-toggle-${usr.id}`}
                          >
                            {usr.is_active ? (
                              <Ban className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-chart-2" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(usr);
                              setDeleteUserOpen(true);
                            }}
                            disabled={usr.id === user?.id}
                            data-testid={`button-delete-${usr.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>
              تعديل صلاحيات وبيانات المستخدم
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">الاسم الأول</Label>
                <Input
                  id="edit_first_name"
                  defaultValue={selectedUser.first_name || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, first_name: e.target.value })
                  }
                  data-testid="input-edit-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">اسم العائلة</Label>
                <Input
                  id="edit_last_name"
                  defaultValue={selectedUser.last_name || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, last_name: e.target.value })
                  }
                  data-testid="input-edit-lastname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_role">الصلاحيات</Label>
                <Select
                  value={selectedUser.role || "user"}
                  onValueChange={(value) =>
                    setSelectedUser({ ...selectedUser, role: value, is_admin: value === 'admin' })
                  }
                >
                  <SelectTrigger id="edit_role" data-testid="select-edit-user-role">
                    <SelectValue placeholder="اختر الصلاحية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم عادي</SelectItem>
                    <SelectItem value="admin">مشرف (Admin)</SelectItem>
                    <SelectItem value="receptionist">موظف استقبال (Receptionist)</SelectItem>
                    <SelectItem value="finance">موظف مالية (Finance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedUser) {
                  updateUserMutation.mutate({
                    id: selectedUser.id,
                    data: {
                      first_name: selectedUser.first_name,
                      last_name: selectedUser.last_name,
                      is_admin: selectedUser.is_admin,
                      role: selectedUser.role,
                    },
                  });
                }
              }}
              disabled={updateUserMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateUserMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير الباقة</DialogTitle>
            <DialogDescription>
              اختر الباقة الجديدة للمستخدم
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan_select">الباقة</Label>
                <Select
                  onValueChange={(planId) => {
                    changePlanMutation.mutate({
                      userId: selectedUser.id,
                      planId,
                    });
                  }}
                >
                  <SelectTrigger id="plan_select" data-testid="select-plan">
                    <SelectValue placeholder="اختر الباقة" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name_ar} - {formatCurrency(plan.price_monthly)}/شهر
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Alert */}
      <AlertDialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المستخدم نهائياً مع جميع بياناته (النطاقات، الكلمات المفتاحية، السجلات).
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser) {
                  deleteUserMutation.mutate(selectedUser.id);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteUserMutation.isPending ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
