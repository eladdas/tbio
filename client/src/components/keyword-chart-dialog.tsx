import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { ar } from "date-fns/locale";

interface KeywordChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keywordId: string;
  keywordText: string;
}

type TimeRange = "1m" | "3m" | "6m" | "1y";

interface RankingData {
  id: string;
  keyword_id: string;
  position: number | null;
  search_volume: number;
  checked_at: string;
}

export function KeywordChartDialog({
  open,
  onOpenChange,
  keywordId,
  keywordText,
}: KeywordChartDialogProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");

  const { data: rankings = [], isLoading } = useQuery<RankingData[]>({
    queryKey: ["/api/keywords", keywordId, "rankings"],
    enabled: open && !!keywordId,
  });

  const getFilteredData = () => {
    if (!rankings.length) return [];

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "1m":
        startDate = subMonths(now, 1);
        break;
      case "3m":
        startDate = subMonths(now, 3);
        break;
      case "6m":
        startDate = subMonths(now, 6);
        break;
      case "1y":
        startDate = subYears(now, 1);
        break;
    }

    return rankings
      .filter((r) => new Date(r.checked_at) >= startDate)
      .map((r) => ({
        date: format(new Date(r.checked_at), "dd/MM", { locale: ar }),
        position: r.position || 100,
        searchVolume: r.search_volume,
        fullDate: format(new Date(r.checked_at), "dd MMMM yyyy", { locale: ar }),
      }))
      .reverse();
  };

  const chartData = getFilteredData();

  const getPositionChange = () => {
    if (chartData.length < 2) return null;
    const first = chartData[0].position;
    const last = chartData[chartData.length - 1].position;
    return first - last;
  };

  const positionChange = getPositionChange();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            تحليل الترتيب: {keywordText}
          </DialogTitle>
          <DialogDescription>
            متابعة تغييرات الترتيب على مدار الفترة الزمنية المحددة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">الفترة الزمنية:</span>
            </div>
            <div className="flex gap-2">
              {[
                { value: "1m" as TimeRange, label: "شهر" },
                { value: "3m" as TimeRange, label: "3 أشهر" },
                { value: "6m" as TimeRange, label: "6 أشهر" },
                { value: "1y" as TimeRange, label: "سنة" },
              ].map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range.value)}
                  data-testid={`button-timerange-${range.value}`}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          {positionChange !== null && chartData.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">الترتيب الحالي</div>
                <div className="text-2xl font-bold text-primary">
                  {chartData[chartData.length - 1].position === 100
                    ? "غير موجود"
                    : `#${chartData[chartData.length - 1].position}`}
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">التغيير</div>
                <div className={`text-2xl font-bold flex items-center gap-1 ${
                  positionChange > 0 ? "text-green-600" : positionChange < 0 ? "text-red-600" : "text-muted-foreground"
                }`}>
                  {positionChange > 0 ? (
                    <>
                      <TrendingUp className="h-5 w-5" />
                      <span>+{positionChange}</span>
                    </>
                  ) : positionChange < 0 ? (
                    <>
                      <TrendingDown className="h-5 w-5" />
                      <span>{positionChange}</span>
                    </>
                  ) : (
                    <span>بدون تغيير</span>
                  )}
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">حجم البحث</div>
                <div className="text-2xl font-bold">
                  {chartData[chartData.length - 1]?.searchVolume?.toLocaleString("ar-SA") || "0"}
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-card border rounded-lg p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mb-2 opacity-20" />
                <p>لا توجد بيانات للفترة المحددة</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    reversed
                  />
                  <YAxis 
                    reversed
                    domain={[1, 100]}
                    className="text-xs"
                    label={{ value: "الترتيب", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-semibold mb-1">{data.fullDate}</p>
                            <p className="text-sm text-muted-foreground">
                              الترتيب:{" "}
                              <span className="font-bold text-primary">
                                {data.position === 100 ? "غير موجود" : `#${data.position}`}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              حجم البحث:{" "}
                              <span className="font-bold">
                                {data.searchVolume?.toLocaleString("ar-SA")}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="position"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Data Table */}
          {chartData.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-right p-3 font-semibold">التاريخ</th>
                    <th className="text-right p-3 font-semibold">الترتيب</th>
                    <th className="text-right p-3 font-semibold">حجم البحث</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {chartData.slice().reverse().map((item, index) => (
                    <tr key={index} className="hover-elevate">
                      <td className="p-3">{item.fullDate}</td>
                      <td className="p-3 font-semibold text-primary">
                        {item.position === 100 ? "غير موجود" : `#${item.position}`}
                      </td>
                      <td className="p-3">{item.searchVolume?.toLocaleString("ar-SA")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
