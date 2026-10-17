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

### [ ] api/column-options

- synced, name map only; ColumnOptionsTable + Source, all 63 names in SRT_ColumnDef (tsc pass in prop-tables mode)
- MRT-only facts left: mui.com links in the data (shadcn/ui TableCell API etc.)
- commit 6a584ec (infra 5543ae8)

### [ ] api/index

- synced, name map only (TableOfContentsList variant="heading" over routes)
- commit 34431c1

### [ ] api/mrt-components

- written to api/srt-components (OUTPUT_PATHS); GitHub source links restored to MRT repo via PAGE_RULES
- MRT-only facts left: "previous versions / version 2" prose, `<SRT_TablePaper />` (library has SRT_TableLayout), `<SRT_FilterFilterRangeFields />` (MRT typo of FilterRangeFields)
- commit 34431c1

### [ ] api/mrt-hooks

- written to api/srt-hooks (OUTPUT_PATHS); GitHub links restored to MRT repo; all 6 useSRT_* hooks exist in the library
- MRT-only facts left: "New in v2.2.0" notes
- commit 34431c1

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

### [ ] getting-started/index

- synced, name map only
- commit 34431c1

### [ ] getting-started/install

### [ ] getting-started/usage

### [ ] index

- synced, name map only (re-sync diff is quote style only; left as committed)

## Cluster B

### [ ] guides/accessibility

### [ ] guides/aggregation

### [ ] guides/async-loading

### [ ] guides/best-practices

### [ ] guides/cell-actions

### [ ] guides/click-to-copy

### [ ] guides/column-actions

### [ ] guides/column-filtering

### [ ] guides/column-grouping

### [ ] guides/column-hiding

### [ ] guides/column-ordering-dnd

### [ ] guides/column-pinning

### [ ] guides/column-resizing

### [ ] guides/column-size

### [ ] guides/customize-components

### [ ] guides/customize-icons

### [ ] guides/data-columns

### [ ] guides/density-toggle

### [ ] guides/detail-panel

### [ ] guides/display-columns

## Cluster C

### [ ] guides/editing

### [ ] guides/expanding-sub-rows

### [ ] guides/full-screen-toggle

### [ ] guides/global-filtering

### [ ] guides/index

### [ ] guides/localization

### [ ] guides/memoization

### [ ] guides/pagination

### [ ] guides/row-actions

### [ ] guides/row-numbers

### [ ] guides/row-ordering-dnd

### [ ] guides/row-pinning

### [ ] guides/row-selection

### [ ] guides/sorting

### [ ] guides/state-management

### [ ] guides/sticky-header

### [ ] guides/table-event-listeners

### [ ] guides/toolbar-customization

### [ ] guides/virtualization

## Cluster D

### [ ] examples/advanced

### [ ] examples/aggregation-and-grouping

### [ ] examples/basic

### [ ] examples/chart-detail-panel

### [ ] examples/column-grouping

### [ ] examples/column-ordering

### [ ] examples/column-pinning

### [ ] examples/column-virtualization

### [ ] examples/custom-filter-ui

### [ ] examples/custom-headless

### [ ] examples/customized-grouping

### [ ] examples/detail-panel

### [ ] examples/dynamic-columns

### [ ] examples/editing-crud

### [ ] examples/editing-crud-inline-cell

### [ ] examples/editing-crud-inline-row

### [ ] examples/editing-crud-inline-table

### [ ] examples/editing-crud-tree

### [ ] examples/expanding-tree

### [ ] examples/expanding-tree-flat-parse

### [ ] examples/export-csv

### [ ] examples/export-pdf

## Cluster E

### [ ] examples/faceted-values

### [ ] examples/filter-switching

### [ ] examples/filter-variants

### [ ] examples/index

### [ ] examples/infinite-scrolling

### [ ] examples/lazy-detail-panel

### [ ] examples/lazy-sub-rows

### [ ] examples/minimal

### [ ] examples/popover-filters

### [ ] examples/react-query

### [ ] examples/remote

### [ ] examples/row-dragging

### [ ] examples/row-ordering

### [ ] examples/row-virtualization

### [ ] examples/static-row-pinning

### [ ] examples/sticky-header

### [ ] examples/sticky-row-pinning

### [ ] examples/sticky-row-selection

### [ ] examples/virtualized

## Cluster E (home page)

### [ ] home (pages/index.tsx)

## Library gaps

- api/srt-components: `SRT_TablePaper` (SRT has `SRT_TableLayout`); `SRT_FilterFilterRangeFields` is MRT's typo, library has `SRT_FilterRangeFields`
- api/table-options: `srtTablePaperProps` (SRT uses `srtTableLayoutProps`)
