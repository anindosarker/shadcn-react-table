# SRT ↔ MRT Review Notes

Top-down review (render-tree order). Source of truth: `packages/material-react-table/`.


**Trust map:** Every unchecked item is garbage from bad prior runs → rebuild from
the MRT spec, do NOT trust existing SRT code there. `types.ts` is only partial.

## General notes (established conventions — apply project-wide)

- **cva throughout.** EVERY component defines a `xxxVariants` cva at the top
  (shadcn anatomy), even with no variants yet. Styling via cva + `cn()`
  (twMerge); user `className` merges last (wins).
- **Runtime-measured values stay inline `style`** (e.g. maxHeight from toolbar
  px). No CSS vars, no dynamic classes — the package must install with zero
  CSS config. User `style` passthrough spreads after lib values (user wins).
- **Display-column boundary (locked June deviation).** Core display-column
  defs (ids `mrt-row-*`) carry string/localization Headers where possible but
  NO component-rendering Cell/Header (core cannot import app components). The
  component layer dispatches on ids for what core can't supply:
  `SRT_TableHeadCell` → select-all checkbox (`mrt-row-select`), expand-all
  button (`mrt-row-expand`); `SRT_TableBodyCell` → ALL body display controls.
  Precedence: `columnDef.Header/Cell` (user override) → id dispatch → string
  header.
- **MUI control sizes: hit-area ≠ visible box.** MUI icon-button-style
  controls (Checkbox/Radio/IconButton) size the padded HIT AREA (e.g. 2.5rem);
  the visible glyph is ~18px. Radix/shadcn roots ARE the visible box — map to
  visible sizes (size-4/size-5), not MRT's rem values.
- **MUI component DEFAULT styles count as spec.** MRT inherits MUI root CSS
  invisibly (Table: `width:100%`, `border-spacing:0`; Paper: elevation/bg;
  etc.). When replacing a MUI component with a native element, map its default
  styles into the cva base — MRT source alone is not the full spec.
- **MRT-exact useMemo/useEffect deps arrays are kept verbatim**;
  `// eslint-disable-next-line react-hooks/exhaustive-deps` on the deps line is
  the authorized way to hold them against the lint gate.
- **Keep SRT default designs** (card look: `rounded-md border bg-background
  shadow`, base `p-2`, `relative`) even where MRT differs visually. Target =
  finish the library first with default shadcn themed look; UI polish later.
- **Dropped MRT constructs stay visible as comments.** Keep the dropped MRT
  line(s) commented out at their original position + a short `// Note:` saying
  why (example: `mrtTheme` / `useTheme` in `SRT_TableLayout`). No other
  scaffolding comments. `//@ts-expect-error` gets a brief reason suffix.
- **`mrtTheme` registry dropped project-wide** — tailwind/shadcn CSS vars handle
  theming (`bg-background` etc.).

## Entry

### [x] ShadcnReactTable.tsx : MaterialReactTable.tsx
- ok. almost same.
- Some import differences, will be handled later depending on shadcn registry implementation.

## table/

### [x] SRT_TableLayout.tsx : MRT_TablePaper.tsx
- hand-written, ok. trusted. (last good file top-down)
- Created `DivProps` (`ComponentPropsWithRef<'div'>`, SRT-only; renamed from LayoutDivProps) — the single SRT analogue for EVERY MUI div-backed prop type (`PaperProps`, `TableContainerProps`, `BoxProps`, ...). shadcn has no Paper/Box layer; MUI extras (sx/component/classes) are locked deviations.
- `mrtTheme` / `useTheme` dropped project-wide, handled by shadcn CSS vars.

### [x] SRT_TableContainer.tsx : MRT_TableContainer.tsx
- `srtTableContainerProps` converted to value-or-func `DivProps` in core
  types.ts — same conversion applies to every remaining `SRT_HTMLProps` slot.
- `aria-describedby='srt-progress'` never matches the overlay's suffixed
  `srt-progress-${id}` — MRT has the identical broken link; mirrored as-is.
### [ ] SRT_Table.tsx : MRT_Table.tsx
- MUI `stickyHeader` Table prop dropped (no native `<table>` attr) — sticky th
  styles live in `SRT_TableHeadCell` (+ thead-level grid-mode sticky in
  `SRT_TableHead`), derived from `enableStickyHeader || isFullScreen` off
  `table`, same as MRT_TableHead does.
- `TableProps` (`ComponentPropsWithRef<'table'>`) added to core next to
  `DivProps`; `srtTableProps` converted to MRT's value-or-func shape.
