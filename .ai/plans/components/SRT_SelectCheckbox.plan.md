# Plan: SRT_SelectCheckbox ← MRT_SelectCheckbox

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/inputs/SRT_SelectCheckbox.tsx`.
Garbage-zone; author fresh — but READ the garbage file first: its shadcn/radix
Checkbox event bridge (range-select shiftKey handling) and the round-checkbox
single-select rendering are June browser-verified; preserve those mechanisms.

## Resolved decisions

- Interface `extends ButtonProps { row?, staticRowIndex?, table }`.
- shadcn `Checkbox` (ui/checkbox, radix, button-backed) renders BOTH branches:
  `enableMultiRowSelection === false` → same Checkbox with `rounded-full`
  class (locked June deviation — NO Radio); else normal.
- Logic verbatim: `selectAll = !row`; allRowsSelected (selectAllMode
  page/all); isChecked; slot merge branch (selectAll →
  srtSelectAllCheckboxProps {table} : srtSelectCheckboxProps {row,
  staticRowIndex, table}) + rest — use parseFromValuesOrFunc;
  onSelectionChange = row ? getSRT_RowSelectionHandler({row, staticRowIndex,
  table}) : undefined; onSelectAllChange = getSRT_SelectAllHandler({table})
  (both core exports — verify).
- Event bridging: MRT handlers expect a DOM event (uses target.checked +
  shiftKey for range select). Radix onCheckedChange gives no event — reuse the
  garbage file's working bridge (likely onClick-driven) so shift-click range
  selection keeps working. Do NOT redesign it.
- commonProps mapping: aria-label toggleSelectAll/Row; checked; disabled
  `isLoading || (row && !row.getCanSelect()) || row?.id === 'mrt-row-create'`;
  stopPropagation in the change/click paths verbatim (compose user onClick
  after spread like MRT); density sizing classes: compact `h-7 w-7` else
  `h-10 w-10 -m-[0.4rem]`; `z-0`; `title={undefined}` strip after spread.
- indeterminate verbatim → radix `checked="indeterminate"` when
  `!isChecked && (selectAll ? table.getIsSomeRowsSelected() :
  row?.getIsSomeSelected() && row.getCanSelectSubRows())`.
- SRT_Tooltip wrapper, title `checkboxProps?.title ?? (selectAll ?
  toggleSelectAll : toggleSelectRow)`.
- MUI-only drops with Notes: size small/medium prop (classes handle),
  inputProps.aria-label duplication (single aria-label on the control).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/inputs/SRT_SelectCheckbox.tsx`
--max-warnings=0. Only this file. No core, no git. parseFromValuesOrFunc only.
