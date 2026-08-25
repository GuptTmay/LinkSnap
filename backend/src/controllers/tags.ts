import { Response } from "express";
import { ZodType } from "zod";

import { tagsRepository } from "../repositories/tags";
import { failure, success } from "../utils/status";
import { isRecordNotFoundError } from "../utils/prisma";

import {
  CreateTagSchema,
  LinkTagParamsSchema,
  DeleteLinkTagParamsSchema,
} from "../schema/tags";

import {
  BodyValidatedRequest,
  ValidatedRequest,
} from "../types/validated-request";

export class TagsController {
  async getTags(req: ValidatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      const tags = await tagsRepository.findByUserId(userId);

      return res.status(200).json(
        success("Tags fetched successfully", {
          tags,
        })
      );
    } catch (err) {
      console.error("Error fetching tags:", err);

      return res
        .status(500)
        .json(failure("Failed to fetch tags", "INTERNAL_ERROR"));
    }
  }

  async addTagToLink(
    req: ValidatedRequest<
      typeof CreateTagSchema,
      ZodType,
      typeof LinkTagParamsSchema
    >,
    res: Response
  ) {
    try {
      const userId = req.user?.id;
      const { linkId } = req.validated.params;
      const { name } = req.validated.body;

      const tag = await tagsRepository.addTagToLink(
        userId,
        linkId,
        name.toLowerCase()
      );

      if (!tag) {
        return res
          .status(404)
          .json(failure("Link not found", "NOT_FOUND"));
      }

      return res.status(200).json(
        success("Tag added to link successfully", {
          tag,
        })
      );
    } catch (err) {
      console.error("Error adding tag:", err);

      return res
        .status(500)
        .json(failure("Failed to add tag", "INTERNAL_ERROR"));
    }
  }

  async removeTagFromLink(
    req: ValidatedRequest<
      ZodType,
      ZodType,
      typeof DeleteLinkTagParamsSchema
    >,
    res: Response
  ) {
    try {
      const userId = req.user?.id;
      const { linkId, tagId } = req.validated.params;

      const removed = await tagsRepository.removeTagFromLink(
        userId,
        linkId,
        tagId
      );

      if (!removed) {
        return res
          .status(404)
          .json(failure("Link not found", "NOT_FOUND"));
      }

      return res.status(200).json(
        success("Tag removed from link successfully", {})
      );
    } catch (err) {
      console.error("Error removing tag:", err);

      if (isRecordNotFoundError(err)) {
        return res
          .status(404)
          .json(failure("Tag is not attached to this link", "NOT_FOUND"));
      }

      return res
        .status(500)
        .json(failure("Failed to remove tag", "INTERNAL_ERROR"));
    }
  }
}

export const tagsController = new TagsController();