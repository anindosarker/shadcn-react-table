# Plan: SRT_TableLayout ← MRT_TablePaper

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/table/SRT_TableLayout.tsx`
← `packages/material-react-table/src/components/table/MRT_TablePaper.tsx` (spec, source of truth).

## Resolved decisions (human-approved)

- **A. Fullscreen via cva variant** (project convention), not MRT's inline style
  block. `tableLayoutVariants` cva, `fullscreen` boolean variant.
- **B1.** Fullscreen variant includes `p-0` (MRT sets `padding: 0` fullscreen —
  table flush to screen edges).
- **B2.** `w-dvw` (exact dvw match), not `w-screen`.
- **B3.** Keep SRT default design deviations: base `relative`, `p-2`,
  `rounded-md border bg-background shadow` card look; fullscreen variant undoes
  with `rounded-none border-0 m-0`.

## Structure (mirror MRT_TablePaper line-for-line)

- Interface: `SRT_TableLayoutProps<TData> extends LayoutDivProps { table }`.
- Renames: `muiTablePaperProps`→`srtTableLayoutProps`,
  `tablePaperRef`→`tableLayoutRef`.
- Destructure keeps MRT positional order: `enableBottomToolbar`,
  `enableTopToolbar`, `srtTableLayoutProps` (at `muiTablePaperProps` slot),
  `renderBottomToolbar`, `renderTopToolbar`; `refs: { tableLayoutRef }`.
  (`mrtTheme` line dropped — no theme registry.)
- Props merge: `{ ...parseFromValuesOrFunc(srtTableLayoutProps, { table }), ...rest }`.
- JSX attr order mirrors MRT: `onKeyDown` (Escape → `setIsFullScreen(false)`,
  BEFORE spread so user handler replaces it, same as MRT), `{...layoutDivProps}`,
  `ref` (dual: `tableLayoutRef.current = ref` + user ref with `//@ts-expect-error`),
  `className` (in MRT's style/sx position).
- className: `cn(tableLayoutVariants({ fullscreen: isFullScreen, className: layoutDivProps.className }))`
  — user className last, wins via twMerge (mirrors MRT user-sx-wins).
- Children identical: `enableTopToolbar && (renderTopToolbar ?? <SRT_TopToolbar/>)`,
  `<SRT_TableContainer/>`, `enableBottomToolbar && (renderBottomToolbar ?? <SRT_BottomToolbar/>)`.
- MUI drops: `elevation={2}`→card-look classes; `useTheme`/`zIndex.modal`→`z-50`;
  `backgroundColor: baseBackgroundColor`→`bg-background`;
  `backgroundImage:'unset'`→n/a; sx base→`overflow-hidden transition-all duration-100`.
- No comments except the `//@ts-expect-error` MRT itself has.

## cva spec

```ts
const tableLayoutVariants = cva(
  'relative overflow-hidden rounded-md border bg-background shadow transition-all duration-100 p-2',
  {
    variants: {
      fullscreen: {
        true: 'fixed inset-0 z-50 h-dvh max-h-dvh w-dvw max-w-dvw rounded-none border-0 m-0 p-0',
        false: '',
      },
    },
    defaultVariants: { fullscreen: false },
  },
);
```

## Gates

- `pnpm prettier --write <file>` (run from `shadcn-react-table/`).
- `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean — ignore ONLY
  the preexisting TS5101 `baseUrl` deprecation warning.
- No git commits. Touch ONLY the SRT_TableLayout.tsx file.
