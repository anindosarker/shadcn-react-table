# 07: Radix Select render loop

## 1. Architecture

### 1.1 Overview

The home page of https://www.shadcn-table.com/ (production, v0.3.0) dies about 9 s after
load in Chrome, with no click: React error #185 "Maximum update depth exceeded", then the
renderer is killed ("This page couldn't load"). The timing matches the live demo
(`components/dev-home/v12/signal-demo.tsx`) reaching its Editing step; it reproduces on
`claude/review` with `next dev`. The fix is a dependency bump the owner asked for as a
hotfix; no decision was taken, so `decisions.md` is not touched.

**Mechanism:**

| Layer | Fact |
| --- | --- |
| Mounted Radix Select | pagination "Rows per page" select, `ST_TablePagination.tsx`, installed copy under `apps/docs/components/ui/shadcn-table/` |
| Closed state | Radix Select renders its items into a document fragment, so `SelectItemText` exists while closed |
| Stack (`next dev`) | `dispatchSetState` inside `SelectItemText.useComposedRefs` during `safelyDetachRef` in `commitMutationEffectsOnFiber` |
| Cause | `@radix-ui/react-select` 2.3.0 composes inline ref callbacks through `useComposedRefs` from `@radix-ui/react-compose-refs` 1.1.3; the composed callback changes identity every render |
| Loop | React 19.3.1 detaches the old callback (`setState(null)`) and attaches the new one (`setState(node)`) on every commit, which re-renders until the depth limit |
| Upstream fix | Radix release notes, June 30, 2026: "Fixed infinite re-render loop in React 19 caused by unstable composed ref callback references", radix-ui/primitives#3967 and #3968; ships as `@radix-ui/react-compose-refs` 1.1.5 and `@radix-ui/react-select` 2.4.x, pulled by `radix-ui` 1.8.1 |
| Scope | Only this repo's lockfile is stale (`radix-ui` 1.5.0). The registry item lists `radix-ui` unversioned, so fresh user installs already resolve the fixed version. `@base-ui/react` has no Radix Select and is unaffected |

### 1.2 Goals

- Home page survives the full demo loop (Sorting to Grouping) with zero page errors and zero
  console errors, with Radix UI and with Base UI selected in the base switch
- `pnpm-lock.yaml` resolves `radix-ui` 1.8.1, `@radix-ui/react-select` 2.4.1 and
  `@radix-ui/react-compose-refs` 1.1.5 for both importers
- A page check guards the regression: it fails against production v0.3.0 and passes on the
  bumped tree
- `CHANGELOG.md` carries a Fixed entry under `## Unreleased`
- Installed docs copies under `apps/docs/components/ui` and `ui-base` are unchanged, because
  the library source does not change

### 1.3 Current structure

```
./
├── pnpm-lock.yaml                         ← radix-ui 1.5.0, react-select 2.3.0, compose-refs 1.1.3
├── CHANGELOG.md                           ← "## Unreleased" with "### Added" only
├── packages/shadcn-table/package.json     ← "radix-ui": "^1.5.0"
└── apps/docs/
    ├── package.json                       ← "radix-ui": "^1.5.0"
    └── scripts/
        ├── check-pages.mjs                ← runner; collects console errors and pageerror per page
        └── page-checks/
            ├── _helpers.mjs               ← shared helpers (example, baseSwitch, ...)
            ├── a.mjs                      ← '/' asserts the agent bar base menu only
            └── e.mjs                      ← '/' asserts hero, install command, demo rows; wins when all clusters run
```

### 1.4 Target structure

```
./
├── pnpm-lock.yaml                         ← radix-ui 1.8.1, react-select 2.4.1, compose-refs 1.1.5 (old 1.1.3 entries stay for other transitive users)
├── CHANGELOG.md                           ← "## Unreleased" gains "### Fixed"
├── packages/shadcn-table/package.json     ← "radix-ui": "^1.8.1"
└── apps/docs/
    ├── package.json                       ← "radix-ui": "^1.8.1"
    └── scripts/page-checks/
        ├── _helpers.mjs                   ← new demoLoop() helper
        └── e.mjs                          ← '/' calls demoLoop() on both bases after its existing asserts
```

