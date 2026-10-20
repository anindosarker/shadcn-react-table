# 00: Spike findings (Radix item inside a Base UI app)

Part of `v0.2-base-ui-plan.md`. Read-only reference for R1 to R3.

## Findings (2026-10-19, scratch app in the session scratchpad `base-spike/`)

Setup: shadcn 4.22.1, `base-nova`, `@base-ui/react@1.9.0`, the Radix `shadcn-table` item plus a
locale and seven examples. tsc 64 errors from 13 root causes in 15 library files (31 are one
cascade from `ST_Tooltip.tsx`); runtime zero console or page errors, four behaviors wrong.

Adapter families, corrected: six, not five. `popover` joins (Base UI has no `PopoverAnchor`;
`ST_TableHeadCellFilterLabel` imports it, hard build break). Two base-neutral one-line fixes
instead of adapters: `dialog` (`ST_EditRowModal` forwards `(open, details)` to `onOpenChange`)
and `progress` (`?? null`). Files per family: tooltip 3 (`ST_Tooltip`, `ShadcnTable`,
`utils/style.utils.ts`), menu 6 (the five menus plus `ST_ShowHideColumnsMenuItems`), select 3
(`ST_FilterTextField`, `ST_TablePagination`, `ST_EditCellTextField`), checkbox and radio 3
(`ST_FilterCheckbox`, `ST_SelectCheckbox`, `types.ts`), slider 2 (`ST_FilterRangeSlider`,
`types.ts`), popover 1. 19 unique files.

Deltas per family: tooltip `asChild` to `render`, `delayDuration`/`skipDelayDuration` to Provider
`delay`, `disableHoverableContent` to Root `disableHoverablePopup`; menu `onCloseAutoFocus` to
`finalFocus`, trigger `asChild` to `render`, `onSelect` plus `preventDefault` to
`closeOnClick={false}` (show/hide columns menu closes on every toggle today); select
`position="popper"` to `alignItemWithTrigger={false}` (popup overlaps the trigger today), null
guard on `onValueChange`; checkbox `checked="indeterminate"` to the `indeterminate` prop
(renders as checked with invalid `aria-checked="indeterminate"` today), `onCheckedChange`
arity, the `CheckboxProps | RadioProps` cast in `ST_SelectCheckbox`; slider `onValueCommit` to
`onValueCommitted` (range filter never applies today), value shape; popover `PopoverAnchor` to
Positioner `anchor` (the base `PopoverContent` wrapper does not forward it, the adapter renders
its own Positioner). `asChild` appears in 7 files on `master` (tooltip, 5 menus,
`ST_ToolbarAlertBanner` Badge); the CLI rewrites element children to `render` on base installs
but drops it for `{children}` expressions, so the adapters own `render` themselves.

Other findings:
- The item ships `checkbox.tsx` as a forked file (minus icon for indeterminate) with a Radix
  import; a Base UI app gets a Radix checkbox and `radix-ui` in its `package.json`. The base
  item needs a Base UI fork (`data-indeterminate`), both forks ship from the item.
- Public types `CheckboxProps`, `RadioProps`, `SliderProps`, `DialogProps` in `types.ts` are
  `ComponentPropsWithRef<typeof Part>`; the adapters export base-neutral prop types instead.
- `combobox` and `command` are already Base UI based on both styles; bare dependencies, no change.
- Tooltip delay: Base UI has no skip-delay; set Provider `delay` in the base adapter, accept no
  skip grouping.
- Registry bug on every base: `example-advanced` ships `makeData.ts` importing `./TS` while the
  example file is renamed to `advanced.tsx` on install; tsc and build fail. Fix in
  `scripts/build-registry-items.mjs` (rewrite `./TS` imports to the renamed file) and verify
  every example with a `makeData.ts`.
- Install CI runs `pnpm tsc --noEmit` at the Vite template root, where the root tsconfig has
  `files: []`, so it checks nothing. Use `tsc -p tsconfig.app.json --noEmit`.
