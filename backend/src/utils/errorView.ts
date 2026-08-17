import { Response } from "express";

export function sendNotFoundPage(res: Response) {
  return res.status(404).type("html").send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Link Not Found</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <h1>Link Not Found</h1>
        <p>The shortened URL you're trying to access doesn't exist.</p>
        <p>
          The URL may have been typed incorrectly, deleted,
          or it may be an old/outdated link.
        </p>
        <p>Please check the URL and try again.</p>
      </body>
    </html>
  `);
}