### 1.5 Flow: none

### 1.6 Components

#### 1.6.1 Data artifacts

| Artifact | Status | Change |
| --- | --- | --- |
| `packages/shadcn-table/package.json` | refactor | `"radix-ui": "^1.8.1"` |
| `apps/docs/package.json` | refactor | `"radix-ui": "^1.8.1"` |
| `pnpm-lock.yaml` | refactor | output of `pnpm up -r radix-ui@1.8.1`; no hand edits |
| `CHANGELOG.md` | refactor | `### Fixed` under `## Unreleased`, after `### Added` |
| `packages/shadcn-table/registry.json` | keep | `radix-ui` stays unversioned |
| `registry/radix/registry.ts` line 25 | keep | `{ name: 'radix-ui' }` |

**CHANGELOG entry:**

```markdown
### Fixed

- The docs home page no longer crashes with React error #185 ("Maximum update depth
  exceeded") about 9 seconds after load: `radix-ui` is bumped to 1.8.1, which carries
  Radix's fix for the React 19 re-render loop in `Select` composed refs
  (`@radix-ui/react-select` 2.4.1, `@radix-ui/react-compose-refs` 1.1.5). The registry
  item already installs the fixed version for new users.
```

#### 1.6.2 Page check: demo loop

New helper in `_helpers.mjs`, called from the `'/'` entry of `e.mjs`. Catches any render
loop or crash that needs time or the demo's step changes to surface.

- Scrolls the live demo into view, then waits until its `aria-live` status reads
  `Now showing: Grouping` (last step), timeout 30 s, minimum hold 15 s
- Registers `page.once('crash')` before the hold and fails `demo: no renderer crash` if it
  fires
- Runs twice: with the default base (Radix UI), then picks Base UI through the agent bar's
  `Choose base` menu (same selectors as `commandBarBase` in `a.mjs`), reloads and holds again
- Leaves zero-error assertions to the runner: its `pageerror` and console listeners stay
  attached across the reload, so `no hydration / React errors` and `no console errors` cover
  both holds
- Does NOT add a check to `a.mjs`; `e.mjs` owns `'/'` when all clusters run (release smoke)
- Does NOT change the runner, `FATAL` or `KNOWN_LIBRARY_ERRORS`

**Operations:**

| Operation | Status | Notes |
| --- | --- | --- |
| `demoLoop(page, check)` | new | `_helpers.mjs`, exported |
| `e.mjs` `'/'` | refactor | existing asserts first, then `demoLoop` |
| `e.mjs` header comment | refactor | mentions the demo loop hold |
| other helpers, clusters | keep | |

**Interfaces:**

```javascript
/** Holds the home page through the full live demo loop on both bases. */
export async function demoLoop(page, check) {}

const DEMO_LAST = 'Now showing: Grouping';
const DEMO_MIN_HOLD_MS = 15000;
const DEMO_TIMEOUT_MS = 30000;
```

**Checks added:** `demo: radix ui reaches Grouping`, `demo: base ui reaches Grouping`,
`demo: no renderer crash`.

**Stays unchanged:** `check-pages.mjs`, `a.mjs` to `d.mjs`, `baseSwitch`, `signal-demo.tsx`
timings.

**Usage:**

```javascript
'/': async ({ page, check }) => {
  // existing hero, agent bar, demo rows, headings, guide links asserts
  await demoLoop(page, check);
},
```

#### 1.6.3 Dependency bump

Moves both importers to `radix-ui` 1.8.1 so the lockfile carries the fixed Radix packages.

- Bumps the range in both `package.json` files and regenerates the lockfile with one
  `pnpm up`
- Does NOT pin or override `@radix-ui/react-select` or `@radix-ui/react-compose-refs`
  directly; `radix-ui` 1.8.1 pulls them
- Does NOT touch `@base-ui/react`, React or Next

**Operations:**

| Operation | Status | Notes |
| --- | --- | --- |
| `pnpm up -r radix-ui@1.8.1` | new | from the repo root |
| lockfile verification | new | `pnpm why -r @radix-ui/react-select` and `@radix-ui/react-compose-refs` show 2.4.1 and 1.1.5 under `radix-ui` 1.8.1 |

