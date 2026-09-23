import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ClicksOverTimePoint } from "@/types/analytics";

interface ClicksOverTimeChartProps {
  data: ClicksOverTimePoint[];
  mode?: "link" | "qrcode";
}

export const ClicksOverTimeChart: React.FC<ClicksOverTimeChartProps> = ({
  data,
  mode = "link",
}) => {
  const metricName = mode === "qrcode" ? "Scans" : "Clicks";
  const title = `${metricName} Over Time`;

  const totalClicks = data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

  const chartConfig: ChartConfig = {
    clicks: {
      label: metricName,
      color: mode === "qrcode" ? "var(--color-indigo-500, #6366f1)" : "var(--color-blue-500, #3b82f6)",
    },
  };

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription>Activity trend over the selected period</CardDescription>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tracking-tight">{totalClicks.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total {metricName}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full aspect-auto">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={mode === "qrcode" ? "#6366f1" : "#3b82f6"}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={mode === "qrcode" ? "#6366f1" : "#3b82f6"}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  if (typeof value === "string" && value.length > 10) {
                    return value.slice(5, 10);
                  }
                  return value;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(val) => `Date: ${val}`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke={mode === "qrcode" ? "#6366f1" : "#3b82f6"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fillClicks)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ClicksOverTimeChart;
