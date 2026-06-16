### table/ + modals/

Review of the table/ + modals/ + root cluster. SoT = MRT `packages/material-react-table/src/components/{table,modals}/` + root `MaterialReactTable.tsx`. SRT = `apps/test-shadcn/src/components/ui/shadcn-react-table/{table,modals}/` + root `ShadcnReactTable.tsx`. READ-ONLY verification, 1:1 port intent. All [ ] left unchecked for the lead.

(Note: a second SRT copy of these files lives under `packages/shadcn-react-table-cli/src/templates/shadcn-react-table/` — the CLI template. This review covers the `apps/test-shadcn` copy per the task spec; the lead should confirm the template copy stays in sync.)

### [ ] ShadcnReactTable.tsx : MaterialReactTable.tsx
- `parity-ok` — identical structure: `isTableInstanceProp` type guard, `table = props.table` vs `useShadcnReactTable(props)` branch (SRT line 29-34, MRT line 29-33), `Xor<TableInstanceProp, TableOptions>` props type. 1:1.
- `note` — SRT imports the hook + types from the `shadcn-react-table-core` package (line 1-7) rather than relative `../hooks` / `../types`; expected core/template split.
- `note` — SRT renders `<SRT_TableLayout>` (line 36) where MRT renders `<MRT_TablePaper>` — the renamed root child (see TableLayout pair below). Behaviorally equivalent root wrapper.
- `deviation` (cosmetic) — SRT uses `export default ShadcnReactTable` (line 39) vs MRT named `export const MaterialReactTable` (line 24). SRT adds an `eslint-disable rules-of-hooks` comment on the conditional hook call (line 32); MRT omits it. No runtime difference.

### [ ] SRT_Table.tsx : MRT_Table.tsx
- `parity-ok` — `columnSizeVars` useMemo is byte-identical in logic (SRT 51-62, MRT 43-53): same `--header-${parseCSSVarId(id)}-size` / `--col-...-size` keys, same dep array `[columns, columnSizing, columnSizingInfo, columnVisibility]`.
- `parity-ok` — `useSRT_ColumnVirtualizer(table)` instantiated and fed via `commonTableGroupProps` to head/body/footer (SRT 64-69) exactly as MRT's `useMRT_ColumnVirtualizer` (MRT 55-60).
- `parity-ok` — memoMode dispatch identical: `memoMode === 'table-body' || columnSizingInfo.isResizingColumn ? <Memo_..TableBody> : <..TableBody>` (SRT 85-89, MRT 76-80). renderCaption → `<caption>` and `layoutMode?.startsWith('grid') ? 'grid'` both present (SRT 78,83 / MRT 69,74).
- `deviation` — SRT applies styling via className `cn('w-full border-collapse text-sm', ...)` (line 76) instead of MRT's `sx` `borderCollapse:'separate'` + `position:'relative'` (MRT 67-72). SRT uses `border-collapse` (collapse) vs MRT `separate`, and SRT drops `position:relative` on the `<table>`. Verify sticky-header / column-resize visuals still work without `position:relative` and with `collapse`.
- `gap` — SRT omits `stickyHeader={enableStickyHeader || isFullScreen}` entirely (MRT line 64). MRT destructures `enableStickyHeader` + `isFullScreen`; SRT destructures neither. Sticky-header behavior must therefore be driven by container/CSS rather than the table element — confirm sticky header actually engages in SRT.
- `note` — SRT uses slot prop `srtTableProps` via `parseSRT_HtmlProps` (line 44,71) and drops MRT's `...rest`/`TableProps` passthrough (MRT 17,36-39,65). SRT also drops `muiTableProps` extra theme `sx` merge. Intentional per shadcn HTML-props model.

