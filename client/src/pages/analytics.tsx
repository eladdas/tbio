import { RankChart } from "@/components/rank-chart";
import { MetricCard } from "@/components/metric-card";
import { TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type AnalyticsData = {
  improved: number;
  declined: number;
  avgChange: number;
  domainStats: Array<{
    domain: string;
    keywords: number;
    avgPosition: number;
    improving: number;
    declining: number;
  }>;
  keywordCharts: Array<{
    keyword: string;
    data: Array<{ date: string; position: number }>;
  }>;
};

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
            تحليلات متقدمة
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">التحليلات</h1>
          <p className="text-sm md:text-base text-muted-foreground">تعمق في أداء الترتيب والاتجاهات الخاصة بك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
            تحليلات متقدمة
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">التحليلات</h1>
          <p className="text-sm md:text-base text-muted-foreground">لا توجد بيانات كافية للتحليل</p>
        </div>
      </div>
    );
  }

  const avgChangeFormatted = analytics.avgChange > 0
    ? `+${analytics.avgChange}`
    : analytics.avgChange.toString();

  const avgChangeTrend = analytics.avgChange > 0
    ? { value: Math.abs(analytics.avgChange), direction: "up" as const }
    : analytics.avgChange < 0
      ? { value: Math.abs(analytics.avgChange), direction: "down" as const }
      : undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
          تحليلات متقدمة
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">التحليلات</h1>
        <p className="text-sm md:text-base text-muted-foreground">تعمق في أداء الترتيب والاتجاهات الخاصة بك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="ترتيبات محسّنة"
          value={analytics.improved.toString()}
          icon={TrendingUp}
          subtitle="كلمات محسنة"
          data-testid="metric-improved"
        />
        <MetricCard
          title="ترتيبات منخفضة"
          value={analytics.declined.toString()}
          icon={TrendingDown}
          subtitle="كلمات منخفضة"
          data-testid="metric-declined"
        />
        <MetricCard
          title="متوسط تغيير الموقع"
          value={avgChangeFormatted}
          icon={Target}
          trend={avgChangeTrend}
          subtitle={analytics.avgChange > 0 ? "تحسن" : analytics.avgChange < 0 ? "تراجع" : "بدون تغيير"}
          data-testid="metric-avg-change"
        />
        <MetricCard
          title="إجمالي الكلمات"
          value={analytics.domainStats.reduce((sum, d) => sum + d.keywords, 0).toString()}
          icon={Activity}
          subtitle="قيد المراقبة"
          data-testid="metric-total-keywords"
        />
      </div>

      <Tabs defaultValue="keywords" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="keywords" data-testid="tab-keywords" className="flex-1 sm:flex-initial text-xs sm:text-sm">حسب الكلمات</TabsTrigger>
          <TabsTrigger value="domains" data-testid="tab-domains" className="flex-1 sm:flex-initial text-xs sm:text-sm">حسب النطاقات</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-4 md:space-y-6">
          {analytics.keywordCharts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {analytics.keywordCharts.map((chart, idx) => (
                <RankChart
                  key={idx}
                  data={chart.data}
                  keyword={chart.keyword}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد بيانات كافية لعرض الرسوم البيانية
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          {analytics.domainStats.length > 0 ? (
            <div className="grid gap-4">
              {analytics.domainStats.map((stat) => (
                <Card key={stat.domain} data-testid={`domain-stat-${stat.domain}`}>
                  <CardHeader>
                    <CardTitle className="text-base">{stat.domain}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">الكلمات</p>
                        <p className="text-2xl font-bold" data-testid={`keywords-count-${stat.domain}`}>{stat.keywords}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">متوسط الترتيب</p>
                        <p className="text-2xl font-bold" data-testid={`avg-position-${stat.domain}`}>
                          {stat.avgPosition > 0 ? stat.avgPosition : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">متحسنة</p>
                        <p className="text-2xl font-bold text-chart-2" data-testid={`improving-${stat.domain}`}>{stat.improving}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">منخفضة</p>
                        <p className="text-2xl font-bold text-destructive" data-testid={`declining-${stat.domain}`}>{stat.declining}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد نطاقات لعرض الإحصائيات
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
