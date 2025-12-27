import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Edit, Trash2, AlertCircle, Link as LinkIcon, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Page, InsertPage } from "@shared/schema";

export default function AdminPages() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [addPageOpen, setAddPageOpen] = useState(false);
    const [editPageOpen, setEditPageOpen] = useState(false);
    const [deletePageOpen, setDeletePageOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);

    const [formData, setFormData] = useState<Partial<InsertPage>>({
        title: "",
        title_ar: "",
        slug: "",
        content: "",
        content_ar: "",
        is_active: true,
        show_in_footer: true,
        display_order: 0,
    });

    // Auto-generate slug from English title
    useEffect(() => {
        if (!selectedPage && formData.title && !formData.slug) {
            const generatedSlug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.title, selectedPage]);

    const { data: pages, isLoading } = useQuery<Page[]>({
        queryKey: ["/api/admin/pages"],
        enabled: !!user?.is_admin,
    });

    const createPageMutation = useMutation({
        mutationFn: async (data: InsertPage) => {
            const response = await fetch("/api/admin/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create page");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
            setAddPageOpen(false);
            resetForm();
            toast({
                title: "تم بنجاح",
                description: "تم إنشاء الصفحة بنجاح",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل إنشاء الصفحة",
            });
        },
    });

    const updatePageMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPage> }) => {
            const response = await fetch(`/api/admin/pages/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update page");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
            setEditPageOpen(false);
            setSelectedPage(null);
            resetForm();
            toast({
                title: "تم بنجاح",
                description: "تم تحديث الصفحة بنجاح",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل تحديث الصفحة",
            });
        },
    });

    const deletePageMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/pages/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete page");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
            setDeletePageOpen(false);
            setSelectedPage(null);
            toast({
                title: "تم بنجاح",
                description: "تم حذف الصفحة بنجاح",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل حذف الصفحة",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            title: "",
            title_ar: "",
            slug: "",
            content: "",
            content_ar: "",
            is_active: true,
            show_in_footer: true,
            display_order: 0,
        });
    };

    const handleAddPage = () => {
        resetForm();
        setSelectedPage(null);
        setAddPageOpen(true);
    };

    const handleEditPage = (page: Page) => {
        setSelectedPage(page);
        setFormData({
            title: page.title,
            title_ar: page.title_ar,
            slug: page.slug,
            content: page.content,
            content_ar: page.content_ar,
            is_active: page.is_active,
            show_in_footer: page.show_in_footer,
            display_order: page.display_order,
        });
        setEditPageOpen(true);
    };

    const handleDeletePage = (page: Page) => {
        setSelectedPage(page);
        setDeletePageOpen(true);
    };

    const handleSubmitCreate = () => {
        if (!formData.title || !formData.title_ar || !formData.slug) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "يرجى ملء جميع الحقول المطلوبة (العنوان، العنوان بالعربية، الرابط)",
            });
            return;
        }
        createPageMutation.mutate(formData as InsertPage);
    };

    const handleSubmitUpdate = () => {
        if (!selectedPage) return;
        updatePageMutation.mutate({ id: selectedPage.id, data: formData });
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
                                ليس لديك صلاحيات الوصول إلى هذه الصفحة.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary mb-2">إدارة الصفحات</h1>
                    <p className="text-muted-foreground text-sm">إدارة الصفحات الثابتة والمحتوى المخصص</p>
                </div>
                <Button onClick={handleAddPage} className="shadow-md">
                    <Plus className="ms-2 h-4 w-4" />
                    إضافة صفحة جديدة
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">قائمة الصفحات</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>العنوان</TableHead>
                                    <TableHead>الرابط (Slug)</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>في الفوتر</TableHead>
                                    <TableHead>الترتيب</TableHead>
                                    <TableHead className="text-left">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : !pages || pages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            لا توجد صفحات مضافة بعد
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pages.map((page) => (
                                        <TableRow key={page.id}>
                                            <TableCell>
                                                <div className="font-medium">{page.title_ar}</div>
                                                <div className="text-xs text-muted-foreground">{page.title}</div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/{page.slug}</code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={page.is_active ? "default" : "outline"}>
                                                    {page.is_active ? "نشط" : "غير نشط"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {page.show_in_footer ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XIcon className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </TableCell>
                                            <TableCell>{page.display_order}</TableCell>
                                            <TableCell className="text-left">
                                                <div className="flex justify-start gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditPage(page)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePage(page)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

            {/* Add Page Dialog */}
            <Dialog open={addPageOpen} onOpenChange={setAddPageOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>إضافة صفحة جديدة</DialogTitle>
                    </DialogHeader>
                    <PageForm
                        formData={formData}
                        setFormData={setFormData}
                        isUpdate={false}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddPageOpen(false)}>إلغاء</Button>
                        <Button onClick={handleSubmitCreate} disabled={createPageMutation.isPending}>
                            {createPageMutation.isPending ? "جاري الحفظ..." : "حفظ الصفحة"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Page Dialog */}
            <Dialog open={editPageOpen} onOpenChange={setEditPageOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>تعديل الصفحة</DialogTitle>
                    </DialogHeader>
                    <PageForm
                        formData={formData}
                        setFormData={setFormData}
                        isUpdate={true}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditPageOpen(false)}>إلغاء</Button>
                        <Button onClick={handleSubmitUpdate} disabled={updatePageMutation.isPending}>
                            {updatePageMutation.isPending ? "جاري الحفظ..." : "تحديث الصفحة"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={deletePageOpen} onOpenChange={setDeletePageOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف صفحة "{selectedPage?.title_ar}" نهائياً.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedPage && deletePageMutation.mutate(selectedPage.id)}
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

function PageForm({ formData, setFormData, isUpdate }: {
    formData: Partial<InsertPage>,
    setFormData: React.Dispatch<React.SetStateAction<Partial<InsertPage>>>,
    isUpdate: boolean
}) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title_ar">العنوان بالعربية *</Label>
                    <Input
                        id="title_ar"
                        value={formData.title_ar}
                        onChange={e => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                        placeholder="مثال: من نحن"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">العنوان بالإنجليزية *</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Example: About Us"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">الرابط الفريد (Slug) *</Label>
                <div className="flex items-center gap-2">
                    <code className="text-muted-foreground">/page/</code>
                    <Input
                        id="slug"
                        value={formData.slug}
                        onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                        placeholder="about-us"
                        disabled={isUpdate}
                    />
                </div>
                <p className="text-xs text-muted-foreground">هذا الرابط سيظهر في المتصفح. لا يمكن تغييره بعد الحفظ لضمان استقرار روابط SEO.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="content_ar">المحتوى بالعربية *</Label>
                <Textarea
                    id="content_ar"
                    value={formData.content_ar}
                    onChange={e => setFormData(prev => ({ ...prev, content_ar: e.target.value }))}
                    className="min-h-[200px]"
                    placeholder="اكتب محتوى الصفحة هنا باللغة العربية..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">المحتوى بالإنجليزية *</Label>
                <Textarea
                    id="content"
                    value={formData.content}
                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[200px]"
                    placeholder="Write the page content here in English..."
                />
            </div>

            <div className="grid grid-cols-3 gap-4 border p-4 rounded-md bg-muted/20">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_active"
                        className="h-4 w-4"
                        checked={formData.is_active}
                        onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">نشط</Label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="show_in_footer"
                        className="h-4 w-4"
                        checked={formData.show_in_footer}
                        onChange={e => setFormData(prev => ({ ...prev, show_in_footer: e.target.checked }))}
                    />
                    <Label htmlFor="show_in_footer" className="cursor-pointer">يظهر في الفوتر</Label>
                </div>
                <div className="flex items-center gap-4">
                    <Label htmlFor="display_order">ترتيب الظهور:</Label>
                    <Input
                        id="display_order"
                        type="number"
                        className="w-20 h-8"
                        value={formData.display_order}
                        onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                </div>
            </div>
        </div>
    );
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function XIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
