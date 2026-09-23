import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
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
import type { OsStat } from "@/types/analytics";

interface OperatingSystemChartProps {
  data: OsStat[];
  mode?: "link" | "qrcode";
}

export const OperatingSystemChart: React.FC<OperatingSystemChartProps> = ({
  data,
  mode = "link",
}) => {
  const metricName = mode === "qrcode" ? "Scans" : "Clicks";
  const total = data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

  // Sort descending by clicks
  const sortedData = [...data].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  const chartConfig: ChartConfig = {
    clicks: {
      label: metricName,
      color: mode === "qrcode" ? "#8b5cf6" : "#0284c7",
    },
  };

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold">Operating Systems</CardTitle>
          <CardDescription>Breakdown by platform / OS</CardDescription>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-tight">{total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total {metricName}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col justify-center">
        {sortedData.length === 0 ? (
          <div className="flex h-56 w-full items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-56 w-full aspect-auto">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                dataKey="os"
                type="category"
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(val) => {
                  if (typeof val === "string" && val.length > 9) {
                    return `${val.slice(0, 8)}…`;
                  }
                  return val;
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="clicks"
                fill={mode === "qrcode" ? "#8b5cf6" : "#0284c7"}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default OperatingSystemChart;
