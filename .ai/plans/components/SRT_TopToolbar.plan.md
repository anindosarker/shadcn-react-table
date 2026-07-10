# Plan: SRT_TopToolbar ← MRT_TopToolbar

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/toolbar/SRT_TopToolbar.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface: `{ table }` ONLY — MRT_TopToolbar takes no rest/BoxProps (unlike
  bottom). `toolbarProps = parseFromValuesOrFunc(srtTopToolbarProps, { table })`
  with NO rest merge, mirroring MRT.
- useMediaQuery ×2 → `./useSRT_MediaQuery` ('(max-width:720px)' mobile,
  '(max-width:1024px)' tablet).
- Shared toolbar classes (same string as BottomToolbar's base — maps MRT
  getCommonToolbarStyles): `relative z-[1] grid min-h-14 items-start
  overflow-hidden bg-background flex-wrap-reverse transition-all duration-150
  ease-in-out` + `// Note:` referencing getCommonToolbarStyles.
- cva `topToolbarVariants`: base = shared classes; variant `fullscreen:
  { true: 'sticky top-0', false: 'relative' }`.
- `stackAlertBanner = isMobile || !!renderTopToolbarCustomActions ||
  (showGlobalFilter && isTablet)` verbatim.
- `globalFilterProps`: MRT passes `{ sx: !isTablet ? { zIndex: 2 } :
  undefined, table }` — SRT: `{ className: !isTablet ? 'z-[2]' : undefined,
  table }` IF the garbage SRT_GlobalFilterTextField accepts className; if its
  interface rejects className, pass `{ table }` only + `// Note:` deferring
  the z-index to the inputs/ pair. Check before deciding; report which.
- Dual-ref callback verbatim (topToolbarRef; MRT top version has NO `if (ref)`
  guard — mirror exactly).
- Children verbatim: AlertBanner (position 'top', stackAlertBanner), DropZone
  (['both','top']), inner div `flex w-full box-border items-start
  justify-between gap-2 p-2 right-0 top-0` + conditional
  `relative`/`absolute` per stackAlertBanner; global filter left-position;
  `renderTopToolbarCustomActions?.({ table }) ?? <span />`; internal-actions
  branch: wrapper div `flex flex-wrap-reverse items-center justify-end gap-2`
  containing right-position global filter + SRT_ToolbarInternalButtons; else
  bare right-position global filter; then top pagination under MRT's
  condition; LinearProgressBar isTopToolbar last. Garbage-zone sibling
  imports as-is; STOP if props reject.
- `{...toolbarProps}` spread then className composition.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/toolbar/SRT_TopToolbar.tsx`
--max-warnings=0. Only this file. No core, no git.
