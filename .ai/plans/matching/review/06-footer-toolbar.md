### footer/ + toolbar/

SoT = `packages/material-react-table/src/components/{footer,toolbar}/`
SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/{footer,toolbar}/`
Reviewer: rev-toolbar. READ-ONLY verification review. 1:1 port parity.

---

### footer/

### [ ] SRT_TableFooter.tsx : MRT_TableFooter.tsx
- `parity-ok` — Skip-if-no-footer guard is byte-identical (footerGroups.some -> headers.some on string footer || columnDef.Footer). Same early `return null`.
- `parity-ok` — Sticky logic identical: `(isFullScreen || enableStickyFooter) && enableStickyFooter !== false`. SRT maps MRT's sticky `sx` (position sticky, bottom 0, opacity .97, zIndex 1) to `sticky bottom-0 z-[1] opacity-97 bg-background`.
- `parity-ok` — Slot props wired: `srtTableFooterProps` via `parseSRT_HtmlProps({table})`, spread before className merge. Matches MRT `muiTableFooterProps`.
- `deviation` (cosmetic) — MRT sticky uses a theme grey `outline`; SRT substitutes `bg-background` + relies on `border-t`. No outline equivalent. Visual-only, acceptable for shadcn theme.
- `gap` (intentional) — MRT `layoutMode?.startsWith('grid')` -> `display:grid` is not ported (SRT_TableFooter.tsx line ~64 has no grid branch). Consistent with grid-layout being out of scope across SRT.
- `note` — MRT forwards a ref callback that also writes `tableFooterProps.ref`; SRT only sets `tableFooterRef` via the standard `ref` prop. Forwarded-ref-from-slot-props not supported (parseSRT_HtmlProps strips ref). Minor.

### [ ] SRT_TableFooterCell.tsx : MRT_TableFooterCell.tsx
- `parity-ok` — RTL alignment correctly ported: `columnDefType === 'group' ? center : columnResizeDirection === 'rtl' ? right : left`. MRT uses `theme.direction === 'rtl'`; SRT comment documents the `columnResizeDirection` source mapping. Good.
- `parity-ok` — `colSpan={footer.colSpan}`, `data-index`, `data-pinned` all present. Density padding cva (compact p-2 / comfortable p-4 / spacious p-6) maps MRT's 0.5/1/1.5rem. `font-bold` + `align-top` (verticalAlign top) match.
- `parity-ok` — columnDef-level slot props: SRT merges table-level `srtTableFooterCellProps` then `columnDef.srtTableFooterCellProps` via `mergeSRT_HtmlProps` (columnDef wins), mirroring MRT's spread order. Task focus item satisfied.
- `deviation` — MRT footer content precedence: `tableCellProps.children ?? (isPlaceholder ? null : columnDef.Footer ?? columnDef.footer ?? null)`. SRT drops the `children ??` first branch (SRT_TableFooterCell.tsx render: starts directly at `footer.isPlaceholder ? null : ...`). A consumer passing `children` via slot props won't override footer content. Minor — slot-prop children is rare for footers.
- `gap` (TODO, intentional) — Keyboard shortcuts (`cellKeyboardShortcuts` / copy on footer, `tabIndex`, `enableKeyboardShortcuts`) are commented out with explicit TODO. MRT wires `onKeyDown` + `tabIndex={enableKeyboardShortcuts ? 0 : undefined}`. Documented deferral.
- `parity-ok` — Pinning offsets: `position:sticky` + `left getStart('left')` / `right getAfter('right')` + zIndex, plus `bg-muted/95` solid bg so scrolled content doesn't bleed through (parity with head cell). Matches MRT `getCommonMRTCellStyles` pinning intent.

### [ ] SRT_TableFooterRow.tsx : MRT_TableFooterRow.tsx
- `parity-ok` — Skip-if-no-content guard identical to MRT (headers.some string footer || Footer -> return null).
- `parity-ok` — Virtual padding spacers: `virtualPaddingLeft`/`virtualPaddingRight` render `<th style={{display:flex,width}}/>` exactly as MRT. Virtual column index remap (`footerOrVirtualFooter.index` -> `footerGroup.headers[idx]`) is a 1:1 copy.
- `parity-ok` — Slot props: `srtTableFooterRowProps` via parseSRT_HtmlProps({footerGroup, table}), matching MRT's `muiTableFooterRowProps` args.
- `deviation` (cosmetic) — MRT sets `backgroundColor: baseBackgroundColor` + `width:100%` + grid `display:flex`. SRT uses `relative border-b` (adds a bottom border MRT lacks; relies on tfoot border-t). Width 100% implicit via table layout. Visual-only.
- `gap` (intentional) — grid layoutMode branch (`display:flex` for grid) not ported, consistent with cluster-wide grid omission.

---

### toolbar/

### [ ] SRT_BottomToolbar.tsx : MRT_BottomToolbar.tsx
- `parity-ok` — Composition order matches: LinearProgressBar(isTopToolbar=false) -> AlertBanner(if positionToolbarAlertBanner==='bottom') -> DropZone(['both','bottom']) -> custom-actions/pagination row.
- `parity-ok` — `stackAlertBanner = isMobile || !!renderBottomToolbarCustomActions` matches MRT exactly. `useSRT_MediaQuery('(max-width:720px)')` mirrors MRT `useMediaQuery`.
- `parity-ok` — Pagination overlay: when not stacked, pagination is `absolute right-0 top-0`; MRT uses `position: stackAlertBanner ? relative : absolute; right:0; top:0`. SRT pagination gating `enablePagination && ['both','bottom'].includes(positionPagination)` matches.
- `parity-ok` — Fullscreen fixed positioning: SRT `isFullScreen && 'fixed bottom-0 left-0 right-0 z-40'` maps MRT `position:fixed; bottom/left/right:0`.
- `deviation` (cosmetic) — MRT inset boxShadow (`0 1px 2px -1px grey inset`) + `getCommonToolbarStyles`; SRT uses `border-t bg-background`. Visual-only.
- `note` — Custom-actions fallback `<span />` present in both (keeps flex spacing when no actions). Good.

### [ ] SRT_LinearProgressBar.tsx : MRT_LinearProgressBar.tsx
- `parity-ok` — Show condition identical: `showProgressBars !== false && (showProgressBars || isSaving)`. Position via `isTopToolbar ? bottom-0 : top-0`, `absolute w-full`. Maps MRT Collapse `bottom/top` + `position:absolute`.
- `parity-ok` — Slot props: `srtLinearProgressProps` via parseFromValuesOrFunc({isTopToolbar, table}), matching MRT `muiLinearProgressProps`.
- `deviation` — MRT LinearProgress is **indeterminate** by default (no `value` -> animated bar). SRT uses `useSRT_ProgressAnimation(show, {ease-in-out, 2000ms})` driving a **determinate** Progress `value` that animates 0->100. Visually approximates indeterminate but is a different mechanism; determinate `value` cannot represent true indeterminate state. Acceptable approximation.
- `note` (cleanup) — `...rest` is destructured but the component signature has no rest-bearing extra props beyond the 3 declared; `linerProgressProps` is spread twice (on CollapsibleContent AND Progress), so className merges twice. Harmless but redundant. Also a stale trailing TODO block contradicts the now-implemented `srtLinearProgressProps` wiring — dead comment.
- `note` — Variable typo `linerProgressProps` (missing 'a'). Cosmetic.
- `parity-ok` — Collapse/mount: MRT `Collapse mountOnEnter unmountOnExit`; SRT `Collapsible open={show}`. Mount behavior differs slightly (Radix Collapsible keeps mounted) but visually equivalent.

### [ ] SRT_TablePagination.tsx : MRT_TablePagination.tsx
- `parity-ok` — Range text identical formula: `lastRowIndex===0 ? 0 : (firstRowIndex+1).toLocaleString` + `-lastRowIndex of totalRowCount`, all `toLocaleString(localization.language)`. min-w-[8ch] center matches MRT Typography minWidth 8ch.
- `parity-ok` — rowsPerPage select: `showRowsPerPage` default true, label `localization.rowsPerPage`, `setPageSize(+value)`, options support `number[]` or `{label,value}[]`. id `srt-rows-per-page-${id}` (MRT `mrt-`). Matches.
- `parity-ok` — `showFirstButton`/`showLastButton` default to `showFirstLastPageButtons = numberOfPages > 2`, sourced from `...rest`. Matches MRT default behavior.
- `parity-ok` — Three modes handled: `custom` -> null pagination controls; `pages` -> numbered buttons with ellipsis; `default` -> first/prev/next/last icon buttons. `paginationDisplayMode = 'default'` default matches MRT.
- `deviation` — MRT `pages` mode delegates to MUI `<Pagination>` (boundaryCount/siblingCount defaults). SRT reimplements `getPageItems()` with `boundaryCount=1, siblingCount=1, total<=7 shows all`. Documented as mirroring MUI defaults; ellipsis logic is hand-rolled but matches MUI's typical output. Verify edge cases (e.g. total=8, current near edges) if pixel-parity needed.
- `note` — `default` mode renders `ChevronsLeft`/`ChevronsRight` (first/last) gated on `showFirstButton`/`showLastButton`; prev/next always shown. `disableBack = pageIndex<=0`, `disableNext = lastRowIndex>=totalRowCount`. Matches MRT default-mode IconButton gating. `mt-12` (3rem) top offset when `position==='top' && enableToolbarInternalActions` ported correctly.

### [ ] SRT_ToolbarAlertBanner.tsx : MRT_ToolbarAlertBanner.tsx
- `deviation` — `selectedAlert` gate: MRT shows it whenever `selectedRowCount > 0`; SRT requires `enableRowSelection && selectedRowCount > 0`. If selection state is non-empty while `enableRowSelection` is false/undefined, MRT renders the count, SRT suppresses it. Minor behavioral divergence; SRT's guard is arguably safer but not 1:1.
- `parity-ok` — selectedRowCount memo identical: `manualPagination ? Object.values(rowSelection).filter(Boolean).length : filteredRowCount`. totalRowCount `rowCount ?? getCoreRowModel().rows.length`. Localization `selectedCountOfRowCountRowsSelected` with `{selectedCount}`/`{rowCount}` replace + toLocaleString. clearSelection button calls `getSRT_SelectAllHandler({table})(event,false,true)` — matches MRT `getMRT_SelectAllHandler`.
- `parity-ok` — Grouping chips: maps `grouping`, `index>0` shows `thenBy`, chip label = column header, delete (`XIcon` button) calls `toggleGrouping()`. `srtToolbarAlertBannerChipProps` spread on chip span (MRT `muiToolbarAlertBannerChipProps`). `groupedBy` localization prefix present.
- `parity-ok` — head-overlay: renders `SRT_SelectCheckbox` inline when `enableRowSelection && enableSelectAll && positionToolbarAlertBanner === 'head-overlay'`. Matches MRT.
- `parity-ok` — Density padding parity: non-head-overlay `px-4 py-2` (MRT 0.5rem 1rem); head-overlay spacious `px-5 py-3` / comfortable `px-3 py-2` / compact `px-2 py-1` (MRT 0.75/1.25, 0.5/0.75, 0.25/0.5rem). `renderToolbarAlertBannerContent` render slot wired with `{groupedAlert, selectedAlert, table}`.
- `deviation` (cosmetic) — MRT max-width clamps the alert message to `tablePaperRef.current.clientWidth - 1rem`; SRT does NOT reference tablePaperRef (no width clamp). On very wide grouped/selected text overflow handling differs. Also MRT Collapse `timeout={stackAlertBanner?200:0}`; SRT uses fixed `transition-all duration-200` + `max-h-40/max-h-0` height animation. SRT bottom-position `-mb-4` maps MRT `mb:-1rem`. Visual approximation, acceptable.
- `note` — `alertProps?.title`/`alertProps?.children` (MRT AlertTitle + children-before-alerts) not ported; SRT renders only selectedAlert/groupedAlert. MRT lets slot-prop title/children inject extra content above the alerts. Minor gap.

### [ ] SRT_ToolbarDropZone.tsx : MRT_ToolbarDropZone.tsx
- `parity-ok` — useEffect show-logic is a 1:1 copy: gated on `state?.showToolbarDropZone !== undefined`, sets `!!enableGrouping && !!draggingColumn && draggingColumn.columnDef.enableGrouping !== false && !grouping.includes(draggingColumn.id)`.
- `deviation` (cleanup) — SRT useEffect deps include `setShowToolbarDropZone` and `table.options.state?.showToolbarDropZone`; MRT deps are only `[enableGrouping, draggingColumn, grouping]`. SRT's expanded deps are more lint-correct; behavior equivalent.
- `parity-ok` — Drag handlers: `handleDragEnter` -> setHoveredColumn({id:'drop-zone'}), `handleDragOver` -> preventDefault. SRT adds `handleDragLeave` -> setHoveredColumn(null) (MRT has none). Minor enhancement, not a regression.
- `parity-ok` — Hover highlight: `hoveredColumn?.id === 'drop-zone'` toggles bg intensity (SRT blue-50/20 vs /10; MRT info alpha 0.2 vs 0.1). Dashed border + backdrop-blur + absolute inset-0 + z-[4] match MRT (border dashed info, blur(4px), zIndex 4).
- `parity-ok` — `dropToGroupBy` localization with `{column}` replace from `draggingColumn?.columnDef?.header`. Identical.
- `deviation` — MRT wraps in MUI `<Fade in={showToolbarDropZone}>` (always mounted, fades). SRT does `if (!showToolbarDropZone) return null` + `animate-in fade-in-0`. SRT unmounts when hidden vs MRT fades out. Slight exit-animation difference; entry fade preserved.

### [ ] SRT_ToolbarInternalButtons.tsx : MRT_ToolbarInternalButtons.tsx
- `parity-ok` — Button ORDER is byte-identical: ToggleGlobalFilter -> ToggleFilters -> ShowHideColumns -> ToggleDensePadding -> ToggleFullScreen. All five gating conditions copied verbatim.
- `parity-ok` — Each gate matches MRT: globalFilter `enableFilters && enableGlobalFilter && !initialState?.showGlobalFilter`; filters `enableFilters && enableColumnFilters && columnFilterDisplayMode !== 'popover'`; showHide `enableHiding || enableColumnOrdering || enableColumnPinning`; density `enableDensityToggle`; fullscreen `enableFullScreenToggle`.
- `parity-ok` — `renderToolbarInternalActions?.({table}) ?? <>...</>` render-slot override present, matches MRT.
- `parity-ok` — Container `z-[3] flex items-center gap-1` maps MRT `display:flex; alignItems:center; zIndex:3`.
- `note` — MRT has no print/export button here either (MRT itself omits it in this component), so SRT is complete relative to SoT. No gap.

### [ ] SRT_TopToolbar.tsx : MRT_TopToolbar.tsx
- `parity-ok` — Composition order matches MRT exactly: AlertBanner(top) -> DropZone(['both','top']) -> actions row(globalFilter-left, customActions, internalActions wrapper{globalFilter-right, InternalButtons}) -> Pagination(top/both) -> LinearProgressBar(isTopToolbar).
- `parity-ok` — Responsive stack logic: `isMobile || !!renderTopToolbarCustomActions || (showGlobalFilter && isTablet)`. SRT adds `isTablet = (max-width:1024px)` and `isMobile = (max-width:720px)` — MRT uses the same two breakpoints (720 / 'md'~tablet). Matches the task's mobile/tablet breakpoint focus.
- `parity-ok` — Actions row positioning: `stackAlertBanner ? relative : absolute right-0 top-0`, `flex w-full items-start justify-between gap-2 p-2`. Maps MRT `alignItems:flex-start, justifyContent:space-between, gap 0.5rem, p 0.5rem, position absolute/relative`.
- `parity-ok` — Internal-actions branch: when `enableToolbarInternalActions`, wraps right-globalFilter + InternalButtons in `flex flex-wrap-reverse items-center justify-end gap-2` (MRT `flexWrap:wrap-reverse, justifyContent:flex-end`). Else falls back to right-globalFilter only. Identical control flow.
- `parity-ok` — Fullscreen sticky: `isFullScreen ? 'sticky top-0 z-40 bg-background'`. Maps MRT `position:sticky; top:0`.
- `note` — MRT passes `globalFilterProps` (parsed slot props) into MRT_GlobalFilterTextField; SRT passes only `table={table}` (no spread of pre-parsed global-filter props). GlobalFilter slot-prop forwarding handled inside SRT_GlobalFilterTextField instead — verify in inputs cluster review (#2). Not a top-toolbar gap per se.

---

## Cross-file summary

- Overall parity: HIGH. All 10 pairs are faithful 1:1 ports in structure, ordering, gating, localization, and slot-prop wiring.
- Confirmed gaps (all intentional/documented): grid layoutMode branches omitted cluster-wide (footer); footer-cell keyboard shortcuts deferred (TODO); LinearProgress determinate-animation approximation vs MRT indeterminate.
- Behavioral deviations worth a second look: (1) AlertBanner `selectedAlert` extra `enableRowSelection &&` gate vs MRT's count-only check; (2) footer cell drops `children ??` slot-prop precedence; (3) AlertBanner lacks tablePaperRef width-clamp and slot-prop title/children injection; (4) Pagination `pages` mode reimplements MUI ellipsis logic (verify edge cases).
- Cleanups: LinearProgressBar double-spread of `linerProgressProps`, variable typo `linerProgressProps`, and stale trailing TODO comment contradicting implemented `srtLinearProgressProps`.
