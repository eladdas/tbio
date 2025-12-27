import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Copy, CheckCircle2, XCircle, AlertCircle, CreditCard, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Subscription, Plan, User } from "@shared/schema";
import { MetricCard } from "@/components/metric-card";

type SubscriptionWithDetails = Subscription & {
    plan: Plan;
    user: User;
};

export default function AdminSubscriptions() {
    const { user } = useAuth();

    const { data: subscriptions, isLoading } = useQuery<SubscriptionWithDetails[]>({
        queryKey: ["/api/admin/subscriptions"],
        enabled: !!user?.is_admin,
    });

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

    const formatCurrency = (cents: number) => {
        const dollars = cents / 100;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(dollars);
    };

    const formatDate = (date: string | Date | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">إدارة الاشتراكات</h1>
                <p className="text-muted-foreground">
                    عرض وإدارة اشتراكات المستخدمين
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="إجمالي الاشتراكات"
                    value={subscriptions?.length || 0}
                    icon={CreditCard}
                    subtitle="جميع الاشتراكات المسجلة"
                />
                <MetricCard
                    title="الاشتراكات النشطة"
                    value={subscriptions?.filter(s => s.status === 'active').length || 0}
                    icon={CheckCircle2}
                    subtitle="اشتراكات فعالة حالياً"
                />
                <MetricCard
                    title="الاشتراكات المنتهية"
                    value={subscriptions?.filter(s => s.status !== 'active').length || 0}
                    icon={XCircle}
                    subtitle="منتهية أو ملغاة"
                />
                <MetricCard
                    title="الإيرادات الشهرية"
                    value={formatCurrency(
                        subscriptions?.filter(s => s.status === 'active')
                            .reduce((sum, s) => sum + s.plan.price_monthly, 0) || 0
                    )}
                    icon={CreditCard}
                    subtitle="إجمالي أرباح الاشتراكات"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة المشتركين</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">المستخدم</TableHead>
                                    <TableHead className="text-right">الباقة</TableHead>
                                    <TableHead className="text-right">القيمة</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">تاريخ البدء</TableHead>
                                    <TableHead className="text-right">تاريخ التجديد</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : subscriptions && subscriptions.length > 0 ? (
                                    subscriptions.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{sub.user.first_name} {sub.user.last_name}</span>
                                                    <span className="text-xs text-muted-foreground">{sub.user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                    {sub.plan.name_ar}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(sub.plan.price_monthly)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                                    {sub.status === 'active' ? 'نشط' : 'غير نشط'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {formatDate(sub.current_period_start)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {formatDate(sub.current_period_end)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            لا توجد اشتراكات مسجلة
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
