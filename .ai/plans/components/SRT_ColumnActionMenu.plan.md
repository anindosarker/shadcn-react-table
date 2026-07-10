# Plan: SRT_ColumnActionMenu ← MRT_ColumnActionMenu

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/menus/SRT_ColumnActionMenu.tsx`.
Garbage-zone; author fresh. Depends on SRT_ActionMenuItem's `divider?: boolean`
prop (amendment in flight — verify it exists before coding; STOP if absent).

## Resolved decisions

- Interface `extends ComponentPropsWithRef<typeof DropdownMenuContent>
  { anchorEl, header, setAnchorEl, table }` (MRT Partial<MenuProps>; rest →
  Content).
- ALL handlers verbatim (handleClearSort/SortAsc/SortDesc/ResetColumnSize/
  HideColumn/PinColumn/GroupByColumn — incl. the `['mrt-row-expand', ...old]`
  columnOrder prepend —/ClearFilter incl. empty/notEmpty filterFns reset/
  FilterByColumn incl. queueMicrotask focus/ShowAllColumns/
  OpenFilterModeMenu). `(old: any)` cast: try typed first, keep + disable if
  forced.
- isSelectFilter / allowedColumnFilterOptions / showFilterModeSubMenu
  verbatim.
- `internalColumnMenuItems` array VERBATIM: every item, key, disabled
  expression, divider flag, icon (registry icons with MRT's literal inline
  transform styles — SortIcon rotate(180deg) scaleX(-1), PushPinIcon
  rotate(±90deg)), localization replaces, onClick/onOpenSubMenu wiring, the
  nested SRT_FilterOptionMenu (key 5, filterMenuAnchorEl) inside the filter
  block, the .filter(Boolean) calls.
- Shell: DropdownMenu + fixed-span bridge (copy from garbage/June wiring):
  open={!!anchorEl}, onOpenChange close → setAnchorEl(null); Content gets
  {...rest} + density-conditional `[&_[role=menuitem]]:py-1` when compact
  (MenuListProps dense map — menu-level, NOT per item) +
  menuBackgroundColor dropped Note (bg-popover) + disableScrollLock Note.
- Children precedence verbatim: columnDef.renderColumnActionsMenuItems ??
  table option ?? internalColumnMenuItems, all with {closeMenu, column,
  internalColumnMenuItems, table}.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/menus/SRT_ColumnActionMenu.tsx`
--max-warnings=0. Only this file. No core, no git.
