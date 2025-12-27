import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Crown, Plus, Edit, Users, DollarSign, AlertCircle, Clock, Trash2, Check, X } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Plan, InsertPlan } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
}

export default function AdminPlans() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [deletePlanOpen, setDeletePlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState<Partial<InsertPlan>>({
    name: "",
    name_ar: "",
    price_monthly: 0,
    price_yearly: 0,
    keywords_limit: 0,
    domains_limit: 0,
    update_frequency_hours: 24,
    features: [],
    is_active: true,
  });

  const { data: plans, isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans/all"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.is_admin,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: InsertPlan) => {
      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setAddPlanOpen(false);
      resetForm();
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الباقة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل إنشاء الباقة",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPlan> }) => {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setEditPlanOpen(false);
      setSelectedPlan(null);
      resetForm();
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الباقة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تحديث الباقة",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete plan");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeletePlanOpen(false);
      setSelectedPlan(null);
      toast({
        title: "تم بنجاح",
        description: "تم حذف الباقة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل حذف الباقة",
      });
    },
  });

  const setDefaultPlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/plans/${id}/set-default`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to set default plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans/all"] });
      toast({
        title: "تم بنجاح",
        description: "تم تعيين الباقة كافتراضية للمستخدمين الجدد",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل تعيين الباقة الافتراضية",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      name_ar: "",
      price_monthly: 0,
      price_yearly: 0,
      keywords_limit: 0,
      domains_limit: 0,
      update_frequency_hours: 24,
      features: [],
      is_active: true,
    });
  };

  const handleAddPlan = () => {
    resetForm();
    setAddPlanOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      name_ar: plan.name_ar,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      keywords_limit: plan.keywords_limit,
      domains_limit: plan.domains_limit,
      update_frequency_hours: plan.update_frequency_hours,
      features: (plan.features as any) || [],
      is_active: plan.is_active,
    });
    setEditPlanOpen(true);
  };

  const handleDeletePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setDeletePlanOpen(true);
  };

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features || []), { text: "", included: true }],
    });
  };

  const handleUpdateFeature = (index: number, field: "text" | "included", value: string | boolean) => {
    const newFeatures = [...(formData.features || [])];
    if (field === "text") {
      newFeatures[index].text = value as string;
    } else {
      newFeatures[index].included = value as boolean;
    }
    setFormData({ ...formData, features: newFeatures });
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmitCreate = () => {
    if (!formData.name || !formData.name_ar) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب إدخال اسم الباقة بالإنجليزية والعربية",
      });
      return;
    }
    createPlanMutation.mutate(formData as InsertPlan);
  };

  const handleSubmitUpdate = () => {
    if (!selectedPlan) return;
    updatePlanMutation.mutate({ id: selectedPlan.id, data: formData });
  };

  const handleConfirmDelete = () => {
    if (!selectedPlan) return;
    deletePlanMutation.mutate(selectedPlan.id);
  };

  if (!user?.is_admin) {
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

  const formatCurrency = (cents: number) => {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
            إدارة الباقات
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">الباقات والاشتراكات</h1>
          <p className="text-sm md:text-base text-muted-foreground">إدارة جميع الباقات المتاحة للمستخدمين</p>
        </div>
        <Button
          onClick={handleAddPlan}
          data-testid="button-add-plan"
          className="shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="ms-2 h-4 w-4" />
          إضافة باقة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsLoading || plansLoading ? (
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
              title="إجمالي الباقات"
              value={formatNumber(plans?.length || 0)}
              icon={Crown}
              subtitle="باقات نشطة"
              data-testid="card-total-plans"
            />
            <MetricCard
              title="إجمالي المشتركين"
              value={formatNumber(stats?.totalSubscriptions || 0)}
              icon={Users}
              subtitle="مشتركين نشطين"
              data-testid="card-total-subscribers"
            />
            <MetricCard
              title="الإيرادات الشهرية"
              value={formatCurrency(stats?.monthlyRevenue || 0)}
              icon={DollarSign}
              subtitle="إيرادات متكررة"
              data-testid="card-monthly-revenue"
            />
          </>
        )}
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg border-2">
        <CardHeader>
          <CardTitle>قائمة الباقات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>الباقة</TableHead>
                  <TableHead>السعر الشهري</TableHead>
                  <TableHead>حد الكلمات</TableHead>
                  <TableHead>حد النطاقات</TableHead>
                  <TableHead>تكرار التحديث</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plansLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : plans && plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground" data-testid="empty-plans">
                      لا توجد باقات متاحة
                    </TableCell>
                  </TableRow>
                ) : (
                  plans?.map((plan) => (
                    <TableRow key={plan.id} data-testid={`row-plan-${plan.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-semibold flex items-center gap-2" data-testid={`text-plan-name-ar-${plan.id}`}>
                              {plan.name_ar}
                              {plan.is_default && (
                                <Badge variant="default" className="text-xs" data-testid={`badge-default-${plan.id}`}>
                                  افتراضية
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground" data-testid={`text-plan-name-${plan.id}`}>
                              {plan.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary" data-testid={`text-plan-price-${plan.id}`}>
                        {formatCurrency(plan.price_monthly)}
                      </TableCell>
                      <TableCell data-testid={`text-plan-keywords-${plan.id}`}>
                        {formatNumber(plan.keywords_limit)}
                      </TableCell>
                      <TableCell data-testid={`text-plan-domains-${plan.id}`}>
                        {plan.domains_limit === 999 ? "غير محدود" : formatNumber(plan.domains_limit)}
                      </TableCell>
                      <TableCell data-testid={`text-plan-frequency-${plan.id}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {plan.update_frequency_hours} ساعة
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={plan.is_active ? "default" : "outline"}
                          data-testid={`badge-plan-status-${plan.id}`}
                        >
                          {plan.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!plan.is_default && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDefaultPlanMutation.mutate(plan.id)}
                              disabled={setDefaultPlanMutation.isPending}
                              data-testid={`button-set-default-${plan.id}`}
                              className="text-xs"
                            >
                              تعيين كافتراضية
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                            data-testid={`button-edit-${plan.id}`}
                          >
                            <Edit className="ms-1 h-4 w-4" />
                            تعديل
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlan(plan)}
                            data-testid={`button-delete-${plan.id}`}
                          >
                            <Trash2 className="ms-1 h-4 w-4 text-destructive" />
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

      {/* Add Plan Dialog */}
      <Dialog open={addPlanOpen} onOpenChange={setAddPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة باقة جديدة</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الباقة الجديدة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم بالإنجليزية *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Basic"
                  data-testid="input-plan-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_ar">الاسم بالعربية *</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="أساسية"
                  data-testid="input-plan-name-ar"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الباقة"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_monthly">السعر الشهري (بالهللات)</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) || 0 })}
                  placeholder="2900"
                  data-testid="input-price-monthly"
                />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.price_monthly || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_yearly">السعر السنوي (بالهللات)</Label>
                <Input
                  id="price_yearly"
                  type="number"
                  value={formData.price_yearly}
                  onChange={(e) => setFormData({ ...formData, price_yearly: parseInt(e.target.value) || 0 })}
                  placeholder="29000"
                  data-testid="input-price-yearly"
                />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.price_yearly || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keywords_limit">حد الكلمات المفتاحية</Label>
                <Input
                  id="keywords_limit"
                  type="number"
                  value={formData.keywords_limit}
                  onChange={(e) => setFormData({ ...formData, keywords_limit: parseInt(e.target.value) || 0 })}
                  placeholder="50"
                  data-testid="input-keywords-limit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domains_limit">حد النطاقات</Label>
                <Input
                  id="domains_limit"
                  type="number"
                  value={formData.domains_limit}
                  onChange={(e) => setFormData({ ...formData, domains_limit: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  data-testid="input-domains-limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="update_frequency">تكرار التحديث (بالساعات)</Label>
                <Select
                  value={formData.update_frequency_hours?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, update_frequency_hours: parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-update-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">كل ساعة</SelectItem>
                    <SelectItem value="6">كل 6 ساعات</SelectItem>
                    <SelectItem value="12">كل 12 ساعة</SelectItem>
                    <SelectItem value="24">كل 24 ساعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">الحالة</Label>
                <Select
                  value={formData.is_active ? "true" : "false"}
                  onValueChange={(value) => setFormData({ ...formData, is_active: value === "true" })}
                >
                  <SelectTrigger data-testid="select-is-active">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">نشط</SelectItem>
                    <SelectItem value="false">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>المميزات</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFeature}
                  className="h-8"
                >
                  <Plus className="w-3 h-3 ms-1" />
                  إضافة ميزة
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                {(formData.features || []).map((feature: any, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                    <Switch
                      checked={feature.included}
                      onCheckedChange={(checked) => handleUpdateFeature(index, 'included', checked)}
                    />
                    <Input
                      value={feature.text}
                      onChange={(e) => handleUpdateFeature(index, 'text', e.target.value)}
                      placeholder="وصف الميزة"
                      className="h-8 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(formData.features || []).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    لا توجد مميزات مضافة
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPlanOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={createPlanMutation.isPending}
              data-testid="button-submit-create"
            >
              {createPlanMutation.isPending ? "جاري الإنشاء..." : "إنشاء الباقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الباقة</DialogTitle>
            <DialogDescription>
              تعديل تفاصيل الباقة: {selectedPlan?.name_ar}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">الاسم بالإنجليزية *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Basic"
                  data-testid="input-edit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name_ar">الاسم بالعربية *</Label>
                <Input
                  id="edit-name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="أساسية"
                  data-testid="input-edit-name-ar"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">الوصف</Label>
              <Input
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الباقة"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price_monthly">السعر الشهري (بالهللات)</Label>
                <Input
                  id="edit-price_monthly"
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-price-monthly"
                />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.price_monthly || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price_yearly">السعر السنوي (بالهللات)</Label>
                <Input
                  id="edit-price_yearly"
                  type="number"
                  value={formData.price_yearly}
                  onChange={(e) => setFormData({ ...formData, price_yearly: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-price-yearly"
                />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.price_yearly || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-keywords_limit">حد الكلمات المفتاحية</Label>
                <Input
                  id="edit-keywords_limit"
                  type="number"
                  value={formData.keywords_limit}
                  onChange={(e) => setFormData({ ...formData, keywords_limit: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-keywords-limit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-domains_limit">حد النطاقات</Label>
                <Input
                  id="edit-domains_limit"
                  type="number"
                  value={formData.domains_limit}
                  onChange={(e) => setFormData({ ...formData, domains_limit: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-domains-limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-update_frequency">تكرار التحديث (بالساعات)</Label>
                <Select
                  value={formData.update_frequency_hours?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, update_frequency_hours: parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-edit-update-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">كل ساعة</SelectItem>
                    <SelectItem value="6">كل 6 ساعات</SelectItem>
                    <SelectItem value="12">كل 12 ساعة</SelectItem>
                    <SelectItem value="24">كل 24 ساعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-is_active">الحالة</Label>
                <Select
                  value={formData.is_active ? "true" : "false"}
                  onValueChange={(value) => setFormData({ ...formData, is_active: value === "true" })}
                >
                  <SelectTrigger data-testid="select-edit-is-active">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">نشط</SelectItem>
                    <SelectItem value="false">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>المميزات</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFeature}
                  className="h-8"
                >
                  <Plus className="w-3 h-3 ms-1" />
                  إضافة ميزة
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                {(formData.features || []).map((feature: any, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                    <Switch
                      checked={feature.included}
                      onCheckedChange={(checked) => handleUpdateFeature(index, 'included', checked)}
                    />
                    <Input
                      value={feature.text}
                      onChange={(e) => handleUpdateFeature(index, 'text', e.target.value)}
                      placeholder="وصف الميزة"
                      className="h-8 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(formData.features || []).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    لا توجد مميزات مضافة
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlanOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmitUpdate}
              disabled={updatePlanMutation.isPending}
              data-testid="button-submit-update"
            >
              {updatePlanMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Dialog */}
      <AlertDialog open={deletePlanOpen} onOpenChange={setDeletePlanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الباقة "{selectedPlan?.name_ar}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
              <br /><br />
              <strong className="text-destructive">تحذير:</strong> قد يؤثر ذلك على المستخدمين المشتركين في هذه الباقة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deletePlanMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deletePlanMutation.isPending ? "جاري الحذف..." : "نعم، احذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
