import { MetricCard } from "@/components/metric-card";
import { KeywordTable, KeywordData } from "@/components/keyword-table";
import { AddKeywordDialog } from "@/components/add-keyword-dialog";
import { AddDomainDialog } from "@/components/add-domain-dialog";
import { TrendingUp, Target, Globe, Activity, Sparkles, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type EnrichedKeyword = {
  id: string;
  keyword: string;
  domain_id: string;
  domain: string;
  target_location: string;
  is_active: boolean;
  position: number | null;
  previousPosition: number | null;
  searchVolume: number;
  lastChecked: string | null;
};

export default function Dashboard() {
  const { data: keywords = [], isLoading: keywordsLoading } = useQuery<EnrichedKeyword[]>({
    queryKey: ['/api/keywords'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: domains = [] } = useQuery<any[]>({
    queryKey: ['/api/domains'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Calculate metrics
  const activeKeywords = keywords.filter(k => k.is_active);
  const rankedKeywords = keywords.filter(k => k.position !== null);
  const avgPosition = rankedKeywords.length > 0
    ? (rankedKeywords.reduce((sum, k) => sum + (k.position || 0), 0) / rankedKeywords.length).toFixed(1)
    : "0";

  // Calculate improvement percentage
  const improvedKeywords = keywords.filter(k =>
    k.position !== null && k.previousPosition !== null && k.position < k.previousPosition
  ).length;
  const improvementRate = rankedKeywords.length > 0
    ? ((improvedKeywords / rankedKeywords.length) * 100).toFixed(0)
    : "0";

  // Get top movers (biggest position improvements)
  const topMovers = keywords
    .filter(k => k.position !== null && k.previousPosition !== null && k.position !== k.previousPosition)
    .map(k => ({
      keyword: k.keyword,
      domain: k.domain,
      change: k.previousPosition! - k.position!,
    }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
              <Sparkles className="w-4 h-4" />
              نظرة عامة
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
              لوحة التحكم
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              مرحباً بك! إليك نظرة عامة على أداء SEO الخاص بك
            </p>
          </div>
          <div className="flex gap-2">
            <AddDomainDialog onAdd={(domain) => console.log('Add Domain:', domain)} />
            <AddKeywordDialog onAdd={(keyword, domain) => console.log('Add:', keyword, domain)} />
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-scale" style={{ animationDelay: '0.1s' }}>
          <MetricCard
            title="إجمالي الكلمات"
            value={keywords.length.toString()}
            icon={TrendingUp}
            subtitle="كلمات مفتاحية"
            className="card-lift glow-hover"
          />
        </div>
        <div className="animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
          <MetricCard
            title="متوسط الترتيب"
            value={avgPosition}
            icon={Target}
            subtitle={rankedKeywords.length > 0 ? `من ${rankedKeywords.length} كلمة مصنفة` : "لا توجد بيانات"}
            className="card-lift glow-hover"
          />
        </div>
        <div className="animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
          <MetricCard
            title="النطاقات المتتبعة"
            value={domains.length.toString()}
            icon={Globe}
            subtitle="نطاقات نشطة"
            className="card-lift glow-hover"
          />
        </div>
        <div className="animate-fade-in-scale" style={{ animationDelay: '0.4s' }}>
          <MetricCard
            title="الكلمات النشطة"
            value={activeKeywords.length.toString()}
            icon={Activity}
            subtitle="قيد المراقبة"
            className="card-lift glow-hover"
          />
        </div>
      </div>



      {/* Domain Performance Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          أداء النطاقات
        </h2>

        {domains.map((domain) => {
          const domainKeywords = keywords.filter(k => k.domain_id === domain.id);
          const ranked = domainKeywords.filter(k => k.position !== null && k.position! > 0);
          const avgPos = ranked.length > 0
            ? (ranked.reduce((sum, k) => sum + (k.position || 0), 0) / ranked.length).toFixed(1)
            : "-";

          const top3 = ranked.filter(k => k.position! <= 3).length;
          const top4to7 = ranked.filter(k => k.position! >= 4 && k.position! <= 7).length;
          const top8to10 = ranked.filter(k => k.position! >= 8 && k.position! <= 10).length;

          return (
            <Card key={domain.id} className="card-lift overflow-hidden border-t-4 border-t-primary w-full">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Globe className="w-6 h-6 text-primary" />
                    {domain.domain}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Tracked Keywords */}
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors">
                    <span className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      الكلمات المتتبعة
                    </span>
                    <span className="text-3xl font-bold text-primary">{domainKeywords.length}</span>
                  </div>

                  {/* Avg Position */}
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors">
                    <span className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      متوسط الترتيب
                    </span>
                    <span className="text-3xl font-bold text-primary">{avgPos}</span>
                  </div>

                  {/* Top 1-3 */}
                  <div className="flex flex-col items-center justify-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
                    <span className="text-sm text-yellow-700/80 dark:text-yellow-500/80 mb-2 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      المركز 1-3
                    </span>
                    <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{top3}</span>
                  </div>

                  {/* Top 4-7 */}
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-500/10 rounded-xl border border-gray-500/20 hover:bg-gray-500/20 transition-colors">
                    <span className="text-sm text-gray-700/80 dark:text-gray-400/80 mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      المركز 4-7
                    </span>
                    <span className="text-3xl font-bold text-gray-600 dark:text-gray-400">{top4to7}</span>
                  </div>

                  {/* Top 8-10 */}
                  <div className="flex flex-col items-center justify-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
                    <span className="text-sm text-orange-700/80 dark:text-orange-500/80 mb-2 flex items-center gap-1">
                      <Minus className="w-4 h-4" />
                      المركز 8-10
                    </span>
                    <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{top8to10}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Movers Section - Enhanced */}
      {topMovers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-lift overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                الأكثر تحركاً
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {topMovers.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/30 to-transparent hover:from-muted/50 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">{item.keyword}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      {item.domain}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.change > 0 ? (
                      <>
                        <div className="bg-green-500/10 text-green-600 px-3 py-2 rounded-lg flex items-center gap-1 font-bold text-sm">
                          <ArrowUp className="w-4 h-4" />
                          {item.change}
                        </div>
                      </>
                    ) : item.change < 0 ? (
                      <>
                        <div className="bg-red-500/10 text-red-600 px-3 py-2 rounded-lg flex items-center gap-1 font-bold text-sm">
                          <ArrowDown className="w-4 h-4" />
                          {Math.abs(item.change)}
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-500/10 text-gray-600 px-3 py-2 rounded-lg flex items-center gap-1 font-bold text-sm">
                        <Minus className="w-4 h-4" />
                        0
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Summary Card */}
          <Card className="card-lift overflow-hidden border-l-4 border-l-chart-2">
            <CardHeader className="bg-gradient-to-r from-chart-2/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-chart-2" />
                ملخص الأداء
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">معدل التحسن</span>
                    <span className="text-2xl font-bold text-chart-2">{improvementRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-chart-2 to-primary h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${improvementRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {improvedKeywords}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      كلمات محسّنة
                    </div>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {rankedKeywords.length}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      كلمات مصنّفة
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {
        keywords.length === 0 && !keywordsLoading && (
          <Card className="card-lift">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ابدأ رحلتك الآن</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                لم تقم بإضافة أي كلمات مفتاحية بعد. ابدأ بإضافة كلماتك الأولى لتتبع أداء موقعك.
              </p>
              <div className="flex gap-2">
                <AddDomainDialog onAdd={(domain) => console.log('Add Domain:', domain)} />
                <AddKeywordDialog onAdd={(keyword, domain) => console.log('Add:', keyword, domain)} />
              </div>
            </CardContent>
          </Card>
        )
      }
    </div >
  );
}
