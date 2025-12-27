import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminPaymobSettings() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [apiKey, setApiKey] = useState("");
    const [integrationId, setIntegrationId] = useState("");
    const [iframeId, setIframeId] = useState("");
    const [hmacSecret, setHmacSecret] = useState("");

    const { data: settings } = useQuery({
        queryKey: ["/api/settings/paymob_api_key", "/api/settings/paymob_integration_id", "/api/settings/paymob_iframe_id", "/api/settings/paymob_hmac_secret"],
        queryFn: async () => {
            const [apiKeySetting, integrationIdSetting, iframeIdSetting, hmacSecretSetting] = await Promise.all([
                apiRequest("GET", "/api/settings/paymob_api_key").then(r => r.json()).catch(() => null),
                apiRequest("GET", "/api/settings/paymob_integration_id").then(r => r.json()).catch(() => null),
                apiRequest("GET", "/api/settings/paymob_iframe_id").then(r => r.json()).catch(() => null),
                apiRequest("GET", "/api/settings/paymob_hmac_secret").then(r => r.json()).catch(() => null),
            ]);
            return { apiKeySetting, integrationIdSetting, iframeIdSetting, hmacSecretSetting };
        },
        enabled: !!user?.is_admin,
    });

    useEffect(() => {
        if (settings) {
            setApiKey(settings.apiKeySetting?.value || "");
            setIntegrationId(settings.integrationIdSetting?.value || "");
            setIframeId(settings.iframeIdSetting?.value || "");
            setHmacSecret(settings.hmacSecretSetting?.value || "");
        }
    }, [settings]);

    const updateSettingMutation = useMutation({
        mutationFn: async ({ key, value, description }: { key: string; value: string; description: string }) => {
            const response = await apiRequest("PUT", `/api/settings/${key}`, { value, description });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/settings/paymob_api_key"] });
            queryClient.invalidateQueries({ queryKey: ["/api/settings/paymob_integration_id"] });
            queryClient.invalidateQueries({ queryKey: ["/api/settings/paymob_iframe_id"] });
            queryClient.invalidateQueries({ queryKey: ["/api/settings/paymob_hmac_secret"] });
            toast({
                title: "تم الحفظ بنجاح",
                description: "تم حفظ إعدادات Paymob بنجاح",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل في حفظ الإعدادات",
            });
        },
    });

    const handleSaveAll = async () => {
        try {
            await Promise.all([
                updateSettingMutation.mutateAsync({
                    key: "paymob_api_key",
                    value: apiKey,
                    description: "Paymob API Key",
                }),
                updateSettingMutation.mutateAsync({
                    key: "paymob_integration_id",
                    value: integrationId,
                    description: "Paymob Integration ID",
                }),
                updateSettingMutation.mutateAsync({
                    key: "paymob_iframe_id",
                    value: iframeId,
                    description: "Paymob Iframe ID",
                }),
                updateSettingMutation.mutateAsync({
                    key: "paymob_hmac_secret",
                    value: hmacSecret,
                    description: "Paymob HMAC Secret",
                }),
            ]);
        } catch (error) {
            // Error already handled by mutation
        }
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
                <h1 className="text-3xl font-bold tracking-tight">إعدادات Paymob</h1>
                <p className="text-muted-foreground">
                    قم بتكوين بيانات اعتماد Paymob لتفعيل الدفع الإلكتروني
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>بيانات الاعتماد</CardTitle>
                    <CardDescription>
                        احصل على هذه البيانات من لوحة تحكم Paymob
                        <a
                            href="https://accept.paymob.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline ms-2"
                        >
                            افتح لوحة تحكم Paymob
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api_key">API Key (المفتاح السري)</Label>
                        <Input
                            id="api_key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="أدخل API Key من Paymob"
                        />
                        <p className="text-xs text-muted-foreground">
                            يمكنك العثور على API Key في Settings → Account Info
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="integration_id">Integration ID</Label>
                        <Input
                            id="integration_id"
                            value={integrationId}
                            onChange={(e) => setIntegrationId(e.target.value)}
                            placeholder="أدخل Integration ID"
                        />
                        <p className="text-xs text-muted-foreground">
                            يمكنك العثور على Integration ID في Developers → Payment Integrations
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="iframe_id">Iframe ID</Label>
                        <Input
                            id="iframe_id"
                            value={iframeId}
                            onChange={(e) => setIframeId(e.target.value)}
                            placeholder="أدخل Iframe ID"
                        />
                        <p className="text-xs text-muted-foreground">
                            يمكنك العثور على Iframe ID في Developers → iFrames
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hmac_secret">HMAC Secret</Label>
                        <Input
                            id="hmac_secret"
                            type="password"
                            value={hmacSecret}
                            onChange={(e) => setHmacSecret(e.target.value)}
                            placeholder="أدخل HMAC Secret"
                        />
                        <p className="text-xs text-muted-foreground">
                            يمكنك العثور على HMAC Secret في Settings → Account Info
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            ملاحظة هامة: Webhook URL
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                            يجب تكوين Webhook URL في لوحة تحكم Paymob:
                        </p>
                        <code className="block bg-blue-100 dark:bg-blue-900 p-2 rounded text-sm">
                            {window.location.origin}/api/payment/paymob/webhook
                        </code>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                            اذهب إلى Developers → Webhooks وأضف هذا الرابط
                        </p>
                    </div>

                    <Button
                        onClick={handleSaveAll}
                        disabled={updateSettingMutation.isPending}
                        className="w-full"
                    >
                        <Save className="h-4 w-4 ms-2" />
                        {updateSettingMutation.isPending ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle>كيفية الحصول على بيانات الاعتماد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold">1. API Key و HMAC Secret</h4>
                        <p className="text-sm text-muted-foreground">
                            سجل الدخول إلى Paymob → Settings → Account Info
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">2. Integration ID</h4>
                        <p className="text-sm text-muted-foreground">
                            Developers → Payment Integrations → اختر التكامل المطلوب
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">3. Iframe ID</h4>
                        <p className="text-sm text-muted-foreground">
                            Developers → iFrames → اختر الـ iframe المطلوب
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">4. Webhook Configuration</h4>
                        <p className="text-sm text-muted-foreground">
                            Developers → Webhooks → أضف webhook URL الموضح أعلاه
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
