#!/usr/bin/env node
/**
 * Guard: this plugin must NOT declare a version anywhere.
 *
 * Why (Anthropic's plugin-marketplaces docs, "Version resolution and release
 * channels"). Claude Code resolves a plugin's version from the FIRST of:
 *
 *   1. version in plugin.json
 *   2. version in the marketplace entry
 *   3. the git commit SHA of the plugin's source
 *
 * and: "Plugin versions determine cache paths and update detection: if the
 * resolved version matches what a user already has, /plugin update and
 * auto-update skip the plugin."
 *
 * So a hardcoded version PINS every member. Push all the commits you like, they
 * see the same string, Claude keeps the cached copy, and nobody ever updates.
 * That is exactly what happened here: members sat on 0.8.1 from 25 June while
 * /som-team-kpi shipped and stayed unreachable.
 *
 * Our source is "./som-business-os", a relative path inside a git-hosted
 * marketplace. The docs call that out directly: "you can omit version entirely
 * and every new commit is treated as a new version. This is the simplest setup
 * for internal or actively-developed plugins."
 *
 * With no version field, every push IS the update. Nothing to bump, nothing to
 * forget, no way to strand a member.
 *
 * The docs also warn: "Avoid setting version in both plugin.json and the
 * marketplace entry. Claude Code always uses the plugin.json value without
 * warning, so a stale manifest version can mask a version you set in
 * marketplace.json." Hence this check covers BOTH files.
 *
 *   node scripts/version.mjs    → exits 1 if either file declares a version
 *
 * Run before every push that touches the plugin.
 */
import { readFileSync } from "node:fs";

const MARKETPLACE = ".claude-plugin/marketplace.json";
const PLUGIN = "som-business-os/.claude-plugin/plugin.json";

const read = (f) => JSON.parse(readFileSync(f, "utf8"));

const marketplaceVersion = read(MARKETPLACE).plugins?.[0]?.version;
const pluginVersion = read(PLUGIN).version;

console.log(`plugin.json version      : ${pluginVersion ?? "(none — correct)"}`);
console.log(`marketplace entry version: ${marketplaceVersion ?? "(none — correct)"}`);

const offenders = [];
if (pluginVersion !== undefined) offenders.push(`${PLUGIN} declares "${pluginVersion}"`);
if (marketplaceVersion !== undefined) {
  offenders.push(`${MARKETPLACE} declares "${marketplaceVersion}"`);
}

if (offenders.length > 0) {
  console.error("\nFAIL: a version field is present.");
  for (const o of offenders) console.error("  - " + o);
  console.error("\nThis PINS every existing member. They will never receive another");
  console.error("update, however many commits you push, because Claude compares the");
  console.error("resolved version and skips when it matches the cached copy.");
  console.error("\nDelete the version field(s). Every commit then counts as a new");
  console.error("version and members update on the next marketplace refresh.");
  process.exit(1);
}

console.log("\nOK: no version pinned. Every commit is a new version.");
