# Plan: toolbar/ cluster slot-type conversions (core types.ts only)

Single-writer task on `packages/shadcn-react-table-core/src/types.ts`.
Reference: MRT `packages/material-react-table/src/types.ts` — mirror each
slot's EXACT value-or-func shape + context, swapping MUI prop types for SRT
element types (existing: DivProps, TableSectionProps, TableRowProps,
TableCellProps, TdProps, TableBodyProps, ButtonProps, TableProps).

## Convert these slots (and ONLY these) from `SRT_HTMLProps<...>`:

- `srtTopToolbarProps` — mirror `muiTopToolbarProps` (MUI BoxProps → DivProps)
- `srtBottomToolbarProps` — mirror `muiBottomToolbarProps` (BoxProps →
  DivProps; if MRT's context/type differs — e.g. Toolbar props — mirror its
  context exactly, element type DivProps)
- `srtToolbarAlertBannerProps` — mirror `muiToolbarAlertBannerProps`
  (AlertProps → DivProps)
- `srtToolbarAlertBannerChipProps` — mirror `muiToolbarAlertBannerChipProps`
  (ChipProps → DivProps)
- `srtToolbarDropZoneProps` — mirror `muiToolbarDropZoneProps` (BoxProps →
  DivProps)
- `srtPaginationProps` — mirror `muiPaginationProps` (its MRT type is a
  Partial<...> union over pagination props — read it carefully; map the MUI
  component prop base to DivProps while PRESERVING any MRT-added literal
  fields (e.g. rowsPerPageOptions, showFirstButton/showLastButton style
  extras) exactly as MRT declares them; if MRT-added fields reference
  MUI-only concepts, keep the field with the closest SRT-typed equivalent and
  list it in your report)
- `srtSearchTextFieldProps` — mirror `muiSearchTextFieldProps`
  (TextFieldProps → `InputProps`; ADD `export type InputProps =
  React.ComponentPropsWithRef<'input'>;` next to the other element types)
- `srtLinearProgressProps` — currently a custom SRT type
  (`SRT_LinearProgressProps`); mirror MRT `muiLinearProgressProps`' context
  (`{ isTopToolbar, table }`) as value-or-func; keep the RETURN type as the
  existing `SRT_LinearProgressProps` shape (wrapper/progressRoot divs) — it's
  an SRT-only construct already; just align the outer value-or-func + context
  to MRT's.

## Gates

prettier types.ts; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit`
clean. Same garbage-consumer rule (touch nothing else unless tsc forces;
minimal local swaps only; list every touch). No git.
