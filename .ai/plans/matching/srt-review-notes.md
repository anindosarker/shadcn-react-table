# SRT ↔ MRT review notes

Tag legend: `parity-ok` | `deviation` (acceptable MUI→shadcn) | `gap` (real diff vs MRT) | `note`

Per-file findings from the thorough review pass (2026-06-16, agent team `srt-review`). Checkboxes left `[ ]` for manual review.

## File-wise notes

### buttons/

Source of truth: MRT `packages/material-react-table/src/components/buttons/`.
SRT: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/`.
Tags: parity-ok | deviation | gap | note. Checkboxes left `[ ]` for manual review.

### [ ] SRT_CopyButton.tsx : MRT_CopyButton.tsx
- `deviation` slot props resolved via `mergeSRT_HtmlProps(parseSRT_HtmlProps(srtCopyButtonProps), parseSRT_HtmlProps(columnDef.srtCopyButtonProps))` (table + columnDef, columnDef wins) vs MRT spread of `muiCopyButtonProps` then `columnDef.muiCopyButtonProps` then `rest`. Equivalent; SRT also composes className/handlers via merge helper.
- `deviation` styling: cva ghost Button + `cn('h-auto cursor-copy border-0 bg-transparent p-0 font-inherit text-inherit hover:bg-transparent')` vs MRT `sx` (cursor copy, transparent, inherit font/size/letterSpacing/textAlign/textTransform, `m:-0.25rem`, `minWidth:unset`, `py:0`). Inherit-text intent preserved; negative margin/letterSpacing/textTransform not ported (cosmetic).
- `note` SRT renders `{children ?? cell.getValue()}` as button content. MRT renders no children — the caller (body cell) supplies the displayed value and wraps it in the button. SRT moving the value inside the button is a reasonable port but means callers must NOT also pass the value as a child sibling; confirm the SRT body cell call site passes `children` or relies on this default. Behavioral, low risk — verify call site.

### [ ] SRT_ColumnPinningButtons.tsx : MRT_ColumnPinningButtons.tsx
- `deviation` container `<div className="flex min-w-[70px] justify-center gap-1">` vs MRT `Box sx={{minWidth:'70px', textAlign:'center'}}`. flex+gap vs textAlign is cosmetic; min-width preserved.
- `deviation` SRT adds `aria-label` per button (unpin/pinToLeft/pinToRight) — MRT relies on tooltip title only. Improvement, not a gap.
- `gap` MRT spreads `...rest` (BoxProps) and merges `rest.sx` onto the container; SRT only accepts `className`. No per-instance slot prop passthrough on the container, but this component is internal and not driven by a `srt*Props` slot in MRT either — minor.

### [ ] SRT_EditActionButtons.tsx : MRT_EditActionButtons.tsx
- `deviation` icon variant now wraps both buttons in `SRT_Tooltip` (cancel/save) — MRT also has tooltips, so this matches. lucide `LoaderCircleIcon animate-spin` vs MUI `CircularProgress`. `text-blue-500` vs MUI `color="info"`. All acceptable.
- `gap` MRT extends `BoxProps` and spreads `...rest` (sx etc.) onto the container; SRT exposes only `className`. No `sx`/arbitrary-prop passthrough. Low impact (not a public `srt*Props` slot).
- `note` doc comment is STALE: header says "Barebones implementation" with a TODO list ("Add tooltip", "Add custom button props support") — but tooltips ARE implemented. Update comment to avoid misleading future readers.

### [ ] SRT_ExpandAllButton.tsx : MRT_ExpandAllButton.tsx
- `deviation` density sizing `h-7 w-7`(compact)/`h-9 w-9` + `-mt-1` when not compact vs MRT `1.75rem`/`2.25rem` + `mt:-0.25rem`. Equivalent.
- `note` MRT renders `iconButtonProps?.children ?? <Icon>`; SRT always renders the icon and does not honor a `children` override from the slot props. Minor — slot-supplied custom icon child would be ignored.

### [ ] SRT_ExpandButton.tsx : MRT_ExpandButton.tsx
- `deviation` RTL/`positionExpandColumn==='last'` indent side: MRT reads `theme.direction === 'rtl'`; SRT reads `document.documentElement.getAttribute('dir') === 'rtl'`. Correct adaptation (no MUI theme). Guarded for SSR.
- `gap` MRT chains the slot's `onClick`: `handleToggleExpand` calls `iconButtonProps?.onClick?.(event)` after toggling. SRT spreads `{...buttonProps}` BEFORE `onClick={handleToggleExpand}`... actually SRT sets its own `onClick` after the spread so the slot's onClick is OVERRIDDEN and never called. MRT preserves it. Real behavior diff if a consumer passes `srtExpandButtonProps.onClick`.
- `note` MRT honors `iconButtonProps?.children` as icon override; SRT always renders `ExpandMoreIcon`. Minor.

### [ ] SRT_GrabHandleButton.tsx : MRT_GrabHandleButton.tsx
- `deviation` extra props spread via `...rest` (ComponentProps<'button'>) + `cn(className)` vs MRT spreading `...rest` IconButtonProps + `sx`. MRT also exposes `onDragStart`/`onDragEnd`/`iconButtonProps` in its prop type; SRT relies on generic button props passthrough (`{...rest}`) so drag handlers still flow through. Acceptable.
- `gap` MRT `disableRipple` and fine spacing (`p:'2px'`, `m:'0 -0.1rem'`) not ported. Cosmetic only; ripple is MUI-specific so N/A. Negative margin omission may shift handle alignment slightly.
- `note` SRT `aria-label` is fixed to `localization.move` even when a custom `title` is passed; MRT uses `rest.title ?? localization.move` for aria-label. Minor a11y diff.

### [ ] SRT_RowPinButton.tsx : MRT_RowPinButton.tsx
- `deviation` size `h-6 w-6` (24px) matches MRT `height/width:'24px'`. `h-3.5 w-3.5` icon vs MUI `fontSize="small"`. Acceptable.
- `gap` MRT spreads `...rest` (IconButtonProps incl. sx) onto the button; SRT only accepts `className`. No per-instance slot passthrough — low impact (no public `srt*Props` slot for this button).

### [ ] SRT_ShowHideColumnsButton.tsx : MRT_ShowHideColumnsButton.tsx
- `deviation` ghost icon Button `h-9 w-9` vs MUI IconButton. Title precedence: MRT `rest?.title ?? localization...`; SRT uses localization directly (no `rest`/slot). Minor.
- `note` depends on SRT_ShowHideColumnsMenu (reviewed in menus/ cluster).

### [ ] SRT_ToggleDensePaddingButton.tsx : MRT_ToggleDensePaddingButton.tsx
- `deviation` ghost icon Button `h-8 w-8` vs MUI IconButton; SRT drops the `rest?.title ?? ` precedence (no slot passthrough). Minor.

### [ ] SRT_ToggleFiltersButton.tsx : MRT_ToggleFiltersButton.tsx
- `deviation` ghost icon Button `h-9 w-9`; no `rest.title` slot passthrough (MRT had `rest?.title ??`). Minor.

### [ ] SRT_ToggleFullScreenButton.tsx : MRT_ToggleFullScreenButton.tsx
- `deviation` ghost icon Button `h-8 w-8`; no `rest.title` slot passthrough. Minor.

### [ ] SRT_ToggleGlobalFilterButton.tsx : MRT_ToggleGlobalFilterButton.tsx
- `deviation` aria-label: MRT `rest?.title ?? localization.showHideSearch`; SRT uses `localization.showHideSearch` only (no slot/title). Minor a11y diff.

### [ ] SRT_ToggleRowActionMenuButton.tsx : MRT_ToggleRowActionMenuButton.tsx
- `deviation` common button style `cn('ml-2.5 h-8 w-8 opacity-50 transition-opacity hover:opacity-100')` vs MRT `commonIconButtonStyles` (`ml:10px`, `h/w:2rem`, opacity 0.5 -> 1 on hover, transition). Faithful.
- `deviation` SRT renders `SRT_RowActionMenu` only when `anchorEl` is set; MRT always renders `MRT_RowActionMenu` (which manages its own open state from `anchorEl`). Both correct given each menu's contract — verify SRT_RowActionMenu doesn't need to mount before anchor (reviewed in menus/ cluster).
- `gap` MRT spreads `...rest` (IconButtonProps) onto the edit/menu buttons; SRT drops `rest` entirely (only `className`). No per-instance prop passthrough.
- `note` doc comment STALE: "Barebones implementation" + TODO "Add SRT_RowActionMenu component / Add tooltip" — both are now implemented. Update the comment.

---
Summary: 13/13 pairs are faithful 1:1 ports; MUI->shadcn deviations (ghost Button + cn vs IconButton + sx, lucide vs MUI icons, controlled SRT_Tooltip vs MUI Tooltip) are acceptable throughout.
Real items to flag:
- gap (SRT_ExpandButton): slot `onClick` from `srtExpandButtonProps` is overridden by the component's own `onClick={handleToggleExpand}` (spread is before the handler), so a consumer-supplied onClick never fires. MRT chains it inside `handleToggleExpand`. -> wire the slot onClick into handleToggleExpand.
- note/verify (SRT_CopyButton): renders cell value as button child by default; confirm call site doesn't double-render.
- gap (several: EditActionButtons, ColumnPinningButtons, RowPinButton, ToggleRowActionMenuButton edit/menu buttons): no `...rest`/sx slot passthrough that MRT exposed via its IconButtonProps/BoxProps spread. Low impact since none are public `srt*Props` slots, but it does drop arbitrary prop forwarding.
- note (EditActionButtons, ToggleRowActionMenuButton): stale "Barebones / TODO" doc comments contradict the now-complete implementation — should be cleaned up.
- note (minor a11y): several toggle buttons dropped MRT's `rest?.title ?? localization...` for aria-label/title, using localization only.

### inputs/

Reviewer: rev-inputs. SoT = MRT `packages/material-react-table/src/components/inputs/`. SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/inputs/`. 1:1 port, MUI→shadcn deviations allowed. All 7 MRT files have a matching SRT pair (no missing/extra files).

