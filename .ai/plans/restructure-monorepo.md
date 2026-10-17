# Monorepo restructure and registry distribution

Status: planned 2026-10-17, not started. Runs after the storybook plan.

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
- `pnpm dlx shadcn@latest build` writes `public/r/<name>.json`. Vite serves `public/`, so the dev server exposes `/r/<name>.json`.
- Users: `"registries": { "@srt": "https://shadcn-table.com/r/{name}.json" }` then `shadcn add @srt/shadcn-react-table`.
- `native-select` is not a fork: upstream ships `import { cn } from "cn"`, a placeholder the CLI rewrites. Only `checkbox` (indeterminate dash) is a real fork and ships inside the item with `target: "@ui/checkbox.tsx"`.

## Registry items

- `shadcn-react-table` (`registry:ui`): all library files except `locales/*` other than `en.ts`, plus forked `checkbox.tsx`.
  `registryDependencies`: button, dropdown-menu, collapsible, label, select, tooltip, spinner, slider, radio-group, popover, input-group, field, dialog, badge, switch, skeleton, separator, progress, pagination, native-select, input, command, alert.
  `dependencies`: `@tanstack/react-table@8.20.6`, `@tanstack/react-virtual@3.11.2`, `@tanstack/match-sorter-utils@8.19.4`, `highlight-words@2.0.0`, `class-variance-authority`, `lucide-react`. `devDependencies`: `tw-animate-css`.
- `shadcn-react-table-locale-<code>` x 37, one file each, `registryDependencies: ["shadcn-react-table"]`.
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
