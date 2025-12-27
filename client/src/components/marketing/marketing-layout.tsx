import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Twitter, Facebook, Linkedin, Menu, X } from "lucide-react";
import { Footer } from "@/components/footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 cursor-pointer">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#8bc34a] via-[#4caf50] to-[#2e7d32] bg-clip-text text-transparent">
                  ترتيب
                </h1>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-base font-medium text-muted-foreground hover-elevate transition-colors" data-testid="link-home">
                الرئيسية
              </Link>
              <Link href="/pricing" className="text-base font-medium text-muted-foreground hover-elevate transition-colors" data-testid="link-pricing">
                الأسعار
              </Link>
              <Link href="/contact" className="text-base font-medium text-muted-foreground hover-elevate transition-colors" data-testid="link-contact">
                تواصل معنا
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-[#4caf50]"
                data-testid="button-login"
                asChild
              >
                <a href="/login">تسجيل الدخول</a>
              </Button>
              <Button
                className="bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white"
                data-testid="button-signup"
                asChild
              >
                <a href="/register">انضم الآن</a>
              </Button>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6 text-[#4caf50]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-8">
                  <nav className="flex flex-col gap-4">
                    <Link
                      href="/"
                      className="text-lg font-medium text-foreground hover-elevate transition-colors py-2"
                      data-testid="link-mobile-home"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      الرئيسية
                    </Link>
                    <Link
                      href="/pricing"
                      className="text-lg font-medium text-foreground hover-elevate transition-colors py-2"
                      data-testid="link-mobile-pricing"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      الأسعار
                    </Link>
                    <Link
                      href="/contact"
                      className="text-lg font-medium text-foreground hover-elevate transition-colors py-2"
                      data-testid="link-mobile-contact"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      تواصل معنا
                    </Link>
                  </nav>

                  <div className="flex flex-col gap-3 pt-6 border-t">
                    <Button
                      variant="outline"
                      className="w-full text-[#4caf50] border-[#4caf50]"
                      data-testid="button-mobile-login"
                      asChild
                    >
                      <a href="/login">تسجيل الدخول</a>
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white"
                      data-testid="button-mobile-signup"
                      asChild
                    >
                      <a href="/register">انضم الآن</a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>

      <Footer />
    </div>
  );
}