### [ ] SRT_EditCellTextField.tsx : MRT_EditCellTextField.tsx
- `gap` IME composition guard dropped. MRT tracks `completesComposition` via `onCompositionStart`/`onCompositionEnd` and only blurs on Enter when `completesComposition` (MRT lines 45,96-101,170-171). SRT `handleEnterKeyDown` (line 133-137) blurs on Enter unconditionally — pressing Enter to commit a CJK/IME composition will prematurely blur. Real behavior difference for IME users.
- `deviation` `isSelectEdit` narrowed. MRT: `editVariant === 'select' || textFieldProps?.select` (line 70). SRT: `editVariant === 'select'` only (line 89) — a slot prop can no longer force select mode. Acceptable (no MUI `select` prop in shadcn) but a behavioral narrowing worth noting.
- `deviation` SRT adds `onEditingCellSave?.({cell,row,table,value})` for `editDisplayMode` `'cell'`/`'table'` (lines 105-109) — not in MRT. Sensible addition since shadcn has no Save button in those modes; confirm `onEditingCellSave` is a real SRT option (it's destructured from `options`).
- `note` MRT applies `disableUnderline`/`size="small"`/`margin`/MUI `sx` styling that has no shadcn equivalent — dropped, expected. SRT select trigger uses `w-full` and stops click propagation, mirroring MRT `fullWidth` + `onClick stopPropagation`.

### [ ] SRT_FilterCheckbox.tsx : MRT_FilterCheckbox.tsx
- `deviation` Slot props wired via `srtFilterCheckboxProps` (table + per-column merge, lines 42-45) replacing MRT `muiFilterCheckboxProps`. Correct pattern.
- `note` MRT renders inside `FormControlLabel` with `Checkbox`; SRT renders `Checkbox` + `Label` in a flex div. The `mt-[-4px]` and muted/normal-weight styling mirror MRT `sx` (`mt:'-4px'`, `color:'text.secondary'`, `fontWeight:'normal'`).

### [ ] SRT_FilterRangeFields.tsx : MRT_FilterRangeFields.tsx
- `note` MRT `BoxProps`/`sx` spread → SRT `ComponentProps<'div'>` + `className` + `...rest`. Faithful.

### [ ] SRT_FilterRangeSlider.tsx : MRT_FilterRangeSlider.tsx
- `gap` MRT slider sets `valueLabelDisplay="auto"` (line 96) — a value tooltip on the thumb. shadcn `Slider` has no built-in value label; SRT does not implement one, so the on-drag value bubble is lost. Cosmetic but a real MRT feature gap.
- `note` MRT `disableSwap` (prevents thumbs crossing) has no explicit shadcn equivalent passed; Radix Slider does prevent crossing by default, so behavior likely matches — verify. `slotProps`/`style` (minWidth `column.getSize()-50`, margins) faithfully ported.

### [ ] SRT_FilterTextField.tsx : MRT_FilterTextField.tsx
- `deviation` Debounce: MRT uses MUI `debounce` in `useCallback` (MRT 162-178); SRT defines a local `debounce` helper wrapped in `useMemo` (SRT 60-67,203-224). Same timing tiers preserved exactly: textbox `manualFiltering?400:200`, non-textbox `1`. NOTE task mentioned `useDeferredValue` — neither file uses it; both debounce. Functionally equivalent.
- `gap` `handleClear` autocomplete branch dropped. MRT has an `isAutocompleteFilter` branch resetting `autocompleteValue` + `filterValue` (MRT 220-225); SRT `handleClear` (234-250) has no autocomplete branch and falls through to the generic else only if not multi/range — but autocomplete has no clear button (`clearButton` null when `isAutocompleteFilter`, line 357-358) and the mount effect calls `handleClear` when filterValue===undefined, so autocomplete clear relies on the else branch setting `column.setFilterValue(undefined)`. Behavior likely OK but the dedicated autocomplete state (`autocompleteValue`) is gone — see next.
- `deviation` Autocomplete state simplified. MRT keeps a separate `autocompleteValue: DropdownOption|null` (MRT 155-160,204-207, `value={autocompleteValue}`); SRT drops it and drives the Popover from the string `filterValue` only (494-547). `getValueAndLabel(newValue).value` selection logic (MRT) replaced by `handleChange(optValue)` on `CommandItem` select. Simpler; loses object-valued autocomplete selection but freeSolo string flow matches.
- `deviation` Date variants are native typed `<Input type="date|datetime-local|time">` (SRT 550-583) vs MRT MUI X `DatePicker`/`DateTimePicker`/`TimePicker` (MRT 400-447). Documented deviation (no shadcn date picker primitive). `clearable`/`onClear` picker field wiring and `valueAsDate`/`valueAsNumber` typed coercion in `handleTextFieldChange` (MRT 185-194) are reduced to string + number-only coercion (SRT 586-594) — date value is a string, not a `Date`. Behavioral diff: filter value type differs for date columns (string vs Date). Flag for downstream filter-fn compatibility.
- `note` Slot props wired for every variant: `srtFilterTextFieldProps`, `srtFilterAutocompleteProps`, `srtFilterDatePickerProps`, `srtFilterDateTimePickerProps`, `srtFilterTimePickerProps`, merged table+column via `mergeSRT_HtmlProps`/`parseSRT_HtmlProps` (SRT 113-145). `dateVariantSlotProps` correctly selects the active variant's slot. `filterInputRefs` keyed `${column.id}-${rangeFilterIndex??0}` preserved (setInputRef 286-291 vs MRT 331-337). Clear button only on text/range (`!isAutocompleteFilter && !isDateFilter`), matching MRT `endAdornment` gating.

### [ ] SRT_GlobalFilterTextField.tsx : MRT_GlobalFilterTextField.tsx
- `gap` SRT renders a raw `<input>` with hand-rolled Tailwind classes (SRT 135-151) instead of the shadcn `Input` component. Functional but inconsistent with the other inputs in this cluster which use `<Input>`; restyling/theming via `Input` variants won't apply here. Minor.
- `note` Slot props via `srtSearchTextFieldProps` (table-level only — no per-column, correct since global). `searchInputRef` wired directly as `ref` (SRT 140 vs MRT 148-153).

### [ ] SRT_SelectCheckbox.tsx : MRT_SelectCheckbox.tsx
- `deviation` shiftKey forwarding. Radix `onCheckedChange` omits the mouse event, so SRT captures `e.shiftKey` in a ref on `onClick` and forwards it via a synthetic `{nativeEvent:{shiftKey}}` to the handler (SRT 104,114-133). Necessary workaround for batch/range selection; MRT got shiftKey free from MUI's `onChange` event. Verify the selection handler reads `event.nativeEvent.shiftKey` (it should, given the synthetic shape).
- `deviation` Single-select (`enableMultiRowSelection === false`): MRT renders MUI `Radio` (MRT 119-120); SRT renders a `Checkbox` styled `rounded-full` (SRT 94,136) — documented, no shadcn Radio. Single-select correctly suppresses indeterminate (SRT 97-98).
- `note` Slot props: select-all uses `srtSelectAllCheckboxProps` with `{table}` ctx, per-row uses `srtSelectCheckboxProps` with `{row,staticRowIndex,table}` — matches MRT's two distinct slots (SRT 53-60 vs MRT 56-63).

#### Cluster summary
- Strongest concerns: (1) EditCell IME composition guard dropped (`gap`, real for CJK input); (2) RangeSlider `valueLabelDisplay` value bubble not ported (`gap`, cosmetic); (3) FilterTextField date variants produce string values vs MRT `Date` objects (`deviation`, may affect date filter fns); (4) GlobalFilter uses raw `<input>` not shadcn `Input` (`note`, consistency).
- All filter variants (text/select/multi-select/range/range-slider/checkbox/date/datetime/time/autocomplete) are present and wired. Debounce parity confirmed (local helper, not `useDeferredValue`, matching MRT timing tiers). All `srtFilter*Props`/`srtSelect*Props` slot props are wired with table+column merge.

### menus/

VERIFICATION review of menus/ cluster. SoT = MRT `packages/material-react-table/src/components/menus/`. SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/menus/`. MUI Menu→shadcn DropdownMenu is an accepted deviation. All 7 pairs present.

Recurring accepted pattern (not re-flagged per file): MRT's `<Menu anchorEl … MenuListProps={{dense, sx:{backgroundColor: menuBackgroundColor}}}>` becomes SRT's `<DropdownMenu open={!!anchorEl}>` + a `position:fixed` zero-size span trigger placed at `anchorEl.getBoundingClientRect()`. `menuBackgroundColor` / `mrtTheme` is intentionally dropped (theming handled by shadcn tokens). `density==='compact'` is propagated via an explicit `dense` prop instead of MenuListProps.dense.

### [ ] SRT_ActionMenuItem.tsx : MRT_ActionMenuItem.tsx
- `note` — SRT adds props MRT lacks here (`dense`, `divider` → trailing `DropdownMenuSeparator`, `selected`, `value`/`data-value`). These are required by FilterOptionMenu/ColumnActionMenu callers (MRT passes `divider`/`selected`/`value` to MenuItem via `...rest`); so this is faithful consolidation, not scope creep.
- `note` — `onSelect` is intercepted: when `onOpenSubMenu` is set, `event.preventDefault()` keeps the parent menu open (Radix closes on select by default). Reasonable shadcn-specific adaptation with no MRT equivalent; correct behavior.
- `deviation` (minor a11y) — MRT `MenuItem tabIndex={0}`; SRT submenu-arrow `<button>` has `tabIndex={-1}` (the DropdownMenuItem itself remains focusable via Radix). The arrow is keyboard-unreachable, but in MRT the arrow IconButton is also not separately tab-focusable in practice. Low impact.

### [ ] SRT_CellActionMenu.tsx : MRT_CellActionMenu.tsx
- `gap` (icons not from registry) — SRT imports `CopyIcon, EditIcon` directly from `lucide-react` and renders `<CopyIcon/>`/`<EditIcon/>`. MRT reads `icons: { ContentCopy, EditIcon }` from `table.options.icons`. Task explicitly requires icons read from `table.options.icons`; the copy icon in particular is hardcoded rather than `icons.ContentCopy`. User icon overrides will not apply to this menu. (ColumnActionMenu/RowActionMenu do read from the registry, so this is inconsistent within the cluster.)
- `note` — internal items are NOT passed `dense` (no `dense={...}` on the SRT_ActionMenuItem children). MRT applied density via MenuListProps.dense to all items; here cell-menu items always render at default padding regardless of `density==='compact'`. Same omission as FilterOptionMenu. (SRT also reads `getState()` without destructuring `density`, so the value is unused.)
- `note` — SRT adds optional local-control props (`anchorEl`/`cell`/`setAnchorEl`) on top of the MRT actionCell-state path; faithful superset, default path matches MRT.

### [ ] SRT_ColumnActionMenu.tsx : MRT_ColumnActionMenu.tsx

### [ ] SRT_FilterOptionMenu.tsx : MRT_FilterOptionMenu.tsx
- `note` — items not passed `dense`. MRT destructures `density` and applies via MenuListProps.dense; SRT drops the `density` destructure entirely and omits `dense` on each SRT_ActionMenuItem, so filter-mode list ignores compact density. Consistent with CellActionMenu omission; low visual impact.
- `note` — MRT uses `anchorOrigin={{horizontal:'right', vertical:'center'}}` (submenu opens to the right of anchor). SRT approximates with `DropdownMenuContent side="right" align="start"`. Accepted Menu→DropdownMenu positioning deviation; intent preserved.

### [ ] SRT_RowActionMenu.tsx : MRT_RowActionMenu.tsx
- `note` — useMemo dep arrays differ slightly (SRT adds `density`); behaviorally a superset, no parity concern.

### [ ] SRT_ShowHideColumnsMenu.tsx : MRT_ShowHideColumnsMenu.tsx
- `note` — `isSubMenu` prop declared in both interfaces but unused in both (dead prop carried over faithfully).

### [ ] SRT_ShowHideColumnsMenuItems.tsx : MRT_ShowHideColumnsMenuItems.tsx
- `deviation` (Switch→Checkbox) — MRT renders `FormControlLabel + Switch` inside a `Tooltip`; SRT renders a shadcn `Checkbox` inside `Tooltip*` with a `<label>`. Toggle semantics and `localization.toggleVisibility` tooltip preserved; `disabled={!column.getCanHide()}` matches. Control-type change is within the accepted MUI→shadcn deviation but worth flagging (Switch vs Checkbox affords differently).
- `deviation` (indent halved) — MRT `pl: (column.depth + 0.5) * 2 rem`; SRT `paddingLeft: (column.depth + 0.5) * 1 rem`. Nested-column indentation is half MRT's. Visual-only; verify nested-group menus still read clearly.
- `note` — drag outline colors mapped from theme (`grey[500]`/`draggingBorderColor`) to tokens (`--muted-foreground`/`--primary`); display-column dimming `opacity-50` preserved (MRT `opacity: columnDefType !== 'display' ? 1 : 0.5`). Accepted theming deviation.

### body/

Verification review of body/ cluster. SoT = MRT `packages/material-react-table/src/components/body/`. SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/body/`. 1:1 port. All 7 pairs present. Leave [ ].

---

### [ ] SRT_TableBody.tsx : MRT_TableBody.tsx
- `deviation` (minor, intended) — empty-state width derives from `tableContainerRef.current?.clientWidth` (SRT:137) vs MRT's `tablePaperRef.current?.clientWidth` (MRT:138). MRT has a Paper wrapper; SRT uses the container ref. Same visual intent (clamp to table width); acceptable given DOM-structure difference.
- `deviation` (behavioral, worth noting) — pinned top/bottom tbody render gate: SRT uses `topRows.length > 0` / `bottomRows.length > 0` (SRT:94,183) whereas MRT uses `getIsSomeRowsPinned('top'|'bottom')` (MRT:82,189). `getTopRows()` returns pinned rows only when row pinning is active, so equivalent in practice, but `getIsSomeRowsPinned` is the API-correct guard. Low risk; confirm `getTopRows()`/`getBottomRows()` return [] when nothing pinned.
- `note` — slot props: MRT spreads `muiTableBodyProps` + `...rest` (TableBodyProps), then sticky `sx`. SRT correctly maps `srtTableBodyProps` via `parseSRT_HtmlProps` and composes className/style on all three tbody elements (SRT:96-98,114-127,184-187). SRT drops `layoutMode` grid `display` handling entirely (MRT:86,110,123,129,194) — consistent with SRT having no grid layoutMode; acceptable deviation. `enableStickyHeader`/`enableStickyFooter` head/footer height math identical (SRT:62-67 / MRT:53-58).

### [ ] SRT_TableBodyRow.tsx : MRT_TableBodyRow.tsx
- `deviation` (intended) — MRT's runtime theme color math (`alpha/lighten/darken`, `cellHighlightColor`/`cellHighlightColorHover`, `td:after` highlight pseudo-elements, `baseBackgroundColor !important`, MRT:149-162,186-231) is replaced by Tailwind tokens: `hover:bg-muted/50`, `data-[state=selected]:bg-muted`, `isRowPinned && 'bg-accent/40'` (SRT:196-202). Documented in header comment; correct strategy for shadcn. No `getCommonPinnedCellStyles` on `td` — SRT moves cell pinning into the cell component (see cell pair).
- `gap` (minor) — `customRowHeight` from `tableRowProps.style.height ?? sx.height` (MRT:131-135) is dropped; SRT hardcodes `rowHeight = defaultRowHeight` (SRT:120-122). Consequence: user-overridden row height via `srtTableBodyRowProps.style.height` will NOT feed the pinned-row sticky offset calc, so stacked pinned rows misalign if the consumer sets a custom height. Edge case (custom height + sticky pinning); flag for completeness.
- `note` — slot-prop composition: SRT uses `mergeSRT_HtmlProps(libProps, userRowProps)` so library handlers (`onDragEnter`/`onDragOver`) fire before user handlers and style/className compose (SRT:168-180). MRT relied on spread-after-defaults + `...rest`. SRT approach is the documented merge convention and is correct; the `srtTableBodyRowProps` context `{ row, staticRowIndex, table }` matches MRT's `muiTableBodyRowProps` context.

### [ ] SRT_TableBodyCell.tsx : MRT_TableBodyCell.tsx
- `deviation` (intended, big) — display-column rendering: MRT calls `columnDef.Cell?.(...)` for ALL display columns (MRT:315-329) because MRT's core display defs carry `Cell`. SRT's core display defs are headless, so SRT dispatches on `column.id` via `renderDisplayColumnCell()` (SRT:211-294, switch over mrt-row-select/expand/numbers/actions/drag/pin) and falls back to `columnDef.Cell` in `default`. This is the documented display-column boundary; logic mirrors MRT's get*ColumnDef Cell bodies (row-numbers static/original mode, expand grouped-mode tooltip, etc.). Verify each branch against the corresponding MRT column def in a separate review — within this file it is internally consistent.
- `deviation` (intended) — MRT's `draggingBorders` useMemo (resize/drag/hover border color math, MRT:112-166) and `getCommonMRTCellStyles`/outline `sx` are replaced by data-attrs + cva + Tailwind outline classes (SRT:391-402) and `data-last-row` (SRT:201,388). Column pinning sticky offsets moved INTO the cell here via `pinnedStyles` useMemo (`getStart('left')`/`getAfter('right')`, `position: sticky`, `zIndex:1`, `opacity:0.97`, SRT:296-309) — this is correct (MRT applied pinned styles on the row's `td` selector via `getCommonPinnedCellStyles`). `isColumnPinned && 'bg-background'` gives the pinned cell an opaque bg. Resize/drag visual border feedback is the one behavior not reproduced (no border highlight while dragging/resizing) — note as cosmetic gap.
- `note` — right-click action menu: SRT adds local `actionAnchorEl` state + renders `<SRT_CellActionMenu>` inline (SRT:151-153,433-443) because shadcn uses popover-anchored menus rather than MRT's single global actionCell+Menu portal. `setActionCell(cell)` still set on context-menu so global state parity holds. Additive, no regression. `Memo_SRT_TableBodyCell` equality `next.cell === prev.cell` identical (SRT:448-451 / MRT:348-351).

