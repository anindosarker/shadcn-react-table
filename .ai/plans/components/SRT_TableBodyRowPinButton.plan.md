# Plan: SRT_TableBodyRowPinButton ← MRT_TableBodyRowPinButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/body/SRT_TableBodyRowPinButton.tsx`
← `packages/material-react-table/src/components/body/MRT_TableBodyRowPinButton.tsx`.
Garbage-zone; author fresh. Small dispatcher.

## Resolved decisions

- Interface `extends ButtonProps { row, table }`.
- `canPin = parseFromValuesOrFunc(enableRowPinning, row)` — MRT has `row as
  any`; try WITHOUT the cast first (TableHead precedent); if tsc fails, keep +
  eslint-disable and report.
- Early `if (!canPin) return null;` verbatim.
- `rowPinButtonProps = { row, table, ...rest }` verbatim.
- top-and-bottom branch: MUI Box → div with cva `rowPinWrapperVariants`: base
  `flex`, variant `density: { compact: 'flex-row', other: 'flex-col' }`
  (maps flexDirection ternary; call with density === 'compact' ? 'compact' :
  'other').
- Renders `<SRT_RowPinButton pinningPosition=... {...rowPinButtonProps} />`
  exactly as MRT (top/bottom pair in the branch; single with
  `rowPinningDisplayMode === 'bottom' ? 'bottom' : 'top'` otherwise).
  Garbage-zone import as-is; STOP if props reject pinningPosition/row/table.

## Structure

Mirror MRT order. Comments: none expected.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/body/SRT_TableBodyRowPinButton.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
