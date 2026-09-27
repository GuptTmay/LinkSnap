// src/queues/analytics.queue.ts

import { Queue } from "bullmq";

export const analyticsQueue = new Queue("analytics", {
  connection: {
    url: process.env.REDIS_URL,
  },
});