import type { GetTagsResponse } from "@/types/api";
import { apiRequest } from "./client";

// Get all auth User Tags
export const getTags = async () : Promise<GetTagsResponse> => {
  return apiRequest("/tags", {
    method: "GET",
  });
};