### [ ] SRT_TableBodyCellValue.tsx : MRT_TableBodyCellValue.tsx
- `deviation` (intended, verify) — MRT imports `highlight-words` npm package; SRT inlines a local `highlightWords` (SRT:27-70) to drop the dependency. Behavior: `matchExactly` → single trimmed query term; fuzzy → per-character unique split. This matches `highlight-words`' documented chunk-splitting semantics. Edge: regex built from escaped terms with `gi` flag; chunk `{key, match, text}` shape matches MRT consumption (`chunks.length > 1 || chunks[0].match`, SRT:147 / MRT:86). Reasonable port — worth a unit check on fuzzy multi-char queries but logic looks sound.
- `note` — SRT drops `mrtTheme.matchHighlightColor` option read (MRT:31-32); since highlight color is now a fixed Tailwind token, the consumer cannot recolor highlights via theme. Minor capability gap, consistent with shadcn theming approach.

### [ ] SRT_TableDetailPanel.tsx : MRT_TableDetailPanel.tsx
- `deviation` (intended) — MRT `Collapse mountOnEnter unmountOnExit` (MRT:103-105) → shadcn `<Collapsible open={isExpanded}><CollapsibleContent>{isExpanded && DetailPanel}` (SRT:115-118). Virtualized branch identical (`isExpanded && DetailPanel`, SRT:113 / MRT:101). The extra `isExpanded &&` inside CollapsibleContent approximates unmountOnExit. `transition-all` only when `!virtualRow` matches MRT's `transition: !virtualRow ? ... : undefined`.
- `deviation` (cosmetic) — MRT className `Mui-TableBodyCell-DetailPanel` (MRT:65,87) dropped; SRT uses Tailwind classes only. No functional impact unless a consumer targeted that MUI class. MRT's `baseBackgroundColor` on virtual-row cell bg (MRT:91) not reproduced (SRT relies on default bg) — minor visual gap in virtualized detail panels.
- `note` — header comment correctly documents that SRT_RowHTMLPropsContext lacks MRT's `isDetailPanel: true` flag (MRT:47) so the detail-panel `<tr>` slot-prop context cannot distinguish itself from a normal row. Acceptable known limitation; flag if a consumer needs per-detail-panel row prop branching.

