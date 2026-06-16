### head/

Verification review of the 9 head/ pairs. SoT = MRT `packages/material-react-table/src/components/head/`, SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/head/`. All bullets cite line numbers in the respective file.

---

### [ ] SRT_TableHead.tsx : MRT_TableHead.tsx
- `parity-ok` — Sticky logic `enableStickyHeader || isFullScreen` (SRT:44 / MRT:39), grid `display:grid` branch (SRT:67 / MRT:52), and grid+sticky `top:0` preserved (SRT:68 — note SRT applies `top:0` for ALL sticky cases via inline style, MRT:55 gated it to grid-only because the semantic case used CSS `sticky top-0`; SRT also adds `top-0` only implicitly — see note below).
- `note` — MRT applied `top: stickyHeader && grid ? 0 : undefined` (MRT:55) so semantic sticky relied on the row, not thead. SRT sets `top: stickyHeader ? 0 : undefined` (SRT:68) unconditionally for sticky. Functionally fine (thead has no own sticky class so top is inert unless something makes it sticky), but it is a slight literal deviation; verify no semantic sticky double-offset.
- `parity-ok` — head-overlay banner branch: same gate `positionToolbarAlertBanner==='head-overlay' && (showAlertBanner || selectedRows>0)` (SRT:49-51 / MRT:60-61); colSpan = visibleLeafColumns.length, padding 0, grid display on tr/th mirrored (SRT:72-80 / MRT:62-76).
- `parity-ok` — slot prop `srtTableHeadProps` parsed via `parseSRT_HtmlProps({table})` (SRT:47), spread + className/style merge (SRT:56,61,69) maps MRT `muiTableHeadProps` (MRT:35).
- `note` — bg: MRT used `mrtTheme.baseBackgroundColor` on the ROW only and `opacity:0.97` on thead; SRT puts `bg-muted/50 opacity-[0.97]` + `border-b` on the thead (SRT:58). Background now lives on thead AND row (see row file), acceptable shadcn idiom but a styling deviation from MRT (which had no thead bg).
- `parity-ok` — `tableHeadRef` forwarded (SRT:55). MRT also forwarded a user `tableHeadProps.ref` (MRT:46-49); SRT drops that secondary ref forwarding since the slot API differs — minor, low impact.

### [ ] SRT_TableHeadRow.tsx : MRT_TableHeadRow.tsx
- `parity-ok` — virtual padding spacer cells (left/right) identical: `<th style={{display:flex,width:virtualPaddingLeft/Right}}/>` (SRT:65-67,88-90 / MRT:62-64,85-87).
- `parity-ok` — virtual column mapping resolves real header by `.index` when virtualizer present, else maps `headerGroup.headers` (SRT:68-86 / MRT:65-83); null-guard on header preserved.
- `parity-ok` — grid → row `display:flex` (SRT:57 `flex` / MRT:53); sticky `enableStickyHeader && layoutMode==='semantic' ? sticky : relative` with `top:0` (SRT:58-60 / MRT:54-58).
- `note` — boxShadow `4px 0 8px rgba(0,0,0,0.1)` hardcoded (SRT:54) vs MRT `alpha(theme.palette.common.black,0.1)` (MRT:52). Equivalent in light mode; will not adapt to theme but matches the literal alpha value.
- `note` — bg: MRT row used `baseBackgroundColor` (MRT:51); SRT uses `bg-background` (SRT:54). Theme-token equivalent. Combined with thead `bg-muted/50` the row bg will paint over it — intended.
- `parity-ok` — slot `srtTableHeadRowProps` parsed with `{headerGroup, table}` (SRT:45) matching MRT `muiTableHeadRowProps` context (MRT:40).

### [ ] SRT_TableHeadCell.tsx : MRT_TableHeadCell.tsx
- `parity-ok` — `showColumnActions`, `showDragHandle`, `isColumnPinned` derivations are byte-identical to MRT (SRT:100-116 / MRT:79-95). dragEnter/dragOver handlers identical (SRT:124-139 / MRT:135-150). data-* attrs, colSpan, aria-sort, tabIndex, virtualizer `measureElement` on non-group node all preserved (SRT:228-248 / MRT:178-200).
- `deviation` (documented, by design) — display-column Header content rendered inline by column id (SRT:154-171): `mrt-row-select` gated by `enableSelectAll && enableMultiRowSelection` → SRT_SelectCheckbox; `mrt-row-expand` → SRT_ExpandAllButton or `localization.expand`; row-numbers/actions labels. MRT delegates this to core `getMRT_*ColumnDef` Header fns. Matches the stated display-column boundary. Select-all gate is correct per task spec.
- `deviation` — padding. MRT had fine-grained `p/pt/pb` rules varying by density × columnDefType(display/group/data) × showColumnFilters (MRT:212-233). SRT collapses to a cva with only density: `compact p-2 / comfortable p-4 / spacious px-6 py-5` (SRT:51-65). The display-vs-data padding asymmetry, the `pb` reduction when `showColumnFilters`, and the smaller `pt` for group/compact are NOT reproduced. Visual-only but a real fidelity gap.
- `note` — `headerPL` left-padding accumulation (MRT:97-103, adds pl for sort/actions/dragHandle when align center) is NOT ported in SRT. SRT has no center-align PL compensation (SRT:274-283 just uses flex). Affects only `align==='center'` headers; low impact.
- `parity-ok` — resize/dragging/hover borders mapped to classes: `isResizingBorder` (resizing && !subHeaders.length) → `border-r-2 border-r-primary` (SRT:120-122,254); dragging → dashed muted; hovered → dashed primary (SRT:255-260). MRT used `columnResizeMode==='onChange'` in the resize-border gate (MRT:108) — SRT drops the `onChange` condition (SRT:120-122), so resize border may show in `onEnd` mode too. Minor deviation.
- `note` — pinning: SRT reimplements sticky offsets inline via `getStart('left')`/`getAfter('right')` + `bg-muted/95` (SRT:185-198,261) instead of MRT's `getCommonMRTCellStyles` helper (MRT:236). Background-on-pinned and sticky offsets present; verify z-index (SRT uses 1) vs MRT helper's value. Slot merge `srtTableHeadCellProps` table-then-columnDef done via mergeSRT_HtmlProps (SRT:202-224) mirrors MRT double-parse (MRT:71-76).
- `note` — MRT hover rule `'& :hover' .MuiButtonBase-root {opacity:1}` (MRT:204-207) replaced by `group` + `group-hover:opacity-100` on child buttons (SRT:252; see ColumnActions/Sort/Filter files). Functionally equivalent.

### [ ] SRT_TableHeadCellColumnActionsButton.tsx : MRT_TableHeadCellColumnActionsButton.tsx
- `parity-ok` — anchorEl useState + handleClick (stopPropagation + preventDefault + setAnchorEl) identical (SRT:52-58 / MRT:37-43); SRT_ColumnActionMenu opened with same props when anchorEl set (SRT:97-104 / MRT:86-93).
- `parity-ok` — tooltip title `iconButtonProps?.title ?? localization.columnActions` → SRT `title ?? localization.columnActions` (SRT:92 / MRT:61); aria-label localization.columnActions (SRT:78 / MRT:64).
- `parity-ok` — opacity 0.3 → hover 1 mapped to `opacity-30 hover:opacity-100 group-hover:opacity-100` (SRT:81 / MRT:69-75). MoreVert icon default with `children` override (SRT:94 / MRT:81-83).
- `parity-ok` — slot `srtColumnActionsButtonProps` merged table-then-columnDef (columnDef wins) via mergeSRT_HtmlProps (SRT:62-88) mirrors MRT's two-level parse (MRT:46-54). `children`/`title` destructured out before spread (SRT:75) — correct.
- `note` — MRT sizing `m:-8px -4px`, `height/width:2rem`, MoreVert `scale(0.9)` (MRT:72-82). SRT uses `h-8 w-8` and icon `h-3.5 w-3.5` (SRT:81,94); negative margins not reproduced. Minor spacing deviation.

### [ ] SRT_TableHeadCellFilterContainer.tsx : MRT_TableHeadCellFilterContainer.tsx
- `parity-ok` — mount gate `showColumnFilters || columnFilterDisplayMode==='popover'` identical (SRT:45 / MRT:36); MUI Collapse mountOnEnter/unmountOnExit approximated by early-return null + enter animation (SRT:47,50-51).
- `parity-ok` — filterVariant routing identical order: checkbox → range-slider → isRangeFilter range fields → text field (SRT:53-61 / MRT:41-49). `getColumnFilterInfo` used for isRangeFilter (SRT:43 / MRT:32).
- `note` — animation `animate-in slide-in-from-top-2` (SRT:51) substitutes Collapse height transition; no collapse-height animation. Cosmetic only.

### [ ] SRT_TableHeadCellFilterLabel.tsx : MRT_TableHeadCellFilterLabel.tsx
- `parity-ok` — the entire `filterTooltip` string builder (filterByColumn vs filteringByColumn, filterType localization key casing, range "and"/"or" join, multiselect getSelectLabel, trailing `" "` strip) is byte-identical (SRT:83-118 / MRT:68-103).
- `parity-ok` — show gate `popover || (filterValue && !isRangeFilter) || (isRangeFilter && (val[0]||val[1]))` matches MRT Grow `in` (SRT:120-123 / MRT:108-111); MUI Grow→early-return null + `animate-in zoom-in-50` (SRT:125,150).
- `parity-ok` — click handler: popover→open, else setShowColumnFilters(true); queueMicrotask focus+select on `${column.id}-0` input; stopPropagation (SRT:127-138 / MRT:119-130). Identical.
- `parity-ok` — popover mode renders PopoverAnchor(button) + PopoverContent(align center/side bottom) wrapping FilterContainer in `p-4`, with onClick stopProp and Enter-closes (SRT:166-183 / MRT:149-174). anchorOrigin/transformOrigin (center top / center bottom) → align center side bottom — equivalent placement.
- `note` — opacity isFilterActive?1:0.3 → `opacity-100 / opacity-30 group-hover:opacity-100` (SRT:151-153 / MRT:136). Filter icon `scale-75` preserved (SRT:149 / MRT:138). FilterAlt → lucide FilterIcon — icon swap only.

### [ ] SRT_TableHeadCellGrabHandle.tsx : MRT_TableHeadCellGrabHandle.tsx
- `parity-ok` — handleDragStart: setDraggingColumn + setDragImage(headCell,0,0) in try/catch (SRT:49-60 / MRT:45-57). handleDragEnd: drop-zone→toggleGrouping, else reorderColumn + setColumnOrder + setColumnPinning re-derive left/right (SRT:62-83 / MRT:59-81). Logic identical.
- `parity-ok` — slot `srtColumnDragHandleProps` merged table-then-columnDef (columnDef wins), then user props composed OVER library handlers via mergeSRT_HtmlProps (SRT:87-108). MRT merged muiColumnDragHandleProps table-then-columnDef and called user onDragStart/onDragEnd FIRST inside its handlers (MRT:46,60). SRT order: library handler runs, then user (mergeSRT_HtmlProps base-then-user). Slight ordering difference but both invoke both — acceptable.
- `parity-ok` — renders SRT_GrabHandleButton with `location="column"` (SRT:112) — extra prop vs MRT but matches SRT button API.

### [ ] SRT_TableHeadCellResizeHandle.tsx : MRT_TableHeadCellResizeHandle.tsx
- `parity-ok` — handler from `header.getResizeHandler()` wired to onMouseDown + onTouchStart (SRT:71-72 / MRT:50-51); onDoubleClick resets: setColumnSizingInfo isResizingColumn:false + column.resetSize() (SRT:64-69 / MRT:43-49). Touch IS supported.
- `parity-ok` — density margin offset compact -8 / comfortable -16 / spacious -24 (SRT:49-50 / MRT:31-36); display columnDefType left/right 4px else 0 (SRT:52 / MRT:38); RTL/LTR side+margin keying mirrored (SRT:77-79 / MRT:68-73); onEnd transform translateX(deltaOffset*dir) (SRT:54-60 / MRT:53-59). Equivalent.
- `note` — STALE/INACCURATE comment: SRT header block (SRT:14-29) says "Barebones" and TODO lists "Add touch support" / "Better RTL support" as not-done, but touch (SRT:72) and RTL keying (SRT:77-79) ARE implemented. Comment misrepresents the code; recommend updating.
- `deviation` — active-state divider visuals incomplete. MRT `'&:active > hr'` set color `info.main` AND opacity `header.subHeaders.length || columnResizeMode==='onEnd' ? 1 : 0` (MRT:62-65). SRT uses static `hover:border-primary active:border-primary` + `isResizing && border-primary` (SRT:86-88) and does NOT gate visibility on subHeaders/onEnd. The "hide handle unless group-header or onEnd-mode while active" behavior is lost.
- `note` — MRT Divider had `transform: translateX(4px)` and `transition all 150ms` (disabled while resizing) (MRT:85-88); SRT uses `transition-all` always (SRT:85), no translateX offset. Minor visual.

---

Summary: 9/9 pairs are faithful 1:1 ports of behavior/logic. No correctness gaps in drag/reorder, pinning, sort, filter, resize wiring, or virtualization. Deviations are styling-fidelity (cell padding cva collapse, action button margins, resize active-opacity gating) plus the by-design display-column Header rendering (select-all gate verified correct). One stale comment in SRT_TableHeadCellResizeHandle. Items to flag for follow-up: (1) head cell padding fidelity vs MRT density×type matrix, (2) resize-border `onChange` gate dropped in head cell, (3) resize active divider subHeaders/onEnd opacity logic missing.
