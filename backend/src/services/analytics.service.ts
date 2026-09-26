import { Request } from "express";
import { UAParser } from "ua-parser-js";
import { analyticsRepo } from "../repositories/analytics";
import { getCountryFromIp } from "../services/geolocation.service";

export async function createRedirectAnalytics(
  req: Request,
  linkId: string
) {
  const userAgent = req.headers["user-agent"];

  const parser = new UAParser(userAgent);

  const browser = parser.getBrowser().name ?? null;
  const device = parser.getDevice().type ?? "desktop";
  const os = parser.getOS().name ?? null;

  let country = null;

  // console.log("req.ip:", req.ip);
  // console.log("req.ips:", req.ips);
  // console.log("x-forwarded-for:", req.headers["x-forwarded-for"]);
  
  if (req.ip) {
    country = await getCountryFromIp(req.ip);
  }

  return analyticsRepo.create({
    linkId,
    ipAddress: req.ip,
    userAgent,
    referrer: req.headers.referer,
    os,
    country,
    browser,
    device,
  });
}