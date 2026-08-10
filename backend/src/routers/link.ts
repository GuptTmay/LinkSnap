import { Router } from "express";
import { link } from "../controllers/link";
import { validate } from "../middlewares/requestValidate";
import { CreateLinkSchema, UpdateLinkBodySchema, UpdateLinkParamsSchema } from "../schema/link";
import { BodyValidatedRequest, ValidatedRequest } from "../types/validated-request";
import { requireAuth } from "../middlewares/requireAuth";
import type { ZodType } from "zod";
const router = Router();

// (req, res) => linkController.createLink(req, res) this is done to avoid the loss of context of 'this' in the controller methods "this" in the controller methods will refer to the controller instance, not the router instance, which is what we want. If we just passed linkController.createLink directly, "this" would refer to the router instance, which would cause errors when trying to access properties of the controller instance.
router.post(
  `/`, 
  requireAuth, 
  validate({ body: CreateLinkSchema }), 
  (req, res) => link.createLink(req as BodyValidatedRequest<typeof CreateLinkSchema>, res)
);

router.patch(
  `/:linkId`, 
  requireAuth, 
  validate({ 
    body: UpdateLinkBodySchema, 
    params: UpdateLinkParamsSchema 
  }), 
  (req, res) => 
    link.updateLink(req as ValidatedRequest<typeof UpdateLinkBodySchema, ZodType, typeof UpdateLinkParamsSchema>, res)
);

export default router;