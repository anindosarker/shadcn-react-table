# Plan: SRT_TableBodyCellValue ← MRT_TableBodyCellValue

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/body/SRT_TableBodyCellValue.tsx`
← `packages/material-react-table/src/components/body/MRT_TableBodyCellValue.tsx`.
Garbage-zone; author fresh. Pure logic + highlight rendering, no slot props.

## Resolved decisions

- Interface verbatim (no extends — MRT has none): `{ cell, rowRef?:
  RefObject<HTMLTableRowElement | null>, staticColumnIndex?, staticRowIndex?,
  table }`.
- `highlight-words` import: verify it's a dependency reachable from
  test-shadcn (the garbage file used it — check its import line). STOP if
  missing from node_modules.
- All value-resolution logic VERBATIM: allowedTypes const, AggregatedCell /
  grouped-null / GroupedCell ternary chain, isGroupedValue, renderValue cast,
  the full highlight condition (every clause incl. `columnDef.filterVariant!`
  non-null — if eslint complains about the `!`, restructure minimally and
  report), chunks via highlightWords with matchExactly `(filterValue ?
  columnDef._filterFn : globalFilterFn) !== 'fuzzy'`, the `chunks?.length > 1
  || chunks?.[0]?.match` gate, and the final `columnDef.Cell && !isGroupedValue`
  override with its full props object.
- Highlight span rendering: outer `<span aria-label role="note">` verbatim;
  inner Box → `<mark>` (semantic highlight element) with classes
  `rounded-[2px] px-[1px] py-[2px]` and match-conditional
  `bg-yellow-200 text-black dark:bg-yellow-500/70 dark:text-white` — maps
  mrtTheme.matchHighlightColor (dropped, commented + Note) and MRT's
  dark/light text ternary; non-match chunks render the mark with NO classes
  (or a plain span — use `<mark>` only when `match`, plain `<span>` otherwise,
  keeping aria-hidden="true" + key on both, mirroring MRT's conditional sx).
- No cva (returns a value, not an element of its own — authorized exception;
  the tiny chunk spans keep literal classes).

## Structure

Mirror MRT order exactly. Comments: mrtTheme dropped-construct note only.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/body/SRT_TableBodyCellValue.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
