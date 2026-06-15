# Plan — Complete the shadcn-react-table library

**Date:** 2026-06-15
**Goal:** Full feature parity with material-react-table (MRT), ported to shadcn primitives.

## References (source of truth)

1. **Behavior/architecture truth:** `packages/material-react-table/` (MRT). Port behavior 1:1.
2. **shadcn idiom source:** `/Users/anindosarker/Work/Personal/React-table/tablecn/` (finished shadcn data-table). Copy shadcn wiring patterns (DropdownMenu/Popover/Dialog/Command usage, cva, etc.).

## Locked decisions

- shadcn primitives added via **shadcn CLI** (`npx shadcn add ...`), not hand-copied.
- **Full feature parity** this pass (filters, editing, virtualization, drag/reorder, pinning, expand, row actions, aggregation, row numbers).
- All work stays in **`apps/test-shadcn`**. Port to package/registry is a later pass.
- Styling: **cva variants**, not MUI `sx`. No prebuilt-style shipping — wrapper components only.

## Architecture (confirmed)

- **`packages/shadcn-react-table-core`** = headless logic shipped to users: `types.ts`, `utils/`, `fns/`, `hooks/`, `locales/` (47), `icons.ts`. Mirrors MRT non-component layer w/ `SRT_` prefix.
- **Component layer** lives in user project: `apps/test-shadcn/src/components/ui/shadcn-react-table/`. Mirrors MRT component tree w/ `SRT_` prefix (`MRT_TableContainer` → `SRT_TableContainer`). Built from shadcn primitives. Distributed via CLI/registry later.

## Current state (gap analysis)

### Core pkg — mostly complete, real gaps
- ✅ `types.ts` (1279L ≈ MRT 1289), `utils/`, `fns/`, `locales/`, `icons.ts`, `useSRT_Effects`, `useSRT_TableInstance`, `useSRT_TableOptions`, `useSRT_ProgressAnimation`, `useShadcnReactTable` present.
- ❌ **`hooks/display-columns/` dir does not exist.** Missing all 7 getters. MRT assembly in `useSRT_TableInstance.ts:201-218` is commented out w/ `.filter(Boolean)` placeholders → selection/expand/drag/actions/numbers/pinning/spacer are inert.
- ❌ Missing `useSRT_ColumnVirtualizer`, `useSRT_RowVirtualizer` (commented in `index.ts`).
- ❌ Missing `useSRT_Rows`.
- ❌ `index.ts` has those exports commented out.

### Component layer — 22/57 are TODO stubs (return `<div>TODO</div>`)
Sorted by gap (MRT lines → SRT lines):
- **inputs:** FilterTextField (585→25), EditCellTextField (194→25), FilterRangeSlider (144→25), SelectCheckbox (134→25), FilterCheckbox (91→25), FilterRangeFields (42→25), GlobalFilterTextField (audit, 157)
- **menus:** ColumnActionMenu (351→29), FilterOptionMenu (291→28), ShowHideColumnsMenuItems (204→27), ShowHideColumnsMenu (171→26), CellActionMenu (106→29), RowActionMenu (87→34), ActionMenuItem (63→22)
- **body:** TableBodyCell (352→60), TableBodyRow (289→51), TableBody (222→66), TableBodyCellValue (131→64)
- **head:** TableHeadCell (345→84), TableHeadRow (91→34), TableHead (92→36), TableHeadCellFilterLabel (179→108 — audit)
- **table/toolbar/modal:** TableContainer (112→50), TablePagination (242→103), EditRowModal (115→26)

### shadcn primitives present
Only `badge, button, collapsible, progress`. Need to add: `input, select, dropdown-menu, popover, dialog, checkbox, slider, tooltip, table, label, command, separator, textarea`.

---

## Phases

### Phase 0 — Foundation (2 tracks, parallel) — BLOCKS Phase 1

**Track A — Core pkg completion**
- Create `packages/shadcn-react-table-core/src/hooks/display-columns/`:
  - `getSRT_RowSelectColumnDef.tsx` (port MRT 35L)
  - `getSRT_RowExpandColumnDef.tsx` (MRT 92L)
  - `getSRT_RowActionsColumnDef.tsx` (MRT 29L)
  - `getSRT_RowDragColumnDef.tsx` (MRT 30L)
  - `getSRT_RowNumbersColumnDef.tsx` (MRT 31L)
  - `getSRT_RowPinningColumnDef.tsx` (MRT 25L)
  - `getSRT_RowSpacerColumnDef.tsx` (MRT 34L)
