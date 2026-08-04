import { Router } from "express";
import { link } from "../controllers/link";
import { API_PREFIX } from "../config";
import { validate } from "../middlewares/requestValidate";
import { CreateLinkSchema } from "../schema/link";
import { BodyValidatedRequest } from "../types/validated-request";

const router = Router();

// (req, res) => linkController.createLink(req, res) this is done to avoid the loss of context of 'this' in the controller methods "this" in the controller methods will refer to the controller instance, not the router instance, which is what we want. If we just passed linkController.createLink directly, "this" would refer to the router instance, which would cause errors when trying to access properties of the controller instance.
router.post(`/create`, validate({ body: CreateLinkSchema }), (req, res) => link.createLink(req as BodyValidatedRequest<typeof CreateLinkSchema>, res));

export default router;