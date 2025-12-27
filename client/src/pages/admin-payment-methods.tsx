import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Plus, Edit, Trash2, CreditCard, Wallet, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { PaymentMethod } from "@shared/schema";

export default function AdminPaymentMethods() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        name_ar: "",
        type: "ewallet",
        icon: "",
        is_active: true,
        display_order: 0,
    });

    const { data: paymentMethods, isLoading } = useQuery<PaymentMethod[]>({
        queryKey: ["/api/admin/payment-methods"],
        enabled: !!user?.is_admin,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await apiRequest("POST", "/api/admin/payment-methods", data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-methods"] });
            setAddDialogOpen(false);
            resetForm();
            toast({
                title: "تم بنجاح",
                description: "تمت إضافة وسيلة الدفع بنجاح",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل في إضافة وسيلة الدفع",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
            const response = await apiRequest("PATCH", `/api/admin/payment-methods/${id}`, data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-methods"] });
            setEditDialogOpen(false);
            setSelectedMethod(null);
            resetForm();
            toast({
                title: "تم بنجاح",
                description: "تم تحديث وسيلة الدفع بنجاح",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل في تحديث وسيلة الدفع",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiRequest("DELETE", `/api/admin/payment-methods/${id}`);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-methods"] });
            setDeleteDialogOpen(false);
            setSelectedMethod(null);
            toast({
                title: "تم بنجاح",
                description: "تم حذف وسيلة الدفع بنجاح",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل في حذف وسيلة الدفع",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            name_ar: "",
            type: "ewallet",
            icon: "",
            is_active: true,
            display_order: 0,
        });
    };

    const handleEdit = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setFormData({
            name: method.name,
            name_ar: method.name_ar,
            type: method.type,
            icon: method.icon || "",
            is_active: method.is_active,
            display_order: method.display_order,
        });
        setEditDialogOpen(true);
    };

    const handleDelete = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setDeleteDialogOpen(true);
    };

    const toggleStatus = (method: PaymentMethod) => {
        updateMutation.mutate({
            id: method.id,
            data: { is_active: !method.is_active },
        });
    };

    if (!user?.is_admin) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">وسائل الدفع</h1>
                <p className="text-muted-foreground">
                    إدارة وسائل الدفع المتاحة للمستخدمين
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>قائمة وسائل الدفع</CardTitle>
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 ms-2" />
                                    إضافة وسيلة دفع
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>إضافة وسيلة دفع جديدة</DialogTitle>
                                    <DialogDescription>
                                        أضف وسيلة دفع جديدة للمستخدمين
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">الاسم (English)</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="InstaPay"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name_ar">الاسم (العربية)</Label>
                                        <Input
                                            id="name_ar"
                                            value={formData.name_ar}
                                            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                            placeholder="إنستاباي"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">النوع</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ewallet">محفظة إلكترونية</SelectItem>
                                                <SelectItem value="instapay">إنستاباي</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="icon">الأيقونة (اختياري)</Label>
                                        <Input
                                            id="icon"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="wallet"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="display_order">ترتيب العرض</Label>
                                        <Input
                                            id="display_order"
                                            type="number"
                                            value={formData.display_order}
                                            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={() => createMutation.mutate(formData)}
                                        disabled={createMutation.isPending || !formData.name || !formData.name_ar}
                                    >
                                        {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">الاسم</TableHead>
                                    <TableHead className="text-right">النوع</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">الترتيب</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : paymentMethods && paymentMethods.length > 0 ? (
                                    paymentMethods.map((method) => (
                                        <TableRow key={method.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {method.type === "ewallet" ? (
                                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{method.name_ar}</div>
                                                        <div className="text-xs text-muted-foreground">{method.name}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {method.type === "ewallet" ? "محفظة إلكترونية" : "إنستاباي"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleStatus(method)}
                                                >
                                                    <Badge variant={method.is_active ? "default" : "secondary"}>
                                                        {method.is_active ? "نشط" : "غير نشط"}
                                                    </Badge>
                                                </Button>
                                            </TableCell>
                                            <TableCell>{method.display_order}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(method)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(method)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            لا توجد وسائل دفع مسجلة
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعديل وسيلة الدفع</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">الاسم (English)</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-name_ar">الاسم (العربية)</Label>
                            <Input
                                id="edit-name_ar"
                                value={formData.name_ar}
                                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">النوع</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ewallet">محفظة إلكترونية</SelectItem>
                                    <SelectItem value="instapay">إنستاباي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-icon">الأيقونة (اختياري)</Label>
                            <Input
                                id="edit-icon"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-display_order">ترتيب العرض</Label>
                            <Input
                                id="edit-display_order"
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => selectedMethod && updateMutation.mutate({ id: selectedMethod.id, data: formData })}
                            disabled={updateMutation.isPending || !formData.name || !formData.name_ar}
                        >
                            {updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف وسيلة الدفع "{selectedMethod?.name_ar}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedMethod && deleteMutation.mutate(selectedMethod.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
