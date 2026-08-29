import { prisma } from "../lib/prisma";

export class TagsRepository {
  async findByUserId(userId: string) {
    return prisma.tag.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });
  }

  async findByName(userId: string, name: string) {
    return prisma.tag.findUnique({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
    });
  }

  async create(userId: string, name: string) {
    return prisma.tag.create({
      data: {
        userId,
        name,
      },
    });
  }

  async addTagToLink(
    userId: string,
    linkId: string,
    name: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Make sure the link belongs to this user
      const link = await tx.link.findFirst({
        where: {
          id: linkId,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!link) {
        return null;
      }

      // Find or create user's tag
      const tag = await tx.tag.upsert({
        where: {
          userId_name: { userId, name },
        },
        update: {},
        create: {
          userId,
          name,
        },
      });


      // Attach tag to link
      await tx.linkTag.upsert({
        where: {
          linkId_tagId: {
            linkId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          linkId,
          tagId: tag.id,
        },
      });

      return tag;
    });
  }

  async removeTagFromLink(
    userId: string,
    linkId: string,
    tagId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Verify link belongs to user
      const link = await tx.link.findFirst({
        where: {
          id: linkId,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!link) {
        return null;
      }

      await tx.linkTag.delete({
        where: {
          linkId_tagId: {
            linkId,
            tagId,
          },
        },
      });

      const remainingLinks = await tx.linkTag.count({
        where: {
          tagId,
        },
      });

      if (remainingLinks === 0) {
        await tx.tag.delete({
          where: {
            id: tagId,
          },
        });
      }

      return true;
    });
  }
}

export const tagsRepository = new TagsRepository();