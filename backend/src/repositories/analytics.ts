import { prisma } from "../lib/prisma";
import { AnalyticsRawRow, AnalyticsSummary, TimeGranularity } from "../types";


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

  async getClicksOverTime(
    linkId: string,
    from: Date,
    to: Date,
    granularity: TimeGranularity = "day"
  ) {
    let dateFormat: string;

    switch (granularity) {
      case "day":
        dateFormat = "YYYY-MM-DD";
        break;

      case "week":
        dateFormat = "IYYY-IW";
        break;

      case "month":
        dateFormat = "YYYY-MM";
        break;
    }

    return await prisma.$queryRaw<
      { period: string; clicks: bigint }[]
    >`
      SELECT
        TO_CHAR("createdAt", ${dateFormat}) AS period,
        COUNT(*) AS clicks
      FROM "LinkClick"
      WHERE "linkId" = ${linkId}
        AND "createdAt" >= ${from}
        AND "createdAt" < ${to}
      GROUP BY period
      ORDER BY period ASC;
    `;
  }

  async getDevices(
    linkId: string,
    from: Date,
    to: Date
  ) {
    return await prisma.$queryRaw<
      { device: string; clicks: bigint }[]
    >`
      SELECT
        COALESCE("device", 'Unknown') AS device,
        COUNT(*) AS clicks
      FROM "LinkClick"
      WHERE "linkId" = ${linkId}
        AND "createdAt" >= ${from}
        AND "createdAt" < ${to}
      GROUP BY "device"
      ORDER BY clicks DESC;
    `;
  }

  async getCountries(
    linkId: string,
    from: Date,
    to: Date
  ) {
    return await prisma.$queryRaw<
      { country: string; clicks: bigint }[]
    >`
      SELECT
        COALESCE("country", 'Unknown') AS country,
        COUNT(*) AS clicks
      FROM "LinkClick"
      WHERE "linkId" = ${linkId}
        AND "createdAt" >= ${from}
        AND "createdAt" < ${to}
      GROUP BY "country"
      ORDER BY clicks DESC;
    `;
  }

  async getOperatingSystems(
    linkId: string,
    from: Date,
    to: Date
  ) {
    return await prisma.$queryRaw<
      { os: string; clicks: bigint }[]
    >`
      SELECT
        COALESCE("os", 'Unknown') AS os,
        COUNT(*) AS clicks
      FROM "LinkClick"
      WHERE "linkId" = ${linkId}
        AND "createdAt" >= ${from}
        AND "createdAt" < ${to}
      GROUP BY "os"
      ORDER BY clicks DESC;
    `;
  }

  async getReferrers(
    linkId: string,
    from: Date,
    to: Date
  ) {
    return await prisma.$queryRaw<
      { referrer: string; clicks: bigint }[]
    >`
      SELECT
        COALESCE("referrer", 'Unknown') AS referrer,
        COUNT(*) AS clicks
      FROM "LinkClick"
      WHERE "linkId" = ${linkId}
        AND "createdAt" >= ${from}
        AND "createdAt" < ${to}
      GROUP BY "referrer"
      ORDER BY clicks DESC;
    `;
  }


  /**
 * Single-scan replacement for getClicksOverTime + getDevices + getCountries + getOperatingSystems.
 * Uses GROUPING SETS so Postgres aggregates all 4 dimensions in one pass over LinkClick.
 *
 * NOTE: this coalesces NULL device/country/os to 'Unknown' and does NOT distinguish
 * "genuinely unknown value" from "column not part of this row's grouping set" — both
 * collapse to the same bucket via non-null filtering. Fine if you don't care which is which;
 * if you need that distinction, add GROUPING(period,device,country,os) and branch on the bitmask instead.
 */
  async getStatsSummary(
    linkId: string,
    from: Date,
    to: Date,
    granularity: TimeGranularity = "day"
  ): Promise<AnalyticsSummary> {
    let dateFormat: string;

    switch (granularity) {
      case "day":
        dateFormat = "YYYY-MM-DD";
        break;
      case "week":
        dateFormat = "IYYY-IW";
        break;
      case "month":
        dateFormat = "YYYY-MM";
        break;
    }

    const rows = await prisma.$queryRaw<AnalyticsRawRow[]>`
      WITH filtered AS (
        SELECT
          TO_CHAR("createdAt", ${dateFormat}) AS period,
          "device",
          "country",
          "os"
        FROM "LinkClick"
        WHERE "linkId" = ${linkId}
          AND "createdAt" >= ${from}
          AND "createdAt" < ${to}
      )
      SELECT
        period,
        device,
        country,
        os,
        COUNT(*) AS clicks
      FROM filtered
      GROUP BY GROUPING SETS (
        (period), (device), (country), (os)
      ); 
    `;

    // parse the raw rows into structured data for each dimension, filtering out the "Unknown" buckets
    const clicksOverTime = rows
      .filter((r) => r.period !== null)
      .map((r) => ({ period: r.period as string, clicks: Number(r.clicks) }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const devices = rows
      .filter((r) => r.period === null && r.device !== null)
      .map((r) => ({ device: r.device as string, clicks: Number(r.clicks) }))
      .sort((a, b) => b.clicks - a.clicks);

    const countries = rows
      .filter((r) => r.period === null && r.country !== null)
      .map((r) => ({ country: r.country as string, clicks: Number(r.clicks) }))
      .sort((a, b) => b.clicks - a.clicks);

    const operatingSystems = rows
      .filter((r) => r.period === null && r.os !== null)
      .map((r) => ({ os: r.os as string, clicks: Number(r.clicks) }))
      .sort((a, b) => b.clicks - a.clicks);

    return { clicksOverTime, devices, countries, operatingSystems };
  }
}

export const analyticsRepo = new AnalyticsRepo();