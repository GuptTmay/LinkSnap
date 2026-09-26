# V0 — Baseline

## Results

| Workload | Requests | p50 | p95 | Throughput | Errors |
|---|---:|---:|---:|---:|---:|
| Hot link | 2163 | 87.39 ms | 110.06 ms | 107.72 req/s | 0% |
| Multiple links | 2203 | 86.80 ms | 119.15 ms | 109.87 req/s | 0% |

## Notes

Baseline before Redis caching and asynchronous analytics.