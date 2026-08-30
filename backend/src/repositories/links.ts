import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export class LinksRepository {
  async create(
    shortUrl: string,
    longUrl: string,
    userId: string,
    title?: string,
    tags?: string[],
    customization?: unknown 
  ) {
    /*
      Using Transaction
      Steps:  
        LinkId = Create Link 
        create qrcode if customization exist
        iterate over tags: 
          Create Or Find tags   
          Create Or Find LinkTag 
    */
    return prisma.$transaction(async (tx) => {
      // create link
      const link = await tx.link.create({
        data: {
          shortUrl,
          longUrl,
          userId,
          title,
        },
        select: {
          id: true,
          shortUrl: true,
          longUrl: true,
          title: true,
        },
      });

      if (customization) {
        // Create QR code for the link
        await tx.qrCode.create({
          data: {
            linkId: link.id,
            customization,
          },
          select: {
            id: true,
            customization: true,
            createdAt: true,
          },
        });
      }

      if (tags && tags.length > 0) {
        for (const tag of tags) {
          // Find or create user's tag
          const currTag = await tx.tag.upsert({
            where: {
              userId_name: { userId, name: tag },
            },
            update: {},
            create: {
              userId,
              name: tag,
            },
          });


          // Attach tag to link
          await tx.linkTag.upsert({
            where: {
              linkId_tagId: {
                linkId: link.id,
                tagId: currTag.id,
              },
            },
            update: {},
            create: {
              linkId: link.id,
              tagId: currTag.id,
            },
          });

        }
      }
      return link;
    });
  }

  // get single Link  shorturl
  async findByShortUrl(shortUrl: string) {
    return await prisma.link.findUniqueOrThrow({
      where: { shortUrl },
    });
  }

  async shortUrlExists(shortUrl: string): Promise<boolean> {
    const link = await prisma.link.findUnique({
      where: { shortUrl },
      select: { id: true },
    });

    return link !== null;
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