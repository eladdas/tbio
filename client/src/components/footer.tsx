import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TrendingUp, Mail, Shield, FileText, Twitter, Facebook, Linkedin } from "lucide-react";
import type { Page } from "@shared/schema";

export function Footer() {
    const { data: footerPages } = useQuery<Page[]>({
        queryKey: ["/api/pages"],
    });

    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-card/50 backdrop-blur-sm mt-auto">
            <div className="container max-w-7xl py-12 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-2">
                                ترتيب
                            </span>
                        </div>
                        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                            أقوى أداة عربية لتتبع ترتيب كلماتك المفتاحية وتحليل أداء موقعك في محركات البحث. ابدأ اليوم وحسن ظهورك الرقمي. منصة متقدمة تمنحك تحليلات شاملة وتقارير مفصلة.
                        </p>
                    </div>

                    {/* Quick & Support Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-primary">المصادر</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="hover:text-primary transition-colors">الأسعار</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-primary transition-colors">اتصل بنا</Link>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">مركز المساعدة</a>
                            </li>
                        </ul>
                    </div>

                    {/* Custom Pages */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-primary">روابط قانونية</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {footerPages?.map((page) => (
                                <li key={page.id}>
                                    <Link href={`/page/${page.slug}`} className="hover:text-primary transition-colors">
                                        {page.title_ar}
                                    </Link>
                                </li>
                            ))}
                            {!footerPages && (
                                <>
                                    <li className="animate-pulse h-4 w-24 bg-muted rounded" />
                                    <li className="animate-pulse h-4 w-32 bg-muted rounded mt-2" />
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
                    <p>© {currentYear} شركة ترتيب. جميع الحقوق محفوظة.</p>
                    <div className="flex items-center gap-6">
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-primary transition-colors" aria-label="تويتر">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-primary transition-colors" aria-label="فيسبوك">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-primary transition-colors" aria-label="لينكد إن">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                        <div className="h-4 w-px bg-border hidden md:block" />
                        <Link href="/contact" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Mail className="h-4 w-4" />
                            الدعم الفني
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
