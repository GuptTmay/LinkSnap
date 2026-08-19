import { Router } from "express";
import { links } from "../controllers/links";
import { qrCodeController } from "../controllers/qrcode";
import { validate } from "../middlewares/requestValidate";
import { CreateLinkSchema, UpdateLinkBodySchema, UpdateLinkParamsSchema } from "../schema/link";
import { BodyValidatedRequest, ValidatedRequest } from "../types/validated-request";
import { requireAuth } from "../middlewares/requireAuth";
import type { ZodType } from "zod";
import { CreateQrCodeBodySchema, CreateQrCodeParamsSchema } from "../schema/qrcode";
const router = Router();

// (req, res) => linkController.createLink(req, res) this is done to avoid the loss of context of 'this' in the controller methods "this" in the controller methods will refer to the controller instance, not the router instance, which is what we want. If we just passed linkController.createLink directly, "this" would refer to the router instance, which would cause errors when trying to access properties of the controller instance.
router.post(
  `/`,
  requireAuth,
  validate({ body: CreateLinkSchema }),
  (req, res) => links.createLink(req as BodyValidatedRequest<typeof CreateLinkSchema>, res)
);

router.patch(
  `/:linkId`,
  requireAuth,
  validate({
    body: UpdateLinkBodySchema,
    params: UpdateLinkParamsSchema
  }),
  (req, res) =>
    links.updateLink(req as ValidatedRequest<typeof UpdateLinkBodySchema, ZodType, typeof UpdateLinkParamsSchema>, res)
);

router.post(
  `/:linkId/qrcode`,
  requireAuth,
  validate({ body: CreateQrCodeBodySchema, params: CreateQrCodeParamsSchema }),
  (req, res) => qrCodeController.createQrCode(req as ValidatedRequest<typeof CreateQrCodeBodySchema, ZodType, typeof CreateQrCodeParamsSchema>, res)
);

// get all user links
router.get(
  "/links",
  requireAuth,
  (req, res) => links.getLinks(req as ValidatedRequest, res)
);

// Get all links with qrcodes.
router.get(
  `/qrcode`,
  requireAuth,
  (req, res) => qrCodeController.getQrCodes(req as ValidatedRequest, res)
);

export default router;