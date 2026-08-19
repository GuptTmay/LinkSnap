import { prisma } from "../lib/prisma";


class QrCodeRepo {
  async create(linkId: string, customization?: object) {
    return await prisma.qrCode.create({
      data: {
        linkId,
        customization,
      },
      select: {
        id: true,
        linkId: true,
        customization: true,
        createdAt: true,
      },
    });
  }
}

export const qrCodeRepo = new QrCodeRepo();