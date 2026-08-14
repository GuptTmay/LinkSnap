import { Response } from "express";

import { failure, success } from "../utils/status";
import { ValidatedRequest } from "../types/validated-request";
import { CreateQrCodeBodySchema, CreateQrCodeParamsSchema } from "../schema/qrcode";
import { ZodType } from "zod";
import { linkRepository } from "../repositories/link";
import { qrCodeRepo } from "../repositories/qrcode";
import { isUniqueConstraintError } from "../utils/prisma";

export default class QrCodeController {
  // Controller
  async createQrCode(
    req: ValidatedRequest<typeof CreateQrCodeBodySchema, ZodType, typeof CreateQrCodeParamsSchema>,
    res: Response
  ) {
    const { linkId } = req.validated.params;
    const { customization } = req.validated.body;
    const userId = req.user?.id;

    try {
      // Check whether link exists and belongs to user
      const link = await linkRepository.findByIdAndUserId(linkId, userId);

      if (!link) {
        return res
          .status(404)
          .json(failure("Link not found", "LINK_NOT_FOUND"));
      }

      const qrCode = await qrCodeRepo.create(
        linkId,
        customization
      );

      return res.status(201).json(qrCode);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        return res
          .status(409)
          .json(failure(
            "QR code already exists for this link",
            "QR_CODE_ALREADY_EXISTS"
          ));
      }

      return res
        .status(500)
        .json(failure("Failed to create QR code", "INTERNAL_ERROR"));
    }
  }
}

export const qrCodeController = new QrCodeController();