### [ ] SRT_TableLoadingOverlay.tsx : MRT_TableLoadingOverlay.tsx
- Spinner = `LoaderCircleIcon` + `animate-spin`, `size={40}` maps MUI
  CircularProgress's 40px default; `Component` override kept (MRT fallback shape).
- Wrapper div takes NO user className — MRT's Box takes no user props; the
  `srtCircularProgressProps` slot targets the spinner only. Pattern for other
  MRT Box-wrapper components.

## toolbar/

### [ ] SRT_TopToolbar.tsx : MRT_TopToolbar.tsx
### [ ] SRT_BottomToolbar.tsx : MRT_BottomToolbar.tsx
### [ ] SRT_ToolbarInternalButtons.tsx : MRT_ToolbarInternalButtons.tsx
### [ ] SRT_ToolbarAlertBanner.tsx : MRT_ToolbarAlertBanner.tsx
### [ ] SRT_ToolbarDropZone.tsx : MRT_ToolbarDropZone.tsx
- `srtToolbarDropZoneProps` slot REMOVED from core — MRT has no
  muiToolbarDropZoneProps (prior-run invention); props flow via ...rest only.
### [ ] SRT_LinearProgressBar.tsx : MRT_LinearProgressBar.tsx
### [ ] SRT_TablePagination.tsx : MRT_TablePagination.tsx
- `srtPaginationProps` keeps explicit `showFirstButton`/`showLastButton`
  literals — MUI PaginationProps base carried them; the DivProps swap would
  have dropped API the component consumes.

## head/

### [ ] SRT_TableHead.tsx : MRT_TableHead.tsx
### [ ] SRT_TableHeadRow.tsx : MRT_TableHeadRow.tsx
### [ ] SRT_TableHeadCell.tsx : MRT_TableHeadCell.tsx
- Deferred gap: MRT's expand Header appends grouped-column names when
  `groupedColumnMode === 'remove'` — not rendered; revisit at grouping parity.
### [ ] SRT_TableHeadCellColumnActionsButton.tsx : MRT_TableHeadCellColumnActionsButton.tsx
### [ ] SRT_TableHeadCellFilterContainer.tsx : MRT_TableHeadCellFilterContainer.tsx
### [ ] SRT_TableHeadCellFilterLabel.tsx : MRT_TableHeadCellFilterLabel.tsx
### [ ] SRT_TableHeadCellGrabHandle.tsx : MRT_TableHeadCellGrabHandle.tsx
- Renders SRT_GrabHandleButton WITHOUT `location` (MRT-exact). Deferred gap:
  garbage SRT_GrabHandleButton defaults location='row' → column handle shows
  opacity-100 instead of MRT's 0.5 until its buttons/ pair fixes the default.
### [ ] SRT_TableHeadCellResizeHandle.tsx : MRT_TableHeadCellResizeHandle.tsx
### [ ] SRT_TableHeadCellSortLabel.tsx : MRT_TableHeadCellSortLabel.tsx

## body/

### [ ] SRT_TableBody.tsx : MRT_TableBody.tsx
### [ ] SRT_TableBodyRow.tsx : MRT_TableBodyRow.tsx
- Row highlights = solid classes (locked deviation; MRT's td:after overlay
  machinery commented in place). Consequence: hovering a SELECTED row lightens
  it (bg-muted → bg-muted/50); MRT keeps selected bg on hover.
### [ ] SRT_TableBodyCell.tsx : MRT_TableBodyCell.tsx
- Deferred gap: MRT derives grid-mode flex `justify-content` from the MUI
  `align` prop (RTL / right-aligned display columns); SRT dropped `align` for
  logical `text-start`, which covers text-align but not flex justify. Visible
  only in grid layout + RTL/align-overrides. Revisit if RTL parity pass happens.
- `renderRowActions` is handled inside SRT_ToggleRowActionMenuButton — the
  cell dispatch renders only the button (MRT def shape); wrapping it again
  double-invokes.
### [ ] SRT_TableBodyCellValue.tsx : MRT_TableBodyCellValue.tsx
- `highlight-words` re-exported from core (`highlightWords`) instead of a
  direct app dependency — consuming apps only need the core dep. Components
  import it from 'shadcn-react-table-core'.
### [ ] SRT_TableBodyRowGrabHandle.tsx : MRT_TableBodyRowGrabHandle.tsx
### [ ] SRT_TableBodyRowPinButton.tsx : MRT_TableBodyRowPinButton.tsx
### [ ] SRT_TableDetailPanel.tsx : MRT_TableDetailPanel.tsx

## footer/

