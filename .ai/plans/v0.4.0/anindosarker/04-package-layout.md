# 04: package layout

Decision: [decisions.md](decisions.md) "Package" 1 to 3. Two complete library trees, the
shadcn repo folder layout, a CI guard instead of override resolution.

## Acceptance

- `packages/shadcn-table/registry/radix` and `registry/base` each contain the whole library
  (`components/ui/shadcn-table/**`), the base's shadcn parts (`components/ui/*.tsx`),
  `lib/utils.ts`, `index.css`, `components.json`, `registry.ts`. No `shared/`, no `bases/`.
- Opening any file of either tree in the editor resolves every `@/` import (every file is a
  root file of its tree's tsconfig project).
- `pnpm registry:build` writes the same items to `registry.json` and `public/r/` as before,
  with `files[].path` under `registry/<base>/`; install addresses unchanged.
- `scripts/registry/check-bases.mjs` passes on the moved tree and fails when a file outside
  the diff list differs between the trees or a listed file is missing from one.
- All gates green for both bases.

## Steps

1. **Move** (one commit, `git mv` only, no content changes):
   - `shared/components/ui/shadcn-table/**` to `registry/radix/components/ui/shadcn-table/`.
   - `bases/radix/{components,lib,index.css,components.json,registry.ts}` to
     `registry/radix/`.
   - `bases/base/{components/ui/*.tsx,lib,index.css,components.json,registry.ts}` to
     `registry/base/`; then copy the Radix library into `registry/base/components/ui/
     shadcn-table/` and let `git mv` of the 23 override files overwrite their copies, so
     each tree is complete.
   - `bases/README.md` to `registry/README.md` (rewritten in step 6).
   - `registry/*.mjs` and `lib.d.mts` to `scripts/registry/`; `scripts/check-storybook.mjs`
     stays.
2. **Diff list**: `scripts/registry/base-diff.json`, the 23 override paths relative to
   `components/ui/shadcn-table/` (listing from `git ls-files bases/base/components/ui/
   shadcn-table` before the move). `scripts/registry/check-bases.mjs`: every library file in
   `registry/radix` has a byte-identical twin in `registry/base` unless listed; every listed
   file exists in both; no library file exists in one tree only. Exit non-zero with the
   offending paths. Root `package.json` script `check:bases`; CI job `bases` runs it.
3. **Resolution**: `tsconfig.radix.json` `paths` `@/*` to `./registry/radix/*`, `include`
   `registry/radix`; `tsconfig.baseui.json` likewise for `registry/base`; the solution
   `tsconfig.json` references both plus `tsconfig.stories.json`, no `baseUrl`.
   `tsconfig.stories.json` extends radix and adds `stories`, `.storybook`. `vite.config.ts`:
   delete the `st-base-fallback` plugin and `resolveAlias`; `resolve.alias` `@` to
   `registry/<ST_BASE>`. `vitest.config.ts` and `.storybook/main.ts` keep reading `ST_BASE`
   from `vite.config.ts`.
4. **ESLint**: drop the `no-restricted-imports` rule that forbade relative imports inside the
   library (the reason, override resolution, is gone); library files may stay on `@/`
   imports, nothing is rewritten. Update ignore and glob paths.
5. **Registry scripts**: `lib.mjs` `baseItems` reads the tree's own files instead of merging
   shared and overrides; `build.mjs` imports `../../registry/<base>/registry.ts`; `hosted.mjs`,
   `examples.mjs`, `add-part.mjs` path constants; root `package.json` scripts
   `registry:items`, `registry:hosted`, `add-part` point at `scripts/registry/`.
   `registry.ts` comments updated.
6. **Docs of the layout**: `registry/README.md` (what lives where, how to change a common
   file: edit both trees, the guard tells you if you missed one; how to change a base-only
   file: edit it and keep it in `base-diff.json`), `CONTRIBUTING.md` layout block and
   commands, `.github/workflows/ci.yml` paths, docs app `lib/install.ts`,
   `lib/example-files.mjs`, `lib/example-pages.mjs`, `scripts/install-base.mjs` path
   constants (the installer itself is rewritten in 05).
7. Rebuild the registry, run every gate, commit per step.

## Not in scope

- Any library code change. `git diff --stat` of library files after the move shows renames
  only.
- A sync script. The guard only checks.
- The docs app UI folders (05) and the library internals (06).

## Gates

- `pnpm check:bases` green; then a deliberate one-line edit in one tree makes it red with
  the path, reverted.
- `tsc:radix`, `tsc:baseui`, stories tsc, `lint`, `test` and `test:base` 400/400,
  `storybook:build` and `storybook:build:base`, `check-storybook.mjs`.
- `pnpm registry:build`; `git diff packages/shadcn-table/registry.json` shows only path
  prefix changes; `apps/<docs>` `lib:install` and `lib:install:base` from the rebuilt
  registry produce no diff in the committed `components/ui*` folders.
- CI install matrix green on the branch.
- Editor check by the owner: open `registry/radix/.../body/ST_TableBody.tsx` and the Base UI
  twin, no red imports.
