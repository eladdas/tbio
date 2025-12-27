import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, UserPlus, ShieldCheck, Zap } from "lucide-react";

const getRegisterSchema = (t: any) => z.object({
    first_name: z.string().min(2, t("auth.firstNameMinLength")),
    last_name: z.string().min(2, t("auth.lastNameMinLength")),
    email: z.string().email(t("auth.invalidEmail")),
    password: z.string().min(6, t("auth.passwordMinLength")),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.passwordsDontMatch"),
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<ReturnType<typeof getRegisterSchema>>;

export default function Register() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(getRegisterSchema(t)),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    first_name: data.first_name,
                    last_name: data.last_name,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || t("auth.registrationFailed") || "فشل التسجيل");
            }

            toast({
                title: t("auth.registerSuccess"),
                description: t("auth.registerRedirect"),
            });

            // Redirect to home page (which will redirect to dashboard for auth users)
            window.location.href = "/";
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t("common.error"),
                description: error.message,
            });
        }
    };

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            {/* Left Side - Hero/Features */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 max-w-lg mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {t("auth.registerHeroTitle")}
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {t("auth.registerHeroSubtitle")}
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-background shadow-sm ring-1 ring-border">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">{t("auth.freeTrial")}</h3>
                                <p className="text-muted-foreground">{t("auth.freeTrialDesc")}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-background shadow-sm ring-1 ring-border">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">{t("auth.quickSetup")}</h3>
                                <p className="text-muted-foreground">{t("auth.quickSetupDesc")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex items-center justify-center p-4 sm:p-8 bg-background">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:hidden mb-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {t("common.appName")}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t("auth.registerSubtitle") || "أنشئ حسابك الجديد"}
                        </p>
                    </div>

                    <Card className="border-none shadow-none sm:border sm:shadow-lg">
                        <CardHeader className="text-center space-y-1">
                            <CardTitle className="text-2xl font-bold">{t("auth.createAccount")}</CardTitle>
                            <CardDescription>
                                {t("auth.registerDescription")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="first_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("auth.firstName")}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={t("auth.firstNamePlaceholder") || "محمد"} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="last_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("auth.lastName")}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={t("auth.lastNamePlaceholder") || "أحمد"} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("auth.email")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("auth.password")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="******" type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="******" type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02] mt-6"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        <UserPlus className="w-5 h-5 me-2" />
                                        {t("common.register")}
                                    </Button>

                                    <div className="text-center text-sm text-muted-foreground mt-4">
                                        {t("auth.haveAccount")}{" "}
                                        <a href="/login" className="text-primary hover:underline font-medium">
                                            {t("auth.login")}
                                        </a>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
