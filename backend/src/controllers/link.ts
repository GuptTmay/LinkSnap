import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { linkRepository } from "../repositories/link";
import { LINK_ID_LENGTH, MAX_RETRIES } from "../config";


export class LinkController {
  async createLink(req: Request, res: Response) {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    // NOTE: no format/protocol validation here yet — worth adding
    // (e.g. reject anything that isn't http/https) before this goes to prod.

    for (let i = 0; i < MAX_RETRIES; i++) {
      const shortUrl = nanoid(LINK_ID_LENGTH);

      try {
        await linkRepository.create(shortUrl, url);
        return res.status(201).json({ shortUrl });
      } catch (err) {
        if (linkRepository.isUniqueConstraintError(err)) {
          // Collision, try another nanoid.
          continue;
        }

        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    return res
      .status(500)
      .json({ error: "Failed to generate a unique short URL" });
  }

  async redirectToLongUrl(req: Request, res: Response) {
    const { shorturl }  = req.params;
    try {
      const link = await linkRepository.incrementClicksAndGet(shorturl as string);

      if (!link) {
        return res.status(404).json({ error: "Short URL not found" });
      }
      
      return res.redirect(302, link.longUrl);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
// Export a single instance of the LinkController class
// This ensures that the same instance is used across the application, maintaining state if needed.
// It also simplifies the import and usage of the controller in other parts of the application.
export const link = new LinkController();