# Plan: SRT_TableHeadCellFilterLabel ← MRT_TableHeadCellFilterLabel

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/head/SRT_TableHeadCellFilterLabel.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHeadCellFilterLabel.tsx`.
Garbage-zone; author fresh — EXCEPT the popover anchor bridge (see below).

## Resolved decisions

- Interface `extends ButtonProps { header, table }` (MRT extends IconButtonProps).
- Core utils: `getColumnFilterInfo`, `useDropdownOptions` (column.utils),
  `getValueAndLabel` (utils) — all exported from core; verify imports resolve,
  STOP if any is missing.
- `filterTooltip` string logic copied VERBATIM (all replace chains, the
  `filter${Capitalized}` localization key lookup, the `'" "'` cleanup).
- `isFilterActive`, `getSelectLabel`, `filterValue` cast — verbatim.
- MUI `Grow in={...} unmountOnExit` → plain conditional render
  `{<grow-condition> && <span ...>}` with the exact same condition; the Grow
  line itself becomes a dropped-construct comment + `// Note: MUI Grow
  transition dropped — conditional render keeps unmountOnExit semantics`.
- Wrapper `Box component="span" sx={{flex:'0 0'}}` → `<span className="shrink-0">`.
- Tooltip → `SRT_Tooltip placement="top" title={filterTooltip}`.
- IconButton → `<button type="button">`, cva `filterLabelVariants`: base
  `ml-1 h-4 w-4 p-2 scale-75 transition-all duration-150 inline-flex
  items-center justify-center` + variant `active: { true: 'opacity-100',
  false: 'opacity-30' }` (maps `opacity: isFilterActive ? 1 : 0.3`).
  `disableRipple` + `size="small"` → dropped-construct comments.
- onClick verbatim: popover mode → setAnchorEl(currentTarget); else
  setShowColumnFilters(true); queueMicrotask focus+select on
  `filterInputRefs.current?.[`${column.id}-0`]`; stopPropagation.
- Icon: `<FilterAltIcon size={16} />` from `table.options.icons`.
- **Popover mode**: shadcn Popover primitives with the LOCKED anchorEl→
  fixed-span bridge (this deviation is contract-locked; the garbage file's
  bridge wiring for Popover may be REUSED as reference — the one authorized
  garbage-consultation exception). Behavior mapping: `open={!!anchorEl}`,
  close → `setAnchorEl(null)`; MUI anchor/transform origins (anchor top-center,
  transform bottom-center) → `side="top" align="center"`; `onClick`
  stopPropagation on content; `onKeyDown` Enter closes; content wraps
  `<div className="p-4"><SRT_TableHeadCellFilterContainer header table /></div>`
  (garbage-zone import, as-is; STOP if its props reject header/table).
  `disableScrollLock` + `slotProps.paper overflow visible` → dropped-construct
  comments (radix popover doesn't scroll-lock; overflow handled by content).
- `{...rest}` spread on the button before className merge; className composes
  after spread via cn(variants, rest.className).

## Structure

Mirror MRT order throughout (destructures, filterValue, anchorEl state,
filter-info, dropdownOptions, getSelectLabel, isFilterActive, filterTooltip,
JSX fragment). Comments: only the dropped-construct notes listed above.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHeadCellFilterLabel.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
