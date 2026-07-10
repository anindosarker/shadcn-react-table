# Plan: SRT_TableDetailPanel ← MRT_TableDetailPanel

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/body/SRT_TableDetailPanel.tsx`
← `packages/material-react-table/src/components/body/MRT_TableDetailPanel.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends TdProps { parentRowRef: RefObject<HTMLTableRowElement |
  null>, row, rowVirtualizer?, staticRowIndex: number, table, virtualRow? }`
  (MRT extends TableCellProps → our TdProps: the rest lands on the td).
- Elements: TableRow → `<tr>`, TableCell → `<td>`. Class hooks Mui-→Srt-:
  `Srt-TableBodyCell-DetailPanel` on BOTH tr and td (MRT reuses one name).
- Slot reads verbatim: `tableRowProps = parseFromValuesOrFunc(
  srtTableBodyRowProps, { isDetailPanel: true, row, staticRowIndex, table })`
  (converted slot; note NO rest merge on the row — MRT doesn't);
  `tableCellProps = { ...parseFromValuesOrFunc(srtDetailPanelProps, { row,
  table }), ...rest }`.
- `DetailPanel = !isLoading && renderDetailPanel?.({ row, table })` verbatim.
- tr: `data-index` ternary verbatim; ref callback measureElement verbatim;
  `{...tableRowProps}` then className cn AFTER spread. tr styles → cva
  `detailPanelRowVariants` base `w-full` + variant `layout grid → flex`;
  virtualRow positioning stays inline `style` (runtime):
  `position: 'absolute'`, `top: ${parentRowRef.current?.getBoundingClientRect()?.height}px`,
  `transform: translateY(${virtualRow?.start}px)` — spread user
  `tableRowProps?.style` after lib values.
- td: `colSpan={getVisibleLeafColumns().length}`, `{...tableCellProps}`, then
  className cn. td styles → cva `detailPanelCellVariants` base `w-full` +
  variants: `layout grid → flex`; expanded-with-panel → `py-4` else `py-0`
  (maps py '1rem'/0); `borderBottom: none when !expanded` → conditional
  `border-b-0`; `transition-all duration-150` only when NOT virtualRow;
  `bg-background` only when virtualRow (maps baseBackgroundColor — commented
  mrtTheme destructure + Note).
- Children verbatim: virtualRow branch `row.getIsExpanded() && DetailPanel`;
  else MUI Collapse → conditional render `{row.getIsExpanded() && DetailPanel}`
  with dropped-Collapse comment + Note (mountOnEnter/unmountOnExit semantics
  preserved by conditional).

## Structure

Mirror MRT order. Comments: dropped mrtTheme + Collapse notes only.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/body/SRT_TableDetailPanel.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
