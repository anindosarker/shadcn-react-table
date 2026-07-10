# Plan: SRT_TablePagination ← MRT_TablePagination

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/toolbar/SRT_TablePagination.tsx`.
Garbage-zone; author fresh — BUT read the garbage file FIRST: its
`paginationDisplayMode === 'pages'` numbered-buttons+ellipsis implementation
is June browser-verified; preserve that rendering logic (restructured to fit
MRT's overall shape) rather than reinventing.

## Resolved decisions

- Interface mirrors MRT locally:
  `extends Partial<DivProps & { SelectProps?: Partial<React.ComponentPropsWithRef<'select'>>;
  disabled?: boolean; rowsPerPageOptions?: {label;value}[]|number[];
  showRowsPerPage?: boolean }> { position?: 'bottom'|'top'; table }`
  (matches the converted `srtPaginationProps` incl. the preserved
  showFirstButton/showLastButton — destructure them with the
  `showFirstLastPageButtons` defaults exactly as MRT).
- `useTheme` + `flipIconStyles(theme)` dropped → `rtl:rotate-180` class on
  the four nav icons (modern CSS-only rtl flip; Note).
- Rows-per-page select = native `<select>` ALWAYS (MRT's mobile
  `SelectProps.native` toggle becomes moot — dropped-construct comment; the
  isMobile/native block is commented + Note). Classes:
  `h-8 rounded-md border border-input bg-transparent px-2 text-sm` +
  `{...SelectProps}` spread (user wins), `disabled={disabled}`,
  `aria-label={localization.rowsPerPage}`, `id={'srt-rows-per-page-'+id}`,
  onChange `table.setPageSize(+event.target.value)`, value pageSize. Options
  map verbatim (label/value extraction; `SelectProps?.children ??` fallback
  kept; only `<option>` branch — MenuItem branch is the dropped construct).
  InputLabel → `<label htmlFor=... className="text-sm">`.
- Root Box → div, class hook `SrtTablePagination-root` (Mui-→Srt-), cva
  `tablePaginationVariants` base `relative z-[2] flex flex-wrap items-center
  gap-2 justify-self-end px-2 py-3 justify-center md:justify-between` (maps
  responsive justifyContent) + conditional `mt-12` when `position === 'top' &&
  enableToolbarInternalActions` (3rem).
- All counting math verbatim (totalRowCount, numberOfPages,
  showFirstLastPageButtons, firstRowIndex, lastRowIndex, disableBack,
  disableNext), destructure-with-defaults verbatim.
- `paginationDisplayMode === 'pages'` branch: preserve the June numbered
  implementation (page buttons + ellipsis) driven by MRT's inputs (count,
  page pageIndex+1, onChange setPageIndex(n-1), disabled, showFirst/Last,
  restPaginationProps spread on the container, registry icons for
  first/last/prev/next). MUI Pagination/PaginationItem = dropped constructs.
- `'default'` branch verbatim: span (Typography →
  `mx-1 min-w-[8ch] text-center text-sm`) with the exact
  toLocaleString(localization.language) range string; buttons group div
  `flex gap-1`... MRT `<Box gap="xs">` is odd MUI — map to `flex` container;
  four SRT_Tooltip-wrapped icon buttons (tooltipProps = SRT_Tooltip's own
  defaults; wrap the button in `<span>` like MRT so disabled buttons still
  anchor tooltips), icon-button reset classes per ColumnActionsButton
  precedent (`inline-flex h-8 w-8 items-center justify-center rounded-md
  disabled:opacity-50 disabled:pointer-events-none hover:bg-accent`),
  aria-labels + disabled + onClick (firstPage/previousPage/nextPage/lastPage)
  verbatim, registry icons + rtl:rotate-180, `size="small"` dropped comment.
- `: null` tail (paginationDisplayMode 'custom') verbatim.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/toolbar/SRT_TablePagination.tsx`
--max-warnings=0. Only this file. No core, no git.
