# Plan: inputs/ cluster slot-type conversions (core types.ts only)

Single-writer task on `packages/shadcn-react-table-core/src/types.ts`.
Reference: MRT `packages/material-react-table/src/types.ts` — mirror each
slot's EXACT value-or-func shape + context params, swapping MUI prop types
for SRT element types (existing: DivProps, ButtonProps, InputProps, etc.).

## Convert (table-level AND columnDef-level twins where MRT has both):

- `srtFilterTextFieldProps` — mirror `muiFilterTextFieldProps` (TextFieldProps
  → InputProps; context includes `column` + `rangeFilterIndex?` — read MRT)
- `srtEditTextFieldProps` — mirror `muiEditTextFieldProps` (TextFieldProps →
  InputProps; context {cell, column, row, table} — read MRT)
- `srtFilterCheckboxProps` — mirror `muiFilterCheckboxProps` (CheckboxProps →
  ButtonProps — shadcn Checkbox renders a button)
- `srtSelectCheckboxProps` — mirror `muiSelectCheckboxProps` (CheckboxProps →
  ButtonProps; context includes `row?` or staticRowIndex — read MRT exactly)
- `srtSelectAllCheckboxProps` — mirror `muiSelectAllCheckboxProps` if it
  exists in MRT (ButtonProps)
- `srtFilterSliderProps` — mirror `muiFilterSliderProps` (SliderProps →
  DivProps; shadcn Slider root is a span/div — use DivProps)
- `srtFilterAutocompleteProps` — mirror `muiFilterAutocompleteProps`
  (AutocompleteProps → InputProps)
- `srtFilterDatePickerProps` / `srtFilterDateTimePickerProps` /
  `srtFilterTimePickerProps` — mirror their mui counterparts → InputProps
  (native date/time inputs, locked June deviation)

For each: read MRT's declaration first; mirror the context object exactly
(SRT_Column/SRT_Cell/SRT_Row/SRT_TableInstance). Convert BOTH locations when
MRT declares table-level + columnDef-level.

## Gates

prettier; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean.
Garbage-consumer rule: touch nothing else unless tsc forces; minimal local
swaps only; list every touch. No git.
