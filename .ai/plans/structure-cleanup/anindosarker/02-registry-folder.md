# 02: one registry folder

Owns: `packages/shadcn-table/registry/**`, `packages/shadcn-table/scripts/**` (delete),
`packages/shadcn-table/registry.json`, `apps/<docs>/registry.json`,
`apps/<docs>/scripts/build-registry-items.mjs` (delete), root `package.json` scripts,
`apps/<docs>/package.json` scripts, `.github/workflows/ci.yml` script paths,
`CONTRIBUTING.md` registry section. Starts after phase 01 (needs `shared/`).

## Steps

1. `git mv` into `packages/shadcn-table/registry/`: `scripts/registry-lib.mjs` to `lib.mjs`
   (and its `.d.mts`), `scripts/build-registry.mjs` to `build.mjs`,
   `scripts/emit-hosted-registry.mjs` to `hosted.mjs`,
   `apps/<docs>/scripts/build-registry-items.mjs` to `examples.mjs`. Delete
   `scripts/diff-bases.mjs`. Fix every import and relative path.
2. `lib.mjs`: an item's files are `shared/components/ui/shadcn-table/**` minus the paths
   present in `bases/<base>/components/ui/shadcn-table/**`, plus those overrides, plus the
   forked parts and `index.css` rules as today. `path` fields: shared files as
   `shared/components/ui/shadcn-table/...`, overrides as `bases/<base>/components/ui/shadcn-table/...`;
   `target` unchanged (`components/ui/shadcn-table/...`). Locale items likewise.
3. `add-part.mjs`: `pnpm add-part <radix|base> <part>` fetches
   `https://ui.shadcn.com/r/styles/<style>/<part>.json` with the base's `components.json`
   style (`radix-nova`, `base-nova`), writes the files into `bases/<base>/components/ui/`,
   prints the item's `dependencies` and `registryDependencies` for the caller to add. Prove it
   by re-adding one existing part on each base and getting a zero diff.
4. Root `package.json` scripts: `registry:build` runs `build.mjs`, `registry:items` runs
   `examples.mjs`, `registry:hosted` runs `hosted.mjs`, `add-part`; remove `diff-bases`.
   Docs `package.json` `build` script and any `registry:*` entries point at the new paths.
   `.github/workflows/ci.yml`: replace the `diff-bases` job with nothing (the override folder
   is the diff), fix script paths in the registry job.
5. Regenerate: `pnpm registry:build`, `pnpm registry:items`, `shadcn registry validate` from
   the repo root: 3 files, 190 items. Diff the regenerated catalogs against the previous
   commit: only `path` fields change, every `target`, `dependencies`, `registryDependencies`,
   `css` identical. `pnpm registry:hosted`: `public/r/radix` 152 items, `public/r/base` 152,
   example JSON identical across the two dirs, base main item carries `@base-ui/react`.
6. Scratch install proof from the dev registry (your own port, 5340): Vite radix app with
   `shadcn-table` + one locale, Vite base app with `shadcn-table-base` + one locale; `tsc -p
   tsconfig.app.json --noEmit` 0, `vite build` 0; installed `components/ui/shadcn-table/`
   file list identical to a v0.2.0 install (92 files, same paths).
7. `CONTRIBUTING.md` registry and base sections: new paths, `pnpm add-part`, no `diff-bases`.
8. Commits: `refactor(registry): one registry folder`, `feat(registry): add-part script`,
   `chore(registry): regenerate catalogs`, `docs: contributing on the new layout`.
