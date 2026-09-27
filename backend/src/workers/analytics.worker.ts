// src/workers/analytics.worker.ts

import { Worker } from "bullmq";
import { createRedirectAnalytics } from "../services/analytics.service";

const worker = new Worker(
  "analytics",
  async (job) => {
    const {
      linkId,
      ipAddress,
      userAgent,
      referrer,
    } = job.data;

    await createRedirectAnalytics(
      linkId,
      ipAddress,
      userAgent,
      referrer
    );
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Analytics job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Analytics job ${job?.id} failed:`, err);
});