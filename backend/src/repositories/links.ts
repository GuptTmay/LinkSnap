import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export class LinksRepository {
  async create(shortUrl: string, longUrl: string, userId: string) {
    return await prisma.link.create({
      data: { shortUrl, longUrl, userId },
      select: { id: true, shortUrl: true, longUrl: true },
    });
  }

  // get single Link b shorturl
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

  // get single link by LinkId and UserId
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

  // Get all user links 
  async findByUserId(userId: string) {
    return await prisma.link.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        shortUrl: true,
        longUrl: true,
        createdAt: true,
      },
    });
  }

  async findLinksWithQrCodes(userId: string) {
    return prisma.link.findMany({
      where: {
        userId,
        qrCode: {
          isNot: null,
        },
      },
      select: {
        id: true,
        shortUrl: true,
        longUrl: true,
        createdAt: true,
        qrCode: {
          select: {
            id: true,
            customization: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const linksRepository = new LinksRepository();