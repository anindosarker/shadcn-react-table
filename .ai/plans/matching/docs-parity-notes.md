# Docs parity tracker

Plan: `.ai/plans/docs-site.md`. One entry per MRT page, ticked by the owner only.
Under each entry at most 3 bullets: examples ported, library gaps, commit. Equivalent pages
synced with the name map only get `- synced, name map only`.

## Cluster A

### [ ] api/cell-instance-apis

- synced, name map only; CellInstanceAPIsTable + CellInstanceAPIsSource (prop-table-source.tsx), all 9 names in SRT_Cell
- commit 6d4e244 (infra 5543ae8)

### [ ] api/column-instance-apis

- synced, name map only; ColumnInstanceAPIsTable + Source, all 56 names in SRT_Column
- commit 6d4e244 (infra 5543ae8)
- MRT-only facts removed

### [ ] api/column-options

- synced, name map only; ColumnOptionsTable + Source, all 63 names in SRT_ColumnDef (tsc pass in prop-tables mode)
- MRT-only facts left: mui.com links in the data (shadcn/ui TableCell API etc.)
- commit 6a584ec (infra 5543ae8)
- MRT-only facts removed

### [ ] api/index

- synced, name map only (TableOfContentsList variant="heading" over routes)
- commit 34431c1

### [ ] api/mrt-components

- written to api/srt-components (OUTPUT_PATHS); GitHub source links restored to MRT repo via PAGE_RULES
- MRT-only facts left: "previous versions / version 2" prose, `<SRT_TablePaper />` (library has SRT_TableLayout), `<SRT_FilterFilterRangeFields />` (MRT typo of FilterRangeFields)
- commit 34431c1
- MRT-only facts removed

### [ ] api/mrt-hooks

- written to api/srt-hooks (OUTPUT_PATHS); GitHub links restored to MRT repo; all 6 useSRT_* hooks exist in the library
- MRT-only facts left: "New in v2.2.0" notes
- commit 34431c1
- MRT-only facts removed

### [ ] api/row-instance-apis

- synced, name map only; RowInstanceAPIsTable + Source, all 39 names in SRT_Row
- commit 6d4e244 (infra 5543ae8)

### [ ] api/state-options

- synced, name map only; StateOptionsSource added (table existed)
- commit 6a584ec (infra 5543ae8)

### [ ] api/table-instance-apis

- synced, name map only; TableInstanceAPIsTable + Source, all 138 names in SRT_TableInstance; MRT header "State Option" kept verbatim
- commit 6d4e244 (infra 5543ae8)

### [ ] api/table-options

- synced, name map only; TableOptionsSource added (table existed); unmapped srtTablePaperProps (UnmappedTableOption)
- MRT-only facts left: mui.com links in the data
- commit 6a584ec (infra 5543ae8)
- MRT-only facts removed

### [ ] getting-started/index

- synced, name map only
- commit 34431c1
- MRT-only facts removed

### [ ] getting-started/install
- MRT-only facts removed

### [ ] getting-started/usage
- MRT-only facts removed

### [ ] index

- synced, name map only (re-sync diff is quote style only; left as committed)

## Cluster B
- MRT-only facts removed

### [ ] guides/accessibility
- synced; no examples. MRT-only prose left: `sx` focus-style snippets (`sx:` keys in code blocks).
- MRT-only facts removed

### [ ] guides/aggregation
- examples: aggregation-and-grouping, aggregation-multi (Box/Stack to span/div, chip `color` to className)
- library bug: `enableGrouping: true` logs "Can't perform a React state update on a component that hasn't mounted yet" (console error on page)
- MRT-only facts removed

### [ ] guides/async-loading
- examples: loading, linear-progress, react-query (devtools lazy import dropped: `@tanstack/react-query-devtools` not installed)
- MRT-only facts removed

### [ ] guides/best-practices
- synced; no examples. MRT-only prose left: `npm-check-updates` line lists `@mui/*` and `@emotion/*`; `sx: { fontSize }` snippet
- MRT-only facts removed

### [ ] guides/cell-actions
- examples: enable-cell-actions (SRT_ActionMenuItem, lucide Mail/UserX)
- MRT-only facts removed

