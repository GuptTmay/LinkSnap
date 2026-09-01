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

  // patch update link
  async updateLink(
    userId: string,
    linkId: string,
    data: {
      shortUrl?: string;
      longUrl?: string;
      title?: string;
      tags?: string[];
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      const { tags, ...linkData } = data;

      // Update link fields
      const link = await tx.link.update({
        where: {
          id: linkId,
          userId,
        },
        data: linkData,
        select: {
          id: true,
          shortUrl: true,
          longUrl: true,
          title: true,
        },
      });

      // Update tags only if tags were provided
      if (tags !== undefined) {
        const uniqueTags = [...new Set(tags)];

        // Create tags that don't already exist
        await tx.tag.createMany({
          data: uniqueTags.map((name) => ({
            userId,
            name,
          })),
          skipDuplicates: true,
        });

        // Find their IDs
        const tagRows = await tx.tag.findMany({
          where: {
            userId,
            name: {
              in: uniqueTags,
            },
          },
          select: {
            id: true,
          },
        });

        // Remove existing tag relationships
        await tx.linkTag.deleteMany({
          where: {
            linkId,
          },
        });

        // Create new relationships
        await tx.linkTag.createMany({
          data: tagRows.map((tag) => ({
            linkId,
            tagId: tag.id,
          })),
          skipDuplicates: true,
        });
      }

      return link;
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

  // get single Link by userId and shorturl
  async findByUserIdAndShortUrl(userId: string, shortUrl: string) {
    const link = await prisma.link.findUniqueOrThrow({
      where: { shortUrl, userId },
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
      }
    });

    return {
      ...link,
      tags: link.tags.map(({ tag }) => tag),
    };
  }
}

export const linksRepository = new LinksRepository();