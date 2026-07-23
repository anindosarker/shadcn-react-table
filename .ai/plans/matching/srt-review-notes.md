# SRT ↔ MRT Review Notes

Top-down review (render-tree order). Source of truth: `packages/material-react-table/`.


**Trust map:** Every unchecked item is garbage from bad prior runs → rebuild from
the MRT spec, do NOT trust existing SRT code there. `types.ts` is only partial.

## General notes (established conventions — apply project-wide)

- **cva variants**
  Components defines a `xxxVariants` cva at the top (shadcn anatomy), to define the default styling classes. Styling via cva + `cn()` (twMerge); user `className` merges last (wins).
  If a file has nothing to style, it has no cva. User `className` still merges last via `cn()`.
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
- **MUI component DEFAULT styles count as spec** 
  MRT inherits MUI root CSS invisibly (Table: `width:100%`, `border-spacing:0`; etc.). When replacing a MUI component, map its default styles into that element's cva if needed. When replacing with a shadcn COMPONENT, this rule does NOT apply — use the shadcn default variant; no needed to port MUI's look onto it.
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
- **shadcn DEFAULT variants**
  When using a shadcn component, use its default variant. Layout-only
  className allowed (position/margins/flex placement/icon-direction
  transforms — confirmed 2026-07-14); never look (colors/typography/opacity/
  sizing/padding/radius). No custom or "neutralization" cva targeting a
  shadcn component. STATE-DRIVEN functional styling is allowed (lead ruling
  2026-07-14): classes gated on runtime state that map an MRT feature —
  density dense menus, drag outlines, active-filter bg-accent, single-select
  rounded-full, note-25 checkbox sizing — default state must emit pure
  shadcn. Static decorative overrides always die.
- **`Srt-*` class hooks DELETED (user ruling 2026-07-22).** The 6 manual
  class hooks (AlertBanner, DropZone, TablePagination, TableHeadCell,
  DetailPanel, ResizeHandle) mirrored MUI's auto-generated global classes —
  redundant: consumer className flows via slot props. Don't add new ones.
