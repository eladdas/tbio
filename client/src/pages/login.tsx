import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, BarChart, Globe, Zap, CheckCircle2 } from "lucide-react";

export default function Login() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(t("auth.loginError") || "فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.");
            }

            window.location.href = "/";
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t("common.error"),
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            {/* Left Side - Hero/Features */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 max-w-lg mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {t("auth.heroTitle")}
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {t("auth.heroSubtitle")}
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-background shadow-sm ring-1 ring-border">
                                <BarChart className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">{t("auth.feature1Title")}</h3>
                                <p className="text-muted-foreground">{t("auth.feature1Desc")}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-background shadow-sm ring-1 ring-border">
                                <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">{t("auth.feature2Title")}</h3>
                                <p className="text-muted-foreground">{t("auth.feature2Desc")}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-background shadow-sm ring-1 ring-border">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">{t("auth.feature3Title")}</h3>
                                <p className="text-muted-foreground">{t("auth.feature3Desc")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-4 sm:p-8 bg-background">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:hidden mb-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {t("common.appName")}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t("sidebar.subtitle")}
                        </p>
                    </div>

                    <Card className="border-none shadow-none sm:border sm:shadow-lg">
                        <CardHeader className="text-center space-y-1">
                            <CardTitle className="text-2xl font-bold">{t("auth.login")}</CardTitle>
                            <CardDescription>
                                {t("auth.loginDescription")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t("auth.email")}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">{t("auth.password")}</Label>
                                        <a href="#" className="text-xs text-primary hover:underline">{t("auth.forgotPassword")}</a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="******"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02]"
                                    disabled={isLoading}
                                >
                                    <LogIn className="w-5 h-5 me-2" />
                                    {isLoading ? t("auth.loggingIn") : t("auth.login")}
                                </Button>
                            </form>

                            <div className="text-center space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    {t("auth.donthaveAccount")}{" "}
                                    <a href="/register" className="text-primary hover:underline font-medium">
                                        {t("auth.createAccount")}
                                    </a>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            {t("common.confirm")}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground px-4">
                                    {t("auth.termsText")} <a href="#" className="underline hover:text-primary">{t("auth.termsOfService")}</a> {t("auth.and")} <a href="#" className="underline hover:text-primary">{t("auth.privacyPolicy")}</a> {t("auth.specialPrivacy")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
