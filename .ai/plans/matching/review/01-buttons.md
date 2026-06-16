### buttons/

Source of truth: MRT `packages/material-react-table/src/components/buttons/`.
SRT: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/`.
Tags: parity-ok | deviation | gap | note. Checkboxes left `[ ]` for manual review.

### [ ] SRT_CopyButton.tsx : MRT_CopyButton.tsx
- `parity-ok` copy logic identical: `handleCopy` stops propagation, writes `cell.getValue()` to clipboard, sets `copied` true then false after 4000ms.
- `parity-ok` tooltip title precedence matches: `buttonProps?.title ?? (copied ? copiedToClipboard : clickToCopy)`.
- `deviation` slot props resolved via `mergeSRT_HtmlProps(parseSRT_HtmlProps(srtCopyButtonProps), parseSRT_HtmlProps(columnDef.srtCopyButtonProps))` (table + columnDef, columnDef wins) vs MRT spread of `muiCopyButtonProps` then `columnDef.muiCopyButtonProps` then `rest`. Equivalent; SRT also composes className/handlers via merge helper.
- `deviation` styling: cva ghost Button + `cn('h-auto cursor-copy border-0 bg-transparent p-0 font-inherit text-inherit hover:bg-transparent')` vs MRT `sx` (cursor copy, transparent, inherit font/size/letterSpacing/textAlign/textTransform, `m:-0.25rem`, `minWidth:unset`, `py:0`). Inherit-text intent preserved; negative margin/letterSpacing/textTransform not ported (cosmetic).
- `note` SRT renders `{children ?? cell.getValue()}` as button content. MRT renders no children — the caller (body cell) supplies the displayed value and wraps it in the button. SRT moving the value inside the button is a reasonable port but means callers must NOT also pass the value as a child sibling; confirm the SRT body cell call site passes `children` or relies on this default. Behavioral, low risk — verify call site.

### [ ] SRT_ColumnPinningButtons.tsx : MRT_ColumnPinningButtons.tsx
- `parity-ok` logic identical: `handlePinColumn` calls `column.pin(dir)`; pinned -> single unpin button, unpinned -> pin-left (rotate 90deg) + pin-right (rotate -90deg).
- `parity-ok` icon from registry (`PushPinIcon`); rotations match exactly.
- `deviation` container `<div className="flex min-w-[70px] justify-center gap-1">` vs MRT `Box sx={{minWidth:'70px', textAlign:'center'}}`. flex+gap vs textAlign is cosmetic; min-width preserved.
- `deviation` SRT adds `aria-label` per button (unpin/pinToLeft/pinToRight) — MRT relies on tooltip title only. Improvement, not a gap.
- `gap` MRT spreads `...rest` (BoxProps) and merges `rest.sx` onto the container; SRT only accepts `className`. No per-instance slot prop passthrough on the container, but this component is internal and not driven by a `srt*Props` slot in MRT either — minor.

### [ ] SRT_EditActionButtons.tsx : MRT_EditActionButtons.tsx
- `parity-ok` `handleCancel` and `handleSubmitRow` logic ported verbatim, incl. auto-filled input scan over `editInputRefs.current`, `_valuesCache` reset/write, `onCreatingRowSave`/`onEditingRowSave` with `exitCreatingMode`/`exitEditingMode`.
- `parity-ok` save button gated by `(isCreating && onCreatingRowSave) || (isEditing && onEditingRowSave)`; container `onClick` stops propagation; `variant` icon/text both implemented; spinner shown while `isSaving`.
- `deviation` icon variant now wraps both buttons in `SRT_Tooltip` (cancel/save) — MRT also has tooltips, so this matches. lucide `LoaderCircleIcon animate-spin` vs MUI `CircularProgress`. `text-blue-500` vs MUI `color="info"`. All acceptable.
- `gap` MRT extends `BoxProps` and spreads `...rest` (sx etc.) onto the container; SRT exposes only `className`. No `sx`/arbitrary-prop passthrough. Low impact (not a public `srt*Props` slot).
- `note` doc comment is STALE: header says "Barebones implementation" with a TODO list ("Add tooltip", "Add custom button props support") — but tooltips ARE implemented. Update comment to avoid misleading future readers.

### [ ] SRT_ExpandAllButton.tsx : MRT_ExpandAllButton.tsx
- `parity-ok` disabled = `isLoading || (!renderDetailPanel && !getCanSomeRowsExpand())`; click toggles `toggleAllRowsExpanded(!isAllRowsExpanded)`; rotation 0/-90/-180 matches exactly.
- `parity-ok` tooltip title precedence `buttonProps?.title ?? (collapseAll/expandAll)`; SRT additionally suppresses tooltip while disabled (`SRT_Tooltip disabled`), matching MRT wrapping disabled button in `<span>`.
- `parity-ok` slot `srtExpandAllButtonProps` resolved via `parseSRT_HtmlProps` and spread before className compose.
- `deviation` density sizing `h-7 w-7`(compact)/`h-9 w-9` + `-mt-1` when not compact vs MRT `1.75rem`/`2.25rem` + `mt:-0.25rem`. Equivalent.
- `note` MRT renders `iconButtonProps?.children ?? <Icon>`; SRT always renders the icon and does not honor a `children` override from the slot props. Minor — slot-supplied custom icon child would be ignored.

### [ ] SRT_ExpandButton.tsx : MRT_ExpandButton.tsx
- `parity-ok` `handleToggleExpand` stops propagation + `row.toggleExpanded()`; disabled = `!canExpand && !detailPanel`; depth indent `row.depth * 16px`.
- `parity-ok` rotation formula ported exactly incl. the `!canExpand && !renderDetailPanel` sideways case (90/-90) and expanded (-180)/collapsed (0).
- `deviation` RTL/`positionExpandColumn==='last'` indent side: MRT reads `theme.direction === 'rtl'`; SRT reads `document.documentElement.getAttribute('dir') === 'rtl'`. Correct adaptation (no MUI theme). Guarded for SSR.
- `gap` MRT chains the slot's `onClick`: `handleToggleExpand` calls `iconButtonProps?.onClick?.(event)` after toggling. SRT spreads `{...buttonProps}` BEFORE `onClick={handleToggleExpand}`... actually SRT sets its own `onClick` after the spread so the slot's onClick is OVERRIDDEN and never called. MRT preserves it. Real behavior diff if a consumer passes `srtExpandButtonProps.onClick`.
- `note` MRT honors `iconButtonProps?.children` as icon override; SRT always renders `ExpandMoreIcon`. Minor.

### [ ] SRT_GrabHandleButton.tsx : MRT_GrabHandleButton.tsx
- `parity-ok` draggable button, `move` tooltip (title precedence `title ?? localization.move`), onClick stops propagation then calls caller `onClick`. Icon from registry (`DragHandleIcon`).
- `parity-ok` opacity rule: row -> 1, column -> 0.5 raised to 1 on hover; cursor grab / active grabbing; transparent hover bg.
- `deviation` extra props spread via `...rest` (ComponentProps<'button'>) + `cn(className)` vs MRT spreading `...rest` IconButtonProps + `sx`. MRT also exposes `onDragStart`/`onDragEnd`/`iconButtonProps` in its prop type; SRT relies on generic button props passthrough (`{...rest}`) so drag handlers still flow through. Acceptable.
- `gap` MRT `disableRipple` and fine spacing (`p:'2px'`, `m:'0 -0.1rem'`) not ported. Cosmetic only; ripple is MUI-specific so N/A. Negative margin omission may shift handle alignment slightly.
- `note` SRT `aria-label` is fixed to `localization.move` even when a custom `title` is passed; MRT uses `rest.title ?? localization.move` for aria-label. Minor a11y diff.

### [ ] SRT_RowPinButton.tsx : MRT_RowPinButton.tsx
- `parity-ok` `handleTogglePin` closes tooltip, stops propagation, `row.pin(isPinned ? false : pinningPosition)`.
- `parity-ok` controlled tooltip via `open={tooltipOpened}` + open on hover/focus, close on click/blur/leave — matches MRT's manual open-state handling.
- `parity-ok` icon: `CloseIcon` when pinned else rotated `PushPinIcon`; rotation `sticky?135 : top?180 : 0` ported exactly.
- `deviation` size `h-6 w-6` (24px) matches MRT `height/width:'24px'`. `h-3.5 w-3.5` icon vs MUI `fontSize="small"`. Acceptable.
- `gap` MRT spreads `...rest` (IconButtonProps incl. sx) onto the button; SRT only accepts `className`. No per-instance slot passthrough — low impact (no public `srt*Props` slot for this button).

### [ ] SRT_ShowHideColumnsButton.tsx : MRT_ShowHideColumnsButton.tsx
- `parity-ok` `handleClick` captures `event.currentTarget` as `anchorEl`; renders menu only when `anchorEl` set; passes `anchorEl`/`setAnchorEl`/`table` to the menu component.
- `parity-ok` icon `ViewColumnIcon` from registry; tooltip `localization.showHideColumns`.
- `deviation` ghost icon Button `h-9 w-9` vs MUI IconButton. Title precedence: MRT `rest?.title ?? localization...`; SRT uses localization directly (no `rest`/slot). Minor.
- `note` depends on SRT_ShowHideColumnsMenu (reviewed in menus/ cluster).

### [ ] SRT_ToggleDensePaddingButton.tsx : MRT_ToggleDensePaddingButton.tsx
- `parity-ok` `handleToggleDensePadding` cycle comfortable->compact->spacious->comfortable identical; `setDensity` called.
- `parity-ok` icon selection: compact=DensitySmall, comfortable=DensityMedium, else=DensityLarge — exact match, from registry.
- `parity-ok` tooltip `localization.toggleDensity`.
- `deviation` ghost icon Button `h-8 w-8` vs MUI IconButton; SRT drops the `rest?.title ?? ` precedence (no slot passthrough). Minor.

### [ ] SRT_ToggleFiltersButton.tsx : MRT_ToggleFiltersButton.tsx
- `parity-ok` `handleToggleShowFilters` -> `setShowColumnFilters(!showColumnFilters)`.
- `parity-ok` icon: `FilterListOffIcon` when shown else `FilterListIcon` — exact match, from registry.
- `parity-ok` tooltip `localization.showHideFilters`.
- `deviation` ghost icon Button `h-9 w-9`; no `rest.title` slot passthrough (MRT had `rest?.title ??`). Minor.

### [ ] SRT_ToggleFullScreenButton.tsx : MRT_ToggleFullScreenButton.tsx
- `parity-ok` `handleToggleFullScreen` closes tooltip then `setIsFullScreen(!isFullScreen)`.
- `parity-ok` controlled tooltip (open on hover/focus, close on click/blur/leave) matches MRT's `open` handling.
- `parity-ok` icon: `FullscreenExitIcon` when fullscreen else `FullscreenIcon`, from registry; tooltip `localization.toggleFullScreen`.
- `deviation` ghost icon Button `h-8 w-8`; no `rest.title` slot passthrough. Minor.

### [ ] SRT_ToggleGlobalFilterButton.tsx : MRT_ToggleGlobalFilterButton.tsx
- `parity-ok` `handleToggleSearch` toggles `setShowGlobalFilter` then `queueMicrotask(() => searchInputRef.current?.focus())` — identical incl. focus timing.
- `parity-ok` disabled = `!!globalFilter && showGlobalFilter`; SRT suppresses tooltip while disabled.
- `parity-ok` icon: `SearchOffIcon` when shown else `SearchIcon`, from registry; tooltip `localization.showHideSearch`.
- `deviation` aria-label: MRT `rest?.title ?? localization.showHideSearch`; SRT uses `localization.showHideSearch` only (no slot/title). Minor a11y diff.

### [ ] SRT_ToggleRowActionMenuButton.tsx : MRT_ToggleRowActionMenuButton.tsx
- `parity-ok` full branch logic ported: renderRowActions (when not showing edit buttons) -> SRT_EditActionButtons (row/create display mode) -> inline edit button (`!renderRowActionMenuItems && enableEditing && editDisplayMode in [modal,row]`) -> row action menu (when `renderRowActionMenuItems(...)?.length`).
- `parity-ok` `handleOpenRowActionMenu` (stop+prevent default, set anchor) and `handleStartEditMode` (stop, `setEditingRow({...row})`, clear anchor) identical; `parseFromValuesOrFunc(enableEditing, row)` reused from core.
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