- **shadcn-first (user ruling 2026-07-10).** When a shadcn/ui component exists
  for the MUI counterpart, use it — add via CLI if missing (components.json =
  radix/new-york; NOT the Base UI docs flavor). Approved mappings: MUI Alert →
  ui/alert, Chip → ui/badge (FilterTextField precedent), LinearProgress →
  ui/progress, TablePagination rows-per-page native `<select>` → ui/select,
  TableSortLabel → Button ghost default styles (no className override), all
  remaining raw icon-buttons → Button ghost/icon. Raw `<table>/<tr>/<td>`
  markup stays (ui/table's overflow wrapper conflicts with SRT_TableContainer).
  Open gaps to sweep later: SRT_TablePagination (4 nav icon-buttons + select),
  SRT_LinearProgressBar, SRT_TableHeadCellColumnActionsButton,
  SRT_TableHeadCellFilterLabel, SRT_TableHeadCellSortLabel,
  SRT_GlobalFilterTextField (2 adornments), SRT_ActionMenuItem (submenu arrow).
- **ui/ registry refresh (2026-07-21, user order: every component, no
  exceptions).** All ui/*.tsx on latest radix-flavor registry. input-group
  fork CONVERGED upstream (no longer a deviation). badge data-icon fork
  dropped — registry has no data-icon support yet; `data-icon` attrs stay
  inert until Base UI migration. tooltip on latest → provider moved to
  ShadcnReactTable root (see SRT_Tooltip entry). button gained xs/icon-xs/
  icon-sm/icon-lg sizes + data-variant/data-size stamps. Pre-refresh backup:
  session scratchpad ui-backup/. Browser-verified post-refresh (tooltips,
  chips, console clean).

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
### [x] SRT_Table.tsx : MRT_Table.tsx
- MUI `stickyHeader` Table prop dropped (no native `<table>` attr) — sticky th
  styles live in `SRT_TableHeadCell` (+ thead-level grid-mode sticky in
  `SRT_TableHead`), derived from `enableStickyHeader || isFullScreen` off
  `table`, same as MRT_TableHead does.
- `TableProps` (`ComponentPropsWithRef<'table'>`) added to core next to
  `DivProps`; `srtTableProps` converted to MRT's value-or-func shape.
### [x] SRT_TableLoadingOverlay.tsx : MRT_TableLoadingOverlay.tsx
- Sweep supersedes the LoaderCircleIcon line: spinner = ui/spinner at its
  default size (MUI 40px dropped per ruling — noticeably smaller);
  `srtCircularProgressProps` (LucideProps) spreads onto Spinner (svg) clean;
  `Component` override kept (MRT fallback shape).
- Wrapper div takes NO user className — MRT's Box takes no user props; the
  `srtCircularProgressProps` slot targets the spinner only. Pattern for other
  MRT Box-wrapper components.

## toolbar/

### [x] SRT_TopToolbar.tsx : MRT_TopToolbar.tsx
### [x] SRT_BottomToolbar.tsx : MRT_BottomToolbar.tsx
### [x] SRT_ToolbarInternalButtons.tsx : MRT_ToolbarInternalButtons.tsx
### [x] SRT_ToolbarAlertBanner.tsx : MRT_ToolbarAlertBanner.tsx
- Rev-3 (2026-07-14 default-variants ruling): neutralization cva REVERTED —
  Alert renders its shadcn default (border, rounded-lg, px-4 py-3, bg-card;
  old flat bg-primary/10 banner look gone); cva now layout-only (`relative
  left-0 right-0 top-0 z-[2] w-full` + `-mb-4` bottomOffset). Clear-selection
  = plain Button ghost/sm (`p-[2px] text-primary` cva deleted); Badge gap-1
  dropped (already in Badge base). Alert default padding now wraps the inner
  density-padding div — combined padding accepted. Content wrapper div takes
  `col-start-2` (SRT-owned) to land in Alert's `grid-cols-[0_1fr]` content
  track — without it content auto-places in the 0px icon track (browser-
  caught regression); replaces Rev-2's `block` neutralization.
- Rev-2 keeps: ui/alert via CLI, Chip → ui/badge secondary (keeps `icons:
  { CloseIcon }` — MUI Chip's onDelete icon is internal, Badge has none),
  interface extends `ComponentProps<typeof Alert>`; core `SpanProps`,
  `srtToolbarAlertBannerChipProps` DivProps → SpanProps.
- Grouping chip = `Badge asChild` rendering a single `<button>` (2026-07-15
  user ruling; replaces Rev-2's nested raw delete button). Deviation: MUI
  Chip label is inert, only its X deletes — here the WHOLE chip click
  ungroups (user-accepted). Icon auto-sized by badge base `[&>svg]:size-3`;
  accessible name = column header text (MUI's delete icon was unlabeled).
  Browser-verified. FilterTextField chip converted to the same pattern
  2026-07-21 (see its entry).
- Collapse swap (2026-07-22, user): conditional render → radix Collapsible
  (controlled `open` = MRT's exact condition, no trigger; early return
  removed — root div stays in DOM closed, MUI Collapse parity). MUI
  `timeout={stackAlertBanner ? 200 : 0}` → collapsible animation classes
  ONLY when stacked (tw-animate-css keyframes, 0.2s default = 200ms; no CSS
  config added). Parity gap accepted: radix unmounts closed content, MUI
  keeps it mounted (forceMount rejected — banner stateless, would need
  hand-styled hidden state). Browser-verified 6/6; stacked-animation branch
  not demo-reachable (guard verified in code).
- Chip icon (final, 2026-07-21): chip uses the `CancelIcon` slot (registry
  `CancelIcon: XCircle` = circle-X, matching MUI Chip's built-in onDelete
  glyph). User's interim global `CloseIcon → CircleX` remap was reverted —
  registry back to MUI parity (CloseIcon=plain X). `data-icon="inline-end"`
  attr on the icon is inert under radix-flavor badge — kept for future Base
  UI migration.
### [ ] SRT_ToolbarDropZone.tsx : MRT_ToolbarDropZone.tsx
- `srtToolbarDropZoneProps` slot REMOVED from core — MRT has no
  muiToolbarDropZoneProps (prior-run invention); props flow via ...rest only.
### [ ] SRT_LinearProgressBar.tsx : MRT_LinearProgressBar.tsx
- Sweep: bars → ui/progress driven by the existing useSRT_ProgressAnimation
  value; manual aria dropped (radix Progress supplies progressbar semantics);
  h-1 square → h-2 rounded-full shadcn default.
### [ ] SRT_TablePagination.tsx : MRT_TablePagination.tsx
- `srtPaginationProps` keeps explicit `showFirstButton`/`showLastButton`
  literals — MUI PaginationProps base carried them; the DivProps swap would
  have dropped API the component consumes.
- Sweep: rows-per-page native select → radix Select; `SelectProps` slot
  retyped Partial<'select' props> → Partial<ButtonProps> (spread target =
  SelectTrigger); slot `children` rendered inside SelectContent, excluded
  from trigger spread.
- 'pages' mode = shadcn Pagination composition, but PaginationPrevious/Next
  dropped (hardcode English text + lucide icons — break 38-locale + icon
  overrides) and PaginationLink dropped for numbered pages (href-less anchor,
  not keyboard-operable) → all interactive controls are Buttons inside
  PaginationItem; active page = variant outline + aria-current="page".
- `mx-0 w-auto` on Pagination root ruled LAYOUT (2026-07-14): undoes the
  component's standalone `mx-auto w-full` so the nav sits inline in the
  toolbar flex row — placement, not look.

## head/

### [ ] SRT_TableHead.tsx : MRT_TableHead.tsx
### [ ] SRT_TableHeadRow.tsx : MRT_TableHeadRow.tsx
### [ ] SRT_TableHeadCell.tsx : MRT_TableHeadCell.tsx
- Deferred gap: MRT's expand Header appends grouped-column names when
  `groupedColumnMode === 'remove'` — not rendered; revisit at grouping parity.
### [ ] SRT_TableHeadCellColumnActionsButton.tsx : MRT_TableHeadCellColumnActionsButton.tsx
- Sweep: raw button → Button ghost/icon defaults; MRT sx (32px box, negative
  margins, idle opacity 0.3 + hover fade) dropped per no-override ruling —
  button now full-opacity size-9. Icon scale(0.9) → `scale-90` class.
- Head-button resize (2026-07-22): size icon → `icon-sm` (size-8/32px,
  built-in variant from the ui refresh; closest to MUI small IconButton
  ~34px) — resolves the size-9 dense-column crowding flag. Applied uniformly
  to ColumnActionsButton, FilterLabel, SortLabel, GrabHandleButton.
  Browser-verified 32px + functional + compact density clean. SortLabel
  nuance: MRT's TableSortLabel is ~3ch (~24px), not a small IconButton —
  icon-sm chosen for sibling parity; `icon-xs` (24px) = alternative if
  closer MRT footprint wanted. GrabHandleButton shared → row drag handles
  shrink too (MRT small in both spots, parity holds).
### [ ] SRT_TableHeadCellFilterContainer.tsx : MRT_TableHeadCellFilterContainer.tsx
### [ ] SRT_TableHeadCellFilterLabel.tsx : MRT_TableHeadCellFilterLabel.tsx
- Sweep: raw button → Button ghost/icon defaults; MRT's 16px scaled box +
  active-opacity dim dropped per ruling; only ml-1 (layout) kept.
### [ ] SRT_TableHeadCellGrabHandle.tsx : MRT_TableHeadCellGrabHandle.tsx
- Renders SRT_GrabHandleButton WITHOUT `location` (MRT-exact). The old
  location-opacity gap is moot post-sweep: normalization made ALL grab
  handles full-opacity (user ruling); `location` is now vestigial on the
  button (kept in interface, excluded from DOM spread).
### [ ] SRT_TableHeadCellResizeHandle.tsx : MRT_TableHeadCellResizeHandle.tsx
- Sweep: `<hr>` → Separator orientation="vertical" (rest spread now plain
  DivProps — hr cast removed). Line 2px → 1px bg-border default; active
  highlight via wrapper selector `[&:active>[data-slot=separator]]:bg-primary`
  (no className on Separator beyond translate-x-1 layout + transition, which
  must sit on Separator for the active state to animate).
### [ ] SRT_TableHeadCellSortLabel.tsx : MRT_TableHeadCellSortLabel.tsx
- Sweep: raw button → Button ghost/icon with pure defaults (user ruling —
  ~3ch box → size-9); MUI TableSortLabel active/idle dim moved onto the
  SRT-owned icons (SyncAlt opacity-30 unsorted / Arrow opacity-100 sorted);
  static icon transform → `-rotate-90 scale-x-90 -translate-x-px` classes.

## body/

### [ ] SRT_TableBody.tsx : MRT_TableBody.tsx
### [ ] SRT_TableBodyRow.tsx : MRT_TableBodyRow.tsx
- Row highlights = solid classes (locked deviation; MRT's td:after overlay
  machinery commented in place). Consequence: hovering a SELECTED row lightens
  it (bg-muted → bg-muted/50); MRT keeps selected bg on hover.
### [ ] SRT_TableBodyCell.tsx : MRT_TableBodyCell.tsx
- Sweep: skeleton pulse-div → ui/skeleton (runtime width/height stay inline;
  MUI wave→pulse and bg-muted→bg-accent defaults noted).
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
- Sweep: MUI Collapse → Collapsible/CollapsibleContent on the NON-virtual
  branch only (virtual branch stays a bare conditional so measureElement
  reads real height). Browser-verified expand/collapse clean.

## footer/

### [ ] SRT_TableFooter.tsx : MRT_TableFooter.tsx
### [ ] SRT_TableFooterRow.tsx : MRT_TableFooterRow.tsx
### [ ] SRT_TableFooterCell.tsx : MRT_TableFooterCell.tsx

## inputs/

### [ ] SRT_FilterTextField.tsx : MRT_FilterTextField.tsx
- Sweep fork: text + autocomplete variants → InputGroup (mode InputGroupButton
  + chip inline-start; clear inline-end, text only; autocomplete's
  PopoverTrigger asChild wraps ONLY the InputGroupInput so the mode button
  opens the mode menu, not the popover). select/multiselect/date keep sibling
  adornments (`!usesInputGroup` gate) — radix Select/Popover can't host
  addons. Adornment size-*/scale-* overrides stripped to variant defaults.
- Text-branch value guard widened to accept numbers (`valueAsNumber` filters
  blanked the visible input each keystroke; MRT passes filterValue directly).
- Deferred gap: select/multi-select filter variants (June non-input
  renderings) don't register in filterInputRefs and skip the shared
  onKeyDown/aria common props — focus-filter-on-open skips select columns.
  Structural to the locked June rendering; revisit if select filters need
  programmatic focus.
- PopoverContent `w-[--radix-popover-trigger-width] p-0` (autocomplete +
  multiselect) KEPT: shadcn's own canonical Combobox pattern (Command inside
  padless Popover); width var = layout. Notes at both sites.
