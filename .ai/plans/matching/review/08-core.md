### Core package

Verification review of the headless core package `packages/shadcn-react-table-core/src/` against the vendored SoT `packages/material-react-table/src/`. Both trees are 1:1 in layout. SRT adds two intentional core-only files (`useSRT_ProgressAnimation`, `srtHtmlProps.utils`). Method: per-file normalized diff (MRT↔SRT / mui*↔srt* / theme-token names folded out) so only real logic deltas surface; values for sizing/enable flags compared literally. Locale files reviewed as a group, not per-file.

### [ ] index.ts : index.ts
- `note` SRT core index does NOT re-export `./components/*` — correct, components live in the UI package; this is the core/UI split, not a gap.
- `parity-ok` SRT core exports the headless surface: 7 `getSRT_*ColumnDef`, all hooks, `useShadcnReactTable`, utils (incl. `srtHtmlProps.utils`, `style.utils`, `utils`), `fns/`, `icons`, `types`.
- `note` SRT core additionally re-exports all 38 `./locales/*` (MRT exposed locales from a different entrypoint) — additive, not a parity issue.

### [ ] types.ts : types.ts
- `parity-ok` All 40 MRT `mui*Props` table+columnDef option keys have matching `srt*Props` (BottomToolbar…TopToolbar). None missing.
- `parity-ok` All 17 `render*` callbacks present; all 32 `enable*` option flags present; `icons?:` option present (`Partial<SRT_Icons>`).
- `parity-ok` All 49 MRT exported types/interfaces present (normalized); all `MRT_*State` aliases (Density, ColumnFilters, Sorting, Pagination, StatefulTableOptions, …) mirrored.
- `note` SRT adds 2 extra props (`srtTableLayoutProps`, `srtToolbarDropZoneProps`) and 12 extra types — HTMLProps context machinery (`*HTMLPropsContext`, `HTMLProps`, `HTMLPropsValue`, `LayoutDivProps`, `Circular/LinearProgressProps`). These back the headless html-props/layout approach. Additive deviation, no MRT coverage lost.

### [ ] icons.ts : icons.ts
- `parity-ok` All 34 keys of `MRT_Default_Icons` present in `SRT_Default_Icons` (none missing), mapped MUI→lucide-react (e.g. ArrowDownwardIcon→ArrowDown, DensitySmallIcon→Rows4, PushPinIcon→Pin). `SRT_Icons` type = `Record<keyof typeof SRT_Default_Icons, any>` mirrors MRT.
- `parity-ok` Wired as the default `icons` in `useSRT_TableOptions` (references `SRT_Default_Icons`), same as MRT references `MRT_Default_Icons`.
- `note` MRT's distinct `FilterAltIcon` and `FilterListIcon` both map to lucide `Filter` in SRT — cosmetic only (two MUI glyphs collapsed to one), no logic impact.
- `note` Task brief said 33 keys; actual count is 34. All accounted for.

### [ ] fns/aggregationFns.ts : fns/aggregationFns.ts
- `parity-ok` Normalized-identical (4 lines, re-export of TanStack aggregation fns). Same export set.

### [ ] fns/filterFns.ts : fns/filterFns.ts
- `parity-ok` Normalized-identical (197 lines). All filter predicates (contains, fuzzy, startsWith, between, etc.) byte-equal after rename.

### [ ] fns/sortingFns.ts : fns/sortingFns.ts
- `parity-ok` Normalized-identical (34 lines). Same export set.

### [ ] utils/cell.utils.ts : utils/cell.utils.ts
- `parity-ok` Normalized-identical (235 lines). No commented-out MUI/theme blocks (verified 0) — no hidden gaps.

### [ ] utils/column.utils.ts : utils/column.utils.ts
- `parity-ok` Normalized-identical (210 lines). Column ordering/leaf/default-column logic intact. 0 commented MUI refs.

### [ ] utils/displayColumn.utils.ts : utils/displayColumn.utils.ts
- `parity-ok` Normalized-identical (153 lines). Display-column show/order/builtin logic intact. 0 commented MUI refs.

### [ ] utils/row.utils.ts : utils/row.utils.ts
- `parity-ok` Normalized-identical (261 lines). Row flattening/expansion/selection helpers intact. 0 commented MUI refs.

