# Plan: SRT_RowActionMenu ← MRT_RowActionMenu

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/menus/SRT_RowActionMenu.tsx`.
Garbage-zone; author fresh. Menu shell = shadcn DropdownMenu family + the
fixed-span anchorEl bridge (locked — see ActionMenuItem tracker entry; copy
the bridge wiring from the garbage file / SRT_ColumnActionMenu's shell).

## Resolved decisions

- Interface `extends DivProps { anchorEl: HTMLElement | null, handleEdit,
  row, setAnchorEl, staticRowIndex?, table }` (MRT extends Partial<MenuProps>;
  rest lands on DropdownMenuContent — extend
  `ComponentPropsWithRef<typeof DropdownMenuContent>` if cleaner; report
  which).
- menuItems useMemo VERBATIM (edit item gated on
  `parseFromValuesOrFunc(enableEditing, row) && ['modal','row'].includes(
  editDisplayMode!)`, EditIcon from registry, label localization.edit,
  onClick handleEdit; then renderRowActionMenuItems with closeMenu callback;
  empty → null). Keep MRT deps + authorized eslint-disable if flagged. MRT's
  `row as any` style casts — try without.
- Shell: DropdownMenu open={!!anchorEl} onOpenChange(open→false →
  setAnchorEl(null)); Trigger asChild → invisible fixed span positioned from
  anchorEl.getBoundingClientRect() (bridge); Content align per June, with
  `onClick={(e) => e.stopPropagation()}` on content (MRT parity) + {...rest}.
- MenuListProps mapping: `dense: density === 'compact'` → density-conditional
  content className (`[&>*]:py-1` when compact — per the dense ruling);
  menuBackgroundColor (mrtTheme, dropped) → DropdownMenuContent's own
  bg-popover (Note). disableScrollLock → dropped Note (radix default).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/menus/SRT_RowActionMenu.tsx`
--max-warnings=0. Only this file. No core, no git. parseFromValuesOrFunc only.
