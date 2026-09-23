import { Response } from "express";
import { ZodType } from "zod";

import { linksRepository } from "../repositories/links";
import { analyticsRepo } from "../repositories/analytics";

import {
  AnalyticsParamsSchema,
  AnalyticsQuerySchema,
} from "../schema/analytics";

import { ValidatedRequest } from "../types/validated-request";
import { failure, success } from "../utils/status";
import { isRecordNotFoundError } from "../utils/prisma";


export class AnalyticsController {
  async getAnalytics(
  req: ValidatedRequest<
    ZodType,
    typeof AnalyticsQuerySchema,
    typeof AnalyticsParamsSchema
  >,
  res: Response
) {
  const { linkId } = req.validated.params;

  const {
    from: requestedFrom,
    to: requestedTo,
    granularity = "day",
  } = req.validated.query;

  const userId = req.user!.id;

  try {
    // Verify that the link belongs to the authenticated user
    const link = await linksRepository.findByIdAndUserId(linkId, userId);
    
    if (!link) {
      return res.status(404).json(failure("Link not found", "LINK_NOT_FOUND"));
    }

    // Default analytics range: last 7 days
    const to = requestedTo ?? new Date();
    const from = requestedFrom ?? new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (from >= to) {
      return res.status(400).json(
        failure("'from' must be earlier than 'to'", "INVALID_DATE_RANGE")
      );
    }

    const { clicksOverTime, devices, countries, operatingSystems } =
      await analyticsRepo.getStatsSummary(linkId, from, to, granularity);

    const analytics = {
      clicksOverTime,
      devices,
      countries,
      operatingSystems,
      from,
      to,
      granularity,
    };

    return res.status(200).json(
      success("Analytics fetched successfully", analytics)
    );
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return res.status(404).json(failure("Link not found", "LINK_NOT_FOUND"));
    }

    console.error("Failed to fetch analytics:", err);

    return res.status(500).json(
      failure("Failed to fetch analytics", "INTERNAL_ERROR")
    );
  }
}
}

export const analytics = new AnalyticsController();