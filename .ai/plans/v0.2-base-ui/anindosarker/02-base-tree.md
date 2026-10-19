# 02: R2, the Base UI tree

Part of `v0.2-base-ui-plan.md`. One agent, worktree, branch `r2-base-tree`, from `claude/review`
after R1 is merged. Push only.

## Goal

`packages/shadcn-table/bases/base/` is the Base UI edition: a complete copy of the Radix tree
with the files that touch primitives rewritten in plain Base UI code, plus the Base UI shadcn
parts. The shared `stories/` suite passes on both legs with no assertion changes. No file in
either tree imports from the other.

## Inputs

- `bases/radix/` from R1.
- Base UI parts and checkbox fork: the phase 2 `base/components/ui/*` as of commit `bddbcc9`
  on `claude/review` (`git show bddbcc9:packages/shadcn-table/base/components/ui/<part>.tsx`).
  23 parts plus `textarea.tsx`, `cn` imported from `@/lib/utils`.
- Base UI implementations of the deltas: the phase 2 adapters at `bddbcc9`,
  `packages/shadcn-table/src/components/ui/shadcn-table/primitives/base/{tooltip,menu,select,checkbox,slider,popover,slot}.tsx`.
  Reference only; the code is inlined into the library files, not kept as a layer.
- `00-spike-findings.md` for the file list and each delta.
- `/Users/anindosarker/Work/Personal/React-table/.agents/skills/migrate-radix-to-base/*.md`
  for the prop tables.

## Steps

1. `bases/base/components/ui/*` from the inputs; `bases/base/components.json` (style
   `base-nova`), `tsconfig.json`, minimal `package.json` like R1.
2. `bases/base/components/ui/shadcn-table/**`: copy of `bases/radix/components/ui/shadcn-table/**`
   including locales.
3. Rewrite in place, plain Base UI code against the Base UI parts (same exported names as the
   Radix parts, different props):
   - `ST_Tooltip.tsx`, `ShadcnTable.tsx`, `utils/style.utils.ts`: Provider `delay`, Root
     `disableHoverablePopup`, Trigger `render`; per-tooltip delay via a wrapping Provider where
     the Radix code used `delayDuration`.
   - `menus/ST_ColumnActionMenu.tsx`, `ST_ShowHideColumnsMenu.tsx`, `ST_RowActionMenu.tsx`,
     `ST_CellActionMenu.tsx`, `ST_FilterOptionMenu.tsx`, `ST_ShowHideColumnsMenuItems.tsx`,
     `ST_ActionMenuItem.tsx`: trigger `render`, item `onClick`, `closeOnClick` set explicitly
     per item (false on the show/hide switches), focus return via the popup `finalFocus`
     (Base UI 1.9.0 never fires `onOpenChangeComplete(false)` for menus).
   - `inputs/ST_FilterTextField.tsx`, `toolbar/ST_TablePagination.tsx`,
     `inputs/ST_EditCellTextField.tsx`: `alignItemWithTrigger={false}` where Radix used
     `position="popper"`, `onValueChange(value: string | null)` guards, `""` to `null` for the
     placeholder.
   - `inputs/ST_FilterCheckbox.tsx`, `inputs/ST_SelectCheckbox.tsx`: `indeterminate` prop,
     `onCheckedChange(checked, details)`, radio via `Radio.Root`, click handler types.
   - `inputs/ST_FilterRangeSlider.tsx`: `onValueCommitted`, array value shape.
   - `head/ST_TableHeadCellFilterLabel.tsx`: `Popover.Positioner anchor={anchorEl}` (the base
     `PopoverContent` wrapper does not forward `anchor`; compose the primitive parts directly).
   - `toolbar/ST_ToolbarAlertBanner.tsx`: Badge `render`.
   - `modals/ST_EditRowModal.tsx`: forward `(open, details)`; `toolbar/ST_LinearProgressBar.tsx`:
     `value ?? null`.
   - Collapsible users (`ST_ToolbarAlertBanner`, `ST_LinearProgressBar`, `ST_TableDetailPanel`,
     `ST_TableHeadCellFilterContainer`, `ST_GlobalFilterTextField`): `data-open`/`data-closed`
     classes and keyframes on `--collapsible-panel-height` / `--collapsible-panel-width` in the
     tree's `index.css` (the Radix selectors are removed in this tree, not kept side by side).
   - `types.ts`: public `CheckboxProps`, `RadioProps`, `SliderProps`, `DialogProps`,
     `TooltipProps` typed from the Base UI parts, same names.
   - Comments mentioning Radix behavior get the Base UI fact instead.
4. Test config only: `ST_BASE=base` alias `@/` to `bases/base` in `vite.config.ts`,
   `vitest.config.ts`, `.storybook/main.ts` (a resolve plugin, not a regex alias: rolldown took
   `$2` literally in phase 2), `tsconfig.base.json` with the paths; scripts `tsc:base`,
   `test:base`, `storybook:base` (port 6007), `storybook:build:base` (output
   `storybook-static-base`, gitignored).
5. Base-specific stories only if a behavior differs on purpose: `<name>.base.stories.tsx`
   included on the base leg only, `<name>.radix.stories.tsx` likewise. Expected: none.
6. `bases/base/registry.ts`: item `shadcn-table-base` (dependencies: `@base-ui/react` instead
   of `radix-ui`, same 23 bare registryDependencies, same css and devDependencies), locale items
   `shadcn-table-base-locale-<code>` depending on `shadcn-table-base`. `build-registry.mjs`
   reads both trees. R3 owns the hosted copies and docs.

## Acceptance

- `tsc:base` 0 errors, `test:base` 400 passed with `stories/` unchanged, `storybook:build:base`
  ok; Radix leg unchanged (400, builds).
- `grep -rn "bases/radix\|radix-ui" packages/shadcn-table/bases/base` returns nothing;
  `grep -rn "base-ui\|bases/base" packages/shadcn-table/bases/radix` returns nothing.
- Playwright on the base Storybook: show/hide switch keeps the menu open, Escape returns focus
  to the trigger; range slider filters rows; select-all after one row is `aria-checked="mixed"`
  with the minus icon; tooltip appears after the configured delay and the trigger is a single
  `<button>`; popover filter anchored to the filter button; detail panel and alert banner
  animate (height changes over several frames).
- `shadcn registry validate`: 3 files, 152 + 39 items.
- CI: `library` and `test` matrix over `radix` and `base` green (the matrix exists; point the
  base leg at the new scripts).
- `diff -r bases/radix bases/base` lists only the files named in step 3, `components/ui/*`,
  `components.json`, `index.css`, `registry.ts`, `package.json`.

## Commits

`feat(table): base ui tree under bases/base`, `chore(table): ST_BASE test config`,
`chore(registry): shadcn-table-base item`, `ci: base leg on bases/base`.
