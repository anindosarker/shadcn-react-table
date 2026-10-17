# Stories parity tracker

Plan: `.ai/plans/stories-parity.md`. One entry per MRT story file (path relative to `packages/shadcn-react-table/stories`). Ticks are owner-only. Under each entry at most 3 bullets: what changed, library gaps found, commit. Equivalent files get `- same scenario as MRT, no change`.

## Library gaps (features a story needs that SRT lacks)
- fixed-bugs/mobile-date-pickers: MUI X date/time pickers have no shadcn calendar/popover picker in SRT; filter variants use native inputs

- styling/Caption: SRT_Table `<caption>` lacks MUI's `captionSide: bottom` default; BottomCaption renders on top

## Files

### [ ] features/Aggregation.stories.tsx
- Meta import to `@storybook/react-vite`; dropped the `any` annotations on the multi aggregationFn params (eslint no-explicit-any), inferred from the column type
- commit dd82639

### [ ] features/CellActions.stories.tsx
- data back to MRT faker shape (local `Row` interface, 100 rows) instead of `makeData`/`Person`; Meta import to `@storybook/react-vite`
- gap: SRT_CellActionMenu closes on right-button pointerup (Radix dismissable layer), so a real right-click never leaves the menu open; verified items via a dispatched `contextmenu` event
- commit d7f9cc2

### [ ] features/ClickToCopy.stories.tsx
- same scenario as MRT; only the Meta import moved to `@storybook/react-vite`
- commit 301086b

### [ ] features/ColumnActions.stories.tsx
- data back to MRT faker shape (local `Row` interface, 100 rows) instead of `makeData`/`Person`; Meta import to `@storybook/react-vite`
- commit 1bed949

### [ ] features/ColumnDragging.stories.tsx
- data back to MRT faker shape (local `Person` type, 100 rows) instead of `makeData`; Meta import to `@storybook/react-vite`
- commit a8e55a1

### [ ] features/ColumnGrouping.stories.tsx
- ColumnGroupingDropZoneAlwaysVisible: MRT `muiTopToolbarProps` sx on `.Mui-ToolbarDropZone` mapped to `srtTopToolbarProps` className `[&>.border-dashed]:...` (1px solid red, z-2!) replacing the stale API-gap comment; GroupingColumnsSetState `any` typed as `SRT_RowData` (eslint); Meta import to `@storybook/react-vite`
- commit 08c7d91

### [ ] features/ColumnHiding.stories.tsx
- added the 3 missing exports ColumnHidingWithHeaderGroups, ColumnHidingColumnsNotVisibleInShowHide, ColumnHidingWithColumnsHiddenAndNotVisibleInShowHide (verbatim MRT, `visibleInShowHideMenu` exists in SRT); Meta import to `@storybook/react-vite`
- commit 8f46128

### [ ] features/ColumnOrdering.stories.tsx
- same scenario as MRT; only the Meta import moved to `@storybook/react-vite`
- commit be078ab

### [ ] features/ColumnPinning.stories.tsx
- data back to MRT faker shape (`(typeof data)[0]`, 100 rows) instead of `makeData`/`Person`; `renderDetailPanel` drops the unused `_row` destructure (eslint no-unused-vars); Meta import to `@storybook/react-vite`
- commit 5d1453e

### [ ] features/ColumnResizing.stories.tsx
- same scenario as MRT; only the Meta import moved to `@storybook/react-vite`
- commit d6dec05

### [ ] features/Creating.stories.tsx
- CreateRowIndexIndexExpanding: `renderRowActions` back to MRT `staticRowIndex` (SRT has it now; stale API-gap comment and `row.index` fallback removed), IconButton -> `Button size="icon"` default variant; CreateWithCustomEditCell: MUI Select/MenuItem -> shadcn `Select`/`SelectItem` with MRT `value`; Meta import to `@storybook/react-vite`

### [ ] features/DensePadding.stories.tsx

- same scenario as MRT, no change

### [ ] features/DetailPanel.stories.tsx

- added `DetailPanelSingleExpand`; `muiExpandButtonProps` -> `srtExpandButtonProps` (rotation, conditional hide, single expand); `srt-row-expand` cell/head `align: right` restored; stale API GAP comments removed

### [ ] features/Editing.stories.tsx

- deleted `onEditingCellSave` replaced by `srtEditTextFieldProps` onBlur save (cell, cell+row actions, table, manual onChange) like MRT; `srtTableContainerProps` height 400 restored; custom Save button green like MRT `color="success"`; stale API GAP comments removed
- `muiEditTextFieldProps` `select` + MenuItem children stays `editVariant`/`editSelectOptions` (SRT Input takes no children); `variant: outlined` has no Input equivalent
- DetailPanel commit: 957eb01

