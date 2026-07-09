# Plan: SRT_TableContainer ← MRT_TableContainer

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/table/SRT_TableContainer.tsx`
← `packages/material-react-table/src/components/table/MRT_TableContainer.tsx` (spec, source of truth).

Existing SRT file = garbage from prior runs. Author fresh from the MRT spec. Do
not preserve its June-era API (`parseSRT_HtmlProps`/`mergeSRT_HtmlProps` are
dead — do not import them).

## Resolved decisions (human-approved)

- **A. Core types.ts edit (exactly one property):** in
  `packages/shadcn-react-table-core/src/types.ts` (~line 954) replace
  ```ts
  srtTableContainerProps?: SRT_HTMLProps<
    HTMLDivElement,
    SRT_TableHTMLPropsContext<TData>
  >;
  ```
  with
  ```ts
  srtTableContainerProps?:
    | ((props: { table: SRT_TableInstance<TData> }) => DivProps)
    | DivProps;
  ```
  (same shape as `srtTableLayoutProps`, mirrors MRT `muiTableContainerProps`).
  Touch NOTHING else in types.ts.
- **B.** `aria-describedby={loading ? 'srt-progress' : undefined}`. Known
  deferred gap: current overlay renders suffixed id — fixed later at the
  SRT_TableLoadingOverlay pair, not here.

## Structure (mirror MRT_TableContainer line-for-line)

- Interface: `SRT_TableContainerProps<TData> extends DivProps { table }`;
  component takes `({ table, ...rest })`.
- `useIsomorphicLayoutEffect` const, `loading` calc, `totalToolbarHeight`
  state, toolbar-height layout effect, `createModalOpen`/`editModalOpen` — 1:1
  with MRT, same order.
- Props merge: `{ ...parseFromValuesOrFunc(srtTableContainerProps, { table }), ...rest }`.
- Destructure keeps MRT positional order: options `createDisplayMode,
  editDisplayMode, enableCellActions, enableStickyHeader,
  srtTableContainerProps`; refs `bottomToolbarRef, tableContainerRef,
  topToolbarRef`; state `actionCell, creatingRow, editingRow, isFullScreen,
  isLoading, showLoadingOverlay`.
- JSX `<div>` (replaces MUI TableContainer), attr order as MRT: `aria-busy`,
  `aria-describedby`, `{...tableContainerProps}`, `ref`, `style`, `className`
  (in MRT's sx position).
  - ref mirrors MRT exactly incl. `if (node)` guard + user-ref forward with
    `//@ts-expect-error` + brief reason suffix.
  - `style`: single object — `maxHeight: isFullScreen ? calc(100vh - Npx) :
    enableStickyHeader ? clamp(350px, calc(100vh - Npx), 9999px) : undefined`,
    then `...tableContainerProps?.style` (user wins). Fullscreen branch winning
    over sticky = MRT's style-attr-beats-sx precedence. Dynamic px → inline
    style is correct here (cva impossible).
  - `className`: `cn('relative max-w-full overflow-auto', tableContainerProps.className)`
    — maps sx `maxWidth:'100%', overflow:'auto', position:'relative'`. No cva
    (no variants).
- Children 1:1: loading ? overlay : null → `<SRT_Table>` → modal conditional →
  cell-action-menu conditional.
- Comments: none except the `//@ts-expect-error` (+reason). No dropped-MRT
  constructs in this file.

## Gates (run from repo root)

- `pnpm prettier --write <files>`
- `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean (ignore only
  the preexisting TS5101 baseUrl deprecation)
- `pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/table/SRT_TableContainer.tsx --max-warnings=0`
- Touch ONLY the two files above. No git.
