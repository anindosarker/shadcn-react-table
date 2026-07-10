# Plan: SRT_FilterRangeFields ← MRT_FilterRangeFields

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/inputs/SRT_FilterRangeFields.tsx`.
Garbage-zone; author fresh. Tiny.

## Resolved decisions

- Interface `extends DivProps { header, table }` (MRT extends BoxProps).
- NO slot (MRT has no muiFilterRangeFieldsProps) — `...rest` only; if garbage
  reads an invented slot, drop it.
- cva `filterRangeFieldsVariants` base `grid grid-cols-2 gap-4` (maps sx).
- `{...rest}` then className after.
- `[0, 1].map(rangeFilterIndex => <SRT_FilterTextField header key
  rangeFilterIndex table />)` verbatim (sibling mid-rebuild — import as-is).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/inputs/SRT_FilterRangeFields.tsx`
--max-warnings=0. Only this file. No core, no git.
