import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { app } from "..";

const BASE = "/api/v1";

if (!process.env.TEST_JWT_TOKEN) {
  throw new Error(
    "TEST_JWT_TOKEN is not set. Add it to .env.test before running this suite."
  );
}

const AUTH_COOKIE = `token=${process.env.TEST_JWT_TOKEN}`; // <-- confirm cookie name matches your auth middleware

// Decode (not verify — we don't have the signing secret here, and don't need it)
// so the seeded DB user's id matches the id your auth middleware will extract
// from the token on every request. Previously this was a random id per test
// run, which caused FK violations (create) and empty results (queries scoped
// to the real JWT user finding nothing).
const decoded = jwt.decode(process.env.TEST_JWT_TOKEN) as { id?: string } | null;

if (!decoded?.id) {
  throw new Error(
    "Could not decode an `id` claim out of TEST_JWT_TOKEN. Check the token is valid and the claim name still matches (currently expecting `id`)."
  );
}

const testUserId = decoded.id;

describe("Links Controller HTTP API (Integration, real app + real auth)", () => {
  beforeEach(async () => {
    await prisma.linkClick.deleteMany();
    await prisma.linkTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.link.deleteMany();
    await prisma.user.deleteMany();

    // Seed the user with the EXACT id encoded in the JWT, not a random one —
    // every authenticated request in this file resolves to this id.
    await prisma.user.create({
      data: {
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        name: "Controller Test User",
        provider: "google",
        providerId: `google-id-${Date.now()}`,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Route resolution (regression guard)", () => {
    it("GET /links must hit getLinks, not be swallowed by a shortUrl catch-all", async () => {
      const response = await request(app)
        .get(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .query({ page: 1, limit: 20, sort: "desc" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("pagination");
    });

    it("GET /links/check/:shorturl must hit checkIfShortUrl, not the catch-all", async () => {
      const response = await request(app)
        .get(`${BASE}/links/check/some-code`)
        .set("Cookie", AUTH_COOKIE);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("exists");
    });
  });

  describe("POST /links", () => {
    it("should create link and return 201 with success payload", async () => {
      const response = await request(app)
        .post(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .send({
          shortUrl: "custom123",
          longUrl: "https://example.com",
          title: "My Site",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Link Created Successfully",
        data: {
          id: expect.any(String),
          shortUrl: "custom123",
          title: "My Site",
          longUrl: "https://example.com",
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
        .post(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .send({
          shortUrl: "duplicate",
          longUrl: "https://another.com",
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("SHORT_URL_ALREADY_EXISTS");
    });

    it("should generate a unique short URL when none is provided", async () => {
      const response = await request(app)
        .post(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .send({ longUrl: "https://auto-generated.com" });

      expect(response.status).toBe(201);
      expect(response.body.data.shortUrl).toEqual(expect.any(String));
      expect(response.body.data.shortUrl.length).toBeGreaterThan(0);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await request(app)
        .post(`${BASE}/links`)
        .send({ longUrl: "https://no-auth.com" });

      expect([401, 403]).toContain(response.status);
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
        .patch(`${BASE}/links/${link.id}`)
        .set("Cookie", AUTH_COOKIE)
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
        .patch(`${BASE}/links/00000000-0000-0000-0000-000000000000`)
        .set("Cookie", AUTH_COOKIE)
        .send({ shortUrl: "new-url" });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 404 when updating a link owned by another user (ownership check)", async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `owner-${Date.now()}@example.com`,
          name: "Owner",
          provider: "google",
          providerId: `owner-google-${Date.now()}`,
        },
      });

      const link = await prisma.link.create({
        data: {
          shortUrl: "not-yours",
          longUrl: "https://original.com",
          userId: otherUser.id,
        },
      });

      const response = await request(app)
        .patch(`${BASE}/links/${link.id}`)
        .set("Cookie", AUTH_COOKIE)
        .send({ shortUrl: "hijacked" });

      expect(response.status).toBe(404);
    });
  });

  // NOTE: mounted at the root path, not under /api/v1 — short links are
  // served from the bare domain (e.g. https://yourapp.com/go-link).
  describe("GET /:shorturl (public redirect, no auth, root path)", () => {
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

    it("should actually persist an analytics row on redirect, not just return 302", async () => {
      const link = await prisma.link.create({
        data: {
          shortUrl: "tracked-link",
          longUrl: "https://tracked-destination.com",
          userId: testUserId,
        },
      });

      await request(app)
        .get("/tracked-link")
        .set("User-Agent", "Mozilla/5.0")
        .set("Referer", "https://google.com");

      const clicks = await prisma.linkClick.findMany({
        where: { linkId: link.id },
      });

      expect(clicks).toHaveLength(1);
      expect(clicks[0].referrer).toBe("https://google.com");
    });

    it("should return the not-found page for an unknown short URL", async () => {
      const response = await request(app).get("/does-not-exist");
      expect(response.status).toBe(404);
    });
  });

  describe("GET /links/check/:shorturl", () => {
    it("should return exists: true if shortUrl already exists", async () => {
      await prisma.link.create({
        data: {
          shortUrl: "taken-url",
          longUrl: "https://example.com",
          userId: testUserId,
        },
      });

      const response = await request(app)
        .get(`${BASE}/links/check/taken-url`)
        .set("Cookie", AUTH_COOKIE);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Short URL already exists",
        data: { exists: true },
      });
    });

    it("should return exists: false if shortUrl is available", async () => {
      const response = await request(app)
        .get(`${BASE}/links/check/available-url`)
        .set("Cookie", AUTH_COOKIE);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Short URL is available!",
        data: { exists: false },
      });
    });
  });

  describe("GET /links", () => {
    it("should return paginated links belonging to the user", async () => {
      await prisma.link.createMany({
        data: [
          { shortUrl: "url-1", longUrl: "https://a.com", userId: testUserId },
          { shortUrl: "url-2", longUrl: "https://b.com", userId: testUserId },
          { shortUrl: "url-3", longUrl: "https://c.com", userId: testUserId },
        ],
      });

      const response = await request(app)
        .get(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .query({ page: 1, limit: 2, sort: "desc" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.links).toHaveLength(2);
      expect(response.body.data.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it("should reject a non-numeric limit with a 400, not crash Prisma with a 500", async () => {
      const response = await request(app)
        .get(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .query({ page: 1, limit: "not-a-number", sort: "desc" });

      expect(response.status).toBe(400);
    });

    it("should return links sorted by creation date ascending", async () => {
      await prisma.link.create({
        data: { shortUrl: "old-link", longUrl: "https://old.com", userId: testUserId },
      });
      await prisma.link.create({
        data: { shortUrl: "new-link", longUrl: "https://new.com", userId: testUserId },
      });

      const response = await request(app)
        .get(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .query({ page: 1, limit: 20, sort: "asc" });

      expect(response.status).toBe(200);
      const result = response.body.data.links;
      expect(result[0].shortUrl).toBe("old-link");
      expect(result[1].shortUrl).toBe("new-link");
    });

    it("should return only links with QR codes", async () => {
      const linkWithQr = await prisma.link.create({
        data: {
          shortUrl: "with-qr",
          longUrl: "https://withqr.com",
          userId: testUserId,
          qrCode: { create: { customization: { size: 300 } } },
        },
      });

      await prisma.link.create({
        data: { shortUrl: "without-qr", longUrl: "https://withoutqr.com", userId: testUserId },
      });

      const response = await request(app)
        .get(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .query({ page: 1, limit: 20, sort: "desc", qrCode: true });

      expect(response.status).toBe(200);
      const result = response.body.data.links;
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(linkWithQr.id);
      expect(result[0].qrCode).not.toBeNull();
    });

    it("should return only links without QR codes", async () => {
      await prisma.link.create({
        data: {
          shortUrl: "with-qr",
          longUrl: "https://withqr.com",
          userId: testUserId,
          qrCode: { create: {} },
        },
      });

      await prisma.link.create({
        data: { shortUrl: "without-qr", longUrl: "https://withoutqr.com", userId: testUserId },
      });

      const response = await request(app)
        .get(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .query({ page: 1, limit: 20, sort: "desc", qrCode: false });

      expect(response.status).toBe(200);
      const result = response.body.data.links;
      // console.log(result);
      expect(result).toHaveLength(1);
      expect(result[0].shortUrl).toBe("without-qr");
      expect(result[0].qrCode).toBeNull();
    });

    it("should not return links belonging to another user", async () => {
      const anotherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          name: "Other User",
          provider: "google",
          providerId: `other-google-${Date.now()}`,
        },
      });

      await prisma.link.create({
        data: { shortUrl: "user-link", longUrl: "https://user.com", userId: testUserId },
      });
      await prisma.link.create({
        data: { shortUrl: "other-link", longUrl: "https://other.com", userId: anotherUser.id },
      });

      const response = await request(app)
        .get(`${BASE}/links`)
        .set("Cookie", AUTH_COOKIE)
        .query({ page: 1, limit: 20, sort: "desc" });

      expect(response.status).toBe(200);
      const result = response.body.data.links;
      expect(result).toHaveLength(1);
      expect(result[0].shortUrl).toBe("user-link");
    });

    it("should reject unauthenticated requests", async () => {
      const response = await request(app).get(`${BASE}/links`);
      expect([401, 403]).toContain(response.status);
    });
  });


  describe("DELETE /links/:linkId", () => {
    it("should delete a link owned by the requesting user and return 200", async () => {
      const link = await prisma.link.create({
        data: {
          shortUrl: "delete-me",
          longUrl: "https://example.com",
          userId: testUserId,
        },
      });

      const response = await request(app)
        .delete(`${BASE}/links/${link.id}`)
        .set("Cookie", AUTH_COOKIE);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const stillExists = await prisma.link.findUnique({ where: { id: link.id } });
      expect(stillExists).toBeNull();
    });

    it("should reject unauthenticated requests", async () => {
      const link = await prisma.link.create({
        data: {
          shortUrl: "no-auth-delete",
          longUrl: "https://example.com",
          userId: testUserId,
        },
      });

      const response = await request(app).delete(`${BASE}/links/${link.id}`);

      expect([401, 403]).toContain(response.status);

      // Confirm nothing was actually deleted despite the missing auth.
      const stillExists = await prisma.link.findUnique({ where: { id: link.id } });
      expect(stillExists).not.toBeNull();
    });

    it("should return 404, not 500, when the link does not exist", async () => {
      const response = await request(app)
        .delete(`${BASE}/links/00000000-0000-0000-0000-000000000000`)
        .set("Cookie", AUTH_COOKIE);

      // Currently fails: the controller has no isRecordNotFoundError check
      // (unlike updateLink), so a missing link falls through to the generic
      // catch block and returns 500 instead of 404.
      expect(response.status).toBe(404);
    });

    it("should NOT allow a user to delete a link they don't own", async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `owner-${Date.now()}@example.com`,
          name: "Owner",
          provider: "google",
          providerId: `owner-google-${Date.now()}`,
        },
      });

      const link = await prisma.link.create({
        data: {
          shortUrl: "not-yours-delete",
          longUrl: "https://example.com",
          userId: otherUser.id,
        },
      });

      const response = await request(app)
        .delete(`${BASE}/links/${link.id}`)
        .set("Cookie", AUTH_COOKIE);

      // Currently fails: linksRepository.delete(linkId) is not scoped by
      // userId, so an authenticated-but-non-owning user can delete any link
      // by id. This should be 403 or 404, and the row should survive.
      expect([403, 404]).toContain(response.status);

      const stillExists = await prisma.link.findUnique({ where: { id: link.id } });
      expect(stillExists).not.toBeNull();
    });

    it("should not leak raw error internals in the response body on failure", async () => {
      const response = await request(app)
        .delete(`${BASE}/links/00000000-0000-0000-0000-000000000000`)
        .set("Cookie", AUTH_COOKIE);

      // failure(..., err) currently passes the raw Prisma/Error object through.
      // At minimum this shouldn't contain a stack trace or internal file paths.
      const bodyStr = JSON.stringify(response.body);
      expect(bodyStr).not.toMatch(/at .*\.ts:\d+:\d+/); // stack trace line pattern
    });
  });
});