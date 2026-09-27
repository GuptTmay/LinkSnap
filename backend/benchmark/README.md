# Redirect Endpoint Benchmark

This benchmark measures the performance of the redirect endpoint as analytics and caching were incrementally optimized.

The goal was not simply to increase requests/sec, but to identify **what was slowing the redirect path and what tradeoffs were introduced by each optimization**.
 > Screenshots of the k6 load testing results are available in the `backend/benchmark/screenshots` folder.
## 1. Benchmark Setup

### Computer Specs
* **RAM:** 8 GB
* **CPU:** 11th Gen Intel i3-1115G4 (4) @ 3.00GHz
* **GPU:** Intel Tiger Lake-LP GT2 [UHD Graphics]

### Environment

* **Load testing:** k6
* **Virtual users:** 30
* **Duration:** 20 seconds
* **Workload:** `multipleLinks`
* **Requests:** randomly selected from 5 valid short URLs and 2 invalid URLs
* **Valid response:** `302`
* **Invalid response:** `404`
* **Redirect following:** disabled with `redirects: 0`
* **Database:** PostgreSQL
* **Cache / queue:** Redis
* **Queue:** BullMQ
* **Rate limiting:** disabled

The workload intentionally contains invalid URLs to test negative caching as well.

### Workload

```js
const urlIds = [
  "meragpt",
  "beastCo",
  "1LRVQOo",
  "xjurYdK",
  "ouGjLSk",
  "invalid-url-id",
  "invalid-url-id-2",
];
```

Each virtual user repeatedly selects one of these IDs randomly.

---

# 2. V0 — Baseline

### Implementation

The redirect endpoint performed the complete operation synchronously:

```text
Request
   ↓
PostgreSQL lookup
   ↓
Analytics processing
   ↓
PostgreSQL analytics INSERT
   ↓
302 response
```

### Results

| Metric          |    Result |
| --------------- | --------: |
| Requests        |     8,255 |
| Throughput      | 411 req/s |
| Average latency |  72.65 ms |
| Median          |  77.17 ms |
| p90             | 114.24 ms |
| p95             | 124.75 ms |
| Max             | 947.06 ms |
| VUs             |        30 |
| Duration        |      20 s |

### Problem

The redirect request was responsible for both:

1. Finding the destination URL.
2. Performing analytics work.

This made database and analytics operations part of the redirect's critical path.

### Tradeoff

**Advantage:** Simple and reliable.

**Disadvantage:** Every analytics operation directly increases redirect latency.

---

# 3. V1 — Redis URL Cache

The next optimization was caching short URL → long URL mappings in Redis.

```text
Request
   ↓
Redis lookup
   ├── HIT → 302
   │
   └── MISS → PostgreSQL → Redis → 302
```

### Results

| Metric     |        V0 |        V1 |
| ---------- | --------: | --------: |
| Throughput | 411 req/s | 449 req/s |
| Average    |  72.65 ms |  66.44 ms |
| p95        | 124.75 ms | 111.73 ms |

### Result

Throughput increased by approximately **9%**, while p95 latency decreased by approximately **10%**.

### Why?

Repeated requests no longer require PostgreSQL to retrieve the destination URL when the URL is cached. The same is true for invalid URLs, which are also cached.

### Tradeoff

Redis introduces:

* Cache invalidation concerns
* Memory usage
* Redis availability as another dependency

---

# 4. V2 — Asynchronous Analytics

The next bottleneck was analytics.

Instead of waiting for analytics to complete before returning the redirect, analytics was started asynchronously.

```text
Request
   ↓
Redis / PostgreSQL lookup
   ↓
Start analytics asynchronously
   ↓
302 response

Analytics
   ↓
IP lookup
   ↓
PostgreSQL INSERT
```

### Results

| Metric     |        V1 |          V2 |
| ---------- | --------: | ----------: |
| Requests   |     9,012 |      28,996 |
| Throughput | 449 req/s | 1,449 req/s |
| Average    |  66.44 ms |    20.60 ms |
| p95        | 111.73 ms |    44.64 ms |

### Result

Throughput increased by approximately **222%** compared with V1.

Average latency decreased by approximately **69%**, while p95 decreased by approximately **60%**.

### Why?

Analytics was removed from the response's critical path.

The API no longer waits for:

* IP geolocation
* User-agent parsing
* PostgreSQL analytics insertion

### Important limitation

Although the Promise is not awaited, the analytics work still executes inside the **same Node.js process**.

At high traffic, analytics can therefore compete with redirect requests for:

* CPU
* memory
* database connections
* network resources
* Node.js process resources

### Tradeoff

**Advantage:** Very simple and significantly faster.

**Disadvantages:**

* Analytics jobs are not durable.
* Work can be lost if the process crashes.
* Failed analytics operations are not automatically retried.

---

# 5. V3 — BullMQ Analytics Worker

The final optimization moved analytics into a BullMQ queue backed by Redis.

```text
                 API
                  │
Request → Redis → Queue → 302
                    │
                    ↓
              Analytics Worker
                    │
             ┌──────┴──────┐
             ↓             ↓
         IP lookup      PostgreSQL
```

The API only needs to enqueue the analytics job.

The worker processes the expensive operation separately.

### Results

| Metric     |          V2 |          V3 |
| ---------- | ----------: | ----------: |
| Requests   |      28,996 |     142,975 |
| Throughput | 1,449 req/s | 7,148 req/s |
| Average    |    20.60 ms |     4.11 ms |
| Median     |    16.79 ms |     3.89 ms |
| p90        |    35.50 ms |     5.96 ms |
| p95        |    44.64 ms |     7.02 ms |
| Max        |   185.73 ms |   194.32 ms |

### Result

Compared with V2:

* Throughput increased by approximately **393%**
* Average latency decreased by approximately **80%**
* p95 latency decreased by approximately **84%**

Compared with the original V0:

* Throughput increased from **411 → 7,148 req/s**
* Average latency decreased from **72.65 → 4.11 ms**
* p95 latency decreased from **124.75 → 7.02 ms**

### Why?

The API process no longer performs the expensive analytics work.

Instead:

```text
API
 ↓
enqueue small Redis job
 ↓
return 302
```

The worker independently handles:

```text
UA parsing
IP geolocation
PostgreSQL INSERT
```

This isolates analytics workload from the latency-sensitive redirect path.

### Tradeoff

BullMQ introduces more complexity:

* Separate worker process
* Redis dependency
* Queue monitoring
* Retry configuration
* Deployment of an additional service

In return, queued work can be processed independently with retry and concurrency controls.

---

# 6. Final Comparison

| Version | Main change     |  Throughput |         Avg |         p95 |
| ------- | --------------- | ----------: | ----------: | ----------: |
| V0      | Baseline        |       411/s |    72.65 ms |   124.75 ms |
| V1      | Redis cache     |       449/s |    66.44 ms |   111.73 ms |
| V2      | Async analytics |     1,449/s |    20.60 ms |    44.64 ms |
| V3      | BullMQ worker   | **7,148/s** | **4.11 ms** | **7.02 ms** |

## 7. What the benchmark demonstrates

The major performance improvement did not come from Redis alone.

The largest improvements came from progressively removing expensive work from the redirect request's critical path:

```text
V0
PostgreSQL + Analytics
        ↓
V1
Redis + Analytics
        ↓
V2
Redis + asynchronous Analytics
        ↓
V3
Redis + Queue + separate Analytics Worker
```

The final architecture prioritizes the redirect operation while allowing analytics to be processed independently.