### [ ] SRT_TableFooter.tsx : MRT_TableFooter.tsx
### [ ] SRT_TableFooterRow.tsx : MRT_TableFooterRow.tsx
### [ ] SRT_TableFooterCell.tsx : MRT_TableFooterCell.tsx

## inputs/

### [ ] SRT_FilterTextField.tsx : MRT_FilterTextField.tsx
- Deferred gap: select/multi-select filter variants (June non-input
  renderings) don't register in filterInputRefs and skip the shared
  onKeyDown/aria common props — focus-filter-on-open skips select columns.
  Structural to the locked June rendering; revisit if select filters need
  programmatic focus.
### [ ] SRT_FilterRangeFields.tsx : MRT_FilterRangeFields.tsx
### [ ] SRT_FilterRangeSlider.tsx : MRT_FilterRangeSlider.tsx
### [ ] SRT_FilterCheckbox.tsx : MRT_FilterCheckbox.tsx
- Checkbox slots are ButtonProps → MRT's `(e, checked)` onChange composition
  has no typed surface; user hook = onClick only (same across all checkbox
  slots).
### [ ] SRT_GlobalFilterTextField.tsx : MRT_GlobalFilterTextField.tsx
### [ ] SRT_EditCellTextField.tsx : MRT_EditCellTextField.tsx
- SRT-only `onEditingCellSave` API preserved: fires in saveInputValueToRowCache
  when editDisplayMode is 'cell'|'table' (blur + Enter-via-blur + select
  immediate save) — where MRT does nothing. Signature {cell, row, table, value}.
### [ ] SRT_SelectCheckbox.tsx : MRT_SelectCheckbox.tsx
- `srtSelectCheckboxProps` collapses MRT's `CheckboxProps | RadioProps` union
  to ButtonProps — locked June deviation: round Checkbox for single-select,
  no Radio element in SRT.

## menus/

### [ ] SRT_ColumnActionMenu.tsx : MRT_ColumnActionMenu.tsx
### [ ] SRT_FilterOptionMenu.tsx : MRT_FilterOptionMenu.tsx
### [ ] SRT_RowActionMenu.tsx : MRT_RowActionMenu.tsx
### [ ] SRT_CellActionMenu.tsx : MRT_CellActionMenu.tsx
- MRT `transformOrigin={{horizontal: -100, vertical: 8}}` → radix Content
  `align="start" alignOffset={100} sideOffset={8}` (offset placement near
  click point; no exact radix equivalent).
- `cell = actionCell!` kept MRT-verbatim — sole caller (SRT_TableContainer)
  gates render on `enableCellActions && actionCell`.
### [ ] SRT_ShowHideColumnsMenu.tsx : MRT_ShowHideColumnsMenu.tsx
- Dropped June file's invented `min-w-[14rem]` on Content — MRT Menu has no
  width constraint.
- Function-call deps in allColumns memo kept MRT-verbatim under a tightly
  scoped eslint-disable/enable BLOCK (prettier splits deps one-per-line, so
  the next-line comment convention can't cover them).
### [ ] SRT_ShowHideColumnsMenuItems.tsx : MRT_ShowHideColumnsMenuItems.tsx
- `onSelect={(e) => e.preventDefault()}` on the item — radix closes menu on
  select, MUI doesn't; preventDefault preserves MRT's menu-stays-open
  behavior for visibility toggles.
- Authored missing shadcn `ui/switch.tsx` (standard, `radix-ui` umbrella
  import matching checkbox.tsx idiom, no new dep).
- draggingBorderColor map: dragging → dashed outline-muted-foreground,
  hovered === column → dashed outline-primary.
### [ ] SRT_ActionMenuItem.tsx : MRT_ActionMenuItem.tsx
- Menu shell = shadcn DropdownMenu family + fixed-span anchorEl bridge
  (locked). Items extend DropdownMenuItem props + explicit `divider?: boolean`
  (mirrors MUI MenuItemProps.divider — real per-item MRT API, renders trailing
  DropdownMenuSeparator). `dense` stays menu-level (Content className), never
  per item. All menu rebuilds follow this.

## buttons/

### [ ] SRT_ToggleRowActionMenuButton.tsx : MRT_ToggleRowActionMenuButton.tsx
### [ ] SRT_EditActionButtons.tsx : MRT_EditActionButtons.tsx
- MUI CircularProgress(18) → LoaderCircleIcon size-[18px] animate-spin
  (SRT_TableLoadingOverlay precedent); MUI `color="info"` on the icon save
  button → `text-primary` (no info palette token in shadcn) + Note.
### [ ] SRT_CopyButton.tsx : MRT_CopyButton.tsx
- No hover suppression: MUI text-variant's action.hover overlay survives
  MRT's root-only `backgroundColor: transparent` sx, so ghost's default
  `hover:bg-accent` is the correct analog (plan initially said the opposite;
  corrected on review).
### [ ] SRT_ExpandButton.tsx : MRT_ExpandButton.tsx
- theme.direction rtl branches dropped with Notes (SRT has no theme
  direction); `positionExpandColumn === 'last'` branches kept.
- MRT's no-rest-spread quirk mirrored (destructures only
  row/staticRowIndex/table; interface still extends ButtonProps).
