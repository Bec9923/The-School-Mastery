#!/usr/bin/env node
/**
 * Keep the plugin's two version numbers in lockstep.
 *
 * Why this exists (2026-07-22): the plugin shipped with a version in
 * som-business-os/.claude-plugin/plugin.json and NO version at all in
 * .claude-plugin/marketplace.json. Claude reads the MARKETPLACE entry to decide
 * whether a newer build exists, so with nothing advertised there was nothing to
 * compare against an installed copy, and the Update button did nothing for
 * every member. /som-team-kpi sat in commands/ unreachable as a result.
 *
 * The two files are read at different moments (catalogue before install, plugin
 * manifest after), so a drift between them is invisible until a member cannot
 * update. This script makes the drift loud instead.
 *
 *   node scripts/version.mjs           → check both agree, exit 1 if not
 *   node scripts/version.mjs 0.8.4     → set BOTH to 0.8.4
 *
 * Run the check before every push that touches the plugin.
 */
import { readFileSync, writeFileSync } from "node:fs";

const MARKETPLACE = ".claude-plugin/marketplace.json";
const PLUGIN = "som-business-os/.claude-plugin/plugin.json";

const read = (f) => JSON.parse(readFileSync(f, "utf8"));
const write = (f, j) => writeFileSync(f, JSON.stringify(j, null, 2) + "\n");

const next = process.argv[2];

if (next) {
  if (!/^\d+\.\d+\.\d+$/.test(next)) {
    console.error(`Not a version: "${next}". Expected x.y.z, e.g. 0.8.4`);
    process.exit(1);
  }
  const m = read(MARKETPLACE);
  const p = read(PLUGIN);
  const from = p.version;
  m.plugins[0].version = next;
  p.version = next;
  write(MARKETPLACE, m);
  write(PLUGIN, p);
  console.log(`bumped ${from} -> ${next} in both manifests`);
  console.log("commit and push, then Sync in Claude to publish it");
  process.exit(0);
}

const m = read(MARKETPLACE);
const p = read(PLUGIN);
const advertised = m.plugins?.[0]?.version;
const declared = p.version;

console.log(`marketplace.json advertises : ${advertised ?? "(MISSING)"}`);
console.log(`plugin.json declares        : ${declared ?? "(MISSING)"}`);

if (!advertised) {
  console.error("\nFAIL: marketplace.json has no version for the plugin.");
  console.error("Members will never be offered an update. This is the exact");
  console.error("bug found on 2026-07-22. Run: node scripts/version.mjs " + (declared ?? "0.0.1"));
  process.exit(1);
}
if (advertised !== declared) {
  console.error("\nFAIL: the two versions disagree.");
  console.error("Claude compares the marketplace entry, so members would be");
  console.error(`offered ${advertised} while the plugin actually contains ${declared}.`);
  process.exit(1);
}

console.log("\nOK: in lockstep.");