### [ ] SRT_TableContainer.tsx : MRT_TableContainer.tsx
- `parity-ok` — loading derivation identical: `showLoadingOverlay !== false && (isLoading || showLoadingOverlay)` (SRT 46-47, MRT 44-45). `useIsomorphicLayoutEffect` toolbar-height measurement (top+bottom offsetHeight) identical (SRT 51-63, MRT 56-68). createModalOpen/editModalOpen derivation identical (SRT 65-66, MRT 70-71).
- `parity-ok` — child render order + conditions match exactly: loading overlay → `<SRT_Table>` → `(createModalOpen||editModalOpen) && <SRT_EditRowModal open>` → `enableCellActions && actionCell && <SRT_CellActionMenu>` (SRT 99-104, MRT 103-108).
- `parity-ok` — maxHeight clamp preserved: SRT collapses MRT's two-layer (style `isFullScreen` calc + sx `enableStickyHeader` clamp) into one nested ternary (SRT 72-78): isFullScreen→`calc(100vh - Npx)`, else stickyHeader→`clamp(350px, calc(100vh - Npx), 9999px)`, else undefined. Same net values as MRT 87-101.
- `parity-ok` — `position:relative` + `overflow:auto` + `maxWidth:100%` preserved via className `'relative max-w-full overflow-auto'` (line 94) = MRT sx (97-99). `aria-busy={loading}` + `aria-describedby` ('srt-progress' vs 'mrt-progress') match (SRT 85-86, MRT 75-76).
- `note` — SRT uses `mergeSRT_HtmlProps` to compose its own style under user `srtTableContainerProps` so the height clamp survives (b wins per-key, SRT 70-81); equivalent to MRT spreading `tableContainerProps` last but with library-style protected. Reasonable adaptation.
- `deviation` — SRT drops the `tableContainerProps.ref` forwarding branch (MRT 81-84 forwards a user-supplied ref alongside `tableContainerRef`). SRT's ref callback only assigns `tableContainerRef.current` (SRT 87-91). User-supplied container refs won't be populated — minor, slot-prop edge case.

### [ ] SRT_TableLayout.tsx : MRT_TablePaper.tsx
- `parity-ok` — fullscreen styling fully mapped: MRT `position:'fixed', top/right/bottom/left:0, height/maxHeight:100dvh, width/maxWidth:100dvw, margin:0, padding:0, zIndex:modal` (MRT 52-66) → SRT cva `fixed inset-0 z-50 h-dvh w-screen rounded-none border-0 m-0` (line 27). Escape-to-exit-fullscreen onKeyDown identical (SRT 66-67, MRT 42).
- `parity-ok` — toolbar render slots + child order identical: `enableTopToolbar && (renderTopToolbar ?? <TopToolbar>)` → `<TableContainer>` → `enableBottomToolbar && (renderBottomToolbar ?? <BottomToolbar>)` (SRT 86-94, MRT 78-86).
- `parity-ok` — base styling mapped: MRT `overflow:'hidden'` + `transition:'all 100ms ease-in-out'` + baseBackgroundColor (MRT 70-74) → SRT cva base `relative overflow-hidden ... bg-background shadow transition-all duration-100` (line 22). MRT `elevation={2}` → SRT `shadow border rounded-md`.
- `deviation` — SRT introduces TWO slot props: `srtTableLayoutProps` (line 47,56) AND `srtTablePaperProps` (line 47,69), where MRT has a single `muiTablePaperProps`. `srtTablePaperProps` carries the onKeyDown/className merge; `srtTableLayoutProps` is spread as `divRest`. Lead should confirm the split is intentional and documented in core types.
- `deviation` — SRT adds `p-2` padding to the layout root (line 22). MRT Paper has no padding (padding:0 only in fullscreen). Visual deviation: SRT pads the table wrapper in non-fullscreen mode.
- `gap` — SRT omits the paper `ref` forwarding to user-supplied `paperProps.ref` (MRT 44-49). Explicitly TODO'd at SRT line 72 ("omitted the ref ... might add later"). Tracked, low risk.

