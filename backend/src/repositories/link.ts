import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export class LinkRepository {
  async create(shortUrl: string, longUrl: string, userId: string) {
    return await prisma.link.create({
      data: { shortUrl, longUrl, userId },
      select: { id: true, shortUrl: true, longUrl: true },
    });
  }

  async findByShortUrl(shortUrl: string) {
    return await prisma.link.findUniqueOrThrow({
      where: { shortUrl },
    });
  }

  // patch update link: longUrl, shortUrl
  async updateLink(userId: string, linkId: string, data: { shortUrl?: string; longUrl?: string }): Promise<{ shortUrl: string; longUrl: string } | null> {
    return await prisma.link.update({
      where: { id: linkId, userId: userId },
      data: data,
    });
  }

  // linkRepository
  async findByIdAndUserId(linkId: string, userId: string) {
    return await prisma.link.findFirst({
      where: {
        id: linkId,
        userId,
      },
      select: {
        id: true,
      },
    });
  }
}

export const linkRepository = new LinkRepository();