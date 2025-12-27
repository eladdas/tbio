import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymobCheckoutProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planId: string;
    planName: string;
    planPrice: number;
}

interface BillingData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    city: string;
    country: string;
    apartment?: string;
    floor?: string;
    street?: string;
    building?: string;
    postal_code?: string;
    state?: string;
}

export function PaymobCheckout({ open, onOpenChange, planId, planName, planPrice }: PaymobCheckoutProps) {
    const { toast } = useToast();
    const [showIframe, setShowIframe] = useState(false);
    const [iframeUrl, setIframeUrl] = useState("");
    const [billingData, setBillingData] = useState<BillingData>({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        city: "Cairo",
        country: "EG",
    });

    const initiateMutation = useMutation({
        mutationFn: async (data: { plan_id: string; billing_data: BillingData }) => {
            const response = await apiRequest("POST", "/api/payment/paymob/initiate", data);
            return response.json();
        },
        onSuccess: (data) => {
            setIframeUrl(data.iframe_url);
            setShowIframe(true);
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "خطأ في بدء الدفع",
                description: error.message || "حدث خطأ أثناء بدء عملية الدفع",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!billingData.first_name || !billingData.last_name || !billingData.email || !billingData.phone_number) {
            toast({
                variant: "destructive",
                title: "بيانات ناقصة",
                description: "يرجى ملء جميع الحقول المطلوبة",
            });
            return;
        }

        initiateMutation.mutate({
            plan_id: planId,
            billing_data: billingData,
        });
    };

    const handleClose = () => {
        setShowIframe(false);
        setIframeUrl("");
        setBillingData({
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            city: "Cairo",
            country: "EG",
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>الدفع عبر Paymob - {planName}</DialogTitle>
                </DialogHeader>

                {!showIframe ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">المبلغ المطلوب</p>
                            <p className="text-2xl font-bold">{(planPrice / 100).toFixed(2)} جنيه مصري</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">الاسم الأول *</Label>
                                <Input
                                    id="first_name"
                                    value={billingData.first_name}
                                    onChange={(e) => setBillingData({ ...billingData, first_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">الاسم الأخير *</Label>
                                <Input
                                    id="last_name"
                                    value={billingData.last_name}
                                    onChange={(e) => setBillingData({ ...billingData, last_name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={billingData.email}
                                onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">رقم الهاتف *</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                placeholder="+20100000000"
                                value={billingData.phone_number}
                                onChange={(e) => setBillingData({ ...billingData, phone_number: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">المدينة</Label>
                                <Input
                                    id="city"
                                    value={billingData.city}
                                    onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="street">الشارع (اختياري)</Label>
                                <Input
                                    id="street"
                                    value={billingData.street || ""}
                                    onChange={(e) => setBillingData({ ...billingData, street: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={initiateMutation.isPending}>
                                {initiateMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        جاري المعالجة...
                                    </>
                                ) : (
                                    "متابعة للدفع"
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                سيتم تحويلك إلى صفحة الدفع الآمنة. يرجى إكمال عملية الدفع لتفعيل اشتراكك.
                            </p>
                        </div>

                        <div className="relative w-full" style={{ height: "600px" }}>
                            <iframe
                                src={iframeUrl}
                                className="w-full h-full border-0 rounded-lg"
                                title="Paymob Payment"
                            />
                        </div>

                        <Button variant="outline" onClick={handleClose} className="w-full">
                            إغلاق
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
