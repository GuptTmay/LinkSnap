import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { LinksRepository } from "../repositories/links";
import { prisma } from "../lib/prisma";

describe("LinksRepository (Integration)", () => {
  const repository = new LinksRepository();
  let testUserId: string;

  beforeEach(async () => {
    await prisma.linkClick.deleteMany();
    await prisma.linkTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.link.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        provider: "google",
        providerId: `google-id-${Date.now()}`,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("create", () => {
    it("should persist link, tags, and link-tag relations in PostgreSQL", async () => {
      const result = await repository.create(
        "my-short-url",
        "https://example.com",
        testUserId,
        "Test Title",
        ["nodejs", "testing"]
      );

      expect(result).toHaveProperty("id");
      expect(result.shortUrl).toBe("my-short-url");

      const dbLink = await prisma.link.findUnique({
        where: { id: result.id },
        include: { tags: { include: { tag: true } } },
      });

      expect(dbLink).not.toBeNull();
      expect(dbLink?.tags).toHaveLength(2);
      const tagNames = dbLink?.tags.map((t) => t.tag.name);
      expect(tagNames).toContain("nodejs");
      expect(tagNames).toContain("testing");
    });

    it("should throw a unique-constraint error on duplicate shortUrl", async () => {
      await repository.create("dupe-url", "https://a.com", testUserId);

      await expect(
        repository.create("dupe-url", "https://b.com", testUserId)
      ).rejects.toThrow();
    });
  });

  describe("findByShortUrl", () => {
    it("should fetch a created link by shortUrl", async () => {
      await prisma.link.create({
        data: {
          shortUrl: "find-me",
          longUrl: "https://google.com",
          userId: testUserId,
        },
      });

      const link = await repository.findByShortUrl("find-me");
      expect(link.longUrl).toBe("https://google.com");
    });

    it("should throw if shortUrl does not exist", async () => {
      await expect(repository.findByShortUrl("non-existent")).rejects.toThrow();
    });
  });

  describe("shortUrlExists", () => {
    it("should return true if shortUrl exists", async () => {
      await prisma.link.create({
        data: {
          shortUrl: "find-me",
          longUrl: "https://google.com",
          userId: testUserId,
        },
      });

      const exists = await repository.shortUrlExists("find-me");

      expect(exists).toBe(true);
    });

    it("should return false if shortUrl does not exist", async () => {
      const exists = await repository.shortUrlExists("non-existent");

      expect(exists).toBe(false);
    });
  });

  describe("updateLink", () => {
    it("should update shortUrl and longUrl in the DB", async () => {
      const created = await prisma.link.create({
        data: {
          shortUrl: "old-short",
          longUrl: "https://old.com",
          userId: testUserId,
        },
      });

      const updated = await repository.updateLink(testUserId, created.id, {
        shortUrl: "new-short",
        longUrl: "https://new.com",
      });

      expect(updated?.shortUrl).toBe("new-short");
      expect(updated?.longUrl).toBe("https://new.com");
    });

    it("should throw / not update a link owned by a different user", async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `owner-${Date.now()}@example.com`,
          name: "Owner",
          provider: "google",
          providerId: `owner-google-${Date.now()}`,
        },
      });

      const created = await prisma.link.create({
        data: {
          shortUrl: "not-yours",
          longUrl: "https://original.com",
          userId: otherUser.id,
        },
      });

      // testUserId does not own this link — this must not silently succeed.
      await expect(
        repository.updateLink(testUserId, created.id, { shortUrl: "hijacked" })
      ).rejects.toThrow();
    });
  });

  describe("getLinks", () => {
    it("should return paginated links belonging to the user", async () => {
      await prisma.link.createMany({
        data: [
          { shortUrl: "url-1", longUrl: "https://a.com", userId: testUserId },
          { shortUrl: "url-2", longUrl: "https://b.com", userId: testUserId },
          { shortUrl: "url-3", longUrl: "https://c.com", userId: testUserId },
        ],
      });

      const result = await repository.findByUserId(testUserId, 1, 2, "desc");

      expect(result.links).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it("should return links sorted by creation date ascending", async () => {
      await prisma.link.createMany({
        data: [
          { shortUrl: "old-link", longUrl: "https://old.com", userId: testUserId },
          { shortUrl: "new-link", longUrl: "https://new.com", userId: testUserId },
        ],
      });

      const result = await repository.findByUserId(testUserId, 1, 20, "asc");

      expect(result.links[0].shortUrl).toBe("old-link");
      expect(result.links[1].shortUrl).toBe("new-link");
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

      const result = await repository.findByUserId(testUserId, 1, 20, "desc", true);

      expect(result.links).toHaveLength(1);
      expect(result.links[0].id).toBe(linkWithQr.id);
      expect(result.links[0].qrCode).not.toBeNull();
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

      const result = await repository.findByUserId(testUserId, 1, 20, "desc", false);

      expect(result.links).toHaveLength(1);
      expect(result.links[0].shortUrl).toBe("without-qr");
      expect(result.links[0].qrCode).toBeNull();
    });

    it("should not return links belonging to another user", async () => {
      // FIX: was a fake string id ("another-user-id") with no matching row —
      // Link.userId has an FK constraint to User.id, so that create() threw
      // a PrismaClientKnownRequestError before the assertion ever ran.
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

      const result = await repository.findByUserId(testUserId, 1, 20, "desc");

      expect(result.links).toHaveLength(1);
      expect(result.links[0].shortUrl).toBe("user-link");
    });

    it("should return an empty result, not throw, for a user with no links", async () => {
      const result = await repository.findByUserId(testUserId, 1, 20, "desc");

      expect(result.links).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });
});