- Filter-value chip (2026-07-21): Badge asChild single `<button>` — banner
  chip pattern; whole-chip click clears filter value+mode (MUI label-inert
  deviation accepted, banner precedent). Icon = `CancelIcon` slot (circle-X,
  MUI Chip onDelete parity); X button's `aria-label={localization.
  clearFilter}` dropped — accessible name = chip label text. gap-1/ml-0.5/
  size-3 manual classes dropped (badge base covers). Browser-verified
  (clear resets mode→Fuzzy, rows restore, console clean).
### [ ] SRT_FilterRangeFields.tsx : MRT_FilterRangeFields.tsx
### [ ] SRT_FilterRangeSlider.tsx : MRT_FilterRangeSlider.tsx
- Default-variants pass: `px-1` (ported MUI px:4px) dropped from Slider cva;
  `mx-auto w-[calc(100%-8px)]` kept as layout (track inset). Watch item:
  thumb clipping at min/max extremes — revert px-1 if browser shows clipping.
### [ ] SRT_FilterCheckbox.tsx : MRT_FilterCheckbox.tsx
- Checkbox slots are ButtonProps → MRT's `(e, checked)` onChange composition
  has no typed surface; user hook = onClick only (same across all checkbox
  slots).
- Default-variants pass: no-op `cva('size-4')` deleted, Checkbox bare.
  Pre-existing gap (reviewer aside, deferred): user `checkboxProps.
  onCheckedChange` is overridden, not composed — MRT forwards onChange.
### [ ] SRT_GlobalFilterTextField.tsx : MRT_GlobalFilterTextField.tsx
- Sweep: raw input + absolute adornments → InputGroup (mode button or bare
  SearchIcon inline-start; clear inline-end, disabled clear tooltip-anchored
  via span); InputGroupButton size icon-xs; width lives on the SRT-owned
  wrapper (w-48), not the group.
### [ ] SRT_EditCellTextField.tsx : MRT_EditCellTextField.tsx
- Sweep: raw input → ui/Input; raw select → radix Select. Select mapping:
  onValueChange = commit (setValue + saveInputValueToRowCache);
  onOpenChange(false) → setEditingCell(null) with NO re-save (stale-closure
  clobber); trigger onBlur exits only when never-opened (selectOpenRef set
  synchronously in onOpenChange) — together = MRT's handleBlur exit paths.
- Select variant drops textFieldProps onChange/onBlur/children (no radix
  surface; children can't inject native options) + Notes; disabled honored on
  Input variant only.
- SRT-only `onEditingCellSave` API preserved: fires in saveInputValueToRowCache
  when editDisplayMode is 'cell'|'table' (blur + Enter-via-blur + select
  immediate save) — where MRT does nothing. Signature {cell, row, table, value}.
### [ ] SRT_SelectCheckbox.tsx : MRT_SelectCheckbox.tsx
- `srtSelectCheckboxProps` collapses MRT's `CheckboxProps | RadioProps` union
  to ButtonProps — locked June deviation: round Checkbox for single-select,
  no Radio element in SRT.
- Deferred gap (tester obs 2026-07-10): with grouping active, group-HEADER-row
  checkboxes keep aria-checked="true" after clear-selection though the
  selected-row model is 0 — grouped-row re-render/derived-state suspect;
  unverified against MRT behavior.

## menus/

### [ ] SRT_ColumnActionMenu.tsx : MRT_ColumnActionMenu.tsx
### [ ] SRT_FilterOptionMenu.tsx : MRT_FilterOptionMenu.tsx
- Active-mode `bg-accent` on the selected item KEPT (2026-07-14 ruling):
  state-driven functional styling (MUI MenuItem `selected` analog); same
  token radix uses for its own highlighted state. RadioGroup/RadioItem
  alternative rejected — items flow through shared SRT_ActionMenuItem.
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
- Default-variants pass: `py-1.5` (ported MUI py:6px) dropped from item cva;
  layout classes + `-outline-offset-2` (drag-outline inset, functional) kept.
### [ ] SRT_ActionMenuItem.tsx : MRT_ActionMenuItem.tsx
- Sweep: submenu arrow raw button → Button ghost/icon (size-9 in the item
  row); item cva trimmed of min-w-[120px]/py-1.5 (DropdownMenuItem defaults
  win; Content governs width).
- Menu shell = shadcn DropdownMenu family + fixed-span anchorEl bridge
  (locked). Items extend DropdownMenuItem props + explicit `divider?: boolean`
  (mirrors MUI MenuItemProps.divider — real per-item MRT API, renders trailing
  DropdownMenuSeparator). `dense` stays menu-level (Content className), never
  per item. All menu rebuilds follow this.

## buttons/

Sweep normalization (2026-07-11 ruling, all 13 files): styling classNames/cva
on shadcn Buttons stripped — size overrides → size-9 icon default (Pin 24px,
ColumnPinning/RowAction 32px, compact-density shrinks all gone), opacity
fades gone (GrabHandle 0.5→1, RowActionMenu/edit 0.5→1, ColumnActions 0.3→1),
ExpandButton disabled dim 0.3 → disabled:opacity-50 default. Layout margins +
icon rotations kept. Each drop has an in-file Note.

### [ ] SRT_ToggleRowActionMenuButton.tsx : MRT_ToggleRowActionMenuButton.tsx
- `{...rest}` moved LAST on both Buttons (MRT precedence: consumer
  onClick/aria-label override internal) — sweep review caught the uniform
  rest-first idiom inverting this file's MRT order.
### [ ] SRT_EditActionButtons.tsx : MRT_EditActionButtons.tsx
- Sweep: spinner → ui/spinner (was LoaderCircleIcon 18px; now Spinner 16px
  default); save icon button's `text-primary` (old color="info" map) and
  text-variant `min-w-[100px]` dropped per ruling.
### [ ] SRT_CopyButton.tsx : MRT_CopyButton.tsx
- USER EXCEPTION (2026-07-11) to the no-className ruling: text-inheritance
  cva restored — click-to-copy cells must render as plain cell text, not a
  ghost-button box (strict ruling application boxed every copyable cell).
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
- Post-sweep: opacity/location distinction gone (all handles full-opacity
  size-9 per ruling); `location` prop vestigial — kept in interface,
  destructured out of the DOM spread (callers still pass it harmlessly).
- Superseded history: June `location='row'` default bug was fixed
  (no-default), then the ruling flattened the 0.5/1 opacity split entirely.
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
- Default-variants pass (supersedes next line): `sm:max-w-[444px]` cva
  DELETED — DialogContent default sm:max-w-lg (512px) wins; DialogTitle
  `text-center` dropped (typography) — DialogHeader default alignment
  (centered mobile / left sm+) wins. Both = visual changes vs MRT.
- ~~`fullWidth maxWidth="xs"` → cva `sm:max-w-[444px]`~~ (superseded above).
- Sweep: field stack div (flex-col gap-8 pt-4) → ui/field FieldGroup
  (gap-7, no top pad — shadcn default wins); DialogFooter `p-5` dropped
  (default footer spacing wins; MRT DialogActions p 1.25rem noted).

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
- ui-refresh (2026-07-21): latest registry tooltip no longer self-wraps in a
  TooltipProvider (radix Root THROWS without one). Per shadcn docs ("add the
  TooltipProvider to the root of your app") ONE provider is mounted in
  ShadcnReactTable.tsx wrapping SRT_TableLayout — zero consumer boilerplate
  (MUI/MRT ergonomics). Per-Root delayDuration kept (valid radix override).
  Portal audit: all 23 usages descend from the provider.

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