### [ ] SRT_ExpandAllButton.tsx : MRT_ExpandAllButton.tsx
### [ ] SRT_GrabHandleButton.tsx : MRT_GrabHandleButton.tsx
- Fixed June gap: NO default on `location` — opacity 0.5 unless caller passes
  location="row" (June file's `location = 'row'` default forced opacity 1
  everywhere).
- size="icon" (not default size): default carries `has-[>svg]:px-3` which
  survives twMerge against p-[2px] and breaks the tight padding.
### [ ] SRT_RowPinButton.tsx : MRT_RowPinButton.tsx
- `RowPinningPosition` re-exported from core types.ts (app has no direct
  @tanstack/react-table dep; MRT imports it directly).
### [ ] SRT_ColumnPinningButtons.tsx : MRT_ColumnPinningButtons.tsx
### [ ] SRT_ShowHideColumnsButton.tsx : MRT_ShowHideColumnsButton.tsx
### [ ] SRT_ToggleDensePaddingButton.tsx : MRT_ToggleDensePaddingButton.tsx
### [ ] SRT_ToggleFiltersButton.tsx : MRT_ToggleFiltersButton.tsx
### [ ] SRT_ToggleFullScreenButton.tsx : MRT_ToggleFullScreenButton.tsx
### [ ] SRT_ToggleGlobalFilterButton.tsx : MRT_ToggleGlobalFilterButton.tsx

## modals/

### [ ] SRT_EditRowModal.tsx : MRT_EditRowModal.tsx
- Interface = Partial<DialogContent props> + open/table; slots
  (srtCreateRowModalProps/srtEditRowDialogProps) are DivProps spread onto
  DialogContent. MUI `onClose(event, reason)` → radix `onOpenChange(false)`;
  MRT's `dialogProps.onClose` compose dropped + Note (close interception not
  exposed — DivProps has no onOpenChange surface).
- `showCloseButton={false}` (MUI Dialog has no top-right X) +
  `aria-describedby={undefined}` (no DialogDescription in MRT), both before
  spread so user slots can override.
- `fullWidth maxWidth="xs"` → cva `sm:max-w-[444px]`.

## Deviation-only (no MRT counterpart)

### [ ] SRT_Tooltip.tsx
- API frozen (~24 consumers): title/side/sideOffset/disabled/open/
  onOpenChange/className/asChild; controlled-open-without-onOpenChange is
  valid radix usage (3 consumers drive state via button handlers).
- Fixed: nested TooltipProvider (SRT's outer + shadcn Tooltip's inner)
  shadowed delayDuration=1000 → tooltips popped at 0ms vs MRT's 1000ms.
  delayDuration now passed to Tooltip Root directly (prop beats provider).
- `disableHoverableContent` added to Root — maps MRT's getCommonTooltipProps
  `disableInteractive: true` (tooltip dismisses when pointer moves onto it).

## Core (`packages/shadcn-react-table-core/src`)

### [ ] index.ts : index.ts
- Deviation kept: SRT re-exports `utils/utils` (parseFromValuesOrFunc etc.)
  publicly — required because SRT components live in the app, outside the
  core package; MRT keeps it internal (same-package imports).
- Deviation kept: all locales re-exported from the MAIN index (MRT ships
  them as separate subpath entry points); display-column defs also surfaced
  (MRT exports none). Single-entry consumption is intentional.
### [ ] types.ts : types.ts
- Full-surface audit vs MRT: 40/40 table slot props + 14/14 columnDef slots
  + all state/instance/localization keys matched (renames: srtTableLayoutProps
  / refs.tableLayoutRef for the MUI Paper pair).
- mrtTheme remnants removed (SRT_DefinedTableOptions re-added a never-
  populated `mrtTheme: Required<SRT_Theme>`; SRT_Theme interface deleted).
- Dead-API family fully deleted post-conversion: SRT_HTMLProps,
  SRT_HTMLPropsValue, the three *HTMLPropsContext types, srtHtmlProps.utils.
