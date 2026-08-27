import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import { links } from "../controllers/links";
import { prisma } from "../lib/prisma";

const app = express();
app.use(express.json());

let testUserId: string;

// Middleware to inject user dynamically
app.use((req: any, res, next) => {
  req.user = { id: testUserId };
  next();
});

// Explicit route definitions wrapping req.validated
app.post("/links", (req: any, res) => {
  req.validated = { body: req.body, params: req.params, query: req.query };
  return links.createLink(req, res);
});

app.patch("/links/:linkId", (req: any, res) => {
  req.validated = { body: req.body, params: req.params, query: req.query };
  return links.updateLink(req, res);
});

app.get("/:shorturl", (req: any, res) => {
  req.validated = { body: req.body, params: req.params, query: req.query };
  return links.redirectToLongUrl(req, res);
});

app.get("/links/check/:shorturl", (req: any, res) => {
  req.user = { id: testUserId };
  req.validated = { body: req.body, params: req.params, query: req.query };
  return links.checkIfShortUrl(req, res);
});

describe("Links Controller HTTP API (Integration)", () => {
  beforeEach(async () => {
    await prisma.linkClick.deleteMany();
    await prisma.linkTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.link.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Controller Test User",
        provider: "google",
        providerId: `google-id-${Date.now()}`,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /links", () => {
    it("should create link and return 201 with success payload", async () => {
      const response = await request(app)
        .post("/links")
        .send({
          shortUrl: "custom123",
          longUrl: "https://example.com",
          title: "My Site",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Link created",
        data: {
          id: expect.any(String),
          shortUrl: "custom123",
        },
      });
    });

    it("should return 409 conflict when shortUrl is already taken", async () => {
      await prisma.link.create({
        data: {
          shortUrl: "duplicate",
          longUrl: "https://initial.com",
          userId: testUserId,
        },
      });

      const response = await request(app)
        .post("/links")
        .send({
          shortUrl: "duplicate",
          longUrl: "https://another.com",
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("SHORT_URL_ALREADY_EXISTS");
    });
  });

  describe("PATCH /links/:linkId", () => {
    it("should update an existing link", async () => {
      const link = await prisma.link.create({
        data: {
          shortUrl: "original-url",
          longUrl: "https://original.com",
          userId: testUserId,
        },
      });

      const response = await request(app)
        .patch(`/links/${link.id}`)
        .send({
          shortUrl: "modified-url",
          longUrl: "https://modified.com",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shortUrl).toBe("modified-url");
    });

    it("should return 404 if link does not exist", async () => {
      const response = await request(app)
        .patch("/links/00000000-0000-0000-0000-000000000000")
        .send({ shortUrl: "new-url" });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /:shorturl", () => {
    it("should log analytics and perform a 302 redirect", async () => {
      await prisma.link.create({
        data: {
          shortUrl: "go-link",
          longUrl: "https://target-destination.com",
          userId: testUserId,
        },
      });

      const response = await request(app)
        .get("/go-link")
        .set("User-Agent", "Mozilla/5.0")
        .set("Referer", "https://google.com");

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("https://target-destination.com");
    });
  });

  describe("GET /links/check/:shorturl", () => {
    it("should return exists: true if shortUrl already exists", async () => {
      // Seed existing link in DB
      await prisma.link.create({
        data: {
          shortUrl: "taken-url",
          longUrl: "https://example.com",
          userId: testUserId,
        },
      });

      const response = await request(app).get("/links/check/taken-url");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Short URL already exists",
        data: { exists: true },
      });
    });

    it("should return exists: false if shortUrl is available", async () => {
      const response = await request(app).get("/links/check/available-url");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Short URL is available",
        data: { exists: false },
      });
    });
  });
});