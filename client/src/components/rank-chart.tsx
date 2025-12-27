import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RankChartProps {
  data: Array<{
    date: string;
    position: number;
  }>;
  keyword?: string;
}

export function RankChart({ data, keyword }: RankChartProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          {keyword ? `اتجاه الترتيب: ${keyword}` : "اتجاه الترتيب"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              reversed 
              domain={[1, 20]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="position"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
