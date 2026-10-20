# 01: shared source and per-base overrides

Owns: `packages/shadcn-table/**` except `scripts/` and `registry.json` (phase 02).

## Steps

1. Import codemod: in `bases/radix/components/ui/shadcn-table/**` and
   `bases/base/components/ui/shadcn-table/**`, rewrite every relative import (`./x`, `../x`)
   to `@/components/ui/shadcn-table/<path from the shadcn-table root>`. Keep `@/components/ui/<part>`
   and `@/lib/utils` imports as they are. Node script, run once, deleted after; prettier after.
   Gate before moving anything: `tsc`, `tsc:base`, `test`, `test:base` still green (this step
   alone must not change behaviour).
2. `git mv bases/radix/components/ui/shadcn-table shared/components/ui/shadcn-table`. In
   `bases/base/components/ui/shadcn-table`, delete every file that is byte-identical to the
   shared copy (`cmp`); the 23 that differ stay as overrides (`ShadcnTable.tsx`,
   `ST_Tooltip.tsx`, `utils/style.utils.ts`, `toolbar/ST_TablePagination.tsx`,
   `toolbar/ST_ToolbarAlertBanner.tsx`, `toolbar/ST_LinearProgressBar.tsx`,
   `body/ST_TableDetailPanel.tsx`, `modals/ST_EditRowModal.tsx`,
   `head/ST_TableHeadCellFilterLabel.tsx`, `head/ST_TableHeadCellFilterContainer.tsx`,
   `menus/*` 7 files, `inputs/*` 6 files). `bases/radix/components/ui/shadcn-table/` is empty
   and does not exist until a Radix-only override is needed.
3. Resolution. `tsconfig.radix.json` (rename of `tsconfig.app.json`):
   `"paths": { "@/*": ["./bases/radix/*", "./shared/*"] }`, `include` `bases/radix`, `shared`,
   `stories`. `tsconfig.baseui.json` (rename of `tsconfig.base.json`): same with `bases/base`.
   `vite.config.ts`: replace the single `@` alias with a resolver plugin that tries
   `bases/<ST_BASE>` then `shared` (extensions `''`, `.ts`, `.tsx`, `/index.ts`,
   `/index.tsx`); keep `ST_BASE` handling. Vitest and Storybook inherit it; check
   `.storybook/main.ts` adds nothing that bypasses it. `tsconfig.stories.json` and
   `tsconfig.json` references updated.
4. Remove `bases/radix/package.json`, `bases/base/package.json`, `bases/radix/tsconfig.json`,
   `bases/base/tsconfig.json`. Parts are added with `registry/add-part.mjs` (phase 02); until
   then document the manual copy in `bases/README.md`.
5. ESLint: `no-restricted-imports` with `patterns: ['./*', '../*']` scoped to
   `shared/**` and `bases/*/components/ui/shadcn-table/**`, so the alias rule holds.
6. `bases/README.md`: what lives where, how to override a file (copy from `shared/` to the
   same path under `bases/<base>/components/ui/shadcn-table/`, edit, delete to fall back), the
   rule that an override must keep the shared callers' types compatible, how to add a part.
7. Scripts in `package.json`: `tsc:radix`, `tsc:baseui`, `tsc` (= `tsc:radix`),
   `tsc:base` kept as an alias of `tsc:baseui` for this PR (CI uses it; phase 03 or 04 updates
   CI and removes the alias). `test`, `test:base`, `storybook*` unchanged.
8. Gates: `pnpm --filter shadcn-table tsc:radix` 0, `tsc:baseui` 0, lint 0, `test` 400/400,
   `test:base` 400/400, `storybook:build` and `storybook:build:base` exit 0. Also: an
   intentional check that an override is picked (grep the Base UI Vitest run or a one-off
   script resolving `@/components/ui/shadcn-table/ST_Tooltip` under `ST_BASE=base` to
   `bases/base/...`).
9. Commits (pushed): `refactor(table): alias imports inside the library`,
   `refactor(table): shared source with per-base overrides`,
   `chore(table): per-base tsconfig names and fallback resolution`.

Phase 02 depends on step 2's layout; `scripts/build-registry.mjs` will be broken between
steps 2 and phase 02 on this branch (the registry agent fixes it; do not patch it here).
