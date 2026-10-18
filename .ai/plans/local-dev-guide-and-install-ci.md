# Local development guide, install CI, license

Status: planned 2026-10-19. Runs after the `shadcn-table` rename lands on `claude/review`
(branch `rename-st`). One agent, worktree, fast-forward onto `claude/review`, push.

Names below use the post-rename layout: `packages/shadcn-table`, `apps/shadcn-table-docs`,
registry address `anindosarker/shadcn-table/<item>`, docs at `https://shadcn-table.com`.

## 1. `CONTRIBUTING.md` as the single contributor guide

One file. `LOCAL_DEVELOPMENT.md` is deleted; its commands move here. Plain Markdown for GitHub:
numbered `##` headings carry the steps (no `<Steps>` MDX). Style reference:
`apps/shadcn-table-docs/content/docs/guides/production-ready-tables.mdx` (short lead, numbered
pieces, a text diagram, one line of why per step, bold-lead bullets, Common Mistakes, Related).
Every command is verified once from a clean shell after the rename before it is written down.

Audience: a contributor or an agent with a fresh clone. Goal: make a change, prove it, open a
PR. Excluded: release steps (the checklist owns them), Vercel, table internals.

Structure:

- **Lead.** Two sentences: what the repo is, what the library is (shadcn registry, source copied
  into the user's app, no npm package, Radix base only). Then the four pieces:
  1. **Library:** `packages/shadcn-table`, the source and its Storybook stories.
  2. **Tests:** Vitest runs the stories in Chromium.
  3. **Docs:** `apps/shadcn-table-docs`, holds an installed copy of the library.
  4. **Registry:** what users install, built from the library source.

  Text diagram:

  ```text
  packages/shadcn-table/src
    ▼ stories + vitest            (prove the change)
    ▼ registry:build              (what users install)
    ▼ lib:install                 (docs app copy)
  apps/shadcn-table-docs          (docs, examples, page gate)
  ```

- **Folder Layout.** Tree with one comment per entry: library source
  `src/components/ui/shadcn-table`, shadcn/ui parts, `stories/`, `scripts/build-registry.mjs`,
  `registry.json`; docs `components/ui/shadcn-table` (installed copy), `examples/`,
  `content/docs`, `registry.json` (example items), `scripts/check-pages.mjs`, `/SKILL.md` and
  `/llms.txt` routes; root `registry.json`, `skills/`, `vercel.json`, `.github/workflows/ci.yml`.
- **Prerequisites.** Node 22, pnpm 10.13.1, Chromium. Ports table (docs 5320, Storybook 6006,
  dev registry 5310). Optional env vars table (`NEXT_PUBLIC_SITE_URL`, `REGISTRY_BASE_URL`,
  `NEXT_DIST_DIR`, `PORT`).
- **Steps**, `## 1.` to `## 6.`, each one line of why, exact commands, bold-lead notes:
  1. **Set up:** clone, `pnpm install`, `pnpm --filter shadcn-table exec playwright install chromium`.
  2. **Change the library:** edit `src`, add or update a story, `storybook`, `test`, `tsc`, `lint`.
  3. **Sync the docs app:** `lib:install`, `git checkout -- app/global.css`, `dev` on 5320,
     `types:check`, page gate with cluster letters, the `tsconfig.json` include-noise note.
  4. **Prove the install:** `pnpm registry:dev`; fresh Vite app
     (`shadcn init --base radix --preset nova`, add `http://localhost:5310/r/shadcn-table.json`);
     existing app with `@tanstack/react-table` already installed; from a pushed branch with
     `anindosarker/shadcn-table/shadcn-table#<branch>`.
  5. **Update the docs:** `content/docs`, `examples/`, `registry:items` for example items; both
     generated `registry.json` files are committed and must keep GitHub addresses.
  6. **Open a PR:** the commands CI runs, in order; discuss large changes in an issue first;
     commit message style; no `git add -A`.
- **Common Mistakes.** Editing the docs copy instead of the library; forgetting `lib:install`;
  committing `tsconfig.json` include noise; `registry.json` rewritten with localhost (use
  `registry:dev`); a server on a port already in use; `shadcn init` without `--base radix`.
- **Related.** `.ai/plans/release-v0.1.md`, `.github/workflows/ci.yml`, the docs install page,
  `LICENSE`.

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
before merging. Each command in `CONTRIBUTING.md` run once from a clean shell. `LOCAL_DEVELOPMENT.md` removed and no file references it (grep).
