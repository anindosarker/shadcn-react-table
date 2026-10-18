# Monorepo restructure and registry distribution

Status: steps 1 to 4 done 2026-10-17. Step 1 commit caf42f9 (move library to packages/shadcn-react-table). Step 2 is commit 3b41fc1's predecessor (remove material-react-table monorepo leftovers). Step 3 commit bc8a4f6 plus the commit carrying this status line (build-registry script, registry.json, shadcn ^4.22 devDependency). Step 4 install test passed 2026-10-17 in a scratchpad Vite app: shadcn add by URL, de locale by URL, tsc, vite build, Playwright 5 rows, no page errors; nothing committed from it. Caveats: shadcn v4 `init` must use `-b radix -p nova` (default base is Base UI, the library imports radix-ui); locale items depend on the main item by URL (bare names resolve to shadcn/ui), base URL baked in at build time via REGISTRY_BASE_URL. Step 5 not started.

## Target layout

```
shadcn-react-table/
├── packages/
│   ├── shadcn-react-table/                  the library, a shadcn registry project, never on npm
│   │   ├── package.json                     scripts: registry:build, storybook, lint, tsc, review
│   │   ├── components.json                  aliases @/ -> src
│   │   ├── registry.json                    generated, committed
│   │   ├── tsconfig.json  eslint.config.js
│   │   ├── .storybook/  stories/            moved from apps/test-shadcn
│   │   ├── scripts/build-registry.mjs  scripts/review-defs.mjs
│   │   ├── public/r/                        shadcn build output, gitignored
│   │   └── src/
│   │       ├── lib/utils.ts
│   │       ├── components/ui/               25 stock parts + forked checkbox.tsx
│   │       └── components/ui/shadcn-react-table/   the library files, layout unchanged
│   └── material-react-table/                read-only spec for the review tooling; delete when the review ends
├── apps/
│   ├── shadcn-react-table-docs/             Next.js + fumadocs, shadcn-table.com
│   │   ├── public/r/                        copied from the package at build
│   │   └── src/components/ui/shadcn-react-table/   installed via shadcn add from its own /r
│   └── test-shadcn/                         vite playground: demos, .playwright suites
│       ├── vite.config.ts                   alias @/components/ui/shadcn-react-table -> ../../packages/shadcn-react-table/src/components/ui/shadcn-react-table
│       ├── tsconfig.app.json                same path mapping
│       └── src/                             own ui parts (incl. forked checkbox), demos, App.tsx
```

Delete: `apps/test-cra`, `apps/test-remix`, `apps/test-vite`, `apps/material-react-table-docs`, `packages/shadcn-react-table-cli`, `upgrade-examples.sh`.

## Why

- The library folder keeps the path `src/components/ui/shadcn-react-table` inside the package, so `@/components/ui/button` and `../types` resolve unchanged and the source tree equals the install result. Only `target` in `registry.json` matters to users.
- test-shadcn aliases the package source, so library edits hot reload. The library's `@/components/ui/*` imports resolve against test-shadcn's own parts.
- The docs app installs from the registry build. That is the real install test.
- Stories stay with the library (MRT keeps its stories in the package). Playwright stays with the demos.

## Registry facts (checked against ui.shadcn.com/docs/registry, 2026-10-17)

- `files[].target: "@ui/shadcn-react-table/head/SRT_TableHeadCell.tsx"` keeps nested folders under the user's `ui` alias.
- `registryDependencies` take shadcn names, `@ns/name`, or URLs. `dependencies` take `name@version`.
- `shadcn build` (docs use `pnpm dlx shadcn@latest build`; the package pins `shadcn` ^4.22 as a devDependency) reads `registry.json` at the package root and writes `public/r/<name>.json`. Vite serves `public/`, so the dev server exposes `/r/<name>.json`.
- `registryDependencies` bare names always mean shadcn/ui items, so the locale items reference the main item by URL `https://shadcn-table.com/r/shadcn-react-table.json`; `REGISTRY_BASE_URL=http://localhost:<port>/r` rebuilds for a local install test.
- `css` on the item ships the `srt-*` keyframes and the `.srt-progress-indeterminate` rule from `src/index.css`; the CLI writes `@keyframes` into `@theme inline` and plain rules at top level, both end up in the built CSS (checked 2026-10-17).
- shadcn v4 `init` defaults to Base UI. Users (and the docs app) need `shadcn init -b radix -p nova` (new-york look, neutral, css variables) because the library and the forked checkbox import `radix-ui`.
- Users: `"registries": { "@st": "https://shadcn-table.com/r/{name}.json" }` then `shadcn add @st/shadcn-table`.
- `native-select` is not a fork: upstream ships `import { cn } from "cn"`, a placeholder the CLI rewrites. Only `checkbox` (indeterminate dash) is a real fork and ships inside the item with `target: "@ui/checkbox.tsx"`.

## Registry items

- `shadcn-react-table` (`registry:ui`): all library files except `locales/*` other than `en.ts`, plus forked `checkbox.tsx`.
  `registryDependencies`: button, dropdown-menu, collapsible, label, select, tooltip, spinner, slider, radio-group, popover, input-group, field, dialog, badge, switch, skeleton, separator, progress, pagination, native-select, input, command, alert.
  `dependencies`: `@tanstack/react-table@8.20.6`, `@tanstack/react-virtual@3.11.2`, `@tanstack/match-sorter-utils@8.19.4`, `highlight-words@2.0.0`, `class-variance-authority`, `lucide-react`, `radix-ui` (forked checkbox imports it). `devDependencies`: `tw-animate-css`. Pinned versions come from the package's package.json; the rest stay unversioned so the CLI keeps the user's installed version (tested with lucide-react 1.58 and radix-ui 1.8).
- `shadcn-react-table-locale-<code>` x 37, one file each, `registryDependencies: ["https://shadcn-table.com/r/shadcn-react-table.json"]`.
- `scripts/build-registry.mjs` generates `registry.json` from a glob. Never hand-maintain the file list.

## Steps

1. `git mv apps/test-shadcn packages/shadcn-react-table`; recreate `apps/test-shadcn` as the thin playground (demos, App.tsx, .playwright, own ui parts) with the alias above. Keep every intermediate state buildable: tsc, eslint, vite build, storybook build.
2. Delete the MRT leftovers listed above. Update `turbo.json`, `pnpm-workspace.yaml`, `.ai/**` paths, `scripts/review-defs.mjs`, the tracker, and memory files.
3. Add `components.json`, `scripts/build-registry.mjs`, `registry:build` script; commit `registry.json`.
4. Install test: fresh Vite app in the scratchpad, `shadcn init`, `shadcn add http://localhost:<port>/r/shadcn-react-table.json`, mount one table, tsc and vite build pass, Playwright opens it. Repeat with one locale item.
5. `apps/shadcn-react-table-docs`: Next.js + fumadocs, copy `public/r` at build, install the library from its own `/r`, deploy to shadcn-table.com.

## Open

- `index.ts` and the `types.ts` doc comment still mention `material-react-table/locales/*`; fix in the step 1 commit.
- Playwright suites in `.playwright` are gitignored; un-ignore and commit with step 1.
