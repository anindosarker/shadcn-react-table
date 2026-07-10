# Plan: SRT_CellActionMenu ← MRT_CellActionMenu

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/menus/SRT_CellActionMenu.tsx`.
Garbage-zone; author fresh. Shell = DropdownMenu + fixed-span bridge —
anchored from `actionCellRef.current` (set by SRT_TableBodyCell's
handleContextMenu).

## Resolved decisions

- Interface `extends ComponentPropsWithRef<typeof DropdownMenuContent>
  { table }`.
- `cell = actionCell!` + row/column/columnDef destructures verbatim (keep the
  `!` — if lint rejects non-null assertion, guard with early `if (!actionCell)
  return null;` + Note instead; report which).
- handleClose verbatim (`event?: any` → type as `{ stopPropagation?: () =>
  void }` or SyntheticEvent-optional; avoid `any` if clean).
- internalMenuItems verbatim: copy item ('context-menu' click-to-copy gates,
  ContentCopy icon, clipboard.writeText, handleClose), edit item
  (enableEditing + editDisplayMode === 'cell', openEditingCell from core),
  .filter(Boolean). Keys 'mrt-copy'/'mrt-edit' verbatim.
- renderActionProps + menuItems precedence verbatim (columnDef.
  renderCellActionMenuItems ?? table option).
- Render gate verbatim: `(!!menuItems?.length || !!internalMenuItems?.length)
  && (...)`.
- Shell: DropdownMenu open={!!cell} + onOpenChange close → handleClose();
  bridge span positioned from `actionCellRef.current.getBoundingClientRect()`;
  MRT `transformOrigin={{horizontal: -100, vertical: 8}}` → Content
  `sideOffset`/`alignOffset` approximation: `align="start" alignOffset={100}
  sideOffset={8}` (approximates MRT's offset placement near the click point —
  Note the mapping); Content onClick stopPropagation + {...rest}; dense
  menu-level variant; dropped mrtTheme/disableScrollLock Notes.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
