# Plan: SRT_ShowHideColumnsMenu ← MRT_ShowHideColumnsMenu

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/menus/SRT_ShowHideColumnsMenu.tsx`.
Garbage-zone; author fresh. Shell = DropdownMenu + fixed-span bridge (locked).

## Resolved decisions

- Interface `extends ComponentPropsWithRef<typeof DropdownMenuContent>
  { anchorEl, isSubMenu?, setAnchorEl, table }` (isSubMenu kept — MRT
  declares it even though unused in the body; mirror, destructure-unused →
  drop from destructure if lint complains, keep in interface).
- Logic VERBATIM: handleToggleAllColumns; allColumns useMemo (incl. MRT's
  odd function-call deps — keep + authorized eslint-disable); isNestedColumns;
  hasColumnOrderChanged memo; hoveredColumn state.
  `getDefaultColumnOrderIds` from core displayColumn.utils (verify export;
  STOP if missing).
- Shell: DropdownMenu + bridge; Content {...rest} + dense menu-level class
  when compact; dropped mrtTheme/disableScrollLock Notes. Content needs a
  max-height + scroll for long column lists ONLY IF the garbage/June version
  had one (check; otherwise don't invent).
- Header row: Box → div `flex justify-between p-2 pt-0` with the four
  text-buttons verbatim (conditions/disabled/onClick exact; MUI Button →
  shadcn Button variant="ghost" size="sm" — or the June idiom from the
  garbage file if different; localization labels hideAll/resetOrder/unpinAll/
  showAll; `getDefaultColumnOrderIds(table.options, true)` exact).
- MUI Divider → DropdownMenuSeparator.
- allColumns.map → SRT_ShowHideColumnsMenuItems verbatim (all 6 props + key
  `${index}-${column.id}`).

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git.
