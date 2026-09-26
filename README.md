## MiniLnk 

**MiniLnk** is a URL shortener service that lets users turn long URLs into short, easy-to-share links.

### Features

* **URL Shortening** – Create short links from long URLs.
* **Custom URLs** – Choose a custom short link ID.
* **Google OAuth** – Secure user authentication using Google Oauth
* **Link Management** – Update and manage created links.
* **Analytics** – Track clicks, countries, devices, and browsers.
* **URL Redirection** – Automatically redirect users from the short URL to the original URL.
* **QR Codes** – Generate QR codes for shortened links *(planned)*.

### Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
**Backend:** Node.js, Express.js
**Database:** PostgreSQL, Prisma
**Authentication:** JWT, Cookies

### Future Plans

* Microsoft, Twitter, Github OAuth
* QR code generation
* Redis caching
* IP-based rate limiting
* Automated testing with Playwright
* Performance testing and optimization
* Advanced analytics dashboard
* File/image/video link generation



## Setup

### Benchmark

**Prerequisite:** Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) before running the benchmarks.

1. Add your existing short URL IDs to the `urlIds` array in `benchmark/redirect.js`.
2. Run one of the following:

```bash
npm run benchmark:redirect    # Run all workloads
npm run benchmark:hot         # Test a single hot link
npm run benchmark:multiple    # Test multiple random links
```
