import { Response } from "express";
import { nanoid } from "nanoid";
import { linkRepository } from "../repositories/link";
import { LINK_ID_LENGTH, MAX_RETRIES } from "../config";
import { CreateLinkSchema, RedirectLinkSchema, UpdateLinkBodySchema, UpdateLinkParamsSchema } from "../schema/link";
import { BodyValidatedRequest, ParamsValidatedRequest, ValidatedRequest } from "../types/validated-request";
import { failure, success } from "../utils/status";
import { ZodType } from "zod";
import { isUniqueConstraintError } from "../utils/prisma";


export class LinkController {
  async createLink(req: BodyValidatedRequest<typeof CreateLinkSchema>, res: Response) {
    const { longUrl } = req.validated.body;
    const userId = req.user?.id; // Assuming the user ID is stored in req.user after authentication 

    // NOTE: no format/protocol validation here yet — worth adding
    // (e.g. reject anything that isn't http/https) before this goes to prod.

    for (let i = 0; i < MAX_RETRIES; i++) {
      const shortUrl = nanoid(LINK_ID_LENGTH);

      try {
        const data = await linkRepository.create(shortUrl, longUrl, userId);
        return res.status(201).json({ shortUrl });
      } catch (err) {
        if (isUniqueConstraintError(err)) {
          // Collision, try another nanoid.
          continue;
        }

        return res
          .status(500)
          .json(failure("Failed to generate a unique short URL", "INTERNAL_ERROR"));

      }
    }

    return res
      .status(500)
      .json(failure("Failed to generate a unique short URL", "INTERNAL_ERROR"));
  }

  async updateLink(req: ValidatedRequest<typeof UpdateLinkBodySchema, ZodType, typeof UpdateLinkParamsSchema>, res: Response) {
    const data = req.validated.body;
    const linkId = req.validated.params.linkId;
    const userId = req.user?.id;

    try {
      const updatedLink = await linkRepository.updateLink(userId, linkId, data);

      if (!updatedLink) {
        return res.status(404).json(failure("Link not found", "NOT_FOUND"));
      }

      return res.status(200).json(success("Link updated successfully", updatedLink));
    } catch (err) {
      console.error(err);
      return res.status(500).json(failure("Link Updation failed", "INTERNAL_ERROR"));
    }

  }

  async redirectToLongUrl(req: ParamsValidatedRequest<typeof RedirectLinkSchema>, res: Response) {
    const { shorturl } = req.validated.params;
    try {
      const link = await linkRepository.incrementClicksAndGet(shorturl as string);

      if (!link) {
        return res.status(404).json(failure("Page not found, You may have mistypes the address", "NOT_FOUND"));
      }

      return res.redirect(302, link.longUrl);
    } catch (err) {
      console.error(err);
      return res.status(500).json(failure("Internal server error", "INTERNAL_ERROR", err));
    }
  }
}

// Export a single instance of the LinkController class
// This ensures that the same instance is used across the application, maintaining state if needed.
// It also simplifies the import and usage of the controller in other parts of the application.
export const link = new LinkController();