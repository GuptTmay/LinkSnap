import type { GetAnalyticsPayload, GetAnalyticsResponse } from "@/types/analytics";
import { apiRequest } from "./client";

// Get analytics for a specific link
export const getAnalytics = async (
  linkId: string,
  payload?: GetAnalyticsPayload
): Promise<GetAnalyticsResponse> => {
  const params = new URLSearchParams();
  if (payload?.granularity) params.set("granularity", payload.granularity);
  if (payload?.from) params.set("from", payload.from);
  if (payload?.to) params.set("to", payload.to);

  const query = params.toString();
  return apiRequest(`/analytics/${linkId}${query ? `?${query}` : ""}`, {
    method: "GET",
  });
};