**Stays unchanged:** library source under `packages/shadcn-table/registry/`, installed copies
under `apps/docs/components/ui` and `apps/docs/components/ui-base`,
`packages/shadcn-table/registry.json`, `registry/radix/registry.ts`, `public/r` output
content.

### 1.7 Dependencies and env

| Package | From | To | Importers |
| --- | --- | --- | --- |
| `radix-ui` | 1.5.0 | 1.8.1 | `packages/shadcn-table`, `apps/docs` |
| `@radix-ui/react-select` (transitive) | 2.3.0 | 2.4.1 | via `radix-ui` |
| `@radix-ui/react-compose-refs` (transitive) | 1.1.3 | 1.1.5 | via `radix-ui` |

Unchanged runtime: react 19.3.1, react-dom 19.3.1, next 16.3.8. No env vars.

## 2. Instructions for AI

### 2.1 Phases

Runs alone in `shadcn-react-table.worktrees/07`, branch `v0.4/07`. No dependency on 05 or 06.
Merges into `claude/review` as soon as the gates are green; the owner then merges `master`
as a hotfix.

**Rules for every phase:**

- No `git add -A`; stage files by path
- Conventional Commits, no trailers, no attribution; push right after every commit
- `pnpm format` once, right before each commit; no format-only or comment-only commits
- No em dashes anywhere, comments and CHANGELOG included
- CHANGELOG entry in the same commit as the code it describes
- Revert `lib:install` side effects (`apps/docs/app/global.css`, `.next-*` entries in
  `apps/docs/tsconfig.json`) before committing
- Ports 4170 to 4179 only; never 3000, 5173, 5273, 5320, 5404, 5406, 6006, 6007, 6306
- Never `pkill`; stop only processes you started, by PID
- The docs `start` script binds 5320: use
  `NEXT_DIST_DIR=.next pnpm --filter shadcn-table-docs exec next start -p 4170`
  (`next.config.mjs` maps other ports to `.next-<port>`)

#### 2.1.1 Phase 1: Bump and lockfile

- Run `pnpm up -r radix-ui@1.8.1` from the repo root
- Confirm both `package.json` ranges read `^1.8.1`; set them by hand only if `pnpm up` left
  either unchanged
- Verify the lockfile per 1.6.3
- Add the CHANGELOG entry per 1.6.1
- Commit: `fix(deps): bump radix-ui to 1.8.1 for the React 19 Select ref loop`

#### 2.1.2 Phase 2: Page check

- Add `demoLoop` to `_helpers.mjs` per 1.6.2; call it from `e.mjs` `'/'`
- Prove it red: `node scripts/check-pages.mjs e --base https://www.shadcn-table.com /`
  fails (production still serves v0.3.0)
- Prove it green against local `next start` on 4170 (gate 1 in 2.2)
- Commit: `test(docs): hold the home page through the demo loop`

#### 2.1.3 Final phase: Cleanup

- `pnpm format`
- Repo gates per 2.2
- Revert `lib:install` side effects; `git status` shows only the files in 1.4
- Open the PR into `claude/review` for CI; merge with a merge commit once green

### 2.2 Gates

1. Repro: docs `build`, then `next start -p 4170`;
   `node scripts/check-pages.mjs e --base http://localhost:4170 /` green: demo reaches
   Grouping on Radix UI and Base UI, hold at least 15 s each, zero page errors, zero console
   errors, no renderer crash
2. `pnpm check:bases`
3. Library, both bases (the library depends on `radix-ui`):
   `pnpm --filter shadcn-table tsc:radix` (TS5101 notice only), `tsc:baseui`, `lint`,
   `test` and `test:base` at 400/400 each
4. Docs: `pnpm --filter shadcn-table-docs types:check`, `lint`, `build`
5. Page checks: `check-pages.mjs a` and `e` against `next start` on 4170, all green
6. Installed copies: `pnpm --filter shadcn-table registry:build`, then
   `pnpm --filter shadcn-table-docs lib:install` and `lib:install:base`;
   `git status --short apps/docs/components/ui apps/docs/components/ui-base` is empty;
   side effects reverted
7. CI on the PR: docs, library and install jobs green
