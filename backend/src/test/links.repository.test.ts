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
  });

  describe("findByUserId", () => {
    it("should return all links belonging to a user", async () => {
      await prisma.link.createMany({
        data: [
          { shortUrl: "url-1", longUrl: "https://a.com", userId: testUserId },
          { shortUrl: "url-2", longUrl: "https://b.com", userId: testUserId },
        ],
      });

      const links = await repository.findByUserId(testUserId);
      expect(links).toHaveLength(2);
    });
  });
});