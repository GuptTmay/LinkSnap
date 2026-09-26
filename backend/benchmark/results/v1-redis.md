# V1 — Redis Link Cache

## Objective

Measure the effect of adding Redis caching to the redirect link lookup.

```text
V0: Request → PostgreSQL → Analytics → 302

V1: Request → Redis → Analytics → 302
              ↓
          cache miss
              ↓
          PostgreSQL
```

Only the link lookup was changed. Analytics remains synchronous.

## Benchmark Setup

- k6: local execution
- VUs: 10
- Duration: 20s
- Redirect following: disabled (`redirects: 0`)
- Error rate: 0%
- Hot-link: all requests use `meragpt`
- Multiple-links: randomly selects from configured `urlIds`
- Redis TTL: 60 minutes

## Results

### Hot Link

| Metric | V1 |
|---|---:|
| Requests | 2,590 |
| Throughput | 129.34 req/s |
| Average | 77.08 ms |
| p50 | 69.87 ms |
| p90 | 85.58 ms |
| p95 | 91.07 ms |
| p99 | TBD |
| Max | 1.58 s |
| Errors | 0% |

### Multiple Links

| Metric | V1 |
|---|---:|
| Requests | 2,711 |
| Throughput | 135.18 req/s |
| Average | 73.60 ms |
| p50 | 69.89 ms |
| p90 | 82.54 ms |
| p95 | 86.10 ms |
| p99 | TBD |
| Max | 619 ms |
| Errors | 0% |

## V0 → V1

| Workload | V0 p50 | V1 p50 | V0 p95 | V1 p95 |
|---|---:|---:|---:|---:|
| Hot link | 87.39 ms | 69.87 ms | 110.06 ms | 91.07 ms |
| Multiple links | 86.80 ms | 69.89 ms | 119.15 ms | 86.10 ms |

## Observation

V1 shows lower median and p95 latency than V0 in both workloads while maintaining a 0% error rate.

The hot-link workload benefits from repeatedly accessing the same cached URL.

The maximum latency is still much higher than p95, so tail latency should be evaluated separately using p99.

## Next Step

V2 will move analytics processing out of the redirect request path so the redirect does not wait for analytics work.

## Getting p99 from k6

Add this to `benchmark/redirect.js`:

```js
export function handleSummary(data) {
  const metrics = data.metrics.http_req_duration.values;

  console.log(`p99: ${metrics["p(99)"]} ms`);

  return {};
}
```

Then run:

```bash
npm run benchmark:hot
```

The output will include the p99 value.

For your benchmark report, record p99 alongside p50 and p95.