### [ ] utils/style.utils.ts : utils/style.utils.ts
- `deviation` `getCommonPinnedCellStyles` intentionally commented out (SRT L79, and its call site L161 in `getCommonMRTCellStyles`). MUI sticky-pinned styling moved to UI layer — as noted in task brief. Pinned-cell positioning styles are NOT computed in core.
- `parity-ok` `parseCSSVarId` and `getCommonTooltipProps` are RESTORED and active (L5, L23); each also appears once more as a commented-out original MRT version (L42, L232) — not a duplicate export, just retained reference. `getCommonTooltipProps` returns Radix-shaped `{ delayDuration: 1000, side }` (mirrors MRT's 1000ms enterDelay).
- `parity-ok` `getMRTTheme`, `getCommonMRTCellStyles`, `flipIconStyles`, `commonCellBeforeAfterStyles`, `getCommonToolbarStyles` all present.
- `note` 240 vs 214 lines — delta is the added tooltip type aliases (`SRT_TooltipSide`, `SRT_CommonTooltipProps`) + the commented originals.

### [ ] utils/tanstack.helpers.ts : utils/tanstack.helpers.ts
- `parity-ok` 65 lines, logic identical. `flexRender`, `createRow` unchanged; `createMRTColumnHelper`→`createSRTColumnHelper` (expected rename only).

### [ ] utils/utils.ts : utils/utils.ts
- `parity-ok` Normalized-identical (24 lines).

### [ ] utils/virtualization.utils.ts : utils/virtualization.utils.ts
- `parity-ok` Normalized-identical (25 lines).

### [ ] utils/srtHtmlProps.utils.ts : (SRT-only)
- `note` No MRT counterpart. Exports `parseSRT_HtmlProps`, `mergeSRT_HtmlProps` (105 lines) — supports the SRT html-props deviation in place of MUI's slotProps. Additive; nothing to compare against.

### [ ] hooks/useShadcnReactTable.ts : hooks/useMaterialReactTable.ts
- `parity-ok` Logic identical; the only diff is import formatting (SRT single-line `import { SRT_RowData, SRT_TableInstance, SRT_TableOptions }` vs MRT multi-line). Same body.

### [ ] hooks/useSRT_TableInstance.ts : hooks/useMRT_TableInstance.ts
- `parity-ok` 318 lines, logic identical. Only delta: MRT `tablePaperRef` → SRT `tableLayoutRef` (ref decl L64 + assembled-instance field L271). Consistent SRT "Paper→Layout" rename; all other refs, state wiring, and instance assembly match.

### [ ] hooks/useSRT_TableOptions.ts : hooks/useMRT_TableOptions.ts
- `deviation` MUI `useTheme()` + `getMRTTheme` default-computation commented out (S102/S117/S127) — expected, shadcn uses CSS vars/Tailwind not the MUI theme. `mrtTheme` default not set.
- `deviation` `columnResizeDirection` default-from-theme fallback commented out (S151-153: `if (!columnResizeDirection) columnResizeDirection = theme.direction || 'ltr'`). MRT defaults it to `'ltr'` (with RTL support); SRT leaves it undefined unless the consumer supplies it. Behavioral gap for resize-direction/RTL default — flag.
- `parity-ok` `columnResizeDirection` is still destructured (L54) and passed through (L183); only the default is lost.
- `parity-ok` `layoutMode` default logic intact: `layoutMode || (enableColumnResizing ? 'grid-no-grow' : 'semantic')` + semantic+virtualization override — matches MRT.
- `parity-ok` All other ~63 default-option assignments present; icons default wired to `SRT_Default_Icons`.

### [ ] hooks/useSRT_Effects.ts : hooks/useMRT_Effects.ts
- `parity-ok` Normalized-identical (107 lines). All effects (global filter, density, scroll) intact.

### [ ] hooks/useSRT_Rows.ts : hooks/useMRT_Rows.ts
- `parity-ok` Normalized-identical (45 lines). Row-model derivation logic intact.

### [ ] hooks/useSRT_ColumnVirtualizer.ts : hooks/useMRT_ColumnVirtualizer.ts
- `parity-ok` Normalized-identical (125 lines). Virtualizer range/overscan/draggingColumn logic intact.

### [ ] hooks/useSRT_RowVirtualizer.ts : hooks/useMRT_RowVirtualizer.ts
- `parity-ok` Normalized-identical (89 lines).

### [ ] hooks/useSRT_ProgressAnimation.ts : (SRT-only)
- `note` No MRT counterpart. Exports `SRT_ProgressAnimationStrategy`, `SRT_ProgressAnimationOptions`, `useSRT_ProgressAnimation` (108 lines) — SRT-only progress animation helper (replaces MUI LinearProgress/CircularProgress animation behavior). Additive.

### [ ] hooks/display-columns/getSRT_RowActionsColumnDef.tsx : getMRT_RowActionsColumnDef.tsx
- `parity-ok` id, header, `size: 70` match exactly.
- `note` Cell/Header JSX dropped (accepted headless split).

### [ ] hooks/display-columns/getSRT_RowDragColumnDef.tsx : getMRT_RowDragColumnDef.tsx
- `parity-ok` id, header, `size: 60`, `grow: false` match exactly. Headless split accepted.

### [ ] hooks/display-columns/getSRT_RowExpandColumnDef.tsx : getMRT_RowExpandColumnDef.tsx
- `parity-ok` Size heuristic preserved: grouped/detail-panel/expand-all → `defaultColumn?.size ?? 180` (SRT L35-37 mirrors MRT L80-82). This is the load-bearing logic.
- `deviation` MRT's inline `muiTableBodyCellProps`/`muiTableHeadCellProps: alignProps` (cell alignment) NOT carried to SRT columnDef. Headless split — but note this is cell-styling, not just Cell render; alignment must be reproduced in the UI body/head cell renderer. SRT documents this in a header comment (L14-18).

### [ ] hooks/display-columns/getSRT_RowNumbersColumnDef.tsx : getMRT_RowNumbersColumnDef.tsx
- `parity-ok` id, header, `size: 50`, `grow: false` match exactly.

### [ ] hooks/display-columns/getSRT_RowPinningColumnDef.tsx : getMRT_RowPinningColumnDef.tsx
- `parity-ok` id, header, `size: 60`, `grow: false` match exactly.

### [ ] hooks/display-columns/getSRT_RowSelectColumnDef.tsx : getMRT_RowSelectColumnDef.tsx
- `parity-ok` id, header, `grow: false`, `size: enableSelectAll ? 60 : 70` (conditional sizing) match exactly.

### [ ] hooks/display-columns/getSRT_RowSpacerColumnDef.tsx : getMRT_RowSpacerColumnDef.tsx
- `parity-ok` id, `size: 0`, `grow: true` match exactly.
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
