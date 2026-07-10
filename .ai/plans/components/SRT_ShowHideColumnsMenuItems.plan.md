# Plan: SRT_ShowHideColumnsMenuItems ← MRT_ShowHideColumnsMenuItems

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/menus/SRT_ShowHideColumnsMenuItems.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends ComponentPropsWithRef<typeof DropdownMenuItem>
  { allColumns, column, hoveredColumn, isNestedColumns, setHoveredColumn,
  table }` (MRT extends MenuItemProps).
- Logic VERBATIM: switchChecked; handleToggleColumnHidden (group-children
  branch); menuItemRef (type to the element used); isDragging state;
  handleDragStart (setDragImage try/catch console.error);
  handleDragEnd (reorderColumn + setColumnOrder + setColumnPinning filter);
  handleDragEnter; the `!columnDef.header || visibleInShowHideMenu === false`
  early null.
- Item: DropdownMenuItem with `onSelect={(e) => e.preventDefault()}` (keep
  menu OPEN on toggle — MUI menus don't auto-close on item interaction here;
  radix does; this preserves MRT behavior — Note), onDragEnter, ref,
  {...rest}, classes map sx: `items-center justify-start my-0 py-1.5` +
  isDragging → `opacity-50` + outline conditionals (dragging → `outline-2
  outline-dashed outline-muted-foreground`; hovered === column → `outline-2
  outline-dashed outline-primary` (draggingBorderColor map); else none) +
  `-outline-offset-2` + inline style `paddingLeft: ${(column.depth + 0.5) *
  2}rem` (runtime). disableRipple dropped Note.
- Inner Box → div `flex flex-nowrap gap-2`.
- Grab handle block verbatim (conditions incl. !isNestedColumns; spacer div
  `w-7` for 28px); pinning block verbatim (SRT_ColumnPinningButtons garbage
  import as-is; spacer `w-[70px]`); STOP if either garbage button rejects
  props.
- enableHiding branch: FormControlLabel+Switch → `<label className="flex
  items-center gap-2">` wrapping SRT_Tooltip(title toggleVisibility)-wrapped
  shadcn `Switch` (checked={switchChecked}, disabled={!column.getCanHide()},
  onCheckedChange={() => handleToggleColumnHidden(column)}) + `<span>` label
  text with `opacity-50` when columnDefType === 'display' (typography
  opacity map). Else Typography → `<span className="self-center">`.
- Recursive children map verbatim.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git.
