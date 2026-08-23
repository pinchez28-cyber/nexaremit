// scripts/check-cjs-graph.mjs
//
// Find packages in a dependency tree that cannot be require()d.
//
// Vercel loads serverless functions through its own module loader, which does
// NOT support require() of an ES module — it fails with ERR_REQUIRE_ESM at
// function load, i.e. FUNCTION_INVOCATION_FAILED with no usable message. Local
// Node 22.12+ and 24 DO support require(esm), so `require("xrpl")` succeeds on
// a dev machine and the same code dies in production. A plain require check
// cannot catch this; it has to be checked structurally.
//
// The xrpl dependency chain is mid-migration to ESM-only @scure and @noble
// packages, so this recurs whenever those versions float. Run with:
// npm run check:cjs

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOTS = ["xrpl", "stripe", "@supabase/supabase-js"];

async function readPackageJson(dir) {
  try {
    return JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
  } catch {
    return null;
  }
}

// Resolve like Node does: walk up from `fromDir` looking in each node_modules.
function resolvePackageDir(name, fromDir) {
  let dir = fromDir;
  for (;;) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Can this package be reached by require()?
 *
 * A "require" condition anywhere in exports means yes. Otherwise it depends on
 * type: a package declaring "module" with no require condition is ESM-only.
 */
function hasCommonJsEntry(pkg) {
  if (pkg.exports && /"require"/.test(JSON.stringify(pkg.exports))) {
    return true;
  }
  return pkg.type !== "module";
}

const esmOnly = [];
const visited = new Set();

async function walk(name, fromDir, path) {
  const dir = resolvePackageDir(name, fromDir);
  if (!dir || visited.has(dir)) return;
  visited.add(dir);

  const pkg = await readPackageJson(dir);
  if (!pkg) return;

  if (!hasCommonJsEntry(pkg)) {
    esmOnly.push({ name: `${pkg.name}@${pkg.version}`, path: [...path, name].join(" > ") });
  }

  for (const dep of Object.keys(pkg.dependencies || {})) {
    await walk(dep, dir, [...path, name]);
  }
}

for (const root of ROOTS) {
  await walk(root, process.cwd(), []);
}

console.log(`Checked ${visited.size} packages reachable from: ${ROOTS.join(", ")}`);

if (esmOnly.length) {
  console.error(
    `\n${esmOnly.length} ESM-only package(s) in the require graph — these throw ERR_REQUIRE_ESM on Vercel:`
  );
  for (const { name, path } of esmOnly) {
    console.error(`  ${name}\n    via ${path}`);
  }
  console.error(
    "\nPin them to a version that still ships a CommonJS entry (see overrides in package.json)."
  );
  process.exit(1);
}

console.log("No ESM-only packages in the require graph.");
