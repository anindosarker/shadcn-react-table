# Plan: SRT_TableFooter ← MRT_TableFooter

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/footer/SRT_TableFooter.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends TableSectionProps { columnVirtualizer?, table }`;
  element `<tfoot>`.
- `stickFooter = (isFullScreen || enableStickyFooter) && enableStickyFooter
  !== false` verbatim.
- Skip-footer guard VERBATIM (footerGroups.some(...) + early null) — keep
  MRT's own `//if no footer cells at all, skip footer` comment.
- Merge `{ ...parseFromValuesOrFunc(srtTableFooterProps, { table }), ...rest }`.
- Dual-ref callback verbatim (tableFooterRef + user ref + //@ts-expect-error
  + reason).
- Classes via cva `tableFooterVariants`: variant layout grid → `grid`;
  variant sticky true → `bottom-0 sticky z-[1] opacity-[0.97] outline
  outline-1 outline-border` (maps MRT's light/dark grey outline to the border
  token — Note), false → `relative`.
- footerGroups map verbatim → `<SRT_TableFooterRow columnVirtualizer
  footerGroup key table />`; drop `as any` if it compiles (precedent), else
  keep + eslint-disable and report.
- Spread-then-className order.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/footer/SRT_TableFooter.tsx`
--max-warnings=0. Only this file. No core, no git.
