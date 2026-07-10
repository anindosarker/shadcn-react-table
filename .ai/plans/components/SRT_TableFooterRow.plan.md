# Plan: SRT_TableFooterRow ← MRT_TableFooterRow

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/footer/SRT_TableFooterRow.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends TableRowProps { columnVirtualizer?, footerGroup, table }`.
- Skip-row guard VERBATIM (the `footerGroup.headers?.some(...)` string/Footer
  check + early null) — keep MRT's `// if no content in row, skip row` comment
  (MRT's own comment, allowed).
- Merge `{ ...parseFromValuesOrFunc(srtTableFooterRowProps, { footerGroup,
  table }), ...rest }`.
- tr classes via cva `footerRowVariants`: base `relative w-full bg-background`
  (mrtTheme baseBackgroundColor → bg-background; commented destructure + Note)
  + variant layout grid → `flex`.
- Virtual padding `<th style={{display:'flex', width: virtualPadding*}}/>`
  verbatim; map with virtualizer index reassignment verbatim →
  `<SRT_TableFooterCell footer key staticColumnIndex table />`.
- Spread-then-className order.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/footer/SRT_TableFooterRow.tsx`
--max-warnings=0. Only this file. No core, no git.
