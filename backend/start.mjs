import { spawn } from "node:child_process";

const processes = [
  spawn("node", ["dist/index.js"], { stdio: "inherit" }),
  spawn("node", ["dist/workers/analytics.worker.js"], { stdio: "inherit" }),
];

function shutdown() {
  for (const process of processes) {
    process.kill("SIGTERM");
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);