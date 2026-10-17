# SRT ↔ MRT Review Notes

Spec: `packages/material-react-table/`. MUI behind MRT is also spec. Method and
rules: `.ai/plans/workflows/review-patterns.md`.

Boxes are the owner's: `[x]` reviewed, `[-]` skipped. Agents never mark them.
A recorded ruling is a line under Conventions or a ticked box. Bullets under an
unticked entry are agent claims, not rulings.

## Conventions

- Single folder: `components/ui/shadcn-react-table/` holds components, types,
  hooks, utils, fns, locales, icons. Relative imports like MRT. CLI package
  untouched. Stories deferred until the library is done. Locales are imported
  by path, like MRT's subpath entries.
- Styling: one `xxxVariants` cva at the top, applied through `cn()`; user
  `className` merges last. Runtime-measured values stay inline `style`; user
  `style` spreads last. No CSS variables added; theme tokens only; `data-slot`
  is the restyle hook. Focus rings use `ring`. Keyframes MRT needs (progress
  indeterminate, horizontal collapse) live in the app stylesheet for now.
- MUI default styles of raw elements (`table`, `tr`, `td`) count as spec. A
  shadcn component is used in its default variant; layout-only `className`;
  state-driven classes allowed when they map an MRT feature.
- shadcn-first: check the registry (radix, new-york) before porting MUI by
  hand. Raw table markup stays. Keep the SRT card look; polish later.
- `SRT_Tooltip` stays: one-element MUI shape over shadcn's three parts. Radix
  state children (Checkbox, Switch) get a `<span>` anchor under the trigger.
- Dropped MRT lines stay commented at their position with a one-line
  `// Note:`. `@ts-expect-error` carries a reason. No other scaffolding.
- `mrtTheme` dropped project-wide. No `Srt-*` class hooks.
- MRT deps arrays verbatim, held with `eslint-disable-next-line react-hooks/exhaustive-deps`. `type="button"` on every button (MUI
  ButtonBase emits it). Icon buttons: MRT `size="small"` is `icon-sm`, no
  size is `icon`.
- Display columns MRT-exact: `Cell`/`Header` on the defs, ids `srt-row-*`.
- Registry forks to re-apply after a refresh: `ui/native-select` imports `cn`
  from `@/lib/utils` (CLI emitted `"cn"`); `ui/checkbox` renders MUI's dash
  for `indeterminate`.

## Entry

### [x] ShadcnReactTable.tsx : MaterialReactTable.tsx

- ok. almost same.
- Some import differences, will be handled later depending on shadcn registry implementation.

## table/

### [x] SRT_TableLayout.tsx : MRT_TablePaper.tsx

- hand-written, ok. trusted. (last good file top-down)

### [x] SRT_TableContainer.tsx : MRT_TableContainer.tsx

### [x] SRT_Table.tsx : MRT_Table.tsx

### [x] SRT_TableLoadingOverlay.tsx : MRT_TableLoadingOverlay.tsx

## toolbar/

### [x] SRT_TopToolbar.tsx : MRT_TopToolbar.tsx

### [x] SRT_BottomToolbar.tsx : MRT_BottomToolbar.tsx

### [x] SRT_ToolbarInternalButtons.tsx : MRT_ToolbarInternalButtons.tsx

### [x] SRT_ToolbarAlertBanner.tsx : MRT_ToolbarAlertBanner.tsx

### [x] SRT_ToolbarDropZone.tsx : MRT_ToolbarDropZone.tsx

### [x] SRT_LinearProgressBar.tsx : MRT_LinearProgressBar.tsx

### [-] SRT_TablePagination.tsx : MRT_TablePagination.tsx

## head/

### [-] SRT_TableHead.tsx : MRT_TableHead.tsx

### [-] SRT_TableHeadRow.tsx : MRT_TableHeadRow.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [-] SRT_TableHeadCell.tsx : MRT_TableHeadCell.tsx

