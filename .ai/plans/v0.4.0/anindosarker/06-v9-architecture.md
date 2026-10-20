# 06: v9 architecture

Decision: [decisions.md](decisions.md) "TanStack Table v9 architecture". The library keeps
its public API and component tree; its internals take the shape of MRT's TanStack Table v9
port. Runs after [04](04-package-layout.md) and [05](05-docs-app-layout.md); its phase 00
may start once 04 is merged. Ships as `0.4.0`.

## Acceptance

- `features/` holds the library's own state and APIs as v9 custom features; one
  `createTableHook` in `hooks/stTableHook.ts`; `useST_TableInstance` wraps `useAppTable`;
  `utils/tanstack.features.ts` is gone.
- Public surface unchanged: `useShadcnTable`, `ShadcnTable`, `ST_TableOptions`, every
  `ST_*` option, prop and type name, the locale items. The docs API pages list no removed
  option unless `00-comparison.md` records it with a reason.
- Every file with an MRT twin either matches the twin's shape or has a one-line entry in the
  tracker saying why not.
- Both trees pass every gate; stories render 400/400 on both bases; the registry builds;
  the CI install matrix passes.

## Non-goals

- Markup, styling or prop changes in components; changes to the 23 Base UI diff files
  beyond what the rewrite forces.
- Docs content beyond API pages and one migration note.
- A compatibility layer for the previous internals.

## Reference

- MRT v9 port: `React-table/tanstack-table/examples/react/material-react-table/src/material-react-table/`,
  sparse clone of `TanStack/table` `main`. `git -C ../tanstack-table pull` before each
  phase; the tracker records the head commit used.
- Kitchen sink on shadcn, same clone, `examples/react/kitchen-sink-shadcn-radix/`, for
  idiomatic v9 use of shadcn parts only.
- v9 docs: migration guide and custom features guide at
  https://tanstack.com/table/latest/docs/framework/react/guide/.
- Name map: `MRT_` to `ST_`, `useMRT_` to `useST_`, `mrt*Feature` to `st*Feature`,
  `MaterialReactTable` to `ShadcnTable`; MRT's `components/<group>/` is our `<group>/`.

## File map (measured 2026-10-20, MRT head 95c476849)

- 123 files with a twin.
- Ours only: `fns/sortFns.ts` (MRT: `fns/sortingFns.ts`), `ST_Tooltip.tsx`,
  `table/ST_TableLayout.tsx`, `toolbar/useST_MediaQuery.ts`, `utils/pagination.utils.ts`,
  `utils/tanstack.features.ts`.
- MRT only: `features/` (12 features plus `mrtFeatures.ts`), `hooks/mrtTableHook.ts`,
  `table/MRT_TablePaper.tsx`, `locales/mk.ts`.

## Phases

Each phase: gates green on both trees, `check:bases` green, one commit per cluster on the
work branch. Tracker `06-v9-architecture-tracker.md`, decisions and deviations only.

### 00 Comparison (read-only)

Produces `06-00-comparison.md`:

- Per twin file: v9 API divergences (state reads, setters, feature APIs, `Subscribe`,
  types), one line each with the MRT line reference.
- State ownership map: every piece of state, ref and setter our hooks hold today and which
  MRT feature owns it in the port. This is the work list for 01.
- Our-only and MRT-only files: keep, align or drop, with reason.
- Every finding verified by a second agent against both sources before it enters the file.

The owner reads the file before 01 starts.

### 01 Features and hook

- `features/st*Feature.ts`: the 12 features under `st` names, each with MRT's module
  augmentation (`Plugins`, `TableState_FeatureMap`, `TableOptions_FeatureMap`,
  `Table_FeatureMap`, plus row, column, cell and header maps where MRT has them).
- `features/stFeatures.ts`: `tableFeatures({ ...stockFeatures, ...custom, row models, fn
  registries })`, mirroring `mrtFeatures.ts`.
- `hooks/stTableHook.ts`: `createTableHook({ features: stFeatures, ... })` exporting
  `useAppTable`, `useTableContext`, `useCellContext`, `useHeaderContext`, internal only.
- `types.ts`: `ST_TableInstance`, `ST_TableState`, `ST_DefinedTableOptions`,
  `ST_StatefulTableOptions` derived from `ST_Features` as MRT's `types.ts` does.
- Delete `utils/tanstack.features.ts`.

### 02 Instance and options

- `useST_TableInstance` wraps `useAppTable`; hand-rolled state, setter aliases, refs and
  `table.state` patching that features now provide are removed; display-column injection,
  skeleton rows and initial-state massaging stay, as in MRT.
- `useST_TableOptions`: defaults that MRT moved into a feature's `getDefaultTableOptions`
  move too.
- `useST_Effects`, `useST_Rows`, the virtualizer hooks: aligned with their twins.

### 03 Components

Clusters in render-tree order: table, head, body, footer, toolbar, inputs, menus, buttons,
modals, display columns. Per file: state reads through feature APIs or `table.Subscribe`
where the twin does; props and markup unchanged. A file in `base-diff.json` is edited by
hand in both trees; every other file is edited in `registry/radix` and copied to
`registry/base`; `check:bases` confirms.

### 04 Our-only files and locales

- `ST_TableLayout.tsx`, `ST_Tooltip.tsx`, `useST_MediaQuery.ts`, `pagination.utils.ts`:
  kept as recorded deviations unless 00 found a v9 reason to change.
- `fns/sortFns.ts`: name kept, contents aligned.
- `locales/mk.ts`: added as a locale item on both bases.
- `ST_TablePaper`: stays out unless 00 shows a dependency.

### 05 Gates, docs, release

- Full gate list from the master plan, both bases.
- Docs: API pages for any option added or removed; a note on
  `getting-started/migrating-v1` for internals a user who copied the source might have
  touched.
- `CHANGELOG.md` `## 0.4.0`; then `pnpm release 0.4.0` ([01](01-release-automation.md)).

## Workflow

One Workflow run per phase, resumable. Agents in `shadcn-react-table.worktrees/<name>` on
their own branches, push only; the lead merges onto `v0.4/v9-architecture`, then
`claude/review`.

- 00: one comparison agent per cluster in parallel, one for hooks and types, one for the
  state ownership map; a verifier per finding; a merge agent writes the comparison file.
- 01 and 02: one coder per feature, reviewer bounce up to 3, gates on the merged result.
- 03: per cluster a pipeline of coder, reviewer (walks the MRT twin top to bottom), and a
  verifier that runs the gates and the cluster's stories on both editions through Playwright.
- Halt and ask the owner on: a public API choice not covered by the decisions, more than 3
  review bounces, an unfixable gate, a finding that contradicts a recorded decision.