### [ ] guides/click-to-copy
- examples: enable-click-to-copy (`startIcon` dropped: SRT_CopyButton owns its children). MRT-only prose left: `sx: { width }` snippet
- MRT-only facts removed

### [ ] guides/column-actions
- examples: disable-column-actions, custom-column-actions, column-actions-space (`.Mui-TableHeadCell-Content` selector to `[&>div]:justify-between`)
- MRT-only facts removed

### [ ] guides/column-filtering
- examples: alternate-column-filtering, customize-filter-variants, customize-filter-modes, customize-filter-components, enable-filter-facet-values (date pickers to `Input type="date"`; slider `marks`/`valueLabelFormat` dropped)
- name map: MUI `Box` import dropped, `<Box component="span" color="warning.main">` to a Tailwind span (also used by global-filtering). MRT-only prose left: `theme.palette.warning.main`
- library bug: SRT_FilterTextField text variant passes `value={filterValue}` that becomes undefined, "controlled input to be uncontrolled" (console error on page)
- MRT-only facts removed

### [ ] guides/column-grouping
- examples: enable-column-grouping (RadioGroup from ui), customize-remove-column-grouping (theme colors to CSS vars)
- library bug: same `enableGrouping` setState-in-render console error as guides/aggregation
- MRT-only facts removed

### [ ] guides/column-hiding
- examples: disable-column-hiding. Prose says "import ... from material react table" (lowercase, not in name map)
- MRT-only facts removed

### [ ] guides/column-ordering-dnd
- examples: enable-column-ordering
- MRT-only facts removed

### [ ] guides/column-pinning
- examples: enable-column-pinning
- MRT-only facts removed

