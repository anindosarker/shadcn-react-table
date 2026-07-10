# Plan: SRT_BottomToolbar ← MRT_BottomToolbar

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/toolbar/SRT_BottomToolbar.tsx`.
Garbage-zone; author fresh. FIXES the user-reported pagination cutoff: the
garbage file lacked MRT's `minHeight: 3.5rem`, so the absolutely-positioned
pagination overflowed the collapsed toolbar and got clipped.

## Resolved decisions

- Interface `extends DivProps { table }` (MRT extends BoxProps).
- MUI useMediaQuery → existing `./useSRT_MediaQuery` hook (keep as-is,
  documented deviation).
- Shared toolbar styles (MRT getCommonToolbarStyles) → class string used by
  BOTH toolbars: `relative z-[1] grid min-h-14 items-start overflow-hidden
  bg-background flex-wrap-reverse transition-all duration-150 ease-in-out`
  (min-h-14 = 3.5rem — THE fix; bg-background maps baseBackgroundColor,
  commented mrtTheme note NOT needed here since MRT reads it inside the
  helper — instead one `// Note:` on the cva that it maps
  getCommonToolbarStyles).
- cva `bottomToolbarVariants`: base = shared toolbar classes + MRT bottom
  extras: boxShadow `shadow-[inset_0_1px_2px_-1px_rgba(0,0,0,0.5)]` (maps
  alpha(grey700, .5) inset), `left-0 right-0`; variant `fullscreen: { true:
  'fixed bottom-0', false: 'relative' }`.
- Slot merge `{ ...parseFromValuesOrFunc(srtBottomToolbarProps, { table }),
  ...rest }` (converted slot). Dual-ref callback verbatim (bottomToolbarRef,
  `if (node)` guard per MRT).
- `stackAlertBanner = isMobile || !!renderBottomToolbarCustomActions` verbatim.
- Children verbatim: LinearProgressBar (isTopToolbar={false}), AlertBanner
  when positionToolbarAlertBanner==='bottom' (with stackAlertBanner), DropZone
  when ['both','bottom'] includes positionToolbarDropZone, then inner Box →
  div `flex w-full box-border items-center justify-between p-2` containing
  `renderBottomToolbarCustomActions?.({table})` — MRT uses a ternary with
  `<span />` fallback, keep — and the pagination wrapper div
  `flex justify-end right-0 top-0` + conditional `relative`/`absolute` per
  stackAlertBanner, containing SRT_TablePagination position="bottom" under
  MRT's exact condition. All toolbar-sibling imports are garbage-zone —
  import as-is; STOP if props reject.
- Spread-then-className order.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/toolbar/SRT_BottomToolbar.tsx`
--max-warnings=0. Only this file. No core, no git.
