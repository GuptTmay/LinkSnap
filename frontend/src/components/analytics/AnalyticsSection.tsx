import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAnalytics } from "@/api/analytics.api";
import { ApiError } from "@/types/error";
import type {
  AnalyticsData,
  GetAnalyticsPayload,
  TimeGranularity,
} from "@/types/analytics";
import { ClicksOverTimeChart } from "./ClicksOverTimeChart";
import { DeviceChart } from "./DeviceChart";
import { OperatingSystemChart } from "./OperatingSystemChart";
import { CountryChart } from "./CountryChart";
import { BarChart3, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsSectionProps {
  linkId: string;
  mode?: "link" | "qrcode";
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  linkId,
  mode = "link",
}) => {
  const metricName = mode === "qrcode" ? "Scans" : "Clicks";

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  // Default filters: last 7 days, granularity: "day"
  const defaultFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const defaultTo = new Date().toISOString().split("T")[0];

  const [from, setFrom] = useState<string>(defaultFrom);
  const [to, setTo] = useState<string>(defaultTo);
  const [granularity, setGranularity] = useState<TimeGranularity>("day");

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    if (!linkId) return;

    setIsLoading(true);
    setError(null);

    const payload: GetAnalyticsPayload = {
      granularity,
      ...(from ? { from: new Date(from).toISOString() } : {}),
      ...(to ? { to: new Date(`${to}T23:59:59.999Z`).toISOString() } : {}),
    };

    try {
      const res = await getAnalytics(linkId, payload);
      setData(res.data);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to load analytics data.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [linkId, granularity, from, to]);

  // Handle Toggle Switch
  const handleToggle = (checked: boolean) => {
    setShowAnalytics(checked);
    if (checked && !hasFetchedOnce) {
      setHasFetchedOnce(true);
    }
  };

  // Trigger fetch when analytics are shown and filters or linkId change
  useEffect(() => {
    if (showAnalytics) {
      fetchAnalyticsData();
    }
  }, [showAnalytics, fetchAnalyticsData]);

  return (
    <div className="space-y-6 pt-4">
      {/* Header & Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {mode === "qrcode" ? "QR Code Analytics" : "Link Analytics"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Track {metricName.toLowerCase()}, audience demographics, and devices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Label htmlFor="analytics-toggle" className="text-sm font-medium cursor-pointer">
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Label>
          <Switch
            id="analytics-toggle"
            checked={showAnalytics}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>

      {/* When Analytics are Shown */}
      {showAnalytics && (
        <div className="space-y-6">
          {/* Filter Controls Bar */}
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-4 flex flex-wrap items-end gap-4 justify-between">
              <div className="flex flex-wrap items-center gap-4">
                {/* Granularity */}
                <div className="space-y-1.5 min-w-[120px]">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Granularity
                  </Label>
                  <Select
                    value={granularity}
                    onValueChange={(val) => setGranularity(val as TimeGranularity)}
                  >
                    <SelectTrigger className="h-9 w-[130px] bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-1.5 min-w-[130px]">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    From
                  </Label>
                  <Input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-9 bg-background text-xs"
                  />
                </div>

                {/* Date To */}
                <div className="space-y-1.5 min-w-[130px]">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    To
                  </Label>
                  <Input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-9 bg-background text-xs"
                  />
                </div>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalyticsData}
                disabled={isLoading}
                className="h-9 gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </CardContent>
          </Card>

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="space-y-6">
              {/* Clicks Over Time Skeleton */}
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="pt-4">
                  <Skeleton className="h-64 w-full rounded-md" />
                </CardContent>
              </Card>

              {/* 3 Grid Skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-border/60 shadow-xs">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-44" />
                    </CardHeader>
                    <CardContent className="pt-2 flex justify-center">
                      <Skeleton className="h-56 w-full rounded-md" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : error ? (
            /* Error State with Retry */
            <Card className="border-destructive/40 bg-destructive/5 text-center py-10">
              <CardContent className="flex flex-col items-center justify-center gap-3">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">Failed to load analytics</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAnalyticsData}
                  className="mt-2 gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </Button>
              </CardContent>
            </Card>
          ) : data ? (
            /* Charts Display */
            <div className="space-y-6">
              {/* Full Width Top: Clicks/Scans Over Time */}
              <ClicksOverTimeChart
                data={data.clicksOverTime || []}
                mode={mode}
              />

              {/* 3 Grid Columns: Devices, OS, Countries */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DeviceChart
                  data={data.devices || []}
                  mode={mode}
                />
                <OperatingSystemChart
                  data={data.operatingSystems || []}
                  mode={mode}
                />
                <CountryChart
                  data={data.countries || []}
                  mode={mode}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;
