# Stories parity tracker

Plan: `.ai/plans/stories-parity.md`. One entry per MRT story file (path relative to `packages/shadcn-react-table/stories`). Ticks are owner-only. Under each entry at most 3 bullets: what changed, library gaps found, commit. Equivalent files get `- same scenario as MRT, no change`.

## Library gaps (features a story needs that SRT lacks)

- styling/Caption: SRT_Table `<caption>` lacks MUI's `captionSide: bottom` default; BottomCaption renders on top

## Files

### [ ] features/Aggregation.stories.tsx
- Meta import to `@storybook/react-vite`; dropped the `any` annotations on the multi aggregationFn params (eslint no-explicit-any), inferred from the column type

### [ ] features/CellActions.stories.tsx

### [ ] features/ClickToCopy.stories.tsx

### [ ] features/ColumnActions.stories.tsx

### [ ] features/ColumnDragging.stories.tsx

### [ ] features/ColumnGrouping.stories.tsx

### [ ] features/ColumnHiding.stories.tsx

### [ ] features/ColumnOrdering.stories.tsx

### [ ] features/ColumnPinning.stories.tsx

### [ ] features/ColumnResizing.stories.tsx

### [ ] features/Creating.stories.tsx

### [ ] features/DensePadding.stories.tsx

- same scenario as MRT, no change

### [ ] features/DetailPanel.stories.tsx

- added `DetailPanelSingleExpand`; `muiExpandButtonProps` -> `srtExpandButtonProps` (rotation, conditional hide, single expand); `srt-row-expand` cell/head `align: right` restored; stale API GAP comments removed

### [ ] features/Editing.stories.tsx

- deleted `onEditingCellSave` replaced by `srtEditTextFieldProps` onBlur save (cell, cell+row actions, table, manual onChange) like MRT; `srtTableContainerProps` height 400 restored; custom Save button green like MRT `color="success"`; stale API GAP comments removed
- `muiEditTextFieldProps` `select` + MenuItem children stays `editVariant`/`editSelectOptions` (SRT Input takes no children); `variant: outlined` has no Input equivalent
- DetailPanel commit: 957eb01

### [ ] features/Filtering.stories.tsx

### [ ] features/FullScreen.stories.tsx

### [ ] features/HeaderGroups.stories.tsx

### [ ] features/LayoutMode.stories.tsx

### [ ] features/Loading.stories.tsx

### [ ] features/Memod.stories.tsx

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

### [ ] features/RowPinning.stories.tsx

### [ ] features/Search.stories.tsx

### [ ] features/Selection.stories.tsx

### [ ] features/Sorting.stories.tsx

### [ ] features/SubRowTree.stories.tsx

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

### [ ] fixed-bugs/mobile-date-pickers.stories.tsx

### [ ] fixed-bugs/sticky-footer.stories.tsx

### [ ] fixed-bugs/useEffects.stories.tsx

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

### [ ] styling/StickyHeader.stories.tsx

### [ ] styling/StylingDisplayColumns.stories.tsx

### [ ] styling/TableBodyCellStyles.stories.tsx

### [ ] styling/TableBodyRowStyles.stories.tsx

### [ ] styling/TableDiminsions.stories.tsx

### [ ] styling/TableHeadCellStyles.stories.tsx

### [ ] styling/TablePaper.stories.tsx

### [ ] styling/Theming.stories.tsx

