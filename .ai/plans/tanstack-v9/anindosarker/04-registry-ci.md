# 04: registry, CI, install scenarios

## Goal

A fresh `shadcn add` of either item installs `@tanstack/react-table@9.3.1` and builds; CI is green
on `feat/tanstack-v9`.

## Steps

1. `pnpm registry:build` after phases 01 and 02: 76 items, both main items pin
   `@tanstack/react-table@9.3.1`; `shadcn registry validate` from the repo root: 3 files, 190
   items. Commit the regenerated `registry.json` files.
2. `.github/workflows/ci.yml`: install scenario `existing` adds `@tanstack/react-table@9.3.1`
   (the "project already has TanStack" case) and keeps the single-entry check; every install
   scenario asserts `node -e 'require("@tanstack/react-table/package.json").version'` starts
   with `9.`.
3. Scratch install proof from the dev registry (your port 5316 via `REGISTRY_BASE_URL`): Vite
   radix and base projects, `tsc -p tsconfig.app.json --noEmit` 0, `vite build` 0; one Next.js
   project if the R3 nextjs scenario exists on the branch base.
4. Add `feat/tanstack-v9` to the CI push trigger temporarily, push, read the run, fix until
   every job is green, remove the trigger in a final commit, push.
5. Commits: `chore(registry): tanstack v9 dependency`, `ci: install scenarios on tanstack v9`,
   `ci: temporary trigger` and its removal.
