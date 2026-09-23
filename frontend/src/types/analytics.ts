export type TimeGranularity = "day" | "week" | "month";

export type GetAnalyticsPayload = {
  from?: string; // ISO date string, e.g. new Date().toISOString()
  to?: string;   // ISO date string
  granularity?: TimeGranularity;
};

export type AnalyticsPoint = {
  clicks: number;
};

export type ClicksOverTimePoint = AnalyticsPoint & {
  period: string;
};

export type DeviceStat = AnalyticsPoint & {
  device: string;
};

export type CountryStat = AnalyticsPoint & {
  country: string;
};

export type OsStat = AnalyticsPoint & {
  os: string;
};

export type AnalyticsData = {
  clicksOverTime: ClicksOverTimePoint[];
  devices: DeviceStat[];
  countries: CountryStat[];
  operatingSystems: OsStat[];
  from: string; // serialized Date from backend JSON — string over the wire, not a Date instance
  to: string;
  granularity: TimeGranularity;
};

export type GetAnalyticsResponse = {
  success: true;
  message: string;
  data: AnalyticsData;
};