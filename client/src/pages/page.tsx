import { useQuery } from "@tanstack/react-query";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Page } from "@shared/schema";

export default function PageViewer() {
    const [, params] = useRoute("/page/:slug");
    const slug = params?.slug;

    const { data: page, isLoading, error } = useQuery<Page>({
        queryKey: [`/api/pages/${slug}`],
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <div className="container max-w-4xl py-12">
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0">
                        <Skeleton className="h-10 w-2/3 mb-4" />
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="container max-w-4xl py-20 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <AlertCircle className="h-16 w-16 text-muted-foreground" />
                    <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
                    <p className="text-muted-foreground">عذراً، الصفحة التي تبحث عنها غير متوفرة حالياً.</p>
                    <Button asChild className="mt-4">
                        <Link href="/">
                            <ChevronRight className="me-2 h-4 w-4" />
                            العودة للرئيسية
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <MarketingLayout>
            <div className="container max-w-4xl py-12">
                <article className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 border-b pb-4">
                        {page.title_ar}
                    </h1>
                    <div className="mt-8 text-right whitespace-pre-wrap leading-relaxed">
                        {page.content_ar}
                    </div>
                </article>
            </div>
        </MarketingLayout>
    );
}
