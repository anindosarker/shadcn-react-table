# Plan: SRT_Table ← MRT_Table

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/table/SRT_Table.tsx`
← `packages/material-react-table/src/components/table/MRT_Table.tsx` (spec, source of truth).

Existing SRT file = garbage from prior runs. Author fresh from the MRT spec.

## Resolved decisions (human-approved)

- **A. Core types.ts edits (exactly two, done by the coder):**
  1. Add next to `DivProps` (~line 1167):
     ```ts
     export type TableProps = React.ComponentPropsWithRef<'table'>;
     ```
  2. Replace the `srtTableProps` property (~line 984):
     ```ts
     srtTableProps?:
       | ((props: { table: SRT_TableInstance<TData> }) => TableProps)
       | TableProps;
     ```
  Touch NOTHING else in types.ts.
- **B. MUI `stickyHeader` prop dropped** — no native `<table>` attribute. Keep
  MRT's line as a commented-out dropped construct at its position:
  ```tsx
  // stickyHeader={enableStickyHeader || isFullScreen}
  // Note: no native <table> attr; sticky th styles live in SRT_TableHeadCell
  // (+ thead grid-mode sticky in SRT_TableHead), derived from table options.
  ```
  Do NOT implement any sticky styling in this component.
- **C. cva variants** (per General notes — every component defines one):
  ```ts
  const tableVariants = cva('relative border-separate', {
    variants: {
      layoutMode: { grid: 'grid', 'grid-no-grow': 'grid', semantic: '' },
    },
    defaultVariants: { layoutMode: 'semantic' },
  });
  ```
  Maps MRT sx: `borderCollapse: 'separate'` → `border-separate`,
  `position: 'relative'` → `relative`, `display: grid` when
  `layoutMode?.startsWith('grid')` → `layoutMode` variant.

## Structure (mirror MRT_Table line-for-line)

- Interface: `SRT_TableProps<TData> extends TableProps { table }`; component
  takes `({ table, ...rest })`.
- Destructure MRT positional order: `getFlatHeaders, getState`, options
  `columns, enableStickyHeader, enableTableFooter, enableTableHead, layoutMode,
  memoMode, srtTableProps (at muiTableProps slot), renderCaption`; state
  `columnSizing, columnSizingInfo, columnVisibility, isFullScreen`.
  (`enableStickyHeader`/`isFullScreen` stay destructured — used by the
  commented dropped construct only if still referenced; if tsc flags them
  unused, keep MRT's destructure lines but prefix the unused ones the way the
  dropped-construct convention requires, or drop them with a one-line
  `// Note:` — prefer whichever keeps tsc/eslint clean; report which you chose.)
- Props merge: `{ ...parseFromValuesOrFunc(srtTableProps, { table }), ...rest }`.
- `Caption = parseFromValuesOrFunc(renderCaption, { table })`.
- `columnSizeVars` useMemo — identical body incl. `parseCSSVarId` (import from
  core), same deps array `[columns, columnSizing, columnSizingInfo, columnVisibility]`.
- `const columnVirtualizer = useSRT_ColumnVirtualizer(table);` (core export).
- `commonTableGroupProps = { columnVirtualizer, table }`.
- JSX `<table>` (replaces MUI Table): commented stickyHeader line (decision B),
  `{...tableProps}`, `style={{ ...columnSizeVars, ...tableProps?.style }}`
  (runtime CSS vars stay inline style per General notes),
  `className={cn(tableVariants({ layoutMode: <derive>, className: tableProps.className }))}`
  in MRT's sx position. Derive the variant from `layoutMode` option
  (`grid-no-grow` maps to grid display like MRT's startsWith check).
- Children identical: `{!!Caption && <caption>{Caption}</caption>}`,
  `enableTableHead && <SRT_TableHead {...commonTableGroupProps} />`,
  memo dispatch `memoMode === 'table-body' || columnSizingInfo.isResizingColumn
  ? <Memo_SRT_TableBody .../> : <SRT_TableBody .../>`,
  `enableTableFooter && <SRT_TableFooter {...commonTableGroupProps} />`.
  (All three exist in the tree; they are garbage-zone but must type-check —
  if their prop interfaces don't accept `columnVirtualizer`, STOP and report;
  do not modify them.)
- Comments: only the dropped-construct block (decision B). Nothing else.

## Gates (repo root)

- `pnpm prettier --write` on both touched files
- `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean
- `pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/table/SRT_Table.tsx --max-warnings=0`
- Touch ONLY: this component file + the two types.ts changes. No git.
