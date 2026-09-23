export type TimeGranularity = "day" | "week" | "month";

export type AnalyticsRawRow = {
  period: string | null;
  device: string | null;
  country: string | null;
  os: string | null;
  clicks: bigint;
};

export type AnalyticsSummary = {
  clicksOverTime: { period: string; clicks: number }[];
  devices: { device: string; clicks: number }[];
  countries: { country: string; clicks: number }[];
  operatingSystems: { os: string; clicks: number }[];
};