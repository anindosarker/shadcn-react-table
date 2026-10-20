# 03: R3, registry, docs, CI

Part of `v0.2-base-ui-plan.md`. Starts after R2 is merged. Sub-tasks run in parallel worktrees
where they touch different files; the lead merges in the order listed. Push only.

Inputs: branch `v02-registry` (ee6a768..67149f9) holds a first pass of items 3a, 3c, 3d, 3e
written against the adapter layout; reuse its docs text and CI shape, not its registry script
changes. Its last commit left `v02-registry` in the CI push trigger; do not carry that.

## 3a. Registry build (library, `scripts/build-registry.mjs`)

- Emits from both `registry.ts` files: `shadcn-table` + 38 `shadcn-table-locale-<code>` from
  `bases/radix`, `shadcn-table-base` + 38 `shadcn-table-base-locale-<code>` from `bases/base`.
  Each locale item depends on its own main item.
- `apps/shadcn-table-docs/scripts/build-registry-items.mjs`: example items base-neutral (no
  `registryDependencies` on a main item; they use the public API only).
- Output for hosting (3b): `shadcn build` twice into `apps/shadcn-table-docs/public/r/radix/`
  and `public/r/base/` (gitignored, built in the docs `build` script before `next build`), each
  with its own `registry.json` catalog; the root `registry.json` keeps the GitHub form.
- `shadcn registry validate` from the repo root: 3 files, 152 + 39 items.

## 3b. Hosted registry (docs app)

- Docs `build` script: `pnpm registry:build && pnpm registry:items && <emit public/r/radix and public/r/base> && next build`.
- `next.config.mjs` rewrites: `/r/:style(radix-.*)/:name.json` to `/r/radix/:name.json`,
  `/r/:style(base-.*)/:name.json` to `/r/base/:name.json`, so the namespace form
  `@st=https://www.shadcn-table.com/r/{style}/{name}.json` works for every shadcn style.
- Verify after deploy: `shadcn add https://www.shadcn-table.com/r/radix/shadcn-table.json`
  and `/r/base/...` in scratch apps; `shadcn registry add @st=...` then `shadcn add @st/shadcn-table`
  in both a `radix-nova` and a `base-nova` app.

## 3c. Docs base selector and examples (docs app)

- Site-wide selector: fumadocs `Tabs` group `base` (items Radix | Base UI), persisted like the
  package-manager group; a control in the site header and on the install page. One group,
  every tab with it switches.
- Commands follow it: `lib/install.ts` builds init (`--base radix` / `--base base`), add (direct
  URL `https://www.shadcn-table.com/r/<base>/shadcn-table.json`), locale and example commands
  per base; namespace form shown as the alternative.
- Rendered examples: second library copy `apps/shadcn-table-docs/components/ui-base/` (Base UI
  parts and table) via `lib:install:base`; a build script generates `examples/.base/<slug>/*`
  from each example by rewriting `@/components/ui/` imports to `@/components/ui-base/`
  (gitignored); `<Example>` lazy-loads the variant for the selected base.
- Code view shows the selected base's variant source (import paths differ); copy button and
  file tree read the same files.
- `global.css` carries both keyframe sets.
- Page checks: install page shows both commands and the tab switches them; an example page
  renders on both bases (switch, wait for `table tbody tr`, no console errors).

## 3d. Agent prompt, skill, docs text

- `skills/shadcn-table/SKILL.md`: base detection rule (read `components.json` `style`;
  `radix-*` adds `/r/radix/...`, `base-*` adds `/r/base/...`; no `components.json`: run
  `shadcn init` first and ask the user for the base); same rule for locale and example items;
  GitHub addresses as fallback. The copy prompt text does not change with the selector.
- Install page, agents page, README, `CONTRIBUTING.md` (two-tree rule: a library change is one
  PR touching both trees or says why not; the base loop: `test:base`, `storybook:base`,
  `shadcn add` from `bases/<base>`; `diff-bases`), localization guide (per-base locale item
  names).

## 3e. CI

- `install` matrix `[fresh, existing, base, nextjs]`: `nextjs` is `shadcn init --template next --base radix --preset nova`
  (or `create-next-app` plus `shadcn init`), add the library, mount a table in a client
  component and import the page from a server component, `next build` must pass. If `'use client'`
  is missing from library files that run hooks, add it to the source files that need it in both
  trees (report which).
- Type-check in every scenario: `pnpm tsc -p tsconfig.app.json --noEmit` (Vite) or `next build`.
- `diff-bases` job: `node packages/shadcn-table/scripts/diff-bases.mjs` lists files differing
  between the trees beyond the allowlist in the script; non-blocking (`continue-on-error`),
  output in the job summary.
- Library and test matrix from R2 unchanged.

## 3f. Storybook for both trees (one host)

- `pnpm storybook:build` produces `storybook-static/` (Radix) and `storybook:build:base`
  produces `storybook-static/base/` (set the base build's output dir accordingly, or copy after
  build). `vercel.json` service `storybook` builds both: `buildCommand`
  `pnpm storybook:build && pnpm storybook:build:base`, output `storybook-static`.
- Storybook title or a toolbar label says which base is shown; the docs "View Extra Storybook
  Examples" links point at `/` or `/base/` per the selector.

## Acceptance (merged tree)

Library: `tsc`, `tsc:base`, `lint`, `pnpm test` 400, `test:base` 400, both Storybook builds.
Registry validate 3 files, 152 + 39 items. Docs: `types:check`, `lint`, `build` (with the
hosted registry emitted), page gate `a` and `e` 0 failures. CI green on `claude/review`
including the four install scenarios and both Storybook builds. Scratch installs from the dev
registry for both bases: tsc 0, build 0, Playwright smoke green.

## Commits

One concern per commit, prefixed `feat(registry)`, `feat(docs)`, `docs`, `ci`, `chore(storybook)`.
