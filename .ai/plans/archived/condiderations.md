# Changes I've introduced from the original package

## Overall
- Used cva instead of api to modify the className props. Since we are not shipping with prestyled components like we used to do in MUI package, we don't need to do complicated api stuff to modify the stylings. The user can easily modify the styles by adding new variants.

### Individual components


### inputs/ (Phase 3 review vs MRT components/inputs/)
Reviewed each SRT_ input against its MRT_ counterpart for prop parity,
controlled/uncontrolled state, debounce timing, clear/blur/Enter handling,
filter-variant dispatch completeness, and accessibility. App typecheck +
`pnpm format` green (zero errors in inputs/). Browser-verified at :5273: filter
text fields render with correct localized placeholders ("Filter by First Name",
etc.), select-all + per-row checkboxes render with proper aria-labels, table
filter row toggles correctly.

Behavior confirmed 1:1 with MRT:
- **Debounce timing** — text/textbox filters 200ms (auto) / 400ms (manual),
  non-textbox 1ms, global filter 250ms / 500ms. Matches MRT exactly.
- **SRT_FilterTextField variant dispatch** — text, range (two halves via
  SRT_FilterRangeFields), select, multi-select, autocomplete, date/datetime/time,
  and empty/notEmpty chip mode all dispatch by `columnFilterVariant` /
  `getColumnFilterInfo`. Clear sets `[]` for multi-select, per-index `undefined`
  for range, `undefined` otherwise — matches MRT. `isMounted` effect re-syncs on
  external `column.getFilterValue()` change. `columnDef.Filter` escape hatch kept.
- **Tri-state SRT_FilterCheckbox** — undefined→'true'→'false'→undefined cycle,
  indeterminate while undefined. Matches MRT.
- **SRT_EditCellTextField** — text via Input, select via Select; writes
  `_valuesCache` on change (select) / blur (text); blur-on-Enter via editInputRefs.
- **a11y** — aria-labels on all clear/mode/checkbox controls, `autoComplete="off"`,
  `title`/`aria-label` = placeholder on filter inputs, `onKeyDown` stopPropagation
  to prevent cell keyboard-nav stealing arrow/typing while filtering.

Fix applied during review:
- **Shift-click batch (range) row selection restored (SRT_SelectCheckbox):** Radix
  Checkbox's `onCheckedChange` omits the originating mouse event, so the `shiftKey`
  that MRT reads via `event.nativeEvent.shiftKey` to select a contiguous range was
  always false. Now captured from the preceding `onClick` into a ref and forwarded
  on the synthetic event passed to `getSRT_RowSelectionHandler` (then reset). This
  re-enables `enableBatchRowSelection` range-select to match MRT.

Accepted deviations (intentional, not fixed):
- **Native date inputs instead of MUI DatePicker/TimePicker:** date / datetime /
  time filter variants render a native typed `<Input>` (`type=date|datetime-local
  |time`). The shadcn primitive set has no Date/Time picker, so MRT's
  `muiFilter{Date,DateTime,Time}PickerProps` and the picker clear/onClear UX are
  not reproduced. Functionally filters by the typed value.