### [ ] features/Filtering.stories.tsx

- `CustomFilterComponent`: MUI `TextField select` + MenuItem -> shadcn `NativeSelect`/`NativeSelectOption` (empty value = All, like MRT `value={null}`); `muiFilterTextFieldProps variant: outlined` has no Input equivalent, stays dropped
- Editing commit: e870e41

### [ ] features/FullScreen.stories.tsx

- `ControlledFullScreen`: `muiTableBodyCellProps` cell `title` restored as `srtTableBodyCellProps`; stale API GAP comment removed
- Filtering commit: 69ac8cb

### [ ] features/HeaderGroups.stories.tsx

- same scenario as MRT, no change

### [ ] features/LayoutMode.stories.tsx

- data back to inline faker (5 fields, 100 rows) like MRT instead of `makeData(100)` Person shape; `(typeof data)[0]` column type like MRT

### [ ] features/Loading.stories.tsx

- `OnlyTopProgressBar`: `muiLinearProgressProps` sx display -> `srtLinearProgressProps` `progressComponentProps.style`; stale API GAP comment removed

### [ ] features/Memod.stories.tsx

- same scenario as MRT, no change (MUI `variant="contained"` = shadcn default Button)

### [ ] features/Pagination.stories.tsx
- added PaginationEnabledDefaultNoRowsPerPage and PaginationEnabledCustomizeRowsPerPage; ported muiPaginationProps (rowsPerPageOptions, showRowsPerPage, SelectProps.native, boundaryCount, showFirst/LastButton, disabled) to srtPaginationProps and muiTableContainerProps sx height to srtTableContainerProps className; Meta from @storybook/react-vite
- gaps: muiPaginationProps shape/variant (MUI style variants) have no SRT equivalent, dropped

### [ ] features/RowActions.stories.tsx
- data back to inline faker (5 fields, 10 rows) instead of makeData; menu items inlined per story as DropdownMenuItem with lucide icons (was a shared helper of plain buttons); Meta from @storybook/react-vite
- Pagination commit: cf5309f

### [ ] features/RowDragging.stories.tsx
- data back to inline faker (MRT shape incl. id column, 25 rows) instead of makeData; added missing ID column; Meta from @storybook/react-vite (MRT `_setData` dropped: SRT eslint no-unused-vars rejects it)
- RowActions commit: d3270c9

### [ ] features/RowNumbers.stories.tsx
- data back to inline faker (MRT shape, 100 rows) instead of makeData; Meta from @storybook/react-vite; eslint-disable rules-of-hooks on enableRowNumbersConditionally (lowercase MRT export name + useState, SRT eslint rejects it)
- RowDragging commit: 6010705

### [ ] features/RowOrdering.stories.tsx
- full MRT port: inline faker Person with num column (100 rows) instead of makeData; srtRowDragHandleProps onDragEnd splice-commit restored in every story (stale "API GAP" comment removed, SRT has the option); fakeData cells back to faker firstName; Meta from @storybook/react-vite
- RowNumbers commit: 3a2ba9a

### [ ] features/RowPinning.stories.tsx
- full MRT port: inline faker (6 fields, 50 rows) instead of makeData; muiTableContainerProps sx maxHeight and muiTableBodyRowProps sx height restored as srtTableContainerProps / srtTableBodyRowProps className (stale "API GAP" comment removed, SRT has both); Meta from @storybook/react-vite
- RowOrdering commit: 83cdc43

### [ ] features/Search.stories.tsx
- inline faker (6 fields incl. float age, 200 rows) instead of makeData; CustomizeSearchTextBox ports placeholder via srtSearchTextFieldProps (stale "API GAP" comment replaced); Meta from @storybook/react-vite
- gaps: muiSearchTextFieldProps label / variant / InputLabelProps have no shadcn Input equivalent
- RowPinning commit: 7080a87

### [ ] features/Selection.stories.tsx
- full MRT port: inline faker (4 fields, 15 rows) instead of makeData; row-click handlers (getSRT_RowSelectionHandler, getToggleSelectedHandler, manual data-selected), srtSelectCheckboxProps / srtSelectAllCheckboxProps / srtToolbarAlertBannerProps / srtTableBodyCellProps and the shift-click range selection restored (stale "API GAP" comments removed, SRT has all of them); Meta from @storybook/react-vite
- mapping: MUI `selected` row prop -> `data-selected`; checkbox color secondary -> data-[state=checked] secondary classes; banner color info -> sky classes; Button success -> green classes; MRT useCallback/useEffect deps kept with eslint-disable exhaustive-deps
- Search commit: 0bbf9ce

