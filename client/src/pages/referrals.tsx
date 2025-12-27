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
import { Copy, Check, DollarSign, Users, MousePointerClick, TrendingUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type ReferralStats = {
  referral_code: string;
  total_clicks: number;
  total_conversions: number;
  total_commission: number;
  pending_commission: number;
  paid_commission: number;
};

type PayoutRequest = {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: string;
  created_at: string;
  processed_at: string | null;
};

export default function Referrals() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading: isLoadingStats } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: payoutRequests, isLoading: isLoadingPayouts } = useQuery<PayoutRequest[]>({
    queryKey: ['/api/referrals/payout-requests'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async (data: { payment_method: string; payment_details: string }) => {
      return await apiRequest('POST', '/api/referrals/payout-requests', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/payout-requests'] });
      toast({
        title: "تم إرسال طلب السحب",
        description: "سيتم مراجعة طلبك خلال 3-5 أيام عمل",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال طلب السحب",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = () => {
    if (!stats?.referral_code) return;

    const referralLink = `${window.location.origin}/?ref=${stats.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "تم النسخ",
      description: "تم نسخ رابط الإحالة إلى الحافظة",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayout = () => {
    requestPayoutMutation.mutate({
      payment_method: 'paypal',
      payment_details: 'user@example.com',
    });
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

  if (isLoadingStats) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
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
          <h1 className="text-3xl font-bold" data-testid="heading-referrals">برنامج الإحالة</h1>
          <p className="text-muted-foreground">
            احصل على عمولة عن كل شخص تحيله إلى منصتنا
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-conversions">{stats?.total_conversions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العمولة المعلقة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4caf50]" data-testid="stat-pending-commission">
              ${(stats?.pending_commission || 0) / 100}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العمولة المدفوعة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-paid-commission">
              ${(stats?.paid_commission || 0) / 100}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>رابط الإحالة الخاص بك</CardTitle>
          <CardDescription>
            شارك هذا الرابط مع الآخرين للحصول على عمولة عن كل اشتراك مدفوع
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-code">كود الإحالة</Label>
            <div className="flex gap-2">
              <Input
                id="referral-code"
                value={stats?.referral_code || ''}
                readOnly
                className="font-mono"
                data-testid="input-referral-code"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                data-testid="button-copy-link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral-link">رابط الإحالة الكامل</Label>
            <div className="flex gap-2">
              <Input
                id="referral-link"
                value={stats?.referral_code ? `${window.location.origin}/?ref=${stats.referral_code}` : ''}
                readOnly
                className="font-mono text-sm"
                data-testid="input-referral-link"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md space-y-2">
            <h4 className="font-semibold text-sm">كيف يعمل البرنامج؟</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• احصل على عمولة 20% من قيمة أول اشتراك مدفوع</li>
              <li>• الحد الأدنى للسحب: $100</li>
              <li>• يتم تتبع الإحالات لمدة 30 يوماً من النقر على الرابط</li>
              <li>• طرق الدفع المتاحة: PayPal, Vodafone Cash, InstaPay</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>طلبات السحب</CardTitle>
            <CardDescription>تتبع حالة طلبات السحب الخاصة بك</CardDescription>
          </div>
          <Button
            onClick={handleRequestPayout}
            disabled={!stats || stats.pending_commission < 10000 || requestPayoutMutation.isPending}
            data-testid="button-request-payout"
          >
            {requestPayoutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              'طلب سحب'
            )}
          </Button>
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
              لا توجد طلبات سحب حتى الآن
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">طريقة الدفع</TableHead>
                  <TableHead className="text-right">تاريخ الطلب</TableHead>
                  <TableHead className="text-right">تاريخ المعالجة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((request) => (
                  <TableRow key={request.id} data-testid={`row-payout-${request.id}`}>
                    <TableCell className="font-medium" data-testid={`cell-amount-${request.id}`}>
                      ${request.amount / 100}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell data-testid={`cell-method-${request.id}`}>{request.payment_method}</TableCell>
                    <TableCell data-testid={`cell-created-${request.id}`}>
                      {format(new Date(request.created_at), 'PPp', { locale: ar })}
                    </TableCell>
                    <TableCell data-testid={`cell-processed-${request.id}`}>
                      {request.processed_at ? format(new Date(request.processed_at), 'PPp', { locale: ar }) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {stats && stats.pending_commission < 10000 && (
        <div className="bg-muted border border-muted-foreground/20 rounded-md p-4">
          <p className="text-sm text-muted-foreground text-center">
            تحتاج إلى ${(10000 - stats.pending_commission) / 100} إضافية للوصول إلى الحد الأدنى للسحب ($100)
          </p>
        </div>
      )}
    </div>
  );
}