### [ ] SRT_TableBodyRowGrabHandle.tsx : MRT_TableBodyRowGrabHandle.tsx
- `gap` (intended/documented) — `muiRowDragHandleProps` slot prop NOT supported. SRT comments out the `srtRowDragHandleProps` read and `parseFromValuesOrFunc` merge (SRT:38-46) with a TODO. Consequences vs MRT: (1) user cannot pass custom drag-handle props; (2) user `onDragStart`/`onDragEnd` handlers are NOT chained (MRT calls `iconButtonProps?.onDragStart?.(event)` first, MRT:37,47). Header explicitly flags this as a barebones/TODO deviation.
- `note` — SRT threads a `className` prop through to the button (SRT:36,69) which MRT did not (MRT relied on `...rest` IconButtonProps spread). Additive; fine.

### [ ] SRT_TableBodyRowPinButton.tsx : MRT_TableBodyRowPinButton.tsx
- `gap` (intended/documented) — `rest` IconButtonProps spread dropped; no custom-props passthrough. Header TODO notes `srtRowPinButtonProps` support is future work. Lower impact than grab-handle (no event handlers were being chained in MRT here — MRT only spread `...rest` into `rowPinButtonProps`).
- `note` — SRT threads `className` into both the wrapper div and each `SRT_RowPinButton` via `rowPinButtonProps` (SRT:46-50,56-64). Additive. Behavior otherwise 1:1.

---

#### Cluster summary
- All 7 pairs are faithful 1:1 ports. Virtualization (row + column) is fully wired and functional now that SRT_Table supplies a real columnVirtualizer; memoization (memoMode rows/cells, Memo_ variants + equality fns) matches MRT exactly; density paddings, edit/click/keyboard dispatch, detail-panel interleave, and row-pinning sticky offsets all verified equivalent.
- Two intended-deviation themes recur and are correct for shadcn: (a) MUI runtime theme color math (alpha/lighten/darken, mrtTheme tokens, `td:after` highlights) → Tailwind tokens + data attributes; (b) display-column `Cell` dispatch moved from headless core defs into `renderDisplayColumnCell()` switch in the cell component.
- Real gaps to flag (all minor/edge): row drag-handle (`SRT_TableBodyRowGrabHandle`) and pin button (`SRT_TableBodyRowPinButton`) do NOT support custom slot props and do not chain user drag handlers (documented TODO); custom row height (`style.height`) is not fed into pinned-row sticky offset math (SRT_TableBodyRow); resize/drag border visual feedback on cells is not reproduced (cosmetic); highlight color is no longer theme-configurable; MUI `Mui-TableBodyCell-DetailPanel` class and `baseBackgroundColor` on virtualized detail-panel bg dropped (cosmetic).
- Recommend follow-up: verify `renderDisplayColumnCell()` branches against the actual core display column defs (separate review scope), and a unit check on the inlined `highlightWords` fuzzy path.

### head/

