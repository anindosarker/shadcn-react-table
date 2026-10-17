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
- synced; no examples. MRT-only prose left: `sx` focus-style snippets (`sx:` keys in code blocks).

### [ ] guides/aggregation
- examples: aggregation-and-grouping, aggregation-multi (Box/Stack to span/div, chip `color` to className)
- library bug: `enableGrouping: true` logs "Can't perform a React state update on a component that hasn't mounted yet" (console error on page)

### [ ] guides/async-loading
- examples: loading, linear-progress, react-query (devtools lazy import dropped: `@tanstack/react-query-devtools` not installed)

### [ ] guides/best-practices
- synced; no examples. MRT-only prose left: `npm-check-updates` line lists `@mui/*` and `@emotion/*`; `sx: { fontSize }` snippet

### [ ] guides/cell-actions
- examples: enable-cell-actions (SRT_ActionMenuItem, lucide Mail/UserX)

### [ ] guides/click-to-copy
- examples: enable-click-to-copy (`startIcon` dropped: SRT_CopyButton owns its children). MRT-only prose left: `sx: { width }` snippet

### [ ] guides/column-actions
- examples: disable-column-actions, custom-column-actions, column-actions-space (`.Mui-TableHeadCell-Content` selector to `[&>div]:justify-between`)

### [ ] guides/column-filtering
- examples: alternate-column-filtering, customize-filter-variants, customize-filter-modes, customize-filter-components, enable-filter-facet-values (date pickers to `Input type="date"`; slider `marks`/`valueLabelFormat` dropped)
- name map: MUI `Box` import dropped, `<Box component="span" color="warning.main">` to a Tailwind span (also used by global-filtering). MRT-only prose left: `theme.palette.warning.main`
- library bug: SRT_FilterTextField text variant passes `value={filterValue}` that becomes undefined, "controlled input to be uncontrolled" (console error on page)

### [ ] guides/column-grouping
- examples: enable-column-grouping (RadioGroup from ui), customize-remove-column-grouping (theme colors to CSS vars)
- library bug: same `enableGrouping` setState-in-render console error as guides/aggregation

### [ ] guides/column-hiding
- examples: disable-column-hiding. Prose says "import ... from material react table" (lowercase, not in name map)

### [ ] guides/column-ordering-dnd
- examples: enable-column-ordering

### [ ] guides/column-pinning
- examples: enable-column-pinning

### [ ] guides/column-resizing
- examples: enable-column-resizing, localization-i18n-fa (ThemeProvider/faIR dropped, rtl wrapper kept; folder also used by C's LocaleExamples)

### [ ] guides/column-size
- synced; no examples

### [ ] guides/customize-components
- examples: mui-theme (ThemeProvider to a div setting shadcn CSS vars; tooltip/switch overrides dropped, portals), customize-table-styles (`mrtTheme` dropped, `baseBackgroundColor` as a CSS var; `muiTablePaperProps` to `srtTableLayoutProps` via name map)
- MRT-only prose left: `mui...Props` (dotted form not in name map), `sx`/Emotion/Pigment CSS sections, mui.com links, "shadcn/ui V6"
- library gap: `srtTheme` (MRT `mrtTheme`) not declared; `srtTablePaperProps` has no counterpart beyond `srtTableLayoutProps`

### [ ] guides/customize-icons
- examples: font-awesome-icons. MRT-only prose left: "Material Icons" default, mui.com icons link

### [ ] guides/data-columns
- examples: column-alignment. Prose keeps a react-router `<Link>` snippet

### [ ] guides/density-toggle
- examples: disable-density-toggle

### [ ] guides/detail-panel
- examples: alternate-detail-panel (local `useMediaQuery` hook: drives table options, no Tailwind equivalent), chart-detail-panel (recharts LineChart, `Math.random` to seeded faker), enable-detail-panel-virtualized, enable-detail-panel-conditionally, lazy-detail-panel (devtools dropped)
- MRT-only prose left: "shadcn/ui X Charts" + mui.com link, `sx` snippets

### [ ] guides/display-columns
- examples: customize-display-columns

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

- `srtTheme` (MRT `mrtTheme`): commented out in types.ts; customize-table-styles expresses `baseBackgroundColor` with a CSS var instead (B)
- `srtTablePaperProps`: no Paper in SRT; mapped to `srtTableLayoutProps` in the name map (B)
- `enableGrouping: true` logs "Can't perform a React state update on a component that hasn't mounted yet" in dev (aggregation, column-grouping pages) (B)
- `SRT_FilterTextField` text variant: `value={filterValue}` becomes undefined, React "controlled input to be uncontrolled" warning (column-filtering page) (B)
- `srtFilterSliderProps`: no `marks`/`valueLabelFormat` on the shadcn Slider (customize-filter-variants, enable-filter-facet-values) (B)
- api/srt-components: `SRT_TablePaper` (SRT has `SRT_TableLayout`); `SRT_FilterFilterRangeFields` is MRT's typo, library has `SRT_FilterRangeFields`
- api/table-options: `srtTablePaperProps` (SRT uses `srtTableLayoutProps`)
