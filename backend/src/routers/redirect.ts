import { Router } from "express";
import { links } from "../controllers/links";
import { validate } from "../middlewares/requestValidate";
import {RedirectLinkSchema } from "../schema/link";
import { ParamsValidatedRequest } from "../types/validated-request";

const router = Router();

router.get("/:shorturl", validate({ params: RedirectLinkSchema }), (req, res) => links.redirectToLongUrl(req as ParamsValidatedRequest<typeof RedirectLinkSchema>, res));


export default router;