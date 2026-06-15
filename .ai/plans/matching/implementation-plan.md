# SRT → MRT 1:1 Parity — Implementation Plan

Goal: bring shadcn-react-table (SRT) to true 1:1 feature parity with material-react-table (MRT), MUI→shadcn. Built from package-wide gap scan (8 cluster reports, 2026-06-15).

## Locked decisions
- **Tooltips:** shadcn `<Tooltip>` everywhere via one shared wrapper (`SRT_Tooltip` + `getCommonTooltipProps` equivalent). Remove native `title=` downgrades.
- **Icons:** wire `table.options.icons` registry. Default = existing `SRT_Default_Icons` (lucide-react, shadcn canonical). Components read from registry, stop hardcoding lucide imports. Fix semantically-wrong defaults (e.g. ExpandAll → double-chevron).
- **Deviations — ALL in scope (full parity):** RTL (`direction`) support, responsive/mobile toolbar breakpoints, datetime/time/autocomplete filter variants, empty-rows fallback.
- **style.utils.ts:** minimal restore — `parseCSSVarId` (for columnSizeVars) + `getCommonTooltipProps`. KEEP current component-layer pinning deviation (it works); do NOT restore `getCommonPinnedCellStyles`.
- Work stays in `apps/test-shadcn` + `packages/shadcn-react-table-core`. No CLI/registry migration in this effort.
- Rules: agent teams (not subagents); `pnpm format` then type-check after writing; `graphify update .` after; no git commits.

## Dependency order
Phase A (core foundations) **blocks** Phase B. Phase B clusters run in parallel. Phase C reviews.

---

## Phase A — Core foundations (1 teammate, sequential)
Everything else depends on these. Land + type-check before spawning Phase B.

- **A1. Slot-prop types.** Add the 19 missing `srt*Props` to `core/src/types.ts` at table-level AND columnDef-level where MRT has them, typed as `SRT_HTMLProps<TElement, TContext>` (reuse existing pattern). Missing set:
  `srtColumnActionsButtonProps, srtColumnDragHandleProps, srtCopyButtonProps, srtCreateRowModalProps, srtDetailPanelProps, srtEditRowDialogProps, srtExpandAllButtonProps, srtExpandButtonProps, srtRowDragHandleProps, srtSelectAllCheckboxProps, srtSelectCheckboxProps, srtSkeletonProps, srtToolbarAlertBannerProps, srtToolbarAlertBannerChipProps, srtFilterCheckboxProps, srtFilterSliderProps, srtFilterAutocompleteProps, srtFilterDatePickerProps + srtFilterDateTimePickerProps + srtFilterTimePickerProps` (picker slots needed once deviation filters are built).
  Also fix declared-but-incomplete: columnDef-level `srtTableFooterCellProps`.
- **A2. Icons registry.** Uncomment/define `icons?: Partial<SRT_Icons>` in types.ts; default `icons: SRT_Default_Icons` in `useSRT_TableOptions`; expose via `table.options.icons`. Fix wrong defaults in `icons.ts`.
- **A3. style.utils.ts (minimal).** Restore `parseCSSVarId` + `getCommonTooltipProps` (returns shadcn Tooltip-compatible config). Leave pinned-cell styles commented.
- **A4. Shared Tooltip wrapper.** Component-layer `SRT_Tooltip` (wraps shadcn Tooltip, applies `getCommonTooltipProps`, supports disabled-state + open-control). Reused by all of Phase B.
- **A5. SRT_Table root fixes** (core-ish, do here to unblock body/head):
  - instantiate `useSRT_ColumnVirtualizer(table)` + pass real `columnVirtualizer` (currently `undefined` → column virt dead).
  - add `columnSizeVars` useMemo → `style` (`--header-*-size` / `--col-*-size`).
  - add `memoMode === 'table-body'` (+ `isResizingColumn`) → `Memo_SRT_TableBody` dispatch.
  - wire `renderCaption` → `<caption>`.
  - add `layoutMode` grid `display` branch.

---

## Phase B — Cluster wiring (7 teammates, parallel, after A)
Each: wire slot props (parse+merge table+columnDef), swap to `SRT_Tooltip`, read icons from registry, fix cluster bugs. Type-check per cluster.

- **B1. buttons/** (13) — wire `srt*ButtonProps`; `SRT_Tooltip` (fix RowPin/ToggleFullScreen/Expand disabled-state); icons from registry; **ExpandButton RTL** indent; finish GrabHandleButton drag+icon (incomplete).
- **B2. inputs/** (7) — wire `srtFilterCheckboxProps/srtFilterSliderProps/srtSelectCheckboxProps/srtSelectAllCheckboxProps`; **build datetime + time + autocomplete filter variants** (+ their slot props); tooltip consistency.
- **B3. menus/** (7) — `columnDef.renderColumnActionsMenuItems` override; density variant (RowActionMenu, ShowHideColumnsMenu); themeable dragging border.
- **B4. body/** (7) — `srtTableBodyRowProps` on detail-panel `<tr>`; **renderEmptyRowsFallback + "No data"** in TableBody; confirm column-virt consumers now fed by A5.
- **B5. head/** (9) — `srtColumnDragHandleProps` + `srtColumnActionsButtonProps`; `layoutMode` grid branch in TableHead; head-row background/shadow.
- **B6. footer/ + toolbar/** (10) — `srtTopToolbarProps`, `srtToolbarAlertBannerProps(+Chip)`, `srtToolbarDropZoneProps`, columnDef `srtTableFooterCellProps`; **responsive mobile/tablet breakpoints**; alert-banner clear-selection + head-overlay + `renderToolbarAlertBannerContent`; footer-cell RTL.
- **B7. table/ + modals/** (6) — `srtTableContainerProps`, `srtTablePaperProps`, `srtCircularProgressProps`, `srtCreateRowModalProps`, `srtEditRowDialogProps` wiring; **fullscreen Portal** in SRT_TableLayout; modal props composition.

---

## Phase C — Review + verify
- Per-file diff review vs MRT (resume the `srt-review-notes.md` checklist), now that gaps are closed.
- Storybook litmus re-run; `/agent-browser` exercise all features.
- `build-storybook` + app `tsc` + core build all green.

## Open verification flags (confirm during work)
- RowSelect display-col: agent flagged `enableMultiRowSelection` heuristic maybe missing vs MRT — verify in `getSRT_RowSelectColumnDef`.
- Some agent claims may overstate; each teammate re-confirms against MRT before changing.