- **No Radio primitive:** single-select mode (`enableMultiRowSelection===false`)
  renders a shadcn Checkbox styled round (`rounded-full`) rather than a MUI Radio.
  Indeterminate is suppressed in this mode (a radio can't be indeterminate).
- **No `*Props` passthrough options:** core has no `srtFilterTextFieldProps`/
  `srtEditTextFieldProps`/`srtFilterCheckboxProps`/`srtSelectCheckboxProps`/
  `srtSearchTextFieldProps` (the MUI equivalents are commented out / never added),
  so MRT's object/function `mui*Props` merging is dropped. Each component still
  accepts the underlying shadcn primitive's props via spread + a `className`
  override, per the cva/className convention. Flag if core should add these.
- **Autocomplete commit shows value, not label:** the freeSolo autocomplete
  (Popover + Command) commits the selected option's `value` and reflects it in the
  input; MRT kept a separate `autocompleteValue` so the input showed the option
  `label`. The committed filter value is identical; only the displayed text differs
  for `{label,value}` options. Minor cosmetic.
- **Select editor blur-ref not registered:** MRT registers `editInputRefs[col.id]`
  for select editors (`inputRef.node`) so row/modal save-flows can blur them; the
  shadcn Select trigger is a button and `editInputRefs` is typed `HTMLInputElement`,
  so registering it would need an unsafe cast. Selects commit immediately on change
  and close on selection, so the blur-to-save path isn't needed. Left unregistered
  to avoid the cast.
- **Range numeric typing:** the range textbox doesn't auto-set `type="number"`
  (MRT relied on the consumer passing it via `muiFilterTextFieldProps`); range
  values are submitted as strings. The core range filter fns coerce, so filtering
  works; note if strict numeric input UX is desired.

### SRT_TableLayout
- I've omitted the ref since this code will live in user's directory, might add later

### body/ (Phase 3 review vs MRT components/body/)
Reviewed each component against its MRT counterpart. Behavior matches 1:1 except
the deviations below; app typecheck + production build green, browser-verified
(select/expand/detail-panel/row-numbers/row-actions/pinning/virtualization all
work, zero console errors).

- **Display-column id-dispatch (SRT_TableBodyCell.renderDisplayColumnCell):**
  Core display-column defs are intentionally headless (no `Cell`), so the
  component dispatches on `column.id` to render select/expand/row-number/
  actions/drag/pin. This mirrors each MRT `getMRT_*ColumnDef` `Cell` exactly,
  including the expand column's `groupedColumnMode === 'remove'` grouping-label
  branch (Tooltip + subRows count) and the row-number pagination math
  `((rowNumberDisplayMode==='static' ? (staticRowIndex||0)+(pageSize||0)*(pageIndex||0) : row.index) ?? 0)+1`.
  Display column ids keep MRT's `mrt-row-*` prefix in core, so the dispatch and
  the render-condition allowlist match. Verified the data-column grouped-row
  guard is preserved. User-defined display columns fall back to `columnDef.Cell`.

- **No per-cell / per-row props-api (cva instead):** MRT wraps body cell content
  in `tableCellProps.children ?? (...)` and merges `muiTableBodyCellProps` /
  `muiTableBodyRowProps`. Per the overall cva decision, SRT drops
  `srtTableBodyCellProps` / `srtTableBodyRowProps`; consumers override via
  `className` instead. Consequence: there is no `children`-override escape hatch
  on a body cell, and a row's pinned-offset math uses the density-default row
  height (37/53/69px) rather than a caller-supplied `style.height`/`sx.height`
  custom height. Acceptable given the styling model; revisit if custom row
  heights with sticky row-pinning are needed.

- **MUI drag/resize border theming dropped:** MRT computes `draggingBorders`
  (dashed/solid borders via theme grey + mrtTheme.draggingBorderColor) and
  pinned-cell before/after background overlays in `sx`. SRT conveys
  drag/pin/resize state via `data-pinned` / `data-index` / `data-last-row`
  attributes + cva classes (and `getCommonPinnedCellStyles` is commented out in
  core), so those exact visual borders/overlays aren't reproduced. Functionally
  equivalent; purely cosmetic.

- **highlight-words dependency replaced (SRT_TableBodyCellValue):** the package
  isn't a dependency; a small local `highlightWords` preserves the
  matchExactly/fuzzy chunking behavior 1:1.

- **Detail panel animation:** MRT uses MUI `Collapse`; SRT uses shadcn
  `Collapsible` for the non-virtualized path and renders content directly when
  virtualized (translateY + measureElement), matching MRT's virtual branch.

### head/ (Phase 3 review vs MRT components/head/)
Reviewed each SRT_ head component against its MRT_ counterpart. Behavior parity
confirmed for: header render (columnDef.Header fn/element + flexRender fallback),
sort label + multi-sort badge, column actions button + menu, resize handle
(double-click reset, onEnd deltaOffset transform, density margin, RTL left/right),
grab handle + drag/reorder (reorderColumn + column pinning re-derive), filter
container routing by variant, filter label active-detection + tooltip string
(select/range and/or joins) + popover mode, column pinning offsets (sticky
getStart/getAfter), density padding, colSpan, aria-sort, data-can-sort/index/
pinned/sort attrs, keyboard shortcuts (cellKeyboardShortcuts), virtualizer
measureElement, virtual padding spacers, head-overlay alert banner. App
typecheck green; browser-verified at :5273 (select-all checkbox left-sticky,
expand-all chevron, row-number `#`, Actions right-pinned, sort/grab/actions
icons render).

Fixes applied during review:
- **Hover-reveal of action buttons:** MRT reveals sort/filter/column-action icons
  on cell hover via `& :hover .MuiButtonBase-root { opacity: 1 }`. The SRT buttons
  only had their own `hover:opacity-100`. Added `group-hover:opacity-100` (the th
  carries `group`) to SRT_TableHeadCellSortLabel, SRT_TableHeadCellFilterLabel,
  and SRT_TableHeadCellColumnActionsButton so hovering anywhere in the cell raises
  all inactive icons to full opacity, matching MRT.

Accepted deviations (intentional, not fixed):
- mrtTheme colors (draggingBorderColor, baseBackgroundColor) aren't wired as
  headless options, so dragging/hovered/resize cell borders use Tailwind classes
  (border-primary / border-dashed border-muted-foreground) instead of theme
  palette values. (Same root cause as the body/ drag/resize-theming note.)
- The MRT `*Props` option/columnDef overrides (muiTableHeadCellProps,
  muiColumnActionsButtonProps, muiColumnDragHandleProps, etc.) are commented out
  in core types, so per-cell prop merging is dropped; overrides go through
  `className` per the cva/className convention.
- headerPL (MRT's computed left padding to balance centered display-column
  headers by sort/actions/drag widths) is omitted; SRT centers via flex
  `justify-center`, which balances without the manual rem offset.
- Display-column header dispatch (Task #8) verified against MRT Header gating:
  'mrt-row-select' -> select-all checkbox only when enableSelectAll &&
  enableMultiRowSelection (else null); 'mrt-row-expand' -> ExpandAllButton when
  enableExpandAll (else localization.expand); 'mrt-row-numbers' ->
  localization.rowNumber; 'mrt-row-actions' -> localization.actions. Matches MRT.

### toolbar/ table/ modals/ (Phase 3 review vs MRT components/{toolbar,table,modals}/)
Reviewed each SRT_ component against its MRT_ counterpart. Behavior parity
confirmed for: pagination (rows-per-page Select, range math, nav-button gating),
top/bottom toolbar layout + internal actions, alert banner selected-count +
grouping chips, drop zone, linear progress, table container (fullscreen/sticky/
maxHeight + edit-modal/cell-action mount), table layout, loading overlay, edit
row modal (create/edit, cancel cleanup, internalEditComponents). App typecheck
green for toolbar/table/modals (zero errors); `pnpm format` clean; browser-
verified at :5273 — rows-per-page combobox=10, first/prev disabled on page 1,
next/last enabled, "1-10 of 25" range text, all 5 internal toolbar buttons render
in MRT order, no console errors (only Vite HMR/devtools logs).

Fixes applied during review:
- **SRT_ToolbarInternalButtons wired to MRT button set 1:1:** previously only
  rendered global-filter/density/fullscreen with the column-filters and show/hide-
  columns buttons commented out (their button components didn't exist at scaffold
  time). Both now exist, so re-added `SRT_ToggleFiltersButton` (gated
  `enableFilters && enableColumnFilters && columnFilterDisplayMode !== 'popover'`)
  and `SRT_ShowHideColumnsButton` (gated `enableHiding || enableColumnOrdering ||
  enableColumnPinning`), restoring MRT's exact order/conditions. Also added
  `renderToolbarInternalActions?.({ table }) ??` override wrapper (was a TODO).
- **SRT_ToolbarAlertBanner clearSelection uses core handler:** replaced the
  `table.resetRowSelection()` stub with `getSRT_SelectAllHandler({ table })(event,
  false, true)` (forceAll deselect), matching MRT_ToolbarAlertBanner's
  `getMRT_SelectAllHandler(...)(event,false,true)` — correct deselect-all-across-
  pages + row-pinning reset behavior.
- (Task #5) SRT_TablePagination, SRT_TableContainer, SRT_EditRowModal were full
  rewrites from stubs; SRT_TopToolbar pagination (top/both) was wired in. Verified
  here against MRT and confirmed working in browser.

Accepted deviations (intentional, not fixed):
- **No `*Props` passthrough options:** core has `srtPaginationProps`,
  `srtToolbarAlertBannerProps`/`ChipProps`, `srtTopToolbarProps`,
  `srtToolbarDropZoneProps`, `srtToolbarInternalButtonsProps` commented out, so
  MRT's `mui*Props` object/function merging is dropped. Overrides go through
  `className` per the cva/className convention. SRT_TablePagination still keeps
  MRT's component-level prop interface (rowsPerPageOptions, showRowsPerPage,
  showFirstButton/showLastButton, disabled). `srtLinearProgressProps` /
  `srtTableLayoutProps` / `srtCircularProgressProps` ARE wired where core exposes
  them.
- **paginationDisplayMode='pages' not implemented:** MRT renders a MUI
  `Pagination` (numbered pages) when `paginationDisplayMode==='pages'`. SRT only
  ships the 'default' first/prev/next/last layout (no shadcn numbered-pagination
  primitive). Functionally complete for the default mode; numbered mode is a gap.
- **Alert banner: head-overlay position + select-checkbox + render override:**
  MRT supports `positionToolbarAlertBanner==='head-overlay'` (renders
  MRT_SelectCheckbox), `renderToolbarAlertBannerContent`, alert title, and
  density-based padding. SRT renders the stacked top/bottom banner only; these are
  TODOs. Also SRT gates `selectedAlert` on `enableRowSelection` (MRT does not) —
  harmless since count is 0 without selection.
- **Alert banner animation:** MRT uses MUI `Collapse` (200ms); SRT uses a
  max-h/opacity transition. Visually equivalent.
- **stackAlertBanner always true (no useMediaQuery):** TopToolbar/BottomToolbar
  always stack the banner rather than absolute-positioning on wide screens (MRT
  flips via `useMediaQuery`). Cosmetic; responsive overlay layout not reproduced.
- **Drop zone hover/blur theming:** MRT uses theme `info.main` alpha + backdrop
  blur; SRT uses dashed `border-blue-500`. Cosmetic; drag-to-group logic matches.
- **Column virtualization in SRT_Table:** `useSRT_ColumnVirtualizer` /
  `columnSizeVars` CSS vars are not wired in SRT_Table (commented out); column
  virtualization for the head/body is handled by Task #4/#3 components. Row
  virtualization works (browser-verified on the 1,000-row table).

### menus/ (Phase 3 review vs MRT components/menus/)
Reviewed all 7 SRT_ menu components against their MRT_ counterparts. App
typecheck + production build green (zero errors); `pnpm format` clean.
Browser-verified at :5173 (the team's :5273 dev server had stopped during the
review; restarted on the default port 5173 and verified there — same build).
Confirmed live: column action menu (correct items, gating, localization with
`{column}` interpolation, positioned under its button), row action menu (Edit +
custom items), show/hide columns menu (header buttons + recursive column rows +
grab handles + pin buttons + checkbox toggle actually hides a column),
close-on-select, outside-click close, Escape close, and "Filter by First Name"
revealing the subheader filter row. No console errors (only Vite HMR/devtools).

anchorEl -> DropdownMenu bridge (the core port decision):
- MUI `Menu` is `anchorEl`-driven; shadcn `DropdownMenu` is open-state-driven.
  Each menu keeps MRT's `anchorEl`/`setAnchorEl` prop interface and renders a
  zero-size `position:fixed` `DropdownMenuTrigger` span placed at the anchor's
  `getBoundingClientRect()`, with `open={!!anchorEl}` and
  `onOpenChange(open=>!open && setAnchorEl(null))`. Browser-confirmed: positioning,
  close-on-select, and outside-click all behave like MRT.

Fixes applied during review:
- **SRT_ShowHideColumnsButton was never wired to its menu:** the button shipped
  as a stub — import commented, no `anchorEl` state, `handleClick` a no-op — so the
  toolbar columns icon did nothing (browser-confirmed dead). Wired it 1:1 to the
  MRT pattern (mirrors SRT_TableHeadCellColumnActionsButton): `useState` anchorEl,
  `handleClick` sets `event.currentTarget`, conditional `<SRT_ShowHideColumnsMenu>`
  mount. Menu now opens and toggles visibility (verified hiding the Email column).
- **Submenu (filter-mode) closed its parent prematurely:** the filter-mode submenu
  in SRT_ColumnActionMenu is a nested anchored DropdownMenu opened by the arrow on
  the "Filter by {column}" item. Radix DropdownMenuItem closes the whole menu on
  select by default, which would unmount the just-opened submenu. Added
  `onSelect={e => onOpenSubMenu && e.preventDefault()}` in SRT_ActionMenuItem so a
  submenu-opening item keeps the parent menu open (regular items still close, as in
  MRT). Latent until `enableColumnFilterModes` is on (the demo doesn't set it), so
  it was not visible at runtime — fixed proactively.

Accepted deviations (intentional, not fixed):
- **anchorEl bridge vs MUI Menu:** see above. Functionally equivalent; the
  trigger span is non-interactive (`pointerEvents:none`) and exists only to give
  Radix a positioning anchor. Re-reads the rect each render, so it follows the
  anchor if the layout shifts while open.
- **Filter-mode submenu is a nested anchored DropdownMenu, not Radix
  `DropdownMenuSub`:** SRT_FilterOptionMenu is dual-purpose — it is also used
  standalone by SRT_GlobalFilterTextField and SRT_FilterTextField (column filter
  mode), both of which need the anchored-menu form. To keep one component for all
  three call sites it stays an anchored DropdownMenu even when nested inside the
  column menu's content (its own portal renders it to `document.body`). Works with
  the onSelect fix above; a future refactor could split a `DropdownMenuSub` variant
  for the in-menu case if tighter Radix submenu semantics (hover-open, arrow-key
  traversal into the submenu) are desired.
- **No `*Props` passthrough / mrtTheme menuBackgroundColor:** MRT's
  `MenuListProps`/`menuBackgroundColor`/`dense` (density==='compact') styling is
  dropped; menus use the shadcn DropdownMenuContent surface + cva/className per the
  overall convention. Density compaction of menu item spacing is not reproduced.
- **MUI icons -> lucide-react:** ClearAll->ListX, Sort->ArrowUpNarrowWide/
  ArrowDownWideNarrow, FilterListOff->FilterX, FilterList->Filter, DynamicFeed->
  Layers, PushPin->Pin (rotated), RestartAlt->RotateCcw, VisibilityOff->EyeOff,
  ViewColumn->Columns3, ArrowRight->ChevronRight. Closest-semantic mappings;
  glyphs differ from MUI.
- **Switch -> Checkbox in show/hide menu:** the shadcn primitive set has no Switch,
  so SRT_ShowHideColumnsMenuItems uses a Checkbox for the visibility toggle
  (wrapped in a Tooltip = localization.toggleVisibility). Same toggle behavior
  (group columns toggle all children); visual control differs.
- **SRT_CellActionMenu dual-driven:** ported faithfully to MRT's `actionCell`
  state + `actionCellRef`, but also accepts optional `anchorEl`/`cell`/`setAnchorEl`
  so the body teammate's existing SRT_TableBodyCell call site (local anchor state)
  typechecks and works. When the explicit props are passed they win; otherwise it
  falls back to MRT's state-driven behavior.

### core package (Phase 3 review vs material-react-table/src) — hooks, display-columns, utils, fns, types, locales
Structural parity confirmed: every MRT non-component file has an SRT counterpart
(useMaterialReactTable -> useShadcnReactTable). SRT-only additions:
useSRT_ProgressAnimation (linear-progress feature). 38 locales present, en.ts
full key set, others align. fns (aggregation/filter/sorting), utils
(cell/column/row/displayColumn/tanstack.helpers/utils), virtualizers, effects,
useSRT_TableInstance display-column assembly + order, and useSRT_Rows all match
MRT behavior. `pnpm build` + core `tsc --noEmit` + app `tsc --noEmit` all green.

Intentional deviations / notes:

- **MUI theme + icons stubbed in useSRT_TableOptions (intentional headless drop).**
  File opens with "TODO: fix themes and icons". `icons`, `mrtTheme`, `useTheme`,
  and the `columnResizeDirection = theme.direction` fallback are commented out and
  NOT in the returned options. Verified this is NOT a runtime/type break: core
  `tsc --noEmit` passes, and NO component or core hook reads `options.icons` /
  `options.mrtTheme` (0 references) — the component layer uses lucide-react icons
  and Tailwind tokens directly. The SRT_DefinedTableOptions type still declares
  `icons`/`mrtTheme` as required (type is slightly looser than the value at the
  dts boundary, harmless since unconsumed). columnResizeDirection still defaults
  via layoutMode logic; RTL via theme.direction is not auto-detected (set
  `columnResizeDirection: 'rtl'` explicitly if needed). Revisit only if a future
  feature consumes mrtTheme colors.

- **style.utils.ts — getCommonPinnedCellStyles + getCommonMRTCellStyles remain
  commented out (DECISION: option (b), intentional cva-based deviation).**
  MRT computed pinned-cell sticky offsets, z-index, opacity, and before/after
  background+box-shadow overlays as an `sx` object in core. In the headless port
  this is replaced by the component layer: each cell (head/body/footer) computes
  sticky left/right from `column.getStart('left')`/`getAfter('right')`, sets
  `data-pinned`, and applies a SOLID background via Tailwind (head `bg-muted/95`,
  body `bg-background`, footer `bg-muted/95`) so pinned columns are not
  see-through on horizontal scroll. Reviving the core sx helper would reintroduce
  a styling concern into the headless package against the cva decision, so it
  stays removed. The MRT inset box-shadow "edge" on the last-left/first-right
  pinned column is the one cosmetic the data-attr approach omits; consumers can
  add it via `[&[data-pinned]]` Tailwind rules if desired.
  FIX APPLIED: SRT_TableFooterCell previously set `data-pinned` but had neither a
  sticky offset nor a solid background (pinned footer cells would scroll under
  siblings and show through). Added the same getStart/getAfter sticky style +
  `bg-muted/95` as the head cell so footer pinning matches head/body. (head + body
  already had solid pinned backgrounds.)
