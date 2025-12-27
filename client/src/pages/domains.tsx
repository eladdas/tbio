import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Plus, MoreHorizontal, Trash2, TrendingUp, Target, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetricCard } from "@/components/metric-card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Domain } from "@shared/schema";

export default function Domains() {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const { toast } = useToast();

  // Fetch domains from API
  const { data: domains = [], isLoading, error, refetch, isRefetching } = useQuery<Domain[]>({
    queryKey: ["/api/domains"],
  });

  // Add domain mutation
  const addDomainMutation = useMutation({
    mutationFn: async (domainName: string) => {
      const response = await apiRequest("POST", "/api/domains", { domain: domainName });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      toast({
        title: "تم إضافة النطاق بنجاح",
        description: "تم إضافة النطاق الجديد إلى قائمتك",
      });
      setDomain("");
      setOpen(false);
    },
    onError: (error: Error) => {
      const errorMessage = error.message;
      toast({
        title: "خطأ في إضافة النطاق",
        description: errorMessage.includes("Domain limit reached")
          ? errorMessage.split(":")[1]?.trim() || "لقد وصلت إلى الحد الأقصى للنطاقات"
          : "حدث خطأ أثناء إضافة النطاق",
        variant: "destructive",
      });
    },
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      await apiRequest("DELETE", `/api/domains/${domainId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      toast({
        title: "تم حذف النطاق بنجاح",
        description: "تم حذف النطاق من قائمتك",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف النطاق",
        description: error.message || "حدث خطأ أثناء حذف النطاق",
        variant: "destructive",
      });
    },
  });

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      addDomainMutation.mutate(domain.trim());
    }
  };

  const handleDeleteDomain = (domainId: string) => {
    deleteDomainMutation.mutate(domainId);
  };

  // Calculate stats from real data
  const totalDomains = domains.length;
  const totalKeywords = 0; // Placeholder as we don't have keyword count per domain
  const avgPosition = 0; // Placeholder as we don't have position data

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive" data-testid="error-message">
              حدث خطأ في تحميل النطاقات: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
            إدارة النطاقات
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">النطاقات</h1>
          <p className="text-sm md:text-base text-muted-foreground">إدارة جميع نطاقاتك المتتبعة في مكان واحد</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            title="تحديث البيانات"
            className="mt-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="button-add-domain"
                className="shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                <Plus className="me-2 h-4 w-4" />
                إضافة نطاق جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAddDomain}>
                <DialogHeader>
                  <DialogTitle>إضافة نطاق جديد</DialogTitle>
                  <DialogDescription>
                    أضف نطاقاً جديداً لتتبع كلماته المفتاحية في محركات البحث.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="domain">اسم النطاق</Label>
                    <Input
                      id="domain"
                      placeholder="مثال: example.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      data-testid="input-domain"
                      disabled={addDomainMutation.isPending}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      أدخل النطاق بدون http:// أو https://
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    data-testid="button-submit-domain"
                    disabled={addDomainMutation.isPending}
                  >
                    {addDomainMutation.isPending ? "جاري الإضافة..." : "إضافة النطاق"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <MetricCard
              title="إجمالي النطاقات"
              value={totalDomains}
              icon={Globe}
              subtitle="نطاقات نشطة"
              data-testid="metric-total-domains"
            />
            <MetricCard
              title="إجمالي الكلمات"
              value={totalKeywords}
              icon={TrendingUp}
              subtitle="عبر جميع النطاقات"
              data-testid="metric-total-keywords"
            />
            <MetricCard
              title="متوسط الترتيب"
              value={avgPosition}
              icon={Target}
              subtitle="لجميع النطاقات"
              data-testid="metric-avg-rank"
            />
          </>
        )}
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg border-2">
        <CardHeader>
          <CardTitle>قائمة النطاقات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-state">
              <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد نطاقات بعد</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بإضافة نطاقك الأول لتتبع ترتيب كلماتك المفتاحية
              </p>
              <Button onClick={() => setOpen(true)} data-testid="button-add-first-domain">
                <Plus className="me-2 h-4 w-4" />
                إضافة نطاق جديد
              </Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>النطاق</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإضافة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((item) => (
                    <TableRow key={item.id} data-testid={`row-domain-${item.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2" data-testid={`text-domain-${item.id}`}>
                          <Globe className="h-4 w-4 text-primary" />
                          {item.domain}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.is_active ? "default" : "secondary"}
                          data-testid={`badge-status-${item.id}`}
                        >
                          {item.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground text-sm"
                        data-testid={`text-date-${item.id}`}
                      >
                        {item.created_at ? formatDate(item.created_at) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-actions-${item.id}`}
                              disabled={deleteDomainMutation.isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteDomain(item.id)}
                              data-testid={`button-delete-${item.id}`}
                            >
                              <Trash2 className="me-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
