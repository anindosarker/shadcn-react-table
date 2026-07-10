# Plan: SRT_TableHeadCell ← MRT_TableHeadCell

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/head/SRT_TableHeadCell.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHeadCell.tsx`.
Garbage-zone; author fresh. Biggest head/ file. This pair (with the new core
helpers) fixes the user-reported grid-mode right gap (cells must GROW in grid
layout via `getSRTCellWidthStyles`' flex branch) and delivers sticky th styles.

## Resolved decisions

- Interface `extends TableCellProps { columnVirtualizer?, header,
  staticColumnIndex?, table }` (core TableCellProps).
- MUI TableCell → `<th>`; content Boxes → divs with class hooks renamed
  Mui-→Srt-: `Srt-TableHeadCell-Content`, `-Content-Labels`,
  `-Content-Wrapper`, `-Content-Actions`.
- `useTheme` dropped (commented + Note). Consequences:
  - `align` prop: MUI align → logical CSS classes instead — group →
    `text-center justify-center`, else `text-start` (logical start handles rtl
    without theme; better than MRT's manual rtl branch — Note this). The
    `tableCellProps?.align` reads inside the content divs: treat as
    `undefined` unless user passes align via slot props — since native th has
    no align semantics in our port, replace those reads with the
    group-centering conditions only (`columnDefType === 'group'` → center;
    row-reverse branch for align==='right' is dropped with a Note).
  - `theme.palette.grey[500]` (dragging dashed border) →
    `var(--color-muted-foreground)`; `draggingBorderColor` (mrtTheme, dropped)
    → `var(--color-primary)`. Commented mrtTheme destructure line + Note.
- **Sticky th styles (MUI Table stickyHeader flag equivalent — decided at the
  SRT_Table pair)**: compute `stickyHeader = enableStickyHeader ||
  getState().isFullScreen` and when true add classes `sticky top-0 z-[2]
  bg-background` to the th (cells own their bg; this kills see-through rows).
  When also pinned, the pinned zIndex/position below still applies (style wins
  over class position via inline `position: 'sticky'` — same result).
- Core helpers (NEW, from style.utils): inline `style` object order —
  `{ ...getSRTCellWidthStyles({ column, header, table }),
     ...(isColumnPinned ? getSRTPinnedCellStyles({ column, table }) : {}),
     ...tableCellProps?.style,
     ...draggingBorders }`
  (user style before draggingBorders — MRT puts draggingBorders last, they win).
- Pinned visuals (June deviation, positional came from helper): pinned th also
  gets classes `bg-background opacity-[0.97]` via conditional class string.
- `draggingBorders` useMemo verbatim, colors per above; NO `!important`
  (React style objects can't express it — Note; acceptable, borders still
  render since draggingBorders spreads last).
- getCommonMRTCellStyles' remaining pieces → classes on the th:
  `relative bg-inherit font-bold overflow-visible align-top` base;
  grid layout → `flex flex-col` (display flex + flexDirection column);
  group → `justify-center`; dragging/hovered column → `opacity-50` else
  nothing (opacity 1 default); transition → `transition-[padding] duration-150
  ease-in-out` EXCEPT when `enableColumnVirtualization` (then no transition
  class); zIndex conditional classes: resizing-or-dragging-this-column →
  `z-[2]`, else pinned non-group → `z-[1]`, else `z-0` (mirror MRT's rule;
  when sticky-header z-[2] also present, cn keeps the later/stronger — order
  the sticky class AFTER the zIndex conditional in the cn() call so sticky's
  z-[2] wins when applicable);
  focus-visible outline → `focus-visible:outline-2 focus-visible:outline-ring`
  (cellNavigationOutlineColor → ring token);
  hover-reveals-buttons: `[&:hover_button]:opacity-100` (maps MRT's
  `& :hover .MuiButtonBase-root { opacity: 1 }`).
- Density paddings → runtime-conditional classes mirroring MRT's exact rem
  values: p: compact `p-2`; comfortable display `p-3` else `p-4`; spacious
  display `px-5 py-4` else `p-6`. pb: display `pb-0`; showColumnFilters||compact
  `pb-[0.4rem]` else `pb-[0.6rem]`. pt: group||compact `pt-1`; comfortable
  `pt-3`; else `pt-5`. userSelect: `select-none` when enableMultiSort &&
  canSort. Put these in the cva/conditional strings; exact-value arbitrary
  classes fine.
- `headerPL` useMemo verbatim (+ authorized eslint-disable on deps if flagged);
  applied as inline `style={{ paddingLeft: `${headerPL}rem` }}` on the Labels
  div ONLY when the center-align/group condition MRT uses
  (`tableCellProps?.align === 'center'` → in our port: `columnDefType ===
  'group'`... MRT gates on align center; with align dropped, gate on
  `columnDefType === 'group'`) — Note the substitution.
- Labels div: onClick `column.getToggleSortingHandler()`, cursor-pointer
  conditional class, `overflow-hidden` when columnDefType==='data', flex
  items-center.
- Wrapper div: `hover:text-clip` (maps &:hover textOverflow clip),
  `text-ellipsis`, `overflow-hidden` when data, inline style
  `minWidth: ${Math.min(columnDef.header?.length ?? 0, 4)}ch` (runtime),
  whiteSpace: header length < 20 → `whitespace-nowrap` else `whitespace-normal`.
- Children structure verbatim: placeholder null; tableCellProps.children ??
  content div tree (Labels [HeaderElement wrapper, FilterLabel if canFilter,
  SortLabel if canSort], Actions div (whitespace-nowrap) with GrabHandle
  (tableHeadCellRef `{ current: tableHeadCellRefs.current?.[column.id]! }`)
  and ColumnActionsButton, only when columnDefType !== 'group'; ResizeHandle
  if canResize); subheader FilterContainer when columnFilterDisplayMode ===
  'subheader' && canFilter.
- th attrs verbatim: aria-sort ternary, colSpan, data-can-sort, data-index,
  data-pinned, data-sort, onDragEnter/handleDragOver, ref callback
  (tableHeadCellRefs registry + measureElement for non-group), tabIndex when
  enableKeyboardShortcuts, `{...tableCellProps}`, onKeyDown AFTER spread
  (composed handler — calls user onKeyDown then cellKeyboardShortcuts from
  core; verify export, STOP if missing).
- handleDragEnter/handleDragOver/handleKeyDown/HeaderElement verbatim.
- All fresh siblings (SortLabel, FilterLabel, FilterContainer, GrabHandle,
  ResizeHandle, ColumnActionsButton) are rebuilt and take exactly the props
  MRT passes — use them directly.

## Structure

Mirror MRT order throughout. Comments: dropped useTheme/mrtTheme/align notes +
`//@ts-expect-error` equivalents only where MRT has them.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHeadCell.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
