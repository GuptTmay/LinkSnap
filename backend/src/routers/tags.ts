import { Router } from "express";
import {
  CreateTagSchema,
  LinkTagParamsSchema,
  DeleteLinkTagParamsSchema,
} from "../schema/tags";
import { requireAuth } from "../middlewares/requireAuth";
import { tagsController } from "../controllers/tags";
import { ValidatedRequest } from "../types/validated-request";
import { validate } from "../middlewares/requestValidate";


const router = Router();
// Get all tags belonging to the authenticated user
router.get(
  "/tags",
  requireAuth,
  (req, res) => tagsController.getTags(req as ValidatedRequest, res)
);

// Add tag to a link
router.put(
  "/:linkId/tags",
  requireAuth,
  validate({
    body: CreateTagSchema,
    params: LinkTagParamsSchema,
  }),
  (req, res) =>
    tagsController.addTagToLink(
      req as any,
      res
    )
);

// Remove tag from a link
router.delete(
  "/:linkId/tags/:tagId",
  requireAuth,
  validate({
    params: DeleteLinkTagParamsSchema,
  }),
  (req, res) =>
    tagsController.removeTagFromLink(
      req as any,
      res
    )
);


export default router;