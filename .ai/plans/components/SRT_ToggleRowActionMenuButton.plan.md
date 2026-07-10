# Plan: SRT_ToggleRowActionMenuButton ← MRT_ToggleRowActionMenuButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_ToggleRowActionMenuButton.tsx`.
Garbage-zone; author fresh. Depends on SRT_EditActionButtons (same cluster —
build AFTER it) + menus/SRT_RowActionMenu (review-clean).

## Resolved decisions

- Interface `extends ButtonProps { cell, row, staticRowIndex?, table }`.
- Module-level `commonIconButtonStyles` → module-level cva (mirror MRT's
  const-above-component shape): `h-8 w-8 ml-2.5 opacity-50 transition-opacity
  duration-150 hover:opacity-100` (2rem, 10px, hover opacity 1).
- isCreating/isEditing/showEditActionButtons/anchorEl state verbatim;
  handleOpenRowActionMenu (stopPropagation + preventDefault) and
  handleStartEditMode (`setEditingRow({ ...row })`) verbatim.
- Branch chain VERBATIM: renderRowActions && !showEditActionButtons →
  renderRowActions({cell,row,staticRowIndex,table}); showEditActionButtons →
  SRT_EditActionButtons; `!renderRowActionMenuItems &&
  parseFromValuesOrFunc(enableEditing, row) && ['modal','row'].includes(
  editDisplayMode!)` → edit IconButton (SRT_Tooltip side="right"
  localization.edit, EditIcon); `renderRowActionMenuItems?.({row,
  staticRowIndex, table} as any)?.length` → MoreHoriz button + SRT_RowActionMenu
  (anchorEl/handleEdit/row/setAnchorEl/staticRowIndex/table) ; else null.
  Keep the `as any` + `editDisplayMode!` verbatim.
- Both icon buttons: Button ghost/icon size small + commonIconButtonStyles
  cva + {...rest}; icons h-4 w-4.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
