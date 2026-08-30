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
    return await prisma.$transaction(async (tx) => {
      // Create link
      const link = await tx.link.create({
        data: {
          shortUrl,
          longUrl,
          userId,
          title
        },
        select: {
          id: true,
          longUrl: true,
          shortUrl: true,
          title: true
        }
      });

      // if customization create qrcode with linkid.
      if (customization) {
        await tx.qrCode.create({
          data: { linkId: link.id, customization }
        });
      }

      if (tags && tags.length > 0) {
        // dedup tags. 
        const uniqueTags = [...new Set(tags)];

        // add tags to tags tables
        await tx.tag.createMany({
          data: uniqueTags.map((name) => ({ userId, name })),
          skipDuplicates: true
        })

        const tagRows = await tx.tag.findMany({
          where: { userId, name: { in: uniqueTags } },
          select: { id: true }
        });

        // add linkTags for connections
        await tx.linkTag.createMany({
          data: tagRows.map((tag) => ({ tagId: tag.id, linkId: link.id })),
          skipDuplicates: true
        });
      }
      return link;
    })
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

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
    sort: "asc" | "desc",
    qrCode?: boolean
  ) {
    const skip = (page - 1) * limit;
    const where = {
      userId,

      ...(qrCode !== undefined && {
        qrCode: qrCode
          ? { isNot: null }
          : { is: null },
      }),
    };

    const [links, total] = await prisma.$transaction([
      prisma.link.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          createdAt: sort,
        },

        select: {
          id: true,
          shortUrl: true,
          longUrl: true,
          title: true,
          createdAt: true,
          updatedAt: true,

          qrCode: {
            select: {
              id: true,
              customization: true,
              createdAt: true,
            },
          },

          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      }),

      prisma.link.count({
        where,
      }),
    ]);

    return {
      links: links.map((link) => ({
        ...link,
        tags: link.tags.map(({ tag }) => tag),
      })),

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
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

  async delete(userId: string, linkId: string) {
    return prisma.link.delete({
      where: { userId, id: linkId },
      select: {
        id: true
      }
    })
  }
}

export const linksRepository = new LinksRepository();