import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import openRouter from "../routers/open";

const dependencyMocks = vi.hoisted(() => ({
  prisma: { $queryRaw: vi.fn() },
  redis: { ping: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ prisma: dependencyMocks.prisma }));
vi.mock("../lib/redis", () => ({ default: dependencyMocks.redis }));

const app = express().use(openRouter);

describe("GET /health", () => {
  beforeEach(() => {
    dependencyMocks.prisma.$queryRaw.mockReset();
    dependencyMocks.redis.ping.mockReset();
    dependencyMocks.prisma.$queryRaw.mockResolvedValue([]);
    dependencyMocks.redis.ping.mockResolvedValue("PONG");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("pings Redis and runs a minimal query against Postgres", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(dependencyMocks.redis.ping).toHaveBeenCalledOnce();
    expect(dependencyMocks.prisma.$queryRaw).toHaveBeenCalledOnce();
    expect(dependencyMocks.prisma.$queryRaw.mock.calls[0][0]).toEqual(["SELECT 1"]);
  });

  it("returns 503 when a dependency is unavailable", async () => {
    dependencyMocks.prisma.$queryRaw.mockRejectedValue(new Error("database unavailable"));
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "unavailable" });
    expect(dependencyMocks.redis.ping).toHaveBeenCalledOnce();
    expect(errorLog).toHaveBeenCalledOnce();
  });
});
