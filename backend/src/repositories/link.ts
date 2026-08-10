import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma"; 

export class LinkRepository {
  async create(shortUrl: string, longUrl: string, userId: string) {
    return await prisma.link.create({
      data: { shortUrl, longUrl, userId },
      select: { id: true, shortUrl: true, longUrl: true },
    });
  }

  async findByShortUrl(shortUrl: string): Promise<{shortUrl: string; longUrl: string} | null> {
    return await prisma.link.findUnique({
      where: { shortUrl },
    });
  }

 // patch update link: longUrl, shortUrl
  async updateLink(id: string, data: { shortUrl?: string; longUrl?: string }): Promise<{shortUrl: string; longUrl: string} | null> {
    return await prisma.link.update({
      where: { id },
      data: data,
    });
  }

  /**
   * Atomically increments clicks and returns the link in one query,
   * instead of findUnique + update (two round-trips).
   * Returns null if the short URL doesn't exist.
   */
  async incrementClicksAndGet(shortUrl: string) {
    try {
      return await prisma.link.update({
        where: { shortUrl },
        data: { clicks: { increment: 1 } },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025" // record not found
      ) {
        return null;
      }
      throw err;
    }
  }

  isUniqueConstraintError(err: unknown): boolean {
    return (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    );
  }
}

export const linkRepository = new LinkRepository();