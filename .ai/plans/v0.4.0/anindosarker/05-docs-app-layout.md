# 05: docs app layout

Decision: [decisions.md](decisions.md) "Docs app" 1 and 2. Folder back to
`apps/shadcn-table-docs`, UI folders named per base, example source base-neutral with a
generated variant per base, one installer. Runs after [04](04-package-layout.md) (the
installer reads the registry from `registry/<base>/`) and after
[02](02-docs-weight.md) (shares `example-snippet.tsx`, `code-explorer.tsx`,
`example-variants.mjs`).

## Acceptance

- The app lives at `apps/shadcn-table-docs`; package name `shadcn-table-docs`; `vercel.json`
  `services.docs.root` updated; Vercel deploys from the new root.
- `components/ui-radix/` and `components/ui-base/` hold the installed library and parts; no
  `components/ui/` folder exists in the app.
- `examples/<slug>/` sources import `@/components/ui/...` and are what the code view shows
  on both bases; `examples/.radix/<slug>/` and `examples/.base/<slug>/` are generated,
  gitignored, and what the live example and the type check use.
- `pnpm lib:install radix` and `pnpm lib:install base` each reinstall one folder from the
  built registry with no diff when nothing changed in the library.
- Page checks pass, including the one that reads the code view: it now asserts
  `@/components/ui/` imports on both bases.

## Steps

1. **Folder rename**: `git mv apps/docs apps/shadcn-table-docs`. Update `vercel.json`,
   `.prettierignore`, `CONTRIBUTING.md`, `.github/workflows/ci.yml`,
   `scripts/registry/examples.mjs` and `hosted.mjs` output paths, `registry/README.md`, the
   GitHub URL builder in `example-snippet.tsx`, `apps/shadcn-table-docs/README.md`. One
   commit. Check the Vercel project root setting after the first deploy.
2. **UI folders**: `git mv components/ui components/ui-radix`; `components.json`
   `aliases.ui` to `@/components/ui-radix`; every app import of `@/components/ui/` outside
   `examples/` to `@/components/ui-radix/` (about 30 files under `content/docs`,
   `components/prop-tables`, `lib/prop-tables`, `components/dev-home`, `app/api`, plus the
   installed `ui-radix` files' own imports, which the CLI rewrites on reinstall). `eslint`
   ignores, `.prettierignore`, `tsconfig.json` entries follow.
3. **Installer**: `scripts/install.mjs <base>` replaces `scripts/install-base.mjs` and the
   `lib:install` npm script. It writes a temporary `components.json` with the base's style
   (`radix-nova` or `base-nova`) and `aliases.ui` `@/components/ui-<base>`, runs `shadcn add`
   for the library item and the locale items from `packages/shadcn-table/public/r/`, restores
   `components.json`, `app/global.css`, `package.json` and the lockfile, and prints what it
   wrote (as `install-base.mjs` does today). `lib:install` takes the base as its argument;
   `lib:install:base` goes away.
4. **Example variants**: `lib/example-variants.mjs` generates two variants per example from
   the base-neutral source: `.radix/` with `@/components/ui/` to `@/components/ui-radix/`
   only; `.base/` with the `ui-base` rewrite plus the existing `asChild` to `render`
   transform. Stale folders removed as today. `lib/example-variant-dir.mjs` exports both dir
   names.
5. **Consumers of the variants**: `components/example-variant.tsx` loads
   `@/examples/.radix/<name>/TS` and `.base/...`; `components/dev-home/shared/live-table.tsx`,
   `dev-home/v12/signal-table.tsx`, `dev-home/shared/outline-tiles.tsx` import from
   `.radix/`; `lib/example-source.ts` reads the base-neutral source for the code view on
   both bases (one `files` set, not per base); `example-snippet.tsx` keeps install command
   and prompt per base. `tsconfig.json` includes `examples/*/index.tsx`, `examples/.radix/**`,
   `examples/.base/**` and excludes the other source files under `examples/<slug>/` (their
   `@/components/ui/` imports resolve only inside the variants). `next build` compiles only
   what is imported, so sources are never bundled.
6. **Page checks**: `scripts/page-checks/_helpers.mjs` code-view assertion becomes "both
   bases show `@/components/ui/shadcn-table` imports and no `ui-radix` or `ui-base`"; the
   live example assertions unchanged.
7. **Registry example items** (`scripts/registry/examples.mjs`) read `examples/<slug>/`
   sources as today; they already ship `@/components/ui/` imports. Verify no change in
   `apps/shadcn-table-docs/registry.json` beyond the folder prefix.
8. Docs text: the install page, `CONTRIBUTING.md` docs section and `README.md` mention the
   new script and folders.

## Not in scope

- Changing which examples exist or their content.
- The library trees (04) and internals (06).
- Replacing the committed installed copies with path aliases (owner decision: keep installed
  copies).

## Gates

- Docs `types:check`, `lint`, `build`; `check-pages.mjs a` and `e` against `next start`.
- `pnpm lib:install radix` then `pnpm lib:install base` from a freshly built registry: `git
  status` clean apart from the intended moves.
- CI docs and install jobs green; Vercel preview from the branch serves the site from the
  new root (manual check of one page and `/r/radix/shadcn-table.json`).
- Playwright: on one example page, switch base; the live example re-renders on the other
  base, the code view still shows `@/components/ui/` imports, the install command shows the
  other base's item.
