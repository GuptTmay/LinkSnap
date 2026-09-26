import redis from "../lib/redis";
import { linksRepository } from "../repositories/links";

const NOT_FOUND_SENTINEL = "__NOT_FOUND__";
const NOT_FOUND_TTL = 60;        // short — don't let a typo become "permanently" 404
const FOUND_TTL = 60 * 60;

export async function getLinkFromRedis(shorturl: string) {
  try {
    const cached = await redis.get(`link:${shorturl}`);
    if (cached === null) return { hit: false };
    if (cached === NOT_FOUND_SENTINEL) return { hit: true, link: null };
    return { hit: true, link: JSON.parse(cached) };
  } catch (err) {
    console.error("Redis read failed, falling back to DB:", err);
    return { hit: false };
  }
}

export async function cacheLink(shorturl: string, link: object | null) {
  try {
    if (link === null) {
      await redis.set(`link:${shorturl}`, NOT_FOUND_SENTINEL, "EX", NOT_FOUND_TTL);
    } else {
      await redis.set(`link:${shorturl}`, JSON.stringify(link), "EX", FOUND_TTL);
    }
  } catch (err) {
    console.error("Redis write failed:", err);
  }
}

/*
Edge cases:
  1. shortUrl exists in Database.
  2. shortUrl does not exist in Database

  both responses need to be stored in redis. 
*/
export async function getLink(shorturl: string) {
  const {hit, link: cachedLink} = await getLinkFromRedis(shorturl);
  if (hit) return cachedLink;
  
  const link = await linksRepository.findByShortUrl(shorturl);
  await cacheLink(shorturl, link);
  
  return link;
}