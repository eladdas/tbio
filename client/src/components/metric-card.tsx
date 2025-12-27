import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  subtitle?: string;
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, subtitle, className }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.direction === "up") return <TrendingUp className="h-3 w-3" />;
    if (trend.direction === "down") return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";

    if (trend.direction === "up") return "text-chart-2";
    if (trend.direction === "down") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <Card
      data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn("transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border-2 hover:border-primary/40 bg-gradient-to-br from-card to-secondary/30", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-md flex-shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold tabular-nums text-primary">{value}</div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs font-medium mt-1", getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(trend.value)}%</span>
            {subtitle && <span className="text-muted-foreground ms-1">{subtitle}</span>}
          </div>
        )}
        {!trend && subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
