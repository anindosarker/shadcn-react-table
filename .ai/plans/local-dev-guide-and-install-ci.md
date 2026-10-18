# Local development guide, install CI, license

Status: planned 2026-10-19. Runs after the `shadcn-table` rename lands on `claude/review`
(branch `rename-st`). One agent, worktree, fast-forward onto `claude/review`, push.

Names below use the post-rename layout: `packages/shadcn-table`, `apps/shadcn-table-docs`,
registry address `anindosarker/shadcn-table/<item>`, docs at `https://shadcn-table.com`.

## 1. `LOCAL_DEVELOPMENT.md` rewrite

Audience: a contributor (or an agent) who has cloned the repo. Goal: understand the layout,
run every loop, prove a change end to end. Commands stay exact; prose explains why, short.

Sections, in order:

1. **What this repo is.** Two packages. The library ships as a shadcn registry: the shadcn CLI
   copies the source into the user's app under `components/ui/shadcn-table/`. There is no npm
   package. Radix base only.
2. **Monorepo structure.** Tree with one line per entry:
   `packages/shadcn-table` (library source `src/components/ui/shadcn-table`, shadcn/ui parts it
   uses, `stories/`, Vitest browser tests, `scripts/build-registry.mjs`, `registry.json`),
   `apps/shadcn-table-docs` (Next 16 + fumadocs, installed copy of the library in
   `components/ui/shadcn-table`, `examples/`, `content/docs`, example registry items
   `registry.json`, `scripts/check-pages.mjs` page gate, `/SKILL.md` and `/llms.txt` routes),
   root `registry.json` (includes both), `skills/shadcn-table/SKILL.md`, `vercel.json`
   (services `docs` and `storybook`), `.github/workflows/ci.yml`, `.ai/plans` (history).
3. **How development works.** Edit `packages/shadcn-table/src`. Storybook is the test bed:
   every feature has stories, Vitest runs them in Chromium. The docs app holds a copy of the
   library, resync it with `lib:install` after library changes. The registry build plus an
   install into a consumer app is the final proof; the docs app does not prove the install path.
4. **Prerequisites.** Node 22, pnpm 10.13.1 (`packageManager`), Chromium through
   `playwright install chromium`. Ports: docs 5320, Storybook 6006, dev registry 5310.
   Optional env: `NEXT_PUBLIC_SITE_URL`, `REGISTRY_BASE_URL`, `NEXT_DIST_DIR`, `PORT`.
5. **Setup.** Clone, `pnpm install`, `pnpm --filter shadcn-table exec playwright install chromium`.
6. **Library loop.** `storybook`, `test`, `tsc`, `lint`. Where stories live, how to add one.
7. **Docs loop.** `dev` on 5320, `lib:install` then `git checkout -- app/global.css`,
   `types:check`, `build`, page gate `node scripts/check-pages.mjs --base http://localhost:5320`
   with the cluster letters, the `tsconfig.json` include noise note.
8. **Registry loop.** `pnpm registry:dev` (serves `.dev/r` on 5310), fresh consumer app
   (Vite, `shadcn init --base radix --preset nova`, `shadcn add http://localhost:5310/r/shadcn-table.json`),
   existing app (same with `@tanstack/react-table` already installed), install from a pushed
   branch (`anindosarker/shadcn-table/shadcn-table#<branch>`), what `registry:build` and
   `registry:items` regenerate and that both outputs are committed.
9. **Before a PR.** The exact commands CI runs, in order. Link `.ai/plans/release-v0.1.md`.

Keep the current file's commands as the source of truth; verify each one still runs after the
rename before writing it down.

## 2. Install tests in CI

New job `install` in `.github/workflows/ci.yml`, `needs: registry`, push only (needs the SHA on
GitHub), `GH_TOKEN` as in `registry`. A matrix with two scenarios, each in a temp dir outside the
repo:

- `fresh`: `pnpm create vite app --template react-ts`, `pnpm install`,
  `pnpm dlx shadcn@latest init --base radix --preset nova --yes` (confirm the exact
  non-interactive flags for shadcn 4.22; `--yes` and `--defaults` exist, check `--help`),
  `pnpm dlx shadcn@latest add anindosarker/shadcn-table/shadcn-table#${{ github.sha }} --yes`,
  then one locale item and `example-basic` the same way, mount the example in `App.tsx`,
  `pnpm tsc --noEmit`, `pnpm vite build`.
- `existing`: same, but `pnpm add @tanstack/react-table@8.20.5 @tanstack/react-query` before
  the add. Proves the CLI merges with pre-existing TanStack packages. Assert `tsc` and the build
  pass and that `package.json` has one `@tanstack/react-table` entry.

Example items pin the library dependency to `gitConfig.branch`; until that is `master`, the
example add must also work with the SHA ref. If it cannot (dependency resolves at the branch),
add the library first and the example second, which is the order above.

Cost: about 3 minutes per scenario. No Base UI or React Aria scenario; both documented as
unsupported.

## 3. License

`LICENSE`: keep the MIT text and the existing line `Copyright (c) 2022 Kevin Vandy` (the MRT
notice must stay). Add `Copyright (c) 2026 Anindo Sarker` above it. `license` field in both
`package.json` files: `MIT`. README license section already says MIT and credits MRT.

## 4. README pass

After the rename: docs link `https://shadcn-table.com`, Storybook link
`https://storybook.shadcn-table.com`, a short feature list (sorting, filtering, grouping,
pinning, editing, virtualization, row selection, column ordering, 38 locales), the install
block unchanged. No badges that imply an npm package.

## Verification

`pnpm --filter shadcn-table tsc`, `lint`, `pnpm test`, docs `types:check` and `build`,
`act`-free check of the workflow: push the branch and read the `install` job result on GitHub
before merging. Each command in `LOCAL_DEVELOPMENT.md` run once from a clean shell.
