# Plan: SRT_TableLoadingOverlay ← MRT_TableLoadingOverlay

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/table/SRT_TableLoadingOverlay.tsx`
← `packages/material-react-table/src/components/table/MRT_TableLoadingOverlay.tsx` (spec).

Existing SRT file = garbage-zone; close to target but author fresh per trust map
(it has a real bug: `animate-spin` className placed before the props spread, so
user className clobbers it).

## Resolved decisions

- **Spinner**: `LoaderCircleIcon` (lucide) + `animate-spin` replaces MUI
  `CircularProgress`. `Component` override mirrors MRT exactly:
  `circularProgressProps?.Component ?? <LoaderCircleIcon .../>`.
- **Interface**: `SRT_TableLoadingOverlayProps<TData> extends
  SRT_CircularProgressProps { table }` (mirrors MRT's `extends
  CircularProgressProps`). `SRT_CircularProgressProps` already exists in core
  types.ts — NO types.ts changes this pair.
- **No core edits at all.** `srtCircularProgressProps` slot already value-or-func
  MRT shape.
- **Wrapper div**: pure cva classes, no user className merge (MRT's Box takes
  no user props; slot props target the spinner only).
- **`size={40}`** on the icon before the spread — maps MUI CircularProgress's
  default 40px (lucide default is 24); user-overridable via the spread.

## Structure (mirror MRT line-for-line)

- Component `({ table, ...rest })`.
- Destructure: `options: { id, localization, srtCircularProgressProps }` with
  the dropped mrtTheme line commented at its MRT position:
  ```tsx
  // Note: mrtTheme dropped project-wide — bg-background/50 in the cva maps alpha(baseBackgroundColor, 0.5)
  // mrtTheme: { baseBackgroundColor },
  ```
- Merge: `{ ...parseFromValuesOrFunc(srtCircularProgressProps, { table }), ...rest }`.
- cva (per General notes, no variants):
  ```ts
  const tableLoadingOverlayVariants = cva(
    'absolute inset-0 z-[3] flex max-h-screen w-full items-center justify-center bg-background/50',
  );
  ```
  Maps sx: alignItems/justifyContent → items-center/justify-center;
  bottom/left/right/top 0 → inset-0; display flex; maxHeight 100vh →
  max-h-screen; position absolute; width 100% → w-full; zIndex 3 → z-[3];
  alpha(baseBackgroundColor, 0.5) → bg-background/50.
- JSX: `<div className={cn(tableLoadingOverlayVariants())}>` (replaces Box) →
  `{circularProgressProps?.Component ?? (<LoaderCircleIcon
  aria-label={localization.noRecordsToDisplay} id={`srt-progress-${id}`}
  size={40} {...circularProgressProps}
  className={cn('animate-spin', circularProgressProps?.className)} />)}`.
  className comes AFTER the spread deliberately: composes `animate-spin` with
  user className instead of being clobbered by the spread's raw className.
- Comments: only the dropped-construct block above. `id` suffix kept — MRT
  renders `mrt-progress-${id}` identically (known broken aria link in both).

## Gates (repo root)

- `pnpm prettier --write <file>`
- `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean
- `pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/table/SRT_TableLoadingOverlay.tsx --max-warnings=0`
- Touch ONLY this component file. No core, no git.
