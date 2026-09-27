# MiniLnk

MiniLnk is a URL shortener service that turns long URLs into short, shareable links.

**Live Demo:** `https://minilnk-app.onrender.com`

## Features

* **URL Shortening** — Create short links from long URLs.
* **Custom URLs** — Choose your own short URL ID.
* **Google OAuth** — Authentication using Google OAuth.
* **Link Management** — Update and manage created links.
* **Analytics** — Track clicks, countries, devices, browsers, and operating systems.
* **URL Redirection** — Redirect short URLs to their original destinations.
* **Redis Caching** — Cache frequently accessed links for faster redirects.
* **Background Analytics** — Process analytics asynchronously using BullMQ and Redis.
* **QR Codes** — Generate QR codes for shortened links. 
* **Rate Limiting** — Limit requests per IP to prevent abuse.

## Tech Stack

* **Runtime:** Node.js
* **Backend:** Express.js, TypeScript
* **Database:** PostgreSQL, Prisma ORM
* **Cache / Queue:** Redis, BullMQ
* **Authentication:** JWT
* **Testing:** Vitest
* **Performance Testing:** k6

## Future Plans
* Microsoft, GitHub, and other OAuth providers
* File/image/video links

## Setup

### Backend

```bash
npm install
npm run dev
```

### Analytics Worker

The analytics worker runs separately from the API:

```bash
npm run worker:analytics
```

### Available Scripts

```bash
npm run dev                  # Development server
npm run build                # Production build
npm start                    # Production server

npm run typecheck            # TypeScript type checking

npm test                     # Run tests

npm run worker:analytics    # Start analytics worker
```

## Performance Benchmark

The project includes k6 benchmarks for measuring redirect performance.

### Prerequisite

Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).

Add your existing short URL IDs to:

```text
benchmark/redirect.js
```

Then run:

```bash
npm run benchmark:redirect    # Run all workloads
npm run benchmark:hot         # Single hot link
npm run benchmark:multiple    # Multiple random links
```

### Benchmark Results

The benchmark progressively optimized the redirect endpoint:

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
