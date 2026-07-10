# Plan: SRT_TableHead ← MRT_TableHead

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/head/SRT_TableHead.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHead.tsx`.
Garbage-zone; author fresh. THIS pair kills the user-reported "weird header
shadow" — the garbage file paints `bg-muted/50` on the thead; MRT's thead has
NO background. Do not carry any bg class over.

## Resolved decisions

- Interface `extends TableSectionProps { columnVirtualizer?, table }` — core
  `TableSectionProps` (`ComponentPropsWithRef<'thead'>`; MRT TableHeadProps swap).
- MUI TableHead → `<thead>`.
- Slot merge `{ ...parseFromValuesOrFunc(srtTableHeadProps, { table }), ...rest }`
  (slot already converted).
- Dual-ref callback verbatim (tableHeadRef + user ref with `//@ts-expect-error`
  + brief reason, MRT pattern).
- sx → cva `tableHeadVariants`:
  - base: `opacity-[0.97]` (MRT literal; NO background class).
  - variants: `layout: { grid: 'grid', semantic: '' }` (display grid map);
    `sticky: { true: 'sticky z-[2]', false: 'relative' }` (position+zIndex);
    compute `stickyHeader = enableStickyHeader || isFullScreen` exactly.
  - `top: stickyHeader && grid ? 0 : undefined` → conditional `top-0` class
    only when both (runtime conditional string or compoundVariant).
- head-overlay alert branch verbatim: condition
  `positionToolbarAlertBanner === 'head-overlay' && (showAlertBanner ||
  table.getSelectedRowModel().rows.length > 0)`; `<tr>`/`<th
  colSpan={table.getVisibleLeafColumns().length}>` with the grid display
  inline styles + `padding: 0` exactly as MRT (inline styles here are MRT's
  own, keep literal); wraps `<SRT_ToolbarAlertBanner table={table} />`
  (toolbar/ garbage-zone import as-is; STOP if its props reject `table`; note
  MRT does not pass stackAlertBanner here).
- Else branch: `table.getHeaderGroups().map(...)` → `<SRT_TableHeadRow
  columnVirtualizer headerGroup={headerGroup as any} key table />` — keep
  MRT's literal `as any` cast.
- `{...tableHeadProps}` spread then className composition after spread.

## Structure

Mirror MRT order (destructures incl. refs, state, merge, stickyHeader, JSX).
Comments: only `//@ts-expect-error` + reason. No dropped constructs (no
mrtTheme here).

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHead.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
