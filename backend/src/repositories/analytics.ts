import { prisma } from "../lib/prisma";


class AnalyticsRepo {
  async create(data: {
  linkId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  os?: string | null;
  country?: string | null;
  device?: string | null;
  browser?: string | null;
}) {
  return await prisma.linkClick.create({
    data: {
      linkId: data.linkId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
      os: data.os,
      country: data.country,
      device: data.device,
      browser: data.browser,
    },
  });
}
}

export const analyticsRepo = new AnalyticsRepo();