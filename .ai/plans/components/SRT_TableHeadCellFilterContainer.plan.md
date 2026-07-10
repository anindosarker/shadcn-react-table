# Plan: SRT_TableHeadCellFilterContainer ← MRT_TableHeadCellFilterContainer

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/head/SRT_TableHeadCellFilterContainer.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHeadCellFilterContainer.tsx`.
Garbage-zone; author fresh. Small dispatcher component.

## Resolved decisions

- Interface `extends DivProps { header, table }` (MRT extends CollapseProps;
  the Collapse renders a div wrapper — DivProps is the honest analogue).
- MUI `Collapse in={...} mountOnEnter unmountOnExit {...rest}` → conditional
  render `<div>` when `showColumnFilters || columnFilterDisplayMode ===
  'popover'`, `{...rest}` on the div; the Collapse line becomes a
  dropped-construct comment + `// Note: MUI Collapse transition dropped —
  conditional render keeps mountOnEnter/unmountOnExit semantics`.
- cva `filterContainerVariants` — no variants, base `''`-equivalent is fine;
  if no styles are needed use `cva('')` for anatomy consistency and compose
  `cn(filterContainerVariants(), rest.className)` after the spread.
- Filter-variant dispatch VERBATIM (4-way ternary): filterVariant 'checkbox' →
  `SRT_FilterCheckbox column table`; 'range-slider' → `SRT_FilterRangeSlider
  header table`; `isRangeFilter` → `SRT_FilterRangeFields header table`; else
  `SRT_FilterTextField header table`. All four are garbage-zone inputs/ imports
  — import as-is, their pairs come in inputs/ cluster. STOP if any prop
  interface rejects these props.
- `getColumnFilterInfo` from core.

## Structure

Mirror MRT order exactly (destructures, showColumnFilters, column/columnDef,
isRangeFilter, JSX). Comments: only the dropped-Collapse note.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHeadCellFilterContainer.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