- Add `hooks/useSRT_ColumnVirtualizer.ts` (MRT 125L), `hooks/useSRT_RowVirtualizer.ts` (MRT 89L), `hooks/useSRT_Rows.ts` (MRT 45L).
- Uncomment + wire imports/assembly in `useSRT_TableInstance.ts` (lines 40-46, 201-218) and `index.ts`.
- Note: display-col defs reference SRT_ components (icons/buttons) — they return columnDef objects; cell renderers are component-layer. Keep the headless/cell-render split exactly as MRT does (cell render fns live in core, JSX uses core icons).
- **Done when:** `pnpm --filter shadcn-react-table-core build` (rollup) green, no commented exports.

**Track B — shadcn primitives**
- `cd apps/test-shadcn && npx shadcn@latest add input select dropdown-menu popover dialog checkbox slider tooltip table label command separator textarea`
- Verify each lands in `src/components/ui/`, import paths resolve.
- **Done when:** all 13 present + typecheck clean.

### Phase 1 — Component porting (5 teams, parallel after Phase 0)

Each team: port stubs MRT→shadcn, behavior-faithful, cva styling, use new primitives. Audit the near-complete files in their dir too.

- **Team Inputs:** `inputs/` — FilterTextField, EditCellTextField, FilterRangeSlider, FilterRangeFields, SelectCheckbox, FilterCheckbox, GlobalFilterTextField. (FilterTextField is largest — filter variants, select/multiselect/range/date dispatch.)
- **Team Menus:** `menus/` — ColumnActionMenu, FilterOptionMenu, ShowHideColumnsMenu, ShowHideColumnsMenuItems, CellActionMenu, RowActionMenu, ActionMenuItem. (DropdownMenu-based.)
- **Team Body:** `body/` — TableBodyCell, TableBodyRow, TableBody, TableBodyCellValue, TableDetailPanel + grab/pin handles audit.
- **Team Head:** `head/` — TableHeadCell, TableHeadRow, TableHead, TableHeadCellFilterLabel + sort/resize/grab handles audit.
- **Team Toolbar+Table+Modal:** TablePagination, TableContainer, EditRowModal + TopToolbar/BottomToolbar/AlertBanner/InternalButtons audit.

Shared rules:
- Import types/utils/fns/hooks/display-cols/icons from `shadcn-react-table-core`.
- Match MRT prop interfaces + behavior exactly. Map MUI components → shadcn equivalents (TextField→Input, Menu→DropdownMenu, Popover→Popover, Dialog→Dialog, Checkbox→Checkbox, Slider→Slider, Tooltip→Tooltip).
- Replace MUI `sx`/theme w/ cva + tailwind classes. Allow `className` override prop.

### Phase 2 — Integration + browser verification
- Wire `ShadcnReactTable.tsx` → `SRT_TableLayout` → full tree.
- Build a full-feature demo in `apps/test-shadcn/src/App.tsx` (sorting, filtering, pagination, selection, editing, expand, pinning, drag, virtualization, row actions).
- `pnpm build` + typecheck green.
- **Live browser test (`/agent-browser`):** start vite dev server, drive the app in a real browser — exercise each feature (sort cols, type filters, paginate, select rows, edit cell, expand row, pin, reorder, scroll virtualized list, open row/column action menus). Capture screenshots, check console for errors. Log defects as new tasks, fix, re-test until clean.

### Phase 3 — Per-file code review
- Review each ported file vs MRT counterpart. Catch MUI→shadcn nuance gaps (focus mgmt, a11y, keyboard nav, controlled/uncontrolled, density/fullscreen, RTL).
- Document deviations in `.ai/plans/archived/condiderations.md`.

## Dependency graph
```
Phase 0 (A core ∥ B primitives)  →  Phase 1 (5 teams ∥)  →  Phase 2 integration  →  Phase 3 review
```
Track A blocks Body/Head/Toolbar teams (display-cols). Track B blocks all Phase-1 teams (primitives).

## Conventions
- File naming: `SRT_` prefix, mirror MRT exactly.
- After core edits: `graphify update .` to keep graph current.
- No new deps beyond shadcn primitives + existing core deps (`@tanstack/react-table`, `@tanstack/react-virtual`, `lucide-react`).