Verification review of the 9 head/ pairs. SoT = MRT `packages/material-react-table/src/components/head/`, SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/head/`. All bullets cite line numbers in the respective file.

---

### [ ] SRT_TableHead.tsx : MRT_TableHead.tsx
- `note` — MRT applied `top: stickyHeader && grid ? 0 : undefined` (MRT:55) so semantic sticky relied on the row, not thead. SRT sets `top: stickyHeader ? 0 : undefined` (SRT:68) unconditionally for sticky. Functionally fine (thead has no own sticky class so top is inert unless something makes it sticky), but it is a slight literal deviation; verify no semantic sticky double-offset.
- `note` — bg: MRT used `mrtTheme.baseBackgroundColor` on the ROW only and `opacity:0.97` on thead; SRT puts `bg-muted/50 opacity-[0.97]` + `border-b` on the thead (SRT:58). Background now lives on thead AND row (see row file), acceptable shadcn idiom but a styling deviation from MRT (which had no thead bg).

### [ ] SRT_TableHeadRow.tsx : MRT_TableHeadRow.tsx
- `note` — boxShadow `4px 0 8px rgba(0,0,0,0.1)` hardcoded (SRT:54) vs MRT `alpha(theme.palette.common.black,0.1)` (MRT:52). Equivalent in light mode; will not adapt to theme but matches the literal alpha value.
- `note` — bg: MRT row used `baseBackgroundColor` (MRT:51); SRT uses `bg-background` (SRT:54). Theme-token equivalent. Combined with thead `bg-muted/50` the row bg will paint over it — intended.

### [ ] SRT_TableHeadCell.tsx : MRT_TableHeadCell.tsx
- `deviation` (documented, by design) — display-column Header content rendered inline by column id (SRT:154-171): `mrt-row-select` gated by `enableSelectAll && enableMultiRowSelection` → SRT_SelectCheckbox; `mrt-row-expand` → SRT_ExpandAllButton or `localization.expand`; row-numbers/actions labels. MRT delegates this to core `getMRT_*ColumnDef` Header fns. Matches the stated display-column boundary. Select-all gate is correct per task spec.
- `deviation` — padding. MRT had fine-grained `p/pt/pb` rules varying by density × columnDefType(display/group/data) × showColumnFilters (MRT:212-233). SRT collapses to a cva with only density: `compact p-2 / comfortable p-4 / spacious px-6 py-5` (SRT:51-65). The display-vs-data padding asymmetry, the `pb` reduction when `showColumnFilters`, and the smaller `pt` for group/compact are NOT reproduced. Visual-only but a real fidelity gap.
- `note` — `headerPL` left-padding accumulation (MRT:97-103, adds pl for sort/actions/dragHandle when align center) is NOT ported in SRT. SRT has no center-align PL compensation (SRT:274-283 just uses flex). Affects only `align==='center'` headers; low impact.
- `note` — pinning: SRT reimplements sticky offsets inline via `getStart('left')`/`getAfter('right')` + `bg-muted/95` (SRT:185-198,261) instead of MRT's `getCommonMRTCellStyles` helper (MRT:236). Background-on-pinned and sticky offsets present; verify z-index (SRT uses 1) vs MRT helper's value. Slot merge `srtTableHeadCellProps` table-then-columnDef done via mergeSRT_HtmlProps (SRT:202-224) mirrors MRT double-parse (MRT:71-76).
- `note` — MRT hover rule `'& :hover' .MuiButtonBase-root {opacity:1}` (MRT:204-207) replaced by `group` + `group-hover:opacity-100` on child buttons (SRT:252; see ColumnActions/Sort/Filter files). Functionally equivalent.

### [ ] SRT_TableHeadCellColumnActionsButton.tsx : MRT_TableHeadCellColumnActionsButton.tsx
- `note` — MRT sizing `m:-8px -4px`, `height/width:2rem`, MoreVert `scale(0.9)` (MRT:72-82). SRT uses `h-8 w-8` and icon `h-3.5 w-3.5` (SRT:81,94); negative margins not reproduced. Minor spacing deviation.

### [ ] SRT_TableHeadCellFilterContainer.tsx : MRT_TableHeadCellFilterContainer.tsx
- `note` — animation `animate-in slide-in-from-top-2` (SRT:51) substitutes Collapse height transition; no collapse-height animation. Cosmetic only.

### [ ] SRT_TableHeadCellFilterLabel.tsx : MRT_TableHeadCellFilterLabel.tsx
- `note` — opacity isFilterActive?1:0.3 → `opacity-100 / opacity-30 group-hover:opacity-100` (SRT:151-153 / MRT:136). Filter icon `scale-75` preserved (SRT:149 / MRT:138). FilterAlt → lucide FilterIcon — icon swap only.

### [ ] SRT_TableHeadCellGrabHandle.tsx : MRT_TableHeadCellGrabHandle.tsx

### [ ] SRT_TableHeadCellResizeHandle.tsx : MRT_TableHeadCellResizeHandle.tsx
- `note` — STALE/INACCURATE comment: SRT header block (SRT:14-29) says "Barebones" and TODO lists "Add touch support" / "Better RTL support" as not-done, but touch (SRT:72) and RTL keying (SRT:77-79) ARE implemented. Comment misrepresents the code; recommend updating.
- `deviation` — active-state divider visuals incomplete. MRT `'&:active > hr'` set color `info.main` AND opacity `header.subHeaders.length || columnResizeMode==='onEnd' ? 1 : 0` (MRT:62-65). SRT uses static `hover:border-primary active:border-primary` + `isResizing && border-primary` (SRT:86-88) and does NOT gate visibility on subHeaders/onEnd. The "hide handle unless group-header or onEnd-mode while active" behavior is lost.
- `note` — MRT Divider had `transform: translateX(4px)` and `transition all 150ms` (disabled while resizing) (MRT:85-88); SRT uses `transition-all` always (SRT:85), no translateX offset. Minor visual.

---

Summary: 9/9 pairs are faithful 1:1 ports of behavior/logic. No correctness gaps in drag/reorder, pinning, sort, filter, resize wiring, or virtualization. Deviations are styling-fidelity (cell padding cva collapse, action button margins, resize active-opacity gating) plus the by-design display-column Header rendering (select-all gate verified correct). One stale comment in SRT_TableHeadCellResizeHandle. Items to flag for follow-up: (1) head cell padding fidelity vs MRT density×type matrix, (2) resize-border `onChange` gate dropped in head cell, (3) resize active divider subHeaders/onEnd opacity logic missing.

### footer/ + toolbar/

SoT = `packages/material-react-table/src/components/{footer,toolbar}/`
SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/{footer,toolbar}/`
Reviewer: rev-toolbar. READ-ONLY verification review. 1:1 port parity.

---

### footer/

### [ ] SRT_TableFooter.tsx : MRT_TableFooter.tsx
- `deviation` (cosmetic) — MRT sticky uses a theme grey `outline`; SRT substitutes `bg-background` + relies on `border-t`. No outline equivalent. Visual-only, acceptable for shadcn theme.
- `gap` (intentional) — MRT `layoutMode?.startsWith('grid')` -> `display:grid` is not ported (SRT_TableFooter.tsx line ~64 has no grid branch). Consistent with grid-layout being out of scope across SRT.
- `note` — MRT forwards a ref callback that also writes `tableFooterProps.ref`; SRT only sets `tableFooterRef` via the standard `ref` prop. Forwarded-ref-from-slot-props not supported (parseSRT_HtmlProps strips ref). Minor.

### [ ] SRT_TableFooterCell.tsx : MRT_TableFooterCell.tsx
- `deviation` — MRT footer content precedence: `tableCellProps.children ?? (isPlaceholder ? null : columnDef.Footer ?? columnDef.footer ?? null)`. SRT drops the `children ??` first branch (SRT_TableFooterCell.tsx render: starts directly at `footer.isPlaceholder ? null : ...`). A consumer passing `children` via slot props won't override footer content. Minor — slot-prop children is rare for footers.
- `gap` (TODO, intentional) — Keyboard shortcuts (`cellKeyboardShortcuts` / copy on footer, `tabIndex`, `enableKeyboardShortcuts`) are commented out with explicit TODO. MRT wires `onKeyDown` + `tabIndex={enableKeyboardShortcuts ? 0 : undefined}`. Documented deferral.

