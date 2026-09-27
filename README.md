# MiniLnk

A URL shortener service — long URLs in, short shareable links out, with real analytics and a Redis/BullMQ pipeline behind the redirect endpoint.

**Live Demo:** [https://minilnk-app.onrender.com](https://minilnk-app.onrender.com)

## Features

- **URL Shortening** — Create short links from long URLs.
- **Custom URLs** — Choose your own short URL ID.
- **Google OAuth** — Authentication using Google OAuth.
- **Link Management** — Update and manage created links.
- **Analytics** — Track clicks, countries, devices, browsers, and operating systems.
- **URL Redirection** — Redirect short URLs to their original destinations.
- **Redis Caching** — Cache frequently accessed links for faster redirects.
- **Background Analytics** — Process analytics asynchronously using BullMQ and Redis.
- **QR Codes** — Generate QR codes for shortened links.
- **Rate Limiting** — Limit requests per IP to prevent abuse.

## Tech Stack

- **Runtime:** Node.js
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Cache / Queue:** Redis, BullMQ
- **Authentication:** JWT
- **Testing:** Vitest
- **Performance Testing:** k6

### Benchmark Results

The redirect endpoint was progressively optimized 20x over four iterations:

```text
V0 → PostgreSQL + synchronous analytics
V1 → Redis caching
V2 → Asynchronous analytics
V3 → Redis + BullMQ analytics worker
```

The final benchmark reached approximately:

```text
7,148 requests/sec
4.11 ms average latency
7.02 ms p95 latency
```

See the full benchmark and methodology:

**[Redirect Benchmark](backend/benchmark/README.md)**

## Architecture

- **Writes** go straight to PostgreSQL via Prisma.
- **Reads** (redirects) hit Redis first, cache-aside style, falling back to Postgres on miss.
- **Analytics** (clicks, country, device, browser, OS) are pushed to a BullMQ queue and processed by a separate worker, keeping the redirect path itself synchronous-write-free.
  This split is what took the redirect endpoint from a blocking DB+analytics write to a sub-5ms cache hit — see the benchmark doc for the per-stage breakdown.

## Images
Links Details Page
![Link Details](docs/images/LinkDetails1.png)

Link Analytics
![Analytics Details](docs/images/LinkDetails2.png)

Link Analytics
![Analytics Details](docs/images/LinkDetails3.png)

QrCode Details
![QrCode Details](docs/images/QrCodeDetails.png)

## Setup
See **[SETUP.md](SETUP.md)** for install, dev server, worker, and benchmark instructions.

## Future Plans

- Microsoft, GitHub, and other OAuth providers
- File/image/video links
