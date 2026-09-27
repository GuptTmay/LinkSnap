import { Request } from "express";
import { UAParser } from "ua-parser-js";
import { analyticsRepo } from "../repositories/analytics";
import { getCountryFromIp } from "../services/geolocation.service";

import { analyticsQueue } from "../queues/analytics.queue";

export async function createRedirectAnalytics(
  linkId: string,
  ipAddress: string | undefined,
  userAgent: string | undefined,
  referrer: string | undefined
) {
  const parser = new UAParser(userAgent);

  const browser = parser.getBrowser().name ?? null;
  const device = parser.getDevice().type ?? "desktop";
  const os = parser.getOS().name ?? null;

  let country = null;

  if (ipAddress) {
    country = await getCountryFromIp(ipAddress);
  }

  return analyticsRepo.create({
    linkId,
    ipAddress,
    userAgent,
    referrer,
    os,
    country,
    browser,
    device,
  });
}

export async function queueRedirectAnalytics(
  req: Request,
  linkId: string
) {
  await analyticsQueue.add("redirect-analytics", {
    linkId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    referrer: req.headers.referer,
  },
    {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );
}