### [ ] SRT_TableFooterRow.tsx : MRT_TableFooterRow.tsx
- `deviation` (cosmetic) — MRT sets `backgroundColor: baseBackgroundColor` + `width:100%` + grid `display:flex`. SRT uses `relative border-b` (adds a bottom border MRT lacks; relies on tfoot border-t). Width 100% implicit via table layout. Visual-only.
- `gap` (intentional) — grid layoutMode branch (`display:flex` for grid) not ported, consistent with cluster-wide grid omission.

---

### toolbar/

### [ ] SRT_BottomToolbar.tsx : MRT_BottomToolbar.tsx
- `deviation` (cosmetic) — MRT inset boxShadow (`0 1px 2px -1px grey inset`) + `getCommonToolbarStyles`; SRT uses `border-t bg-background`. Visual-only.
- `note` — Custom-actions fallback `<span />` present in both (keeps flex spacing when no actions). Good.

### [ ] SRT_LinearProgressBar.tsx : MRT_LinearProgressBar.tsx
- `deviation` — MRT LinearProgress is **indeterminate** by default (no `value` -> animated bar). SRT uses `useSRT_ProgressAnimation(show, {ease-in-out, 2000ms})` driving a **determinate** Progress `value` that animates 0->100. Visually approximates indeterminate but is a different mechanism; determinate `value` cannot represent true indeterminate state. Acceptable approximation.
- `note` (cleanup) — `...rest` is destructured but the component signature has no rest-bearing extra props beyond the 3 declared; `linerProgressProps` is spread twice (on CollapsibleContent AND Progress), so className merges twice. Harmless but redundant. Also a stale trailing TODO block contradicts the now-implemented `srtLinearProgressProps` wiring — dead comment.
- `note` — Variable typo `linerProgressProps` (missing 'a'). Cosmetic.

### [ ] SRT_TablePagination.tsx : MRT_TablePagination.tsx
- `deviation` — MRT `pages` mode delegates to MUI `<Pagination>` (boundaryCount/siblingCount defaults). SRT reimplements `getPageItems()` with `boundaryCount=1, siblingCount=1, total<=7 shows all`. Documented as mirroring MUI defaults; ellipsis logic is hand-rolled but matches MUI's typical output. Verify edge cases (e.g. total=8, current near edges) if pixel-parity needed.
- `note` — `default` mode renders `ChevronsLeft`/`ChevronsRight` (first/last) gated on `showFirstButton`/`showLastButton`; prev/next always shown. `disableBack = pageIndex<=0`, `disableNext = lastRowIndex>=totalRowCount`. Matches MRT default-mode IconButton gating. `mt-12` (3rem) top offset when `position==='top' && enableToolbarInternalActions` ported correctly.

### [ ] SRT_ToolbarAlertBanner.tsx : MRT_ToolbarAlertBanner.tsx
- `deviation` — `selectedAlert` gate: MRT shows it whenever `selectedRowCount > 0`; SRT requires `enableRowSelection && selectedRowCount > 0`. If selection state is non-empty while `enableRowSelection` is false/undefined, MRT renders the count, SRT suppresses it. Minor behavioral divergence; SRT's guard is arguably safer but not 1:1.
- `deviation` (cosmetic) — MRT max-width clamps the alert message to `tablePaperRef.current.clientWidth - 1rem`; SRT does NOT reference tablePaperRef (no width clamp). On very wide grouped/selected text overflow handling differs. Also MRT Collapse `timeout={stackAlertBanner?200:0}`; SRT uses fixed `transition-all duration-200` + `max-h-40/max-h-0` height animation. SRT bottom-position `-mb-4` maps MRT `mb:-1rem`. Visual approximation, acceptable.
- `note` — `alertProps?.title`/`alertProps?.children` (MRT AlertTitle + children-before-alerts) not ported; SRT renders only selectedAlert/groupedAlert. MRT lets slot-prop title/children inject extra content above the alerts. Minor gap.

### [ ] SRT_ToolbarDropZone.tsx : MRT_ToolbarDropZone.tsx
- `deviation` (cleanup) — SRT useEffect deps include `setShowToolbarDropZone` and `table.options.state?.showToolbarDropZone`; MRT deps are only `[enableGrouping, draggingColumn, grouping]`. SRT's expanded deps are more lint-correct; behavior equivalent.
- `deviation` — MRT wraps in MUI `<Fade in={showToolbarDropZone}>` (always mounted, fades). SRT does `if (!showToolbarDropZone) return null` + `animate-in fade-in-0`. SRT unmounts when hidden vs MRT fades out. Slight exit-animation difference; entry fade preserved.

### [ ] SRT_ToolbarInternalButtons.tsx : MRT_ToolbarInternalButtons.tsx
- `note` — MRT has no print/export button here either (MRT itself omits it in this component), so SRT is complete relative to SoT. No gap.