### [ ] guides/column-resizing
- examples: enable-column-resizing, localization-i18n-fa (ThemeProvider/faIR dropped, rtl wrapper kept; folder also used by C's LocaleExamples)
- MRT-only facts removed

### [ ] guides/column-size
- synced; no examples
- MRT-only facts removed

### [ ] guides/customize-components
- examples: mui-theme (ThemeProvider to a div setting shadcn CSS vars; tooltip/switch overrides dropped, portals), customize-table-styles (`mrtTheme` dropped, `baseBackgroundColor` as a CSS var; `muiTablePaperProps` to `srtTableLayoutProps` via name map)
- MRT-only prose left: `mui...Props` (dotted form not in name map), `sx`/Emotion/Pigment CSS sections, mui.com links, "shadcn/ui V6"
- library gap: `srtTheme` (MRT `mrtTheme`) not declared; `srtTablePaperProps` has no counterpart beyond `srtTableLayoutProps`
- MRT-only facts removed

### [ ] guides/customize-icons
- examples: font-awesome-icons. MRT-only prose left: "Material Icons" default, mui.com icons link
- MRT-only facts removed

### [ ] guides/data-columns
- examples: column-alignment. Prose keeps a react-router `<Link>` snippet
- MRT-only facts removed

### [ ] guides/density-toggle
- examples: disable-density-toggle
- MRT-only facts removed

### [ ] guides/detail-panel
- examples: alternate-detail-panel (local `useMediaQuery` hook: drives table options, no Tailwind equivalent), chart-detail-panel (recharts LineChart, `Math.random` to seeded faker), enable-detail-panel-virtualized, enable-detail-panel-conditionally, lazy-detail-panel (devtools dropped)
- MRT-only prose left: "shadcn/ui X Charts" + mui.com link, `sx` snippets
- MRT-only facts removed

### [ ] guides/display-columns
- examples: customize-display-columns

## Cluster C
- MRT-only facts removed

### [ ] guides/editing
- MRT-only facts removed

### [ ] guides/expanding-sub-rows

### [ ] guides/full-screen-toggle
- MRT-only facts removed

### [ ] guides/global-filtering
- MRT-only facts removed

### [ ] guides/index

### [ ] guides/localization
- MRT-only facts removed

### [ ] guides/memoization
- MRT-only facts removed

### [ ] guides/pagination
- MRT-only facts removed

### [ ] guides/row-actions
- MRT-only facts removed

### [ ] guides/row-numbers
- MRT-only facts removed

### [ ] guides/row-ordering-dnd
- MRT-only facts removed

### [ ] guides/row-pinning
- MRT-only facts removed

### [ ] guides/row-selection
- MRT-only facts removed

### [ ] guides/sorting
- MRT-only facts removed

### [ ] guides/state-management
- MRT-only facts removed

### [ ] guides/sticky-header
- MRT-only facts removed

### [ ] guides/table-event-listeners
- MRT-only facts removed

### [ ] guides/toolbar-customization
- MRT-only facts removed

### [ ] guides/virtualization

## Cluster D
- MRT-only facts removed

### [ ] examples/advanced
- examples: BasicExamples group (basic, minimal, advanced, custom-headless); advanced: date pickers dropped, `muiPaginationProps` color/shape/variant and `muiSearchTextFieldProps` size/variant dropped (no shadcn twin), MenuItem to DropdownMenuItem, chips to Tailwind colours
- MRT-only left: storybook link (domain rewritten by the map, dead)
- MRT-only facts removed

### [ ] examples/aggregation-and-grouping
- examples: ExpandingExamples group; aggregation-and-grouping (`muiToolbarAlertBannerChipProps.color` dropped, plain button props)
- group: MRT interleaves link tabs (Lazy Sub-Rows, Lazy Detail Panel, Tree Editing) between example tabs; ExampleTabs puts links last
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/basic
- examples: BasicExamples group
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/chart-detail-panel
- examples: chart-detail-panel (@mui/x-charts LineChart to a minimal recharts LineChart, same data)
- page rule: "shadcn/ui X Charts" prose and mui.com link to Recharts; frontmatter description still says "shadcn/ui X Charts" (rules apply to the body only)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/column-grouping
- examples: enable-column-grouping (RadioGroup for grouped column mode)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/column-ordering
- examples: DraggingExamples group; enable-column-ordering, enable-row-ordering, enable-row-dragging (`muiTablePaperProps` to `srtTableLayoutProps`, Typography colours to Tailwind)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/column-pinning
- examples: StickyPinningExamples group; enable-sticky-header, enable-column-pinning, enable-row-pinning-sticky/static/select (`sx.maxHeight` to className, row `sx.height` to style)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/column-virtualization
- examples: VirtualizedExamples group; virtualized, enable-row-virtualization, enable-column-virtualization (seeded faker; column `size` via faker instead of Math.random for SSR), infinite-scrolling (react-query devtools block dropped, package not installed)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/custom-filter-ui
- examples: FilteringExamples group; custom-column-filtering-ui (`useSRT_MediaQuery` path import, filter container `in` to `open`, `muiFilterTextFieldProps.label` to `placeholder`), customize-filter-variants, enable-filter-facet-values, customize-filter-modes, alternate-column-filtering
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/custom-headless
- examples: custom-headless (MUI Table parts to shadcn Table, `flexRender` from the SRT barrel, `muiPaginationProps.variant` dropped)
- MRT-only left: storybook link with `www.Material-react-table.dev` (capital M, missed by the map)
- MRT-only facts removed

### [ ] examples/customized-grouping
- examples: customize-remove-column-grouping
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/detail-panel
- examples: enable-detail-panel-conditionally
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/dynamic-columns
- examples: RemoteFetchingExamples group; dynamic-columns, react-query, lazy-detail-panel, lazy-sub-rows (IconButton+Tooltip to Button ghost icon + SRT_Tooltip, `muiToolbarAlertBannerProps.color` to className, devtools block dropped), remote
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/editing-crud
- examples: EditingCRUDExamples group; editing-crud-modal, -row, -cell, -table, -tree (Dialog parts, Tooltip to SRT_Tooltip, `muiEditTextFieldProps` error/helperText/select to `aria-invalid` only, alert banner colour to className, devtools block dropped)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/editing-crud-inline-cell
- examples: editing-crud-cell (see editing-crud)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/editing-crud-inline-row
- examples: editing-crud-row (see editing-crud)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/editing-crud-inline-table
- examples: editing-crud-table (see editing-crud)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/editing-crud-tree
- examples: editing-crud-tree (see editing-crud; row depth shading via `bg-muted` steps)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/expanding-tree
- examples: expanding-tree-expanded
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/expanding-tree-flat-parse
- examples: expanding-tree-flat-parse
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/export-csv
- examples: DataExportExamples group; export-to-csv (export-to-csv verbatim, Button + lucide DownloadIcon)
- MRT-only left: storybook link
- MRT-only facts removed

### [ ] examples/export-pdf
- examples: export-to-pdf (jspdf + jspdf-autotable verbatim; file name `srt-pdf-example.pdf`); title map rule added for " - Material React Table Docs"
- MRT-only left: storybook link

## Cluster E
- MRT-only facts removed

### [ ] examples/faceted-values
- MRT-only facts removed

### [ ] examples/filter-switching
- MRT-only facts removed

### [ ] examples/filter-variants
- MRT-only facts removed

### [ ] examples/index

### [ ] examples/infinite-scrolling
- MRT-only facts removed

### [ ] examples/lazy-detail-panel
- MRT-only facts removed

### [ ] examples/lazy-sub-rows
- MRT-only facts removed

### [ ] examples/minimal
- MRT-only facts removed

### [ ] examples/popover-filters
- MRT-only facts removed

### [ ] examples/react-query
- MRT-only facts removed

### [ ] examples/remote
- MRT-only facts removed

### [ ] examples/row-dragging
- MRT-only facts removed

### [ ] examples/row-ordering
- MRT-only facts removed

### [ ] examples/row-virtualization
- MRT-only facts removed

### [ ] examples/static-row-pinning
- MRT-only facts removed

### [ ] examples/sticky-header
- MRT-only facts removed

### [ ] examples/sticky-row-pinning
- MRT-only facts removed

### [ ] examples/sticky-row-selection
- MRT-only facts removed

### [ ] examples/virtualized

## Cluster E (home page)
- MRT-only facts removed

### [ ] home (pages/index.tsx)

## Library gaps

- `srtTheme` (MRT `mrtTheme`): commented out in types.ts; customize-table-styles expresses `baseBackgroundColor` with a CSS var instead (B)
- `srtTablePaperProps`: no Paper in SRT; mapped to `srtTableLayoutProps` in the name map (B)
- `enableGrouping: true` logs "Can't perform a React state update on a component that hasn't mounted yet" in dev (aggregation, column-grouping pages) (B)
- `SRT_FilterTextField` text variant: `value={filterValue}` becomes undefined, React "controlled input to be uncontrolled" warning (column-filtering page) (B)
- `srtFilterSliderProps`: no `marks`/`valueLabelFormat` on the shadcn Slider (customize-filter-variants, enable-filter-facet-values) (B)
- api/srt-components: `SRT_TablePaper` (SRT has `SRT_TableLayout`); `SRT_FilterFilterRangeFields` is MRT's typo, library has `SRT_FilterRangeFields`
- api/table-options: `srtTablePaperProps` (SRT uses `srtTableLayoutProps`)
- `srtToolbarAlertBannerChipProps` is plain button props, no `color` (aggregation-and-grouping) (D)
- `srtToolbarAlertBannerProps` no `color`; `color: 'error'` becomes `className` (react-query, infinite-scrolling, lazy-*, dynamic-columns, editing-crud-*) (D)
- `srtEditTextFieldProps` is plain input props: no `error`, `helperText`, `select`; validation text not rendered inline (editing-crud-*) (D)
- `srtFilterTextFieldProps` no `label`, only `placeholder` is read (custom-column-filtering-ui) (D)
- `SRT_Tooltip` and `useSRT_MediaQuery` not exported from the barrel (path imports in custom-column-filtering-ui, dynamic-columns, editing-crud-*) (D)
- `srtTableBodyRowProps` no `hover` flag (minimal: hover overlay neutralised with a className) (D)
- `srtPaginationProps` no `color`/`shape`/`variant`, `srtSearchTextFieldProps` no `size`/`variant` (advanced, custom-headless; dropped) (D)
- MRT-only facts removed
