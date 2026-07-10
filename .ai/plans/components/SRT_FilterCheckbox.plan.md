# Plan: SRT_FilterCheckbox ← MRT_FilterCheckbox

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/inputs/SRT_FilterCheckbox.tsx`.
Garbage-zone; author fresh (consult garbage for June checkbox idiom only).

## Resolved decisions

- Interface `extends ButtonProps { column, table }`.
- Double slot merge verbatim (srtFilterCheckboxProps table → columnDef → rest),
  parseFromValuesOrFunc, {column, table} contexts.
- filterLabel verbatim.
- MUI FormControlLabel → `<label className="mt-[-4px] flex items-center gap-2
  font-normal text-muted-foreground text-sm">` wrapping shadcn Checkbox +
  label text `{checkboxProps.title ?? filterLabel}`; `title={undefined}`
  strip; SRT_Tooltip wrapper with title fallback verbatim.
- Checkbox (shadcn/radix): checked `column.getFilterValue() === 'true'`;
  indeterminate when filterValue undefined → checked="indeterminate";
  tri-state onChange verbatim (undefined→'true'→'false'→undefined) via
  onCheckedChange bridge (compose user onChange after — mirror
  SRT_SelectCheckbox's bridge pattern), onClick stopPropagation compose;
  sizing: visible-box `size-4` (per General hit-area note; MRT 2.5rem =
  hit area) — density small/medium size prop dropped + Note; `color`
  default/primary prop dropped + Note (radix checked-state styling covers).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/inputs/SRT_FilterCheckbox.tsx`
--max-warnings=0. Only this file. No core, no git. parseFromValuesOrFunc only.