- cva base gets MUI TableCell head defaults `border-b text-sm leading-6` (owner ruling); `font-bold` kept (MRT fontWeight bold).
- User `align` was inert (hardcoded `text-start` after the spread); now mapped to MUI's align variants (`text-center` / `text-right flex-row-reverse` / `text-left` / `text-justify`) like SRT_TableBodyCell, …
- `onKeyDown` moved to MRT's position right after the props spread; useTheme Note trimmed to one line. `stickyHeader` block kept: MUI TableCell `stickyHeader` ownerState (MRT_Table passes `stickyHeader={enableStickyHeader || isFullScreen}`) g …
- commits: 2863f36, 134f2b4

### [-] SRT_TableHeadCellColumnActionsButton.tsx : MRT_TableHeadCellColumnActionsButton.tsx

- MRT's IconButton sx (m -8px -4px, opacity .3 to 1 on hover, transition 150ms) was dropped with a 'shadcn wins' note; restored as columnActionsButtonVariants cva, merged via cn() ahead of the user className (CopyButton precedent). …
- Rest unchanged and MRT-exact: ButtonProps slot verified (srtColumnActionsButtonProps -> shadcn Button -> <button></button>), SRT_Tooltip side='top' carries getCommonTooltipProps, size icon-sm / type='button' per Conventions, …
- commits: 1633618

### [-] SRT_TableHeadCellFilterContainer.tsx : MRT_TableHeadCellFilterContainer.tsx

- MUI Collapse rebuilt as shadcn Collapsible/CollapsibleContent with animate-collapsible-down/up (same pattern as ticked SRT_LinearProgressBar, SRT_ToolbarAlertBanner); radix unmount on close = mountOnEnter/unmountOnExit.
- Props extend React.ComponentProps<typeof Collapsible></typeof> (CollapseProps twin) instead of DivProps; rest spreads last like MRT.
- Deleted the homegrown `if (!open) return null` + plain div + empty cva (no MRT/MUI pointer).
- commits: 1a12bec

### [-] SRT_TableHeadCellFilterLabel.tsx : MRT_TableHeadCellFilterLabel.tsx

- IconButton sx rebuilt as tableHeadCellFilterLabelVariants cva (icon-sm = 16px box + 8px pad, ml-1, scale-75, transition-all 150ms ease-in-out, active opacity 1/.3); previous "head-button ruling" comment pointed at no Conventions line, …
- Popover anchor: fixed-position span + getBoundingClientRect hack replaced by radix PopoverAnchor virtualRef={{ current: anchorEl }} (1:1 with MUI anchorEl). …
- Box span flex:'0 0' -> flex-none. Browser check (inputs-menus demo, column mode): label 24px box, opacity 1 when filtered, tooltip text, click focuses input; popover mode not checked (no demo sets columnFilterDisplayMode).
- commits: 5ea63d3, 61dfd12

### [ ] SRT_TableHeadCellGrabHandle.tsx : MRT_TableHeadCellGrabHandle.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_TableHeadCellResizeHandle.tsx : MRT_TableHeadCellResizeHandle.tsx

- Dropped invented consts isResizing/isDisplay/positionClass/activeOpacityClass; MRT's mx/lr live in the cva (density x direction margins, display x direction left/right), active-opacity ternary inline like MRT's sx, …
- Restored MRT's explicit Divider sx on the Separator: z-[4], rounded-xs (2px), data-[orientation=vertical]:w-1 (borderWidth 2px on a zero-width hr renders a 4px bar), data-[orientation=vertical]:h-6, touch-none select-none, ease-in-out; …
- flexItem kept as commented line + Note (no effect: wrapper is not flex). Mui-* class hooks dropped silently like ticked DropZone. info.main -> bg-primary follows ticked SRT_ToolbarDropZone. …
- commits: f7591d4, 3f834ed

### [ ] SRT_TableHeadCellSortLabel.tsx : MRT_TableHeadCellSortLabel.tsx

