V0 — Redirect Performance Baseline

Objective

Establish a baseline for the Minilnk redirect endpoint before introducing Redis caching or moving analytics processing out of the request path.

The benchmark measures the end-to-end latency of the redirect endpoint while not following the returned HTTP redirect.

Test Environment

Application: Minilnk backend

Runtime: Node.js

Load-testing tool: k6

Execution: local

Virtual users: 10

Duration: 20 seconds per workload

Redirect following: disabled (redirects: 0)

Redis: not used for link lookup

Analytics: synchronous, as implemented in V0

Workloads:

Hot link: all requests target meragpt

Multiple links: requests randomly select one of 5 short URLs

Benchmark Command

npm run benchmark:hot
npm run benchmark:multiple

The same k6 script and load configuration are used for both workloads.

Results

Hot Link

Metric

Result

Virtual Users

10

Duration

20s

Requests

2,163

Throughput

107.72 req/s

Average latency

92.30 ms

p50 (median)

87.39 ms

p90

103.10 ms

p95

110.06 ms

Maximum

947.09 ms

Error rate

0%

Multiple Links

Metric

Result

Virtual Users

10

Duration

20s

Requests

2,203

Throughput

109.87 req/s

Average latency

90.76 ms

p50 (median)

86.80 ms

p90

110.14 ms

p95

119.15 ms

Maximum

928.21 ms

Error rate

0%

Interpretation

The baseline shows that the redirect endpoint currently handles roughly 108–110 requests/second under this local 10-VU workload.

The median latency is around 87 ms, while p95 latency is around 110–119 ms.

There are occasional high-latency outliers close to 1 second, despite the p95 remaining near 100 ms. These outliers are worth investigating later, but they are not being optimized as part of V0.

The hot-link and multiple-link workloads produce similar results, which provides a useful baseline for the upcoming optimization stages.

Important Benchmark Detail

The benchmark uses:

http.get(url, {
  redirects: 0,
});

This is intentional.

The Minilnk endpoint returns an HTTP redirect (302). If k6 followed that redirect, the benchmark would also include the response time of the destination website. Disabling redirect following ensures that the measured latency represents the Minilnk redirect request itself.

Next Steps

V1 — Redis Link Cache

Change only the link lookup mechanism:

V0:
Request → PostgreSQL → Analytics → 302

V1:
Request → Redis → Analytics → 302
              ↓
           PostgreSQL
          (cache miss)

The benchmark configuration and workloads should remain unchanged.

V2 — Asynchronous Analytics

Move analytics processing out of the redirect request path:

Request
   ↓
Redis
   ↓
enqueue analytics
   ↓
302 response

Background worker
   ↓
analytics processing
   ↓
PostgreSQL

Again, run the exact same benchmark after the change.

Comparison

Future versions will be compared using the same workloads and metrics:

Version

Workload

p50

p95

p99

Throughput

V0

Hot link

87.39 ms

110.06 ms

TBD

107.72 req/s

V0

Multiple links

86.80 ms

119.15 ms

TBD

109.87 req/s

V1

Hot link

—

—

—

—

V1

Multiple links

—

—

—

—

V2

Hot link

—

—

—

—

V2

Multiple links

—

—

—

—

Note: p99 was not included in the captured k6 output for V0, so it is intentionally left as TBD rather than estimated.


