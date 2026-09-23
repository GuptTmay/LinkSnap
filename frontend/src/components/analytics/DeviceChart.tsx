import React from "react";
import { PieChart, Pie, Cell } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DeviceStat } from "@/types/analytics";

interface DeviceChartProps {
  data: DeviceStat[];
  mode?: "link" | "qrcode";
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
];

export const DeviceChart: React.FC<DeviceChartProps> = ({
  data,
  mode = "link",
}) => {
  const metricName = mode === "qrcode" ? "Scans" : "Clicks";
  const total = data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

  // Build dynamic chart config based on device categories
  const chartConfig: ChartConfig = {
    clicks: {
      label: metricName,
    },
  };

  data.forEach((item, index) => {
    chartConfig[item.device] = {
      label: item.device.charAt(0).toUpperCase() + item.device.slice(1),
      color: COLORS[index % COLORS.length],
    };
  });

  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold">Devices</CardTitle>
          <CardDescription>Breakdown by device category</CardDescription>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-tight">{total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total {metricName}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col justify-center">
        {data.length === 0 ? (
          <div className="flex h-56 w-full items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-56 w-full aspect-auto">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="device" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="clicks"
                nameKey="device"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="device" />}
                className="-translate-y-2 flex-wrap gap-2 text-xs"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceChart;
