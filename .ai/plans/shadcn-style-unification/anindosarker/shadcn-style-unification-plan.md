# shadcn style unification plan

Status: done 2026-10-18 (46334d9, 5794bf6, 978c597, 258c475, d042e18 and the docs library copy sync). Owner's go: "only update the library with
Radix Nova styling and remove all the older generational stuff".

Goal: one generation of shadcn parts everywhere. The library, its playground and the docs app
all use the current Radix parts (`radix-nova` style), the library's own class overrides are
verified against those parts, and the docs theme CSS is rebuilt from the shadcn init output
instead of hand-stitched blocks. Themes stay free (tokens and class strings in the user's parts);
library versions follow the primitive base only (Radix now; Base UI and React Aria are separate
future packages, out of scope).

## Starting point (measured 2026-10-18)

- `components.json` styles: `packages/shadcn-react-table` and `apps/test-shadcn` are `new-york`
  (installed before the nova generation existed); `apps/shadcn-react-table-docs` is `radix-nova`
  (`shadcn init` at ca7a8dc). Base color neutral, lucide icons, css variables everywhere.
- Library parts in `packages/shadcn-react-table/src/components/ui`: alert, badge, button, checkbox,
  collapsible, combobox (new, nova generation already), command, dialog, dropdown-menu, field,
  input-group, input, label, native-select, pagination, popover, progress, radio-group, select,
  separator, skeleton, slider, spinner, switch, table, textarea, tooltip. The library imports them
  from `@/components/ui/<part>` (button 19 files, dropdown-menu 7, collapsible 6, label 4, select 3,
  checkbox 3, the rest 1 to 2). `scripts/build-registry.mjs` derives `registryDependencies` from
  those imports; forked parts (`checkbox`, see `CHECKBOX_REL` in the script) ship inside the item.
- Library CSS `src/index.css`: old init output (`@theme inline` radius scale, `:root`/`.dark`
  tokens with `--radius: 0.625rem`), no `shadcn/tailwind.css` import, plus SRT keyframes
  (`srt-linear-progress-indeterminate`, `srt-collapsible-*`) and `.srt-progress-indeterminate`.
- Docs `app/global.css` (426 lines): tailwind, fumadocs `shadcn.css` and `preset.css`,
  tw-animate-css, `shadcn/tailwind.css`, six preset theme files `themes/*.css` (complete token
  sets under `:root[data-theme=...]`), `@custom-variant dark`, fumadocs chrome overrides (dashed
  seams, sidebar, content column, TOC, page bar, playground), an `@theme inline` block forcing
  `--radius-sm/md/lg/xl` to 3 to 4px "for code blocks, cards, callouts" plus the shadcn color
  bridge, a copied `:root`/`.dark` token block (`--radius: 0.25rem`), `@layer base`.
- Measured symptoms: select popup corners 4px (shadcn default 10px), viewport padding 0 (the
  current nova `select.tsx` carries `cn-menu-target cn-menu-translucent`, absent from all three
  copies and from the CSS), dropdown content sized to a 28px trigger in the docs part
  (`w-(--radix-dropdown-menu-trigger-width)`), item-aligned select placement.
- Verification available: library `pnpm --filter shadcn-react-table tsc`, `lint`, `test`
  (Vitest browser mode, 55 story files), `storybook:build`; docs `types:check`, full page gate
  (`node scripts/check-pages.mjs --base http://localhost:<port>`, 1417 checks, 0 failures at
  a697797), `build`; CI jobs library, test, docs, registry.

## 1. Library and playground on the current Radix parts

- `components.json` style `radix-nova` in `packages/shadcn-react-table` and `apps/test-shadcn`.
- Reinstall every part listed above with `pnpm dlx shadcn@latest add <parts> --overwrite` in
  both packages; the only local edit kept is the `cn` import path (`@/lib/utils`) when the CLI
  writes `from "cn"`. Forked parts: re-fork from the fresh nova copy and reapply the SRT change
  on top (diff the old fork against the old upstream first to know what the fork changed).
- `src/index.css` (library) and `apps/test-shadcn/src/index.css`: replace the init-era blocks
  with what `shadcn init` writes for nova (`@import "shadcn/tailwind.css"`, tokens, radius
  scale); keep the SRT keyframes and `@source`. Run `shadcn init` in a scratch copy to get the
  exact output rather than guessing.
- Library source: re-verify every `className` override that targets a part's internal markup
  (filter text field select trigger and input group, action menus, toolbar icon buttons,
  pagination, alert banner, show-hide columns menu, column actions button, grab handles). Fix
  only what the gates flag; the filter select gets `position="popper"`.
- Gates: `tsc`, `lint`, `test`, `storybook:build`, `registry:build`; Playwright pass over the
  playground stories that render menus, selects, filters and toolbars (the existing
  `apps/test-shadcn/.playwright/check-all-stories.mjs` or `check-storybook.mjs`).
- Commits: `chore: library parts on the radix-nova generation`, then one
  `fix: <component> overrides on nova parts` per component that needed changes.

## 2. Docs app

- Reinstall the same parts in `apps/shadcn-react-table-docs` with `--overwrite` (style already
  `radix-nova`), then `pnpm registry:build` and `pnpm --filter shadcn-react-table-docs
  lib:install` so the library copy matches section 1.
- `app/global.css` rebuilt: imports as today, then the nova init output verbatim (tokens, radius
  scale, color bridge, `@layer base`), the six theme files, then the fumadocs overrides kept as
  they are. The 3 to 4px radius block goes; the small corners it was written for move to the
  fumadocs selectors that need them (`#nd-page pre`, cards, callouts, sidebar items) with
  `rounded-md` style values, never the global scale. `--radius` comes from the nova output
  (0.625rem) and the presets.
- `lib:install` keeps rewriting `global.css` (escapes a `<style>` string); find the registry
  item's `css` entry that causes it and either make it idempotent or drop it from the item, so
  the install step stops touching the docs CSS.
- Gates: `types:check`, full page gate 0 failures, `build`, screenshots of the basic, filter
  variants, faceted values and custom filter UI pages at 1440 before and after.
- Commits: `docs: shadcn parts on the radix-nova generation`, `docs: theme css from the nova
  init output`.

## 3. Wrap-up

- ATTENTION file: a bullet naming the style the library is verified against and that the
  `base-nova` type errors are expected until a Base UI package exists.
- Install page: one sentence "built and tested against the radix-nova parts; other Radix
  themes work, Base UI and React Aria need the matching package (planned)".
- Push after each commit, CI green.

## Out of scope

Base UI and React Aria packages, new features, MRT parity content, theme presets redesign.
