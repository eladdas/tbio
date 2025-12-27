import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Users, MousePointerClick, TrendingUp, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";

type ReferralSettings = {
  commission_type: string;
  commission_value: number;
  free_plan_reward: number;
  min_payout_threshold: number;
  cookie_duration_days: number;
};

type SystemStats = {
  total_referrals: number;
  total_clicks: number;
  total_conversions: number;
  total_commission_paid: number;
  pending_payouts: number;
};

type PayoutRequest = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: string;
  created_at: string;
  processed_at: string | null;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
};

type TopReferrer = {
  user_id: string;
  total_conversions: number;
  total_commission: number;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
};

export default function AdminReferrals() {
  const { toast } = useToast();
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<ReferralSettings>({
    commission_type: 'percentage',
    commission_value: 20,
    free_plan_reward: 500,
    min_payout_threshold: 10000,
    cookie_duration_days: 30,
  });

  const { data: settings, isLoading: isLoadingSettings } = useQuery<ReferralSettings>({
    queryKey: ['/api/admin/referrals/settings'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery<SystemStats>({
    queryKey: ['/api/admin/referrals/stats'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: payoutRequests, isLoading: isLoadingPayouts } = useQuery<PayoutRequest[]>({
    queryKey: ['/api/admin/referrals/payout-requests'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: topReferrers, isLoading: isLoadingTopReferrers } = useQuery<TopReferrer[]>({
    queryKey: ['/api/admin/referrals/top-referrers'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: ReferralSettings) => {
      return await apiRequest('PUT', '/api/admin/referrals/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals/settings'] });
      setEditingSettings(false);
      toast({
        title: "تم تحديث الإعدادات",
        description: "تم حفظ إعدادات الإحالة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث الإعدادات",
        variant: "destructive",
      });
    },
  });

  const processPayoutMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' | 'paid' }) => {
      return await apiRequest('PUT', `/api/admin/referrals/payout-requests/${id}`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals/payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals/stats'] });
      toast({
        title: "تم تحديث الطلب",
        description: "تم معالجة طلب السحب بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل معالجة طلب السحب",
        variant: "destructive",
      });
    },
  });

  const handleEditSettings = () => {
    if (settings) {
      setSettingsForm(settings);
    }
    setEditingSettings(true);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settingsForm);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: 'قيد المراجعة', variant: 'secondary' },
      approved: { label: 'معتمد', variant: 'default' },
      rejected: { label: 'مرفوض', variant: 'destructive' },
      paid: { label: 'مدفوع', variant: 'default' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant} data-testid={`badge-status-${status}`}>{statusInfo.label}</Badge>;
  };

  if (isLoadingSettings || isLoadingStats) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold" data-testid="heading-admin-referrals">إدارة برنامج الإحالة</h1>
          <p className="text-muted-foreground">
            إدارة إعدادات الإحالة ومراجعة طلبات السحب
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإحالات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-referrals">{stats?.total_referrals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي النقرات</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-clicks">{stats?.total_clicks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التحويلات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-conversions">{stats?.total_conversions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العمولات المدفوعة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4caf50]" data-testid="stat-total-commission-paid">
              ${(stats?.total_commission_paid || 0) / 100}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إعدادات برنامج الإحالة</CardTitle>
            <CardDescription>إدارة شروط وإعدادات نظام الإحالة</CardDescription>
          </div>
          {!editingSettings ? (
            <Button onClick={handleEditSettings} variant="outline" data-testid="button-edit-settings">
              تعديل
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ'
                )}
              </Button>
              <Button
                onClick={() => setEditingSettings(false)}
                variant="outline"
                data-testid="button-cancel-settings"
              >
                إلغاء
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="commission-type">نوع العمولة</Label>
              <Select
                value={editingSettings ? settingsForm.commission_type : settings?.commission_type}
                onValueChange={(value) => setSettingsForm({ ...settingsForm, commission_type: value })}
                disabled={!editingSettings}
              >
                <SelectTrigger id="commission-type" data-testid="select-commission-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">نسبة مئوية</SelectItem>
                  <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission-value">
                {(editingSettings ? settingsForm.commission_type : settings?.commission_type) === 'percentage'
                  ? 'نسبة العمولة (%)'
                  : 'قيمة العمولة ($)'}
              </Label>
              <Input
                id="commission-value"
                type="number"
                value={editingSettings ? settingsForm.commission_value : settings?.commission_value}
                onChange={(e) => setSettingsForm({ ...settingsForm, commission_value: parseFloat(e.target.value) })}
                disabled={!editingSettings}
                data-testid="input-commission-value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="free-plan-reward">مكافأة الباقة المجانية ($)</Label>
              <Input
                id="free-plan-reward"
                type="number"
                step="0.01"
                value={editingSettings ? settingsForm.free_plan_reward / 100 : (settings?.free_plan_reward || 0) / 100}
                onChange={(e) => setSettingsForm({ ...settingsForm, free_plan_reward: Math.round(parseFloat(e.target.value) * 100) })}
                disabled={!editingSettings}
                data-testid="input-free-plan-reward"
              />
              <p className="text-xs text-muted-foreground">
                مبلغ ثابت يُدفع عند تسجيل مستخدم عبر رابط الإحالة واشتراكه في باقة مجانية
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-payout">الحد الأدنى للسحب ($)</Label>
              <Input
                id="min-payout"
                type="number"
                value={editingSettings ? settingsForm.min_payout_threshold / 100 : (settings?.min_payout_threshold || 0) / 100}
                onChange={(e) => setSettingsForm({ ...settingsForm, min_payout_threshold: parseFloat(e.target.value) * 100 })}
                disabled={!editingSettings}
                data-testid="input-min-payout"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cookie-duration">مدة تتبع الإحالة (أيام)</Label>
              <Input
                id="cookie-duration"
                type="number"
                value={editingSettings ? settingsForm.cookie_duration_days : settings?.cookie_duration_days}
                onChange={(e) => setSettingsForm({ ...settingsForm, cookie_duration_days: parseInt(e.target.value) })}
                disabled={!editingSettings}
                data-testid="input-cookie-duration"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>طلبات السحب المعلقة</CardTitle>
          <CardDescription>
            {stats?.pending_payouts || 0} طلب في انتظار المراجعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPayouts ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !payoutRequests || payoutRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد طلبات سحب
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">طريقة الدفع</TableHead>
                  <TableHead className="text-right">تاريخ الطلب</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((request) => (
                  <TableRow key={request.id} data-testid={`row-payout-${request.id}`}>
                    <TableCell data-testid={`cell-user-${request.id}`}>
                      <div className="font-medium">{request.user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.user.first_name} {request.user.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`cell-amount-${request.id}`}>
                      ${request.amount / 100}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell data-testid={`cell-method-${request.id}`}>
                      <div>{request.payment_method}</div>
                      <div className="text-sm text-muted-foreground">{request.payment_details}</div>
                    </TableCell>
                    <TableCell data-testid={`cell-created-${request.id}`}>
                      {format(new Date(request.created_at), 'PPp', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processPayoutMutation.mutate({ id: request.id, action: 'approve' })}
                            disabled={processPayoutMutation.isPending}
                            data-testid={`button-approve-${request.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processPayoutMutation.mutate({ id: request.id, action: 'reject' })}
                            disabled={processPayoutMutation.isPending}
                            data-testid={`button-reject-${request.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {request.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => processPayoutMutation.mutate({ id: request.id, action: 'paid' })}
                          disabled={processPayoutMutation.isPending}
                          data-testid={`button-mark-paid-${request.id}`}
                        >
                          تم الدفع
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أفضل المحيلين</CardTitle>
          <CardDescription>المستخدمون ذوو أعلى تحويلات وعمولات</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTopReferrers ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !topReferrers || topReferrers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد بيانات متاحة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">التحويلات</TableHead>
                  <TableHead className="text-right">إجمالي العمولة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topReferrers.map((referrer) => (
                  <TableRow key={referrer.user_id} data-testid={`row-referrer-${referrer.user_id}`}>
                    <TableCell data-testid={`cell-user-${referrer.user_id}`}>
                      <div className="font-medium">{referrer.user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {referrer.user.first_name} {referrer.user.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`cell-conversions-${referrer.user_id}`}>
                      {referrer.total_conversions}
                    </TableCell>
                    <TableCell className="font-medium text-[#4caf50]" data-testid={`cell-commission-${referrer.user_id}`}>
                      ${referrer.total_commission / 100}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