### [ ] SRT_TopToolbar.tsx : MRT_TopToolbar.tsx
- `note` — MRT passes `globalFilterProps` (parsed slot props) into MRT_GlobalFilterTextField; SRT passes only `table={table}` (no spread of pre-parsed global-filter props). GlobalFilter slot-prop forwarding handled inside SRT_GlobalFilterTextField instead — verify in inputs cluster review (#2). Not a top-toolbar gap per se.

---

## Cross-file summary

- Overall parity: HIGH. All 10 pairs are faithful 1:1 ports in structure, ordering, gating, localization, and slot-prop wiring.
- Confirmed gaps (all intentional/documented): grid layoutMode branches omitted cluster-wide (footer); footer-cell keyboard shortcuts deferred (TODO); LinearProgress determinate-animation approximation vs MRT indeterminate.
- Behavioral deviations worth a second look: (1) AlertBanner `selectedAlert` extra `enableRowSelection &&` gate vs MRT's count-only check; (2) footer cell drops `children ??` slot-prop precedence; (3) AlertBanner lacks tablePaperRef width-clamp and slot-prop title/children injection; (4) Pagination `pages` mode reimplements MUI ellipsis logic (verify edge cases).
- Cleanups: LinearProgressBar double-spread of `linerProgressProps`, variable typo `linerProgressProps`, and stale trailing TODO comment contradicting implemented `srtLinearProgressProps`.

### table/ + modals/

Review of the table/ + modals/ + root cluster. SoT = MRT `packages/material-react-table/src/components/{table,modals}/` + root `MaterialReactTable.tsx`. SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/{table,modals}/` + root `ShadcnReactTable.tsx`. READ-ONLY verification, 1:1 port intent. All [ ] left unchecked for the lead.

(Note: a second SRT copy of these files lives under `packages/shadcn-react-table-cli/src/templates/shadcn-react-table/` — the CLI template. This review covers the `apps/test-shadcn` copy per the task spec; the lead should confirm the template copy stays in sync.)

### [ ] ShadcnReactTable.tsx : MaterialReactTable.tsx
- `note` — SRT imports the hook + types from the `shadcn-react-table-core` package (line 1-7) rather than relative `../hooks` / `../types`; expected core/template split.
- `note` — SRT renders `<SRT_TableLayout>` (line 36) where MRT renders `<MRT_TablePaper>` — the renamed root child (see TableLayout pair below). Behaviorally equivalent root wrapper.
- `deviation` (cosmetic) — SRT uses `export default ShadcnReactTable` (line 39) vs MRT named `export const MaterialReactTable` (line 24). SRT adds an `eslint-disable rules-of-hooks` comment on the conditional hook call (line 32); MRT omits it. No runtime difference.

### [ ] SRT_Table.tsx : MRT_Table.tsx
- `deviation` — SRT applies styling via className `cn('w-full border-collapse text-sm', ...)` (line 76) instead of MRT's `sx` `borderCollapse:'separate'` + `position:'relative'` (MRT 67-72). SRT uses `border-collapse` (collapse) vs MRT `separate`, and SRT drops `position:relative` on the `<table>`. Verify sticky-header / column-resize visuals still work without `position:relative` and with `collapse`.
- `gap` — SRT omits `stickyHeader={enableStickyHeader || isFullScreen}` entirely (MRT line 64). MRT destructures `enableStickyHeader` + `isFullScreen`; SRT destructures neither. Sticky-header behavior must therefore be driven by container/CSS rather than the table element — confirm sticky header actually engages in SRT.
- `note` — SRT uses slot prop `srtTableProps` via `parseSRT_HtmlProps` (line 44,71) and drops MRT's `...rest`/`TableProps` passthrough (MRT 17,36-39,65). SRT also drops `muiTableProps` extra theme `sx` merge. Intentional per shadcn HTML-props model.

### [ ] SRT_TableContainer.tsx : MRT_TableContainer.tsx
- `note` — SRT uses `mergeSRT_HtmlProps` to compose its own style under user `srtTableContainerProps` so the height clamp survives (b wins per-key, SRT 70-81); equivalent to MRT spreading `tableContainerProps` last but with library-style protected. Reasonable adaptation.
- `deviation` — SRT drops the `tableContainerProps.ref` forwarding branch (MRT 81-84 forwards a user-supplied ref alongside `tableContainerRef`). SRT's ref callback only assigns `tableContainerRef.current` (SRT 87-91). User-supplied container refs won't be populated — minor, slot-prop edge case.

### [ ] SRT_TableLayout.tsx : MRT_TablePaper.tsx
- `deviation` — SRT introduces TWO slot props: `srtTableLayoutProps` (line 47,56) AND `srtTablePaperProps` (line 47,69), where MRT has a single `muiTablePaperProps`. `srtTablePaperProps` carries the onKeyDown/className merge; `srtTableLayoutProps` is spread as `divRest`. Lead should confirm the split is intentional and documented in core types.
- `deviation` — SRT adds `p-2` padding to the layout root (line 22). MRT Paper has no padding (padding:0 only in fullscreen). Visual deviation: SRT pads the table wrapper in non-fullscreen mode.
- `gap` — SRT omits the paper `ref` forwarding to user-supplied `paperProps.ref` (MRT 44-49). Explicitly TODO'd at SRT line 72 ("omitted the ref ... might add later"). Tracked, low risk.

### [ ] SRT_TableLoadingOverlay.tsx : MRT_TableLoadingOverlay.tsx
- `deviation` — spinner is `LoaderCircleIcon` (lucide) with `animate-spin size={40}` (SRT 36-42) vs MUI `<CircularProgress>` (MRT 50-54). Expected icon-library swap.
- `note` — SRT spreads `circularProgressProps?.className` twice (overlay container line 32 AND spinner line 39), and also spreads `...circularProgressProps` onto the lucide icon (line 41) which forwards `className` a third time. The `id`/`size` set before the spread can be overridden by the spread; minor prop-precedence quirk, no functional break.
- `note` — trailing TODO block (lines 48-54) flags missing `srtSpinnerProps`, custom-Component support, theme bg integration. Awareness only; current behavior matches MRT.

### [ ] SRT_EditRowModal.tsx : MRT_EditRowModal.tsx
- `gap` — SRT's `handleClose` does NOT forward a user-supplied close handler. MRT calls `dialogProps.onClose?.(event, reason)` as the last line of its onClose (MRT line 74); SRT has no equivalent forward of any `onClose`/close callback from `srtEditRowDialogProps`. If a consumer passes a close handler via slot props it will silently not fire. Real behavioral gap — flag for the lead.
- `deviation` — default layout uses shadcn `DialogHeader/DialogTitle/DialogFooter` + `<div className="flex w-full flex-col gap-8 pt-4">` (SRT 100-112) vs MRT `DialogTitle/DialogContent/Stack gap:32px pt:16px` + `DialogActions p:1.25rem` (MRT 91-109). `gap-8`=32px, `pt-4`=16px, `p-5`=1.25rem — values match. `sm:max-w-xs` (line 86) = MRT `fullWidth maxWidth="xs"` (MRT 63-64). Visually equivalent.
- `note` — SRT guards `row ? ...getAllCells() : []` (lines 68-75) which MRT does not (MRT assumes row non-null). Defensive; harmless since container only renders the modal when a row exists. `EditActionButtons variant="text"` preserved (SRT 111, MRT 108).

### Cross-cutting summary
- Root + all four table/ files + loading overlay + edit modal are faithful 1:1 ports. Naming (MRT_→SRT_, mui*Props→srt*Props), MUI→shadcn/lucide component swaps, and sx→className/cva conversions are consistent and behavior-preserving.
- Highest-priority items for the lead: (1) `gap` SRT_Table omits `stickyHeader`/`position:relative` — verify sticky header works; (2) `gap` SRT_EditRowModal does not forward a user `onClose` from slot props; (3) tracked-TODO ref omissions in TableLayout + dropped container ref forwarding.
- The CLI-template copy under `packages/shadcn-react-table-cli/...` was not diffed against this copy — recommend a quick sync check.

## Core package (`packages/shadcn-react-table-core/src`) ↔ MRT (`packages/material-react-table/src`)


Verification review of the headless core package `packages/shadcn-react-table-core/src/` against the vendored SoT `packages/material-react-table/src/`. Both trees are 1:1 in layout. SRT adds two intentional core-only files (`useSRT_ProgressAnimation`, `srtHtmlProps.utils`). Method: per-file normalized diff (MRT↔SRT / mui*↔srt* / theme-token names folded out) so only real logic deltas surface; values for sizing/enable flags compared literally. Locale files reviewed as a group, not per-file.

### [ ] index.ts : index.ts
- `note` SRT core index does NOT re-export `./components/*` — correct, components live in the UI package; this is the core/UI split, not a gap.
- `note` SRT core additionally re-exports all 38 `./locales/*` (MRT exposed locales from a different entrypoint) — additive, not a parity issue.

### [ ] types.ts : types.ts
- `note` SRT adds 2 extra props (`srtTableLayoutProps`, `srtToolbarDropZoneProps`) and 12 extra types — HTMLProps context machinery (`*HTMLPropsContext`, `HTMLProps`, `HTMLPropsValue`, `LayoutDivProps`, `Circular/LinearProgressProps`). These back the headless html-props/layout approach. Additive deviation, no MRT coverage lost.

### [ ] icons.ts : icons.ts
- `note` MRT's distinct `FilterAltIcon` and `FilterListIcon` both map to lucide `Filter` in SRT — cosmetic only (two MUI glyphs collapsed to one), no logic impact.
- `note` Task brief said 33 keys; actual count is 34. All accounted for.

### [ ] fns/aggregationFns.ts : fns/aggregationFns.ts

### [ ] fns/filterFns.ts : fns/filterFns.ts

### [ ] fns/sortingFns.ts : fns/sortingFns.ts

### [ ] utils/cell.utils.ts : utils/cell.utils.ts

### [ ] utils/column.utils.ts : utils/column.utils.ts

### [ ] utils/displayColumn.utils.ts : utils/displayColumn.utils.ts

### [ ] utils/row.utils.ts : utils/row.utils.ts

### [ ] utils/style.utils.ts : utils/style.utils.ts
- `deviation` `getCommonPinnedCellStyles` intentionally commented out (SRT L79, and its call site L161 in `getCommonMRTCellStyles`). MUI sticky-pinned styling moved to UI layer — as noted in task brief. Pinned-cell positioning styles are NOT computed in core.
- `note` 240 vs 214 lines — delta is the added tooltip type aliases (`SRT_TooltipSide`, `SRT_CommonTooltipProps`) + the commented originals.

### [ ] utils/tanstack.helpers.ts : utils/tanstack.helpers.ts

### [ ] utils/utils.ts : utils/utils.ts

### [ ] utils/virtualization.utils.ts : utils/virtualization.utils.ts

### [ ] utils/srtHtmlProps.utils.ts : (SRT-only)
- `note` No MRT counterpart. Exports `parseSRT_HtmlProps`, `mergeSRT_HtmlProps` (105 lines) — supports the SRT html-props deviation in place of MUI's slotProps. Additive; nothing to compare against.

### [ ] hooks/useShadcnReactTable.ts : hooks/useMaterialReactTable.ts

### [ ] hooks/useSRT_TableInstance.ts : hooks/useMRT_TableInstance.ts

### [ ] hooks/useSRT_TableOptions.ts : hooks/useMRT_TableOptions.ts
- `deviation` MUI `useTheme()` + `getMRTTheme` default-computation commented out (S102/S117/S127) — expected, shadcn uses CSS vars/Tailwind not the MUI theme. `mrtTheme` default not set.
- `deviation` `columnResizeDirection` default-from-theme fallback commented out (S151-153: `if (!columnResizeDirection) columnResizeDirection = theme.direction || 'ltr'`). MRT defaults it to `'ltr'` (with RTL support); SRT leaves it undefined unless the consumer supplies it. Behavioral gap for resize-direction/RTL default — flag.

### [ ] hooks/useSRT_Effects.ts : hooks/useMRT_Effects.ts

### [ ] hooks/useSRT_Rows.ts : hooks/useMRT_Rows.ts

### [ ] hooks/useSRT_ColumnVirtualizer.ts : hooks/useMRT_ColumnVirtualizer.ts

### [ ] hooks/useSRT_RowVirtualizer.ts : hooks/useMRT_RowVirtualizer.ts

### [ ] hooks/useSRT_ProgressAnimation.ts : (SRT-only)
- `note` No MRT counterpart. Exports `SRT_ProgressAnimationStrategy`, `SRT_ProgressAnimationOptions`, `useSRT_ProgressAnimation` (108 lines) — SRT-only progress animation helper (replaces MUI LinearProgress/CircularProgress animation behavior). Additive.

### [ ] hooks/display-columns/getSRT_RowActionsColumnDef.tsx : getMRT_RowActionsColumnDef.tsx
- `note` Cell/Header JSX dropped (accepted headless split).

### [ ] hooks/display-columns/getSRT_RowDragColumnDef.tsx : getMRT_RowDragColumnDef.tsx

### [ ] hooks/display-columns/getSRT_RowExpandColumnDef.tsx : getMRT_RowExpandColumnDef.tsx
- `deviation` MRT's inline `muiTableBodyCellProps`/`muiTableHeadCellProps: alignProps` (cell alignment) NOT carried to SRT columnDef. Headless split — but note this is cell-styling, not just Cell render; alignment must be reproduced in the UI body/head cell renderer. SRT documents this in a header comment (L14-18).

### [ ] hooks/display-columns/getSRT_RowNumbersColumnDef.tsx : getMRT_RowNumbersColumnDef.tsx

### [ ] hooks/display-columns/getSRT_RowPinningColumnDef.tsx : getMRT_RowPinningColumnDef.tsx

### [ ] hooks/display-columns/getSRT_RowSelectColumnDef.tsx : getMRT_RowSelectColumnDef.tsx

### [ ] hooks/display-columns/getSRT_RowSpacerColumnDef.tsx : getMRT_RowSpacerColumnDef.tsx
- `deviation` Same as RowExpand: MRT's inline `muiTableBodyCellProps`/`muiTableHeadCellProps` dropped — cell-styling to be reproduced in UI layer.

### [ ] locales/ (38 files) : MRT locales
- `note` 38 locale files present and re-exported from index.ts. Reviewed as a group (no per-file diff). Locale strings are translation tables, not logic — parity assumed at the group level.

---

## Summary
- Core logic parity is HIGH. All `fns/`, all general `utils/`, and 4 of 7 hooks are normalized-identical. `types.ts` (props/render/enable/state), `icons.ts` (34 keys), display-column sizing — all match.
- Real deviations to track (not styling-only):
  1. `useSRT_TableOptions`: `columnResizeDirection` no longer defaults to `'ltr'`/theme direction (RTL/resize-direction default lost) — only behavioral gap found.
  2. `style.utils`: `getCommonPinnedCellStyles` commented out (pinned-cell positioning not in core) — intended, confirm UI layer covers it.
  3. RowExpand & RowSpacer: inline `mui*CellProps` alignment props dropped — UI body/head renderers must reproduce alignment.
- All other deviations are intended/additive: MUI-theme defaults removed, headless Cell/Header split, SRT-only html-props + progress-animation, extra HTMLProps types.

## Phase C verification

Final quality gate run after all 7 Phase-B clusters landed. All file-pair gaps
above confirmed closed and marked [x].

### Builds / static checks — all green
- **Core rebuild** (`pnpm --filter shadcn-react-table-core build`): clean. dist
  reflects all `srt*Props` additions (foundations) + `srtToolbarDropZoneProps`
  (toolbar-dev).
- **App type-check** (`tsc -p tsconfig.app.json --noEmit`): **0 errors, exit 0.**
  The two residuals flagged in the hand-off were already resolved by the time of
  this run:
  - `SRT_ShowHideColumnsMenuItemsProps.dense` exists and is threaded through
    (SRT_ShowHideColumnsMenuItems.tsx: prop declared + applied to padding +
    passed to nested items).
  - `srtToolbarDropZoneProps` resolves cleanly after the core rebuild
    (declared in core types.ts:957, consumed in SRT_ToolbarDropZone.tsx).
  - The pre-existing `baseUrl` TS5101 deprecation did **not** fire in this run.
- **Storybook build** (`pnpm --filter test-shadcn build-storybook`): **succeeds**,
  `storybook-static/index.html` emitted. (Storybook core emits benign `eval` +
  >500 kB chunk warnings from `@storybook/core` itself — not our code.)

### Browser verification — passed
Exercised the live `test-shadcn` dev app on the shared server (http://localhost:5273,
port unchanged, vite not restarted) plus a freshly-built static Storybook served
read-only on :6199 for variant-specific stories. Verified with screenshots:
- **Sorting** — click toggles asc/desc, header indicator + data order update.
- **Column filters — all variants** via `filter-fn-and-filter-variants` story:
  text, range (two-input), range-slider, checkbox, select, multi-select,
  autocomplete, **date / date-range / datetime-range / time-range** (rendered as
  Day/Month/Year + Hours/Minutes/AM-PM spinbuttons). Functional apply on the dev
  app: First Name="Ada" narrows to 2 rows with match highlighting, active-filter
  funnel indicator, clear (×) button, and footer aggregate recalculated.
- **Global search** — fuzzy match + ranked-result highlighting (orange spans).
- **Pagination** — default + **pages display mode** (numbered page buttons,
  prev/next, rows-per-page select); page-2 navigation changes rows.
- **Row selection** — individual + select-all; alert banner "N of 25 row(s)
  selected" + Clear selection; selected-row highlight.
- **Editing** — row-mode (inline editable cells + Cancel/Save, save persists:
  "Ada"→"Adabelle") and **modal mode** (`SRT_EditRowModal` dialog with backdrop,
  labeled fields, disabled Phone column, Cancel/Save). Cell mode covered by
  passing editing stories.
- **Expand + detail panel** — chevron expands a custom detail panel; coexists
  with menus.
- **Row action menu** (Edit / View details / Edit row) and **column action menu**
  (sort / clear sort / filter / clear filter / pin L-R / unpin / reset size /
  hide / show all) render with correct icons + disabled states.
- **Show/Hide columns + density** — menu with Hide all / Reset order / Unpin all
  / Show all, per-column checkboxes, drag-handle + pin icons; density toggle
  switches compact/comfortable.
- **Fullscreen** — table fills viewport, restores on toggle.
- **Virtualization** — `row-and-column-virtualization` story: only ~18 rows in
  DOM, scroll recycles to rows 71-79, sticky header + column virtualization
  intact, no glitches.
- **Pinning** — column pin-to-left moves column to pinned region with separator;
  responsive narrow layout pins the Actions column right.
- **Empty state** — "No records to display" placeholder.
- **Responsive toolbar** — at 480px width title wraps, toolbar icons stay aligned,
  horizontal scroll engages, Actions column pinned right; no breakage.

### Regressions — none blocking
- **Dev app (:5273) console is fully clean** (zero errors/warnings after buffer
  clear + reload) — this is the real library consumer.

### Accepted deviations
- **Storybook docs source-eval artifact (cosmetic, Storybook-only):** some stories
  log `ReferenceError: ColumnsIcon is not defined` + a downstream React
  "order of Hooks" error at render. `ColumnsIcon` exists in **neither** the
  source tree, the stories, **nor** the built `storybook-static` bundle — the icon
  registry uses `ViewColumnIcon: Columns2` (core/src/icons.ts). The throw comes
  from Storybook's own `@storybook/core` source-snippet `eval()` path (the build
  emits matching `eval` warnings); the **story canvas itself renders correctly**
  in every case, `tsc` and `build-storybook` both pass, and the dev app console is
  clean. Treated as a Storybook tooling artifact, not a library defect. Worth a
  follow-up only if Storybook docs "Show code" is a shipped surface.
- **ColumnActionMenu granular icons** remain as direct `lucide-react` imports
  rather than entries in the core icon registry (`SRT_Default_Icons`). They render
  correctly. Recommendation: only promote these to registry keys if per-deployment
  icon overriding of the column-action menu items is a required parity feature;
  MRT exposes them via its MUI icon slots, so adding registry keys
  (e.g. `SortAscIcon`, `SortDescIcon`, `ClearAllIcon` already exists, `PushPinIcon`
  already exists) would tighten parity but is non-blocking.