### [ ] icons.ts : icons.ts
- All 34 MRT icon keys mapped to lucide; `Record<string,...>` annotation
  dropped (defeated `as const` → icons option lost key checking) and
  SRT_Icons re-exported from types.ts (MRT parity).
- Cosmetic candidate: DynamicFeedIcon → Rss is a weak glyph match (MUI =
  stacked cards); Layers/Files would read better. Left as-is.
### [ ] fns/aggregationFns.ts : fns/aggregationFns.ts
### [ ] fns/filterFns.ts : fns/filterFns.ts
### [ ] fns/sortingFns.ts : fns/sortingFns.ts
### [ ] utils/cell.utils.ts : utils/cell.utils.ts
### [ ] utils/column.utils.ts : utils/column.utils.ts
### [ ] utils/displayColumn.utils.ts : utils/displayColumn.utils.ts
### [ ] utils/row.utils.ts : utils/row.utils.ts
### [ ] utils/style.utils.ts : utils/style.utils.ts
- Deferred gap: MRT's pinned-edge inset boxShadow (`&:before` pseudo on
  last-left/first-right pinned column, getCommonPinnedCellStyles) not
  reproduced — pinned columns have no edge shadow. Revisit at this pair.
### [ ] utils/tanstack.helpers.ts : utils/tanstack.helpers.ts
### [ ] utils/utils.ts : utils/utils.ts
### [ ] utils/virtualization.utils.ts : utils/virtualization.utils.ts
- Stale JSDoc still names MRT_TableBodyRowGrabHandle/MRT_TableHeadCellGrabHandle
  (comment-only; fix at core-completion pass).
### [ ] utils/srtHtmlProps.utils.ts : (SRT-only)
- REMOVED (with SRT_HTMLProps/SRT_HTMLPropsValue types + index export) —
  dead June API, zero live references; parseFromValuesOrFunc is the sole
  slot-parsing idiom.
### [ ] hooks/useShadcnReactTable.ts : hooks/useMaterialReactTable.ts
### [ ] hooks/useSRT_TableInstance.ts : hooks/useMRT_TableInstance.ts
### [ ] hooks/useSRT_TableOptions.ts : hooks/useMRT_TableOptions.ts
- Delta vs MRT = 11 removed lines, all mrtTheme/useTheme plumbing. Restored
  the non-theme half of the columnResizeDirection default (`'ltr'` literal;
  theme.direction fallback dropped — no theme in SRT).
### [ ] hooks/useSRT_Effects.ts : hooks/useMRT_Effects.ts
### [ ] hooks/useSRT_Rows.ts : hooks/useMRT_Rows.ts
### [ ] hooks/useSRT_ColumnVirtualizer.ts : hooks/useMRT_ColumnVirtualizer.ts
### [ ] hooks/useSRT_RowVirtualizer.ts : hooks/useMRT_RowVirtualizer.ts
### [ ] hooks/useSRT_ProgressAnimation.ts : (SRT-only)

## Core display-columns (`hooks/display-columns/`)

### [ ] getSRT_RowActionsColumnDef.tsx : getMRT_RowActionsColumnDef.tsx
### [ ] getSRT_RowDragColumnDef.tsx : getMRT_RowDragColumnDef.tsx
### [ ] getSRT_RowExpandColumnDef.tsx : getMRT_RowExpandColumnDef.tsx
- MRT's `alignProps` (align right when positionExpandColumn==='last')
  dropped per the locked align→text-start deviation; consequence: expand
  column positioned 'last' stays left-aligned.
### [ ] getSRT_RowNumbersColumnDef.tsx : getMRT_RowNumbersColumnDef.tsx
### [ ] getSRT_RowPinningColumnDef.tsx : getMRT_RowPinningColumnDef.tsx
### [ ] getSRT_RowSelectColumnDef.tsx : getMRT_RowSelectColumnDef.tsx
### [ ] getSRT_RowSpacerColumnDef.tsx : getMRT_RowSpacerColumnDef.tsx
- Restored MRT's `blankColProps` (children null + minWidth/padding/width 0 on
  body/footer/head cell slots) — was dropped, so the spacer kept density
  padding instead of collapsing to 0.

### [ ] locales/ (38 files) : MRT locales
- 38/38 byte-identical to MRT (92 keys each). Consumed via the core barrel
  (`import { SRT_Localization_XX } from 'shadcn-react-table-core'`) — MRT's
  per-locale subpath entry points (`material-react-table/locales/xx`) not
  reproduced; add build-locales + exports map at publish time if path-import
  parity is wanted.