- TableSortLabel is a MUI ButtonBase, not a Button: shadcn ghost icon-sm dropped; raw `<button type="button">` + one cva holding MUI root/icon defaults (18px icon, mx-1, 200ms opacity/transform, …
- Badge rebuilt from MUI Badge defaults (wrapper: relative inline-flex shrink-0 align-middle; mark: 20px circle, top/right 14% translate 50%, text-xs font-medium, …
- SyncAlt keeps MRT's inline `style={{ transform: 'rotate(-90deg) scaleX(0.9) translateX(-1px)' }}` verbatim (Tailwind v4 rotate/scale/translate compose in a different order); …
- commits: bfb941a, 853a1b7, 04fd6a4

## body/

### [ ] SRT_TableBody.tsx : MRT_TableBody.tsx

- Dropped hoisted `const layout`; `layoutMode?.startsWith('grid') ? 'grid' : 'semantic'` inlined at each of the 3 tbody cva calls, matching MRT's three inline `display` expressions and the ticked SRT_TableHead idiom.
- Rest already MRT-exact: Typography -> `<p>` with text-muted-foreground/italic/py-8/text-center/w-full; sx sticky/relative/zIndex/minHeight -> `sticky z-[1]`, `relative`, `min-h-[100px]`; …
- Defs diff prefix-only; `SRT_VirtualItem` mirrors MRT_VirtualItem (MRT_TableBodyRow/HeadRow use the same alias); slot `srtTableBodyProps` -> `<tbody>` verified.
- commits: 7f6ee19

### [-] SRT_TableBodyRow.tsx : MRT_TableBodyRow.tsx

### [-] SRT_TableBodyCell.tsx : MRT_TableBodyCell.tsx

### [-] SRT_TableBodyCellValue.tsx : MRT_TableBodyCellValue.tsx

### [-] SRT_TableBodyRowGrabHandle.tsx : MRT_TableBodyRowGrabHandle.tsx

### [-] SRT_TableBodyRowPinButton.tsx : MRT_TableBodyRowPinButton.tsx

### [ ] SRT_TableDetailPanel.tsx : MRT_TableDetailPanel.tsx

- text-start moved from tr cva to td cva: MUI TableCell default textAlign left; MUI TableRow has no text-align.
- CollapsibleContent carries data-[state=open]:animate-collapsible-down / closed:animate-collapsible-up, same as ticked SRT_LinearProgressBar (MUI Collapse height transition).
- Row/cell cva otherwise map MRT sx 1:1 (w-full, flex for grid, border-b-0 when collapsed, py-4/py-0, bg-background + no transition when virtual); …
- commits: c321907, ee2c71d

## footer/

### [ ] SRT_TableFooter.tsx : MRT_TableFooter.tsx

- Restored MRT's `footerGroup as any` cast (same as ticked SRT_TableHead); eslint-disable line required because no-explicit-any is only off for fns/hooks/utils/types, not components.
- Dropped `!!stickFooter`: MRT passes the raw `boolean | undefined`, cva accepts it; no coercion in MRT.
- cva maps MRT sx 1:1 (bottom-0 / grid / opacity-[0.97] / outline outline-1 outline-border for grey[300|700] / sticky|relative / z-[1]); slot srtTableFooterProps = ComponentPropsWithRef<'tfoot'> verified onto .
- commits: 0b308c7, 23cadec

### [ ] SRT_TableFooterRow.tsx : MRT_TableFooterRow.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_TableFooterCell.tsx : MRT_TableFooterCell.tsx

- user `align` was inert (class picked from columnDefType only); now MUI align classes map like body/head cell, default group→center else text-start, user align wins as in MRT spread
- `border-b` added to cva (MUI TableCell root borderBottom; body/head cells carry it); owner-ruled `text-xs leading-[1.3125rem] text-muted-foreground font-bold` kept
- duplicate `tableCellProps.className`/`style` merges removed (getCommonSRTCellStyles already merges them last, like MRT's sx tail); `onKeyDown` moved to MRT position after the spread
- commits: b70b0c6

## inputs/

### [ ] SRT_FilterTextField.tsx : MRT_FilterTextField.tsx

- Every variant now sits in one InputGroup (MUI Input root + InputAdornment); the duplicate absolute-overlay adornments, setInputRef/inputType/dateFieldProps/filterChip/isTextVariant/usesInputGroup/optionMenu/filterModeHelperText consts and t …
- MUI sizes mirrored: both IconButtons size="small" -> icon-sm, mode button size-7 (1.75rem), clear scale-90; root cva = MUI FormControl root + fullWidth, MRT minWidth map inline via cn; …
- debounce is now MUI's @mui/utils debounce ported verbatim into utils/utils.ts (MRT imports it from @mui/material/utils); SRT_GlobalFilterTextField still carries its own local copy, to swap in its own entry.
- commits: 12c967e, c4253b1

### [ ] SRT_FilterRangeFields.tsx : MRT_FilterRangeFields.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_FilterRangeSlider.tsx : MRT_FilterRangeSlider.tsx

- types.ts: srtFilterSliderProps slot and SRT_FilterRangeSliderProps now use `SliderProps = ComponentPropsWithRef<typeof Slider>` (MUI's name, shadcn Slider's shape); …
- Component MRT-exact: min/max read off `sliderProps` (maxProp/minProp split gone); `useState([min, max])` and `setFilterValues(columnFilterValue)` without casts; ref callback registers the radix thumb (`[data-slot="slider-thumb"]`, …
- Styling: sx `m:'auto'` and `px:'4px'` mapped (`m-auto px-1`, was `mx-auto` with no padding); dropped `disableSwap` / `valueLabelDisplay` keep their commented lines with corrected Notes (radix thumbs DO sort on cross, no disableSwap; …
- commits: 70dae39

### [ ] SRT_FilterCheckbox.tsx : MRT_FilterCheckbox.tsx

- FormControlLabel -> shadcn `Label` (registry part) with MRT's sx mapped (`-mt-1 font-normal text-muted-foreground`), `title={undefined}` kept; `disableTypography` commented + Note. …
- MUI `color`/`size` lines restored as cva variants (`color: default|primary` -> indeterminate paints muted-foreground like MUI action.active; `density` -> size-4/size-5, same mapping as SRT_SelectCheckbox); …
- types.ts: `CheckboxProps = ComponentPropsWithRef<typeof Checkbox>` added beside SliderProps (MUI name, same precedent) and `srtFilterCheckboxProps` (column def + table options) typed with it instead of `ButtonProps`, …
- commits: c9e96ab

### [ ] SRT_GlobalFilterTextField.tsx : MRT_GlobalFilterTextField.tsx

- debounce: local helper dropped, MUI port from utils/utils (same as SRT_FilterTextField).
- Collapse: keyframes in index.css now read radix's --radix-collapsible-content-width (custom --srt-collapsible-width, inline style, CSSProperties import and w-48 dropped; width is intrinsic like MUI TextField, measured 249px); …
- Buttons icon-sm (Convention), search-mode gets size-7 for MRT's 1.75rem sx; MRT prop order; dropped TextField size/variant/InputProps.sx kept as one commented line + Note; narration comments removed.
- commits: 2dd6246, 802572a

### [ ] SRT_EditCellTextField.tsx : MRT_EditCellTextField.tsx

- onEditingCellSave deleted (option, call, both demos); demos save through srtEditTextFieldProps.onBlur like MRT docs.
- Select branch is a MUI SelectInput port: onBlur only while closed with target shaped { name, value }, onValueChange routed through MRT handleChange, no exit on menu close, textFieldProps spread + children passthrough restored.
- selectOpenRef/handleClick/isModalOrCustom/placeholder/disabled consts inlined at MRT positions; dropped TextField root props commented with one Note each.
- commits: 3e9712e

### [ ] SRT_SelectCheckbox.tsx : MRT_SelectCheckbox.tsx

- Selection moved into MRT's onClick on the real click event (shiftKey batch select works); shiftKeyRef, synthetic ChangeEvent, and hoisted consts (label, isSingleSelect, indeterminate, checked) deleted. …
- Single-select renders shadcn radio-group (registry file added at ui/radio-group.tsx, radix needs RadioGroup around RadioGroupItem, one group per row = MUI standalone Radio) instead of a rounded-full Checkbox; …
- Slot types stay ButtonProps (spread target verified on radix Checkbox and RadioGroupItem). Follow-up once the FilterCheckbox agent's `CheckboxProps` alias lands in types.ts: srtSelectAllCheckboxProps -> CheckboxProps, …
- commits: 4548885, e4e0ba9

## menus/

### [ ] SRT_ColumnActionMenu.tsx : MRT_ColumnActionMenu.tsx

- onCloseAutoFocus preventDefault + anchorEl?.focus() on DropdownMenuContent: focus returns to the column actions button like MUI FocusTrap restore (Radix default focused the aria-hidden ghost trigger span).
- Dense cva selector ([&_[role=menuitem]]:py-1), its density read, cva/cn imports deleted per owner decision: MRT items pin py 6px by sx, compact density changes no item. className now flows via rest.
- Scroll-lock Note reworded in the same commit: Radix DropdownMenu keeps its modal default (scroll-locks), owner ruling.
- commits: 9e4d8d8

### [ ] SRT_FilterOptionMenu.tsx : MRT_FilterOptionMenu.tsx

- icon={symbol} like MRT:278; SRT_ActionMenuItem already wraps the slot span.
- align="start" alignOffset={(rect?.height ?? 0) / 2} side="right" mirrors MUI anchorOrigin right/center with default transformOrigin top/left.
- anchorRef (useRef, set while anchorEl present) + onCloseAutoFocus preventDefault + anchorRef.current?.focus(): focus returns to the trigger even though consumers keep the menu mounted; dense cva selector, density read, …
- commits: 713c5c8

### [ ] SRT_RowActionMenu.tsx : MRT_RowActionMenu.tsx

- anchorRef (useRef, set while anchorEl present) + onCloseAutoFocus preventDefault + anchorRef.current?.focus(): focus returns to the row actions button; SRT_ToggleRowActionMenuButton keeps the menu mounted with anchorEl null.
- Dense cva selector ([&>*]:py-1), getState/density read, cva/cn imports deleted per decision: MRT items pin py 6px by sx. className flows via rest.
- commits: 0d7fc22

### [ ] SRT_CellActionMenu.tsx : MRT_CellActionMenu.tsx

- handleClose is MRT's `(event?: any)` behind eslint-disable; keys `srt-copy` / `srt-edit`
- `sideOffset={-((rect?.height ?? 0) + 8)}` with align start / alignOffset 100 lands on MUI's transformOrigin point (top = anchorTop - 8, left = anchorLeft + 100); Note reworded to that arithmetic in the same hunk
- `anchorEl = actionCellRef.current` captured at render, reused for rect; `onCloseAutoFocus` prevents default and refocuses the cell. Density cva + `[&>*]:py-1` deleted with its Note, …
- commits: 4b3f5d9

### [ ] SRT_ShowHideColumnsMenu.tsx : MRT_ShowHideColumnsMenu.tsx

- onCloseAutoFocus preventDefault + anchorEl?.focus() on DropdownMenuContent: focus returns to the show/hide columns button (SRT_ShowHideColumnsButton mounts the menu only while anchorEl is set).
- Dense cva selector ([&_[role=menuitem]]:py-1), density read, cva/cn imports deleted per decision: MRT items pin py 6px by sx. className flows via rest.
- commits: e48c0af

### [ ] SRT_ShowHideColumnsMenuItems.tsx : MRT_ShowHideColumnsMenuItems.tsx

- `<Label>` from registry replaces raw `<label className="flex items-center gap-2">` (MUI FormControlLabel root label)
- Header span adds `text-muted-foreground` when `!column.getCanHide()` (FormControlLabel disabled label colour)
- Spacer spans are `<div>` (MUI Box default root); no-hiding header is `<p className="self-center">` (Typography body1)
- commits: 053bfe8

### [ ] SRT_ActionMenuItem.tsx : MRT_ActionMenuItem.tsx

- Icon slot `inline-flex min-w-9 shrink-0` (MUI ListItemIcon inside MenuItem minWidth 36); narration comment removed with it
- Submenu arrow `size="icon-xs"` per decision (no className size override); `// p-0` and `// Note:` lines removed
- `onOpenSubMenu` typed as `DropdownMenuItem['onClick'] | ['onMouseEnter']` with MRT's `as any` casts; `divider` is `border-b bg-clip-padding` on the one item element, Fragment and DropdownMenuSeparator import gone
- commits: d6f04ea

## buttons/

### [ ] SRT_ToggleRowActionMenuButton.tsx : MRT_ToggleRowActionMenuButton.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_EditActionButtons.tsx : MRT_EditActionButtons.tsx

- `{...rest}` spread removed from the root div: MRT (:87-94) forwards only `rest?.sx` into Box; `className={cn(editActionButtonsVariants({ className: rest.className }))}` and stopPropagation onClick kept.
- commits: 8dec057

### [ ] SRT_CopyButton.tsx : MRT_CopyButton.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_ExpandButton.tsx : MRT_ExpandButton.tsx

- Density sizing restored (MRT:36, :71/:76): `getState` + `const { density } = getState();`, new `expandButtonVariants` cva (compact: 'size-7'), applied after `{...iconButtonProps}` via `className={cn(expandButtonVariants({ density }), …
- `type="button"` added between `size="icon"` and `variant="ghost"` (MUI ButtonBase default via MRT:65 IconButton).
- commits: 059fa84

### [ ] SRT_ExpandAllButton.tsx : MRT_ExpandAllButton.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_GrabHandleButton.tsx : MRT_GrabHandleButton.tsx

- cva now carries MRT's sx (:44-58): base 'my-0 -mx-[0.1rem] cursor-grab transition-all duration-150 ease-in-out hover:bg-transparent hover:opacity-100 active:cursor-grabbing dark:hover:bg-transparent', …
- `type="button"` inserted between `size="icon-sm"` and `variant="ghost"`, before `{...rest}` (MUI ButtonBase default via MRT:34 IconButton).
- commits: f343662

### [ ] SRT_RowPinButton.tsx : MRT_RowPinButton.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_ColumnPinningButtons.tsx : MRT_ColumnPinningButtons.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_ShowHideColumnsButton.tsx : MRT_ShowHideColumnsButton.tsx

- `type="button"` inserted between `size="icon"` and `variant="ghost"`, before `{...rest}` (MUI ButtonBase default via MRT:32 IconButton; Conventions line).
- commits: 9c558f6

### [ ] SRT_ToggleDensePaddingButton.tsx : MRT_ToggleDensePaddingButton.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_ToggleFiltersButton.tsx : MRT_ToggleFiltersButton.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_ToggleFullScreenButton.tsx : MRT_ToggleFullScreenButton.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] SRT_ToggleGlobalFilterButton.tsx : MRT_ToggleGlobalFilterButton.tsx

- equivalent to MRT, no change (run 2026-10-17)

## modals/

### [ ] SRT_EditRowModal.tsx : MRT_EditRowModal.tsx

- Props `extends Partial<DialogProps>` from '../types' (no `import * as React`); types.ts `DialogProps = Pick<ComponentPropsWithRef<typeof Dialog>, 'onOpenChange'> & ComponentPropsWithRef<typeof DialogContent>`; …
- `handleClose` deleted; MRT onClose body inlined in Dialog `onOpenChange` (early return when opening) and chained to the user `onOpenChange`; …
- Cells render bare `<SRT_EditCellTextField cell key table />` like MRT (Field/FieldLabel dropped, FieldGroup kept). Label moved back into SRT_EditCellTextField: shadcn `Label` with `columnDef.header` when display mode is custom/modal, …
- commits: 8f11f5c, f05dd56

## Deviation-only (no MRT counterpart)

### [ ] SRT_Tooltip.tsx

- `disabled` renamed `disableHoverListener` (MUI Tooltip prop), same early return; SRT_ExpandButton.tsx:55 updated.
- `className` prop removed from SRT_TooltipProps, destructure and TooltipContent (0 consumers; MUI puts className on the child).
- `asChild` prop and default removed; `<TooltipTrigger asChild>` fixed.
- commits: a87ef3b

## Core (types, fns, utils, hooks)

### [ ] index.ts : index.ts

- Helpers block now tanstack.helpers, cell, column, displayColumn, row utils only (pagination.utils, style.utils, utils removed).
- `//display-column defs` block (7 exports), `./SRT_Tooltip`, `./menus/SRT_CellActionMenu` and the `//locales` block (38 exports) removed; SRT_TableLayout moved after SRT_TableLoadingOverlay (TablePaper slot).
- tsc clean after removal: no src consumer imported a removed name from the index, nothing repointed.
- commits: f2bc4c7

### [ ] types.ts : types.ts

- RowPinningPosition re-export dropped: MRT imports it from @tanstack/react-table in MRT_RowPinButton; SRT_RowPinButton import switched to tanstack (one-line edit).
- srtPaginationProps: `disabled?: boolean` restored inside the slot intersection as MRT has it (redundant with the stand-in, kept for line parity); import order and blank lines as MRT.
- DOM alias family, SRT_PaginationProps/SRT_LinearProgressProps/SRT_CircularProgressProps (consumed by [x] LinearProgressBar/LoadingOverlay and [-] Pagination), mui*->srt* slot type substitutions, tableLayoutRef/srtTableLayoutProps, …
- commits: b852ada, d293070, 95482e1

### [ ] icons.ts : icons.ts

- Keys and order already MRT-exact; 7 glyphs were not the closest lucide match and were remapped: FirstPage/LastPage -> ChevronFirst/ChevronLast (MUI chevron+bar), Fullscreen -> Maximize (corner brackets, pairs with Minimize), …
- SortIcon -> ArrowDownWideNarrow: MRT renders SortIcon plain for desc and with rotate(180deg) scaleX(-1) for asc; ArrowUpDown is symmetric so the transform was a no-op. ArrowRightIcon (MUI filled submenu triangle) -> ChevronRight, …
- Kept per owner ruling: FilterListIcon/FilterListOffIcon = Filter/FilterX (FilterAltIcon also Filter). No lucide import in use is a deprecated alias in lucide-react 0.544.0.
- commits: 39859f5, 23aa015

### [ ] fns/aggregationFns.ts : fns/aggregationFns.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] fns/filterFns.ts : fns/filterFns.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] fns/sortingFns.ts : fns/sortingFns.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] utils/cell.utils.ts : utils/cell.utils.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] utils/column.utils.ts : utils/column.utils.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] utils/displayColumn.utils.ts : utils/displayColumn.utils.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] utils/row.utils.ts : utils/row.utils.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] utils/style.utils.ts : utils/style.utils.ts

- Export set now MRT's: parseCSSVarId, getCommonPinnedCellStyles (data-[pinned=true]:before fill + edge shadow classes), getCommonSRTCellStyles ({className, style}: classes for statics, inline style for width/left/right/justifyContent, …
- getSRTTheme and commonCellBeforeAfterStyles stay commented with a Note (mrtTheme ruling; Tailwind prefixes each class with its pseudo variant so the fill cannot be a shared const).
- Head/body/footer cells call getCommonSRTCellStyles and drop their inlined copies (opacity-50, transition, z-index, pinned bg, focus-visible outline, …
- commits: 3e58d08

### [ ] utils/tanstack.helpers.ts : utils/tanstack.helpers.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] utils/utils.ts : utils/utils.ts

- Lines 1-23 (parseFromValuesOrFunc, getValueAndLabel) and DropdownOption defs identical to MRT.
- debounce + createFilterOptions (with Cancelable, CreateFilterOptionsConfig, FilterOptionsState) stay: verbatim @mui/utils debounce and @mui/material useAutocomplete ports, …
- Made MUI source-exact: dropped invented `this: any` for MUI's untyped `this` (ts-expect-error with reason), stripDiacritics regex back to MUI's `̀-ͯ` escapes (file had raw combining chars), …
- commits: 7ce9218

### [ ] utils/virtualization.utils.ts : utils/virtualization.utils.ts

- Follow-up 1 applied: JSDoc now names SRT_TableBodyRowGrabHandle / SRT_TableHeadCellGrabHandle (both exist under body/ and head/); verified file was otherwise byte-identical to MRT before the edit.
- Code unchanged: extraIndexRangeExtractor is MRT-exact line for line.
- commits: e37541f

### [ ] utils/pagination.utils.ts : MUI usePagination.js

- getPaginationItems carries MUI usePagination's defaults in its own destructure (boundaryCount 1, count 1, disabled false, hideNext/hidePrev false, page 1, showFirst/showLast false, siblingCount 1); params optional like UsePaginationProps.
- Body rebuilt MUI-exact: buttonPage keeps `default: return null`, item map is MUI's two-branch form with `!item.includes('ellipsis')`, MUI's own comments restored (range source link, propTypes sync, PaginationItem props). …
- SRT_TablePagination: removed the four defaults MRT does not carry (boundaryCount, hideNextButton, hidePrevButton, siblingCount); `disabled = false`, `showFirstButton/showLastButton = showFirstLastPageButtons` stay (MRT lines).
- commits: 5bc6844, b50f825

### [ ] hooks/useShadcnReactTable.ts : hooks/useMaterialReactTable.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] hooks/useSRT_TableInstance.ts : hooks/useMRT_TableInstance.ts

- Follow-up 1 applied: line 250 ts-expect-error reason replaced with `SRT_ColumnDef/SRT_TableInstance widen TanStack's ColumnDef/Table`; verified by removing the directive: tsc reports TS2345 (SRT_ColumnDef[] vs ColumnDef[], …
- commits: 859408f

### [ ] hooks/useSRT_TableOptions.ts : hooks/useMRT_TableOptions.ts

- Hook body, defaults, row-model wiring and return shape already MRT-exact line for line; only differences were useTheme/mrtTheme (ignored/Conventions) and columnResizeDirection.
- mrtTheme destructure/memo/return now kept as commented MRT lines plus one Note (Conventions: mrtTheme dropped project-wide); previously silently absent.
- columnResizeDirection: MRT `theme.direction || 'ltr'` kept commented at position, SRT hardcodes 'ltr' (MUI theme.direction default); Note reworded to one line.
- commits: 9bd8987

### [ ] hooks/useSRT_Effects.ts : hooks/useMRT_Effects.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] hooks/useSRT_Rows.ts : hooks/useMRT_Rows.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] hooks/useSRT_ColumnVirtualizer.ts : hooks/useMRT_ColumnVirtualizer.ts

- equivalent to MRT, no change (run 2026-10-17)

### [ ] hooks/useSRT_RowVirtualizer.ts : hooks/useMRT_RowVirtualizer.ts

- equivalent to MRT, no change (run 2026-10-17)

## Core display-columns (`hooks/display-columns/`)

### [ ] getSRT_RowActionsColumnDef.tsx : getMRT_RowActionsColumnDef.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] getSRT_RowDragColumnDef.tsx : getMRT_RowDragColumnDef.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] getSRT_RowExpandColumnDef.tsx : getMRT_RowExpandColumnDef.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] getSRT_RowNumbersColumnDef.tsx : getMRT_RowNumbersColumnDef.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] getSRT_RowPinningColumnDef.tsx : getMRT_RowPinningColumnDef.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] getSRT_RowSelectColumnDef.tsx : getMRT_RowSelectColumnDef.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] getSRT_RowSpacerColumnDef.tsx : getMRT_RowSpacerColumnDef.tsx

- equivalent to MRT, no change (run 2026-10-17)

### [ ] locales/ (38 files) : MRT locales

- equivalent to MRT, no change (run 2026-10-17)
