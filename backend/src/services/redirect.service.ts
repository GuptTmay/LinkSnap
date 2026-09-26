import redis from "../lib/redis";
import { linksRepository } from "../repositories/links";

export async function getLinkFromRedis(shorturl: string) {
  const cached = await redis.get(`link:${shorturl}`);

  if (!cached) return null;

  return JSON.parse(cached);
}

export async function cacheLink(shorturl: string, link: object) {
  await redis.set(
    `link:${shorturl}`,
    JSON.stringify(link),
    "EX",
    60 * 60
  );
}

export async function getLink(shorturl: string) {
  const cachedLink = await getLinkFromRedis(shorturl);

  if (cachedLink) {
    return cachedLink;
  }

  const link = await linksRepository.findByShortUrl(shorturl);

  await cacheLink(shorturl, link);

  return link;
}