### [ ] SRT_TableLoadingOverlay.tsx : MRT_TableLoadingOverlay.tsx
- `parity-ok` — overlay box mapped: MRT `position:absolute, inset 0, display:flex, alignItems/justifyContent:center, width:100%, maxHeight:100vh, zIndex:3, bg alpha(base,0.5)` (MRT 34-47) → SRT `absolute inset-0 z-[3] flex items-center justify-center bg-background/50 max-h-screen w-full` (line 30-31). 1:1.
- `parity-ok` — `circularProgressProps?.Component ?? <spinner>` escape hatch preserved (SRT 35, MRT 49); slot prop `srtCircularProgressProps` via parseFromValuesOrFunc (SRT 22-25) = MRT `muiCircularProgressProps` (MRT 27-30). id `srt-progress-${id}` vs `mrt-progress-${id}`, `aria-label={localization.noRecordsToDisplay}` both present.
- `deviation` — spinner is `LoaderCircleIcon` (lucide) with `animate-spin size={40}` (SRT 36-42) vs MUI `<CircularProgress>` (MRT 50-54). Expected icon-library swap.
- `note` — SRT spreads `circularProgressProps?.className` twice (overlay container line 32 AND spinner line 39), and also spreads `...circularProgressProps` onto the lucide icon (line 41) which forwards `className` a third time. The `id`/`size` set before the spread can be overridden by the spread; minor prop-precedence quirk, no functional break.
- `note` — trailing TODO block (lines 48-54) flags missing `srtSpinnerProps`, custom-Component support, theme bg integration. Awareness only; current behavior matches MRT.

### [ ] SRT_EditRowModal.tsx : MRT_EditRowModal.tsx
- `parity-ok` — create-vs-edit props layering preserved: `srtEditRowDialogProps` base + `creatingRow && srtCreateRowModalProps` override via mergeSRT_HtmlProps (SRT 50-55) = MRT `muiEditRowDialogProps` + `creatingRow && muiCreateRowModalProps` (MRT 43-48). `internalEditComponents` filter `columnDefType === 'data'` → `<EditCellTextField>` identical (SRT 68-75, MRT 50-59).
- `parity-ok` — render-content slots preserved exactly: `((creatingRow && renderCreateRowDialogContent?.({...})) || renderEditRowDialogContent?.({...})) ?? <default>` with `{internalEditComponents, row, table}` args (SRT 88-98, MRT 79-89).
- `parity-ok` — cancel/close behavior core matches: creatingRow → `onCreatingRowCancel` + `setCreatingRow(null)`, else `onEditingRowCancel` + `setEditingRow(null)`, then `row._valuesCache = {}` reset (SRT handleClose 57-66, MRT onClose 65-73). Triggered via shadcn `onOpenChange(nextOpen=false)` (SRT 80-82) vs MUI `onClose` (MRT 65).
- `gap` — SRT's `handleClose` does NOT forward a user-supplied close handler. MRT calls `dialogProps.onClose?.(event, reason)` as the last line of its onClose (MRT line 74); SRT has no equivalent forward of any `onClose`/close callback from `srtEditRowDialogProps`. If a consumer passes a close handler via slot props it will silently not fire. Real behavioral gap — flag for the lead.
- `deviation` — default layout uses shadcn `DialogHeader/DialogTitle/DialogFooter` + `<div className="flex w-full flex-col gap-8 pt-4">` (SRT 100-112) vs MRT `DialogTitle/DialogContent/Stack gap:32px pt:16px` + `DialogActions p:1.25rem` (MRT 91-109). `gap-8`=32px, `pt-4`=16px, `p-5`=1.25rem — values match. `sm:max-w-xs` (line 86) = MRT `fullWidth maxWidth="xs"` (MRT 63-64). Visually equivalent.
- `note` — SRT guards `row ? ...getAllCells() : []` (lines 68-75) which MRT does not (MRT assumes row non-null). Defensive; harmless since container only renders the modal when a row exists. `EditActionButtons variant="text"` preserved (SRT 111, MRT 108).

### Cross-cutting summary
- Root + all four table/ files + loading overlay + edit modal are faithful 1:1 ports. Naming (MRT_→SRT_, mui*Props→srt*Props), MUI→shadcn/lucide component swaps, and sx→className/cva conversions are consistent and behavior-preserving.
- Highest-priority items for the lead: (1) `gap` SRT_Table omits `stickyHeader`/`position:relative` — verify sticky header works; (2) `gap` SRT_EditRowModal does not forward a user `onClose` from slot props; (3) tracked-TODO ref omissions in TableLayout + dropped container ref forwarding.
- The CLI-template copy under `packages/shadcn-react-table-cli/...` was not diffed against this copy — recommend a quick sync check.
