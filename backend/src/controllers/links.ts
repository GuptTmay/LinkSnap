import { UAParser } from 'ua-parser-js';
import { Response } from "express";
import { nanoid } from "nanoid";
import { ZodType } from "zod";

import { linksRepository } from "../repositories/links";
import { LINK, MAX_RETRIES } from "../config";
import { CheckIfShortUrlExistSchema, CreateLinkSchema, DeleteLinkParamsSchema, FindByUserIdAndShortUrlSchema, GetLinksQuerySchema, RedirectLinkSchema, UpdateLinkBodySchema, UpdateLinkParamsSchema } from "../schema/link";
import { BodyValidatedRequest, ParamsValidatedRequest, QueryValidatedRequest, ValidatedRequest } from "../types/validated-request";
import { failure, success } from "../utils/status";
import { isRecordNotFoundError, isUniqueConstraintError } from "../utils/prisma";
import { analyticsRepo } from '../repositories/analytics';
import { getCountryFromIp } from '../services/geolocation.service';
import { sendNotFoundPage } from '../utils/errorView';


export class LinksController {
  async createLink(
    req: BodyValidatedRequest<typeof CreateLinkSchema>,
    res: Response
  ) {
    const {
      shortUrl: customShortUrl,
      longUrl,
      title,
      tags,
      customization
    } = req.validated.body;

    const userId = req.user!.id;

    try {
      if (customShortUrl) {
        const link = await linksRepository.create(
          customShortUrl,
          longUrl,
          userId,
          title,
          tags,
          customization
        );

        return res.status(201).json(success("Link Created Successfully", link));
      }

      for (let i = 0; i < MAX_RETRIES; i++) {
        const shortUrl = nanoid(LINK.RANDOM_ID_LENGTH);

        try {
          const link = await linksRepository.create(
            shortUrl,
            longUrl,
            userId,
            title,
            tags,
            customization
          );

          return res.status(201).json(success("Link created", link));
        } catch (err) {
          if (isUniqueConstraintError(err)) {
            continue;
          }
          throw err;
        }
      }
      return res.status(500).json(
        failure("Failed to generate a unique short URL", "INTERNAL_ERROR")
      );
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        return res.status(409).json(
          failure("This short URL is already in use", "SHORT_URL_ALREADY_EXISTS")
        );
      }

      return res.status(500).json(
        failure("Failed to create link", "INTERNAL_ERROR")
      );
    }
  }

  async updateLink(req: ValidatedRequest<typeof UpdateLinkBodySchema, ZodType, typeof UpdateLinkParamsSchema>, res: Response) {
    const data = req.validated.body;
    const linkId = req.validated.params.linkId;
    const userId = req.user?.id;

    try {
      const updatedLink = await linksRepository.updateLink(userId, linkId, data);

      return res.status(200).json(success("Link updated successfully", updatedLink));
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        return res.status(404).json(failure("Link not found", "NOT_FOUND"));
      }
      console.error(err);
      return res.status(500).json(failure("Link Updation failed", "INTERNAL_ERROR"));
    }

  }

  async redirectToLongUrl(req: ParamsValidatedRequest<typeof RedirectLinkSchema>, res: Response) {
    const { shorturl } = req.validated.params;
    try {
      const link = await linksRepository.findByShortUrl(shorturl);

      const userAgent = req.headers["user-agent"];
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser().name ?? null;
      const device = parser.getDevice().type ?? "desktop";
      const os = parser.getOS().name ?? null;
      let country = null;

      if (req.ip) country = await getCountryFromIp(req.ip);

      await analyticsRepo.create({
        linkId: link.id,
        ipAddress: req.ip,
        userAgent,
        referrer: req.headers.referer,
        os,
        country,
        browser,
        device,
      });

      return res.redirect(302, link.longUrl);
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        return sendNotFoundPage(res);
        // return res.status(404).json(failure("Page not found, You’ve got the wrong address. \n You may have mis-typed the address", "NOT_FOUND"));
      }
      console.error(err);
      return res.status(500).json(failure("Internal server error", "INTERNAL_ERROR", err));
    }
  }

  async checkIfShortUrl(
    req: ParamsValidatedRequest<typeof CheckIfShortUrlExistSchema>,
    res: Response
  ) {
    const { shorturl } = req.validated.params;

    try {
      const exists = await linksRepository.shortUrlExists(shorturl);

      return res.status(200).json(
        success(
          exists
            ? "Short URL already exists"
            : "Short URL is available!",
          { exists }
        )
      );
    } catch (err) {
      console.error("Error checking short URL:", err);

      return res.status(500).json(
        failure("Internal server error", "INTERNAL_ERROR")
      );
    }
  }

  async getLinks(
    req: QueryValidatedRequest<typeof GetLinksQuerySchema>,
    res: Response
  ) {
    try {
      const userId = req.user!.id;

      const {
        page,
        limit,
        sort,
        qrCode,
      } = req.validated.query;

      const result = await linksRepository.findByUserId(
        userId,
        page,
        limit,
        sort,
        qrCode
      );
      return res.status(200).json(
        success("Links fetched successfully", result)
      );

    } catch (err) {
      console.error("Error fetching user links:", err);

      return res.status(500).json(
        failure("Failed to fetch links", "INTERNAL_ERROR", err)
      );
    }
  }

  async deleteLink(
    req: ParamsValidatedRequest<typeof DeleteLinkParamsSchema>,
    res: Response
  ) {
    try {
      const userId = req.user!.id;

      const {
        linkId,
      } = req.validated.params;

      const result = await linksRepository.delete(
        userId, linkId,
      );
      return res.status(200).json(
        success("Links deleted successfully", result)
      );

    } catch (err) {
      if (isRecordNotFoundError(err)) {
        return res.status(404).json(
          failure("Link not found", "NOT_FOUND", err)
        );
      }
      console.error("Error deleting user link:", err);

      return res.status(500).json(
        failure("Failed to delete link", "INTERNAL_ERROR", err)
      );
    }
  }

  async findByUserIdAndShortUrl(req: ParamsValidatedRequest<typeof FindByUserIdAndShortUrlSchema>, res: Response) {
    const { shorturl } = req.validated.params;
    const userId = req.user!.id;
    try {
      const link = await linksRepository.findByUserIdAndShortUrl(userId, shorturl);
      return res.status(200).json(success("Link fetched successfully", link));
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        return res.status(404).json(failure("Link not found", "NOT_FOUND", err));
      }
      console.error(err);
      return res.status(500).json(failure("Internal server error", "INTERNAL_ERROR", err));
    }
  }
}

// Export a single instance of the LinkController class
// This ensures that the same instance is used across the application, maintaining state if needed.
// It also simplifies the import and usage of the controller in other parts of the application.
export const links = new LinksController();