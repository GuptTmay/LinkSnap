import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "../lib/redis";

const ipLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:ip",
  points: parseInt(process.env.RATE_LIMITER_POINTS ?? "100", 10),
  duration: parseInt(process.env.RATE_LIMITER_DURATION ?? "60", 10),
});

export default ipLimiter;