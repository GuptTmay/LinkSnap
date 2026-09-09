// build.mjs (Michael Jackson Script) : )

import * as esbuild from "esbuild";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

// Everything in package.json deps stays a real node_modules require —
// esbuild only bundles YOUR src/** code, not third-party packages.
// Critical for bcrypt (native binary) and Prisma (reads files off disk at runtime).
const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
];

await esbuild.build({
  entryPoints: ["src/index.ts"],   // where your app starts
  bundle: true,                     // trace all your own imports into one file
  platform: "node",                 // use Node's module semantics, not browser
  target: "node22",                 // match your actual Node runtime
  format: "esm",                    // matches "type": "module" in package.json
  outfile: "dist/index.js",
  external,
  sourcemap: true,                  // readable stack traces in prod logs
  minify: false,                    // keep off; flip on later once boring and stable
});

console.log("build complete");