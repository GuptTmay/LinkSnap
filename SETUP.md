# Setup

## Backend

```bash
npm install
npm run dev
```

## Analytics Worker

Runs separately from the API:

```bash
npm run worker:analytics
```

## Available Scripts

```bash
npm run dev                  # Development server
npm run build                # Production build
npm start                    # Production server

npm run typecheck            # TypeScript type checking

npm test                     # Run tests

npm run worker:analytics     # Start analytics worker
```

## Performance Benchmark

k6 benchmarks for measuring redirect performance.

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