### [ ] features/Sorting.stories.tsx
- inline faker (5 fields, 100 rows) instead of makeData; columns in MRT multi-line shape; Meta from @storybook/react-vite
- Selection commit: c1415bf

### [ ] features/SubRowTree.stories.tsx
- inline nested faker (MRT shape: 5 rows, 0-4 / 3 / 2 sub-rows) instead of makeNestedData; RTL stories use SRT_Localization_HE from locales/he (stale "API GAP" comment removed) with dir="rtl" wrapper replacing MUI ThemeProvider direction; srt-row-expand displayColumnDefOptions kept as MRT; Meta from @storybook/react-vite
- Sorting commit: ab3b4b5

### [ ] features/Toolbar.stories.tsx

### [ ] features/Virtualization.stories.tsx

### [ ] fixed-bugs/click-propogation.stories.tsx
- added `srtTableBodyRowProps.onClick` alert (was dropped as a false gap), `MenuItem` -> `DropdownMenuItem`, `Button` -> shadcn `Button`, `Meta` from `@storybook/react-vite`

### [ ] fixed-bugs/data-types.stories.tsx
- same scenario as MRT; only `Meta` import moved to `@storybook/react-vite` (click-propogation commit: 317d0b4)

### [ ] fixed-bugs/dragging-virtual-when-filtered.stories.tsx
- same scenario as MRT; `Meta` from `@storybook/react-vite`, dropped unused `_setData` (eslint no-unused-vars) (data-types commit: 5deed99)

### [ ] fixed-bugs/fullscreen-with-appbar.stories.tsx
- AppBar/Toolbar/CssBaseline stay a sticky div (no shadcn AppBar), inline styles -> Tailwind `bg-primary text-primary-foreground`, `Box padding={2}` -> `p-4`; app bar `z-[1100]` (MUI number) -> `z-40` so SRT fullscreen (`z-50`, MRT uses `theme.zIndex.modal`) covers it as the scenario expects; `Meta` from `@storybook/react-vite` (dragging-virtual commit: 9f7bb23)

### [ ] fixed-bugs/gridLayout.stories.tsx
- restored `align` center/right via `srtTableBodyCellProps`/`srtTableHeadCellProps` (was dropped as a false gap), `Meta` from `@storybook/react-vite` (fullscreen-with-appbar commit: e94a1f3)

### [ ] fixed-bugs/loading.stories.tsx
- same scenario as MRT; only `Meta` import moved to `@storybook/react-vite` (gridLayout commit: 1d12a54)

### [ ] fixed-bugs/mobile-date-pickers.stories.tsx
- same columns/filterVariants as MRT; `Meta` from `@storybook/react-vite` (loading commit: a2e3f8a)
- gap: MUI X date/time pickers -> SRT native `date`/`datetime-local`/`time` inputs (no `calendar` under `src/components/ui`); all 6 variants render

### [ ] fixed-bugs/sticky-footer.stories.tsx
- restored MRT cell/container overrides (were dropped as a false gap): `srtTableBodyCellProps`/`srtTableHeadCellProps` `align: center` + `className: border-l border-black`, `srtTableContainerProps` `style: { maxHeight: 300 }` (className cannot beat the sticky-header inline maxHeight); `mockData`/`mockColumns` typed instead of `any` (eslint no-explicit-any); `Meta` from `@storybook/react-vite` (mobile-date-pickers commit: deecefe)

### [ ] fixed-bugs/useEffects.stories.tsx
- `Box sx` -> `div className="flex gap-4 whitespace-nowrap"`, MUI `Button` -> shadcn `Button`, `MenuItem` -> `DropdownMenuItem`; eslint-disable `react-hooks/rules-of-hooks` block around MRT's lowercase export `renderRowActionMenuItemsAsync` (name kept); `Meta` from `@storybook/react-vite` (sticky-footer commit: b76a30f)

### [ ] styling/Alignment.stories.tsx
- data back to faker (25 rows, MRT shape); `align` on `defaultColumn`/column `srtTable{Body,Head,Footer}CellProps` restored for all 8 aligned stories (stale "API GAP" comments removed, SRT supports `align`)

### [ ] styling/Caption.stories.tsx
- data back to faker (25 rows, MRT shape); TopCaption: `muiTableProps.sx caption captionSide top` -> `srtTableProps.className '[&>caption]:caption-top'`
- gap: SRT_Table renders a bare `<caption>` with no `caption-bottom` default, so BottomCaption shows the caption on top (MUI TableCaption defaults to bottom)
- Alignment commit: f7d45b2

