# 01: R1, the Radix tree

Part of `v0.2-base-ui-plan.md`. One agent, worktree, branch `r1-radix-tree`, push only.

## Goal

`packages/shadcn-table/bases/radix/` is the single source of the Radix edition, with the library
files back to their v0.1.1 code (plus the v0.1.x fixes that landed after the tag and the
registry rename fix), no adapter layer anywhere. The `shadcn-table` registry item is the same as
v0.1.1 apart from file paths. Everything else in the package (stories, configs, scripts) runs
against that tree.

## Starting point (claude/review after phases 1 and 2, see overview "State")

- `src/components/ui/shadcn-table/primitives/{radix,base}/*` plus `primitives/<family>.tsx`
  re-exports through the package.json `imports` map (`#primitives/<family>`, condition
  `st-base`); 19 library files call the adapter API; `types.ts` re-exports adapter prop types.
- `base/components/ui/*` (Base UI parts, `cn` import fixed), `base/components.json`,
  `base/tsconfig.json`.
- `tsconfig.base.json`, `ST_BASE` resolve plugin in `vite.config.ts`, Vitest and Storybook
  conditions, scripts `tsc:base`, `test:base`, `storybook:base`, `storybook:build:base`.
- `scripts/build-registry.mjs` with `uiTarget` stripping `primitives/radix/`.
- Docs app copy in `apps/shadcn-table-docs/components/ui/shadcn-table` mirrors the adapter
  code.

## Steps

1. `git mv packages/shadcn-table/src/components bases/radix/components` and
   `src/index.css`, `src/main.tsx` (or whatever the Vite entry is) to `bases/radix/`. Add
   `bases/radix/components.json` (style `radix-nova`, aliases as the package had),
   `bases/radix/tsconfig.json` (aliases only) and a minimal `bases/radix/package.json`
   (`{"name": "shadcn-table-radix", "private": true}`) so `pnpm dlx shadcn add` works from that
   directory. Document the CLI command in CONTRIBUTING later (R3 owns docs).
2. Revert the adapters inside the tree: for each of the 19 files from `00-spike-findings.md`
   plus `types.ts`, start from the file at tag `v0.1.1`
   (`git show v0.1.1:packages/shadcn-table/src/components/ui/shadcn-table/<path>`), then
   re-apply the later non-adapter changes by diffing `v0.1.1..claude/review` for that file and
   keeping only hunks that are not the adapter move (the collapsible `data-open`/`data-closed`
   classes may stay, they are inert on Radix; the `ST_FilterCheckbox` `data-indeterminate`
   colours may stay). Delete `primitives/` entirely, the `imports` map and `#primitives`
   references, `tsconfig.base.json` paths, the base condition in Vite/Vitest/Storybook, the
   `:base` scripts (R2 re-adds them pointing at `bases/base`), and `base/` (R2 recreates it under
   `bases/base`; keep a copy of `base/components/ui` in the worktree's scratch for R2, or rely on
   git history, the R2 brief names the commit).
3. `tsconfig.app.json`, `vite.config.ts`, `vitest.config.ts`, `.storybook/main.ts`,
   `eslint.config.js`: paths to `bases/radix`. Alias `@/` resolves to `bases/radix`.
4. `scripts/build-registry.mjs`: read `bases/radix/registry.ts` (new file exporting the item
   definition: name, description, dependencies, registryDependencies, css, file list; mirror the
   shape of shadcn's `bases/<base>/registry.ts`), emit `shadcn-table` and the locale items from
   that tree. File `path` values point into `bases/radix/...`, `target` values unchanged
   (`@ui/shadcn-table/...`, `@ui/checkbox.tsx`). `pnpm registry:build` then `pnpm registry:items`.
5. Docs app: `pnpm --filter shadcn-table-docs lib:install` (the script points at the built
   `public/r/shadcn-table.json`; update the path if the build output moved), then
   `git checkout -- apps/shadcn-table-docs/app/global.css`. The docs copy must match the tree.
6. CONTRIBUTING, README, `skills/shadcn-table/SKILL.md`: only paths that changed
   (`packages/shadcn-table/src/...` to `bases/radix/...`). No other text changes; R3 owns docs.

## Acceptance

- `pnpm --filter shadcn-table tsc` 0 errors, `lint` clean, `pnpm test` 400 passed (55 files),
  `storybook:build` ok.
- `shadcn registry validate` from the repo root: 3 files, 152 items (the base item does not
  exist yet; locale items 38).
- Emitted `shadcn-table` item: `diff` against the v0.1.1 item (`git show v0.1.1:packages/shadcn-table/registry.json`,
  or rebuild it in a scratch checkout of the tag) shows only `path` changes plus the v0.1.x and
  `example-advanced` fixes; no `primitives` files.
- `grep -rn "primitives\|#primitives\|st-base" packages/shadcn-table --include=*.ts --include=*.tsx --include=*.json --include=*.mjs -l | grep -v node_modules` returns nothing.
- Docs: `types:check`, `lint`, `NEXT_DIST_DIR=.next-r1 build`, page gate `a` and `e` on the
  agent's docs server 0 failures.
- Real install into a scratch Radix Vite app from the dev registry: tsc 0, vite build 0.

## Commits

`refactor(table): radix tree under bases/radix`, `revert(table): adapter layer`,
`chore(registry): items from bases/radix/registry.ts`, `chore(docs): refresh library copy`.
