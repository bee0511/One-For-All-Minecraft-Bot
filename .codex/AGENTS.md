# AGENTS.md

This repository follows the rules in this file during development and refactors.

## Purpose
- Make refactors safe, incremental, and easy to review.
- Split commands into small, reusable modules.
- Enforce JavaScript naming conventions consistently.
- Prefer code reuse over duplication.
- Present options with pros and cons when multiple solutions exist.

## Refactor Workflow (Required)
1) Read the full function before modifying it.
2) Trace all call sites and their call stacks.
3) Identify duplication and reuse opportunities.
4) Simplify or remove code only after confirming no active call sites.
5) Update docs, especially `docs/codebase-function-map.md`.
6) Provide options with pros/cons when there are multiple viable designs.

## Naming Conventions (Required)
- Functions and variables: lowerCamelCase.
- Classes and constructors: UpperCamelCase.
- Constants: UPPER_SNAKE_CASE.
- File names: match existing folder style (prefer lowerCamelCase in this repo).
- Avoid non-standard abbreviations and unclear prefixes/suffixes.

## Command Module Layout (Preferred)
Split commands into small modules and load them via a folder index.

Example structure:
```
src/commands/basic/
  index.js
  info.js
  balance.js
  throw.js
```

Example `index.js` (explicit list):
```js
const info = require("./info");
const balance = require("./balance");
const throwCmd = require("./throw");

module.exports = [info, balance, throwCmd];
```

Example command module:
```js
module.exports = {
  name: "Balance Query",
  identifiers: ["balance", "bal", "money", "emerald", "coin"],
  execute: async function balanceCommand(task, bot, context) {
    // Keep logic small and delegate to shared helpers when possible.
  },
  longRunning: false,
  permissionRequired: 0
};
```

## Reuse First
- Before adding a new helper, check for an existing one.
- Prefer shared helpers for:
  - File IO (config read/write).
  - Task replies and formatting.
  - Inventory scans and slot operations.

## Simplify or Remove
- Remove unreachable code and unused helpers only after verifying call sites.
- If a function is a thin wrapper, consider inlining or merging.
- If functionality is obsolete, delete it and remove docs/references.

## Decision Points (Required)
When multiple refactor designs are possible:
- Present options with pros/cons.
- Ask for user choice before proceeding.

Example:
1) Static index-based module registry
   - Pros: explicit, packaging-friendly.
   - Cons: manual maintenance.
2) Dynamic folder loader
   - Pros: zero manual updates.
   - Cons: packaging and runtime safety concerns.

## Documentation
- Update `docs/codebase-function-map.md` after meaningful refactors.
- Keep changes small and explain intent in commit-ready chunks.

## Quality
- Prefer small, testable functions.
- Avoid large multi-responsibility functions.
- Keep side effects localized and explicit.