### [ ] styling/ColumnWidths.stories.tsx
- title to `Styling/Custom Column Widths`; data back to faker (21 rows, MRT shape incl. `id`); columns rewritten to MRT's 5 (id/firstName/lastName/age/address) with MRT sizes and grow flags, inline per story
- Caption commit: 53993b6 (+ Meta import fix 64a5369; Alignment Meta fix dbe8c89)

### [ ] styling/CustomTableBody.stories.tsx
- data back to faker (25 rows, MRT shape); CustomTableBody: `srtTableBodyProps.children` restored (stale API GAP comment removed, SRT_TableBody honours children); Typography -> `p`
- render check flags React 19's `text nodes cannot be a child of <tbody>` console.error on CustomTableBody; MRT's story has the same text child under the same React 19, kept as written
- ColumnWidths commit: fbbad71

### [ ] styling/RowHeights.stories.tsx
- data back to faker (25 rows, MRT shape); sx `p: '2px 16px'` -> `srtTableBodyCellProps.className 'py-0.5 px-4'`, sx `height: '10px'` -> `srtTableBodyRowProps.className 'h-2.5'` (stale API GAP comment removed)
- CustomTableBody commit: 3eee7d8

### [ ] styling/StickyHeader.stories.tsx
- data back to faker (100 rows, MRT shape, no age); `muiTableContainerProps.sx maxHeight 400` -> `srtTableContainerProps.style maxHeight 400` on the 3 shorter-table stories (className `max-h-[400px]` loses to the container's inline sticky clamp, `style` is spread last); stale API GAP comments removed
- RowHeights commit: dc1acdc

### [ ] styling/StylingDisplayColumns.stories.tsx
- data back to faker (21 rows, MRT shape); display column sx restored as className (`srt-row-actions` head cell `text-xl italic`, `srt-row-numbers` body cell `text-2xl text-red-500`); plain `button` -> shadcn `Button` (default / `destructive` for MUI primary / error contained); stale API GAP comment removed
- StickyHeader commit: 0033f46

### [ ] styling/TableBodyCellStyles.stories.tsx
- data back to faker (21 rows, MRT shape); conditional story back to MRT rule (`> 40` -> `bg-green-500/50`, fontWeight 700/400 -> `font-bold`/`font-normal`; was `>= 50` red/green)
- StylingDisplayColumns commit: ece1f02

### [ ] styling/TableBodyRowStyles.stories.tsx
- data back to faker (21 rows, MRT shape); all 5 styled stories restored via className: hover off -> `hover:[&>td]:after:bg-transparent`, row sx -> `bg-sky-500/10 border-r border-border`, striped -> tbody `[&_tr:nth-of-type(odd)]:bg-[limegreen]` / `[&_tr:nth-child(4n+3)]:bg-[limegreen]` + cell `border-none`, conditional -> `bg-red-500/20 italic`; stale API GAP comments removed
- gap: `srtTableBodyRowProps` has no `hover` boolean like MUI TableRow; disabling the hover overlay needs the className above
- TableBodyCellStyles commit: 773d0a1

### [ ] styling/TableDiminsions.stories.tsx
- data back to faker (25 rows, MRT shape, no age); `muiTablePaperProps` -> `srtTableLayoutProps` (`m-auto max-w-[800px]`, `h-full`), container sx -> `srtTableContainerProps` className `max-h-[500px]` / `min-h-[800px]`, toolbar-ref `calc` height kept as `style`; stale API GAP comments removed
- TableBodyRowStyles commit: 8ddb7c2

### [ ] styling/TableHeadCellStyles.stories.tsx
- data back to faker (21 rows, MRT shape); sx restored as className: sort icon `[&_button[aria-label^=Sort]_svg]:text-[limegreen]!` when sorted, all cells `bg-sky-500/10 border-r border-border text-foreground`, per column `text-primary` / `text-red-500`, `Box color=primary.main` -> `div.text-primary`; stale API GAP comments removed
- TableDiminsions commit: 628ba57

### [ ] styling/TablePaper.stories.tsx
- data back to faker (25 rows, MRT shape, no age); `muiTablePaperProps.elevation 0` -> `srtTableLayoutProps.className 'shadow-none'` (layout wrapper carries the default `shadow`); stale API GAP comment removed
- TableHeadCellStyles commit: 7167138

### [ ] styling/Theming.stories.tsx

