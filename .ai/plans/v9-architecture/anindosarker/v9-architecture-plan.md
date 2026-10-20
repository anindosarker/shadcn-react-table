# v9 architecture: rewrite the library internals on MRT's TanStack Table v9 port

Decision record: `.ai/plans/review-feedback-v0.3/anindosarker/decisions.md`, "TanStack Table
v9 architecture". Runs after the package layout split (two complete trees, `registry/radix`
and `registry/base`).

## Goal

The library keeps its public API and its component tree, and its internals become the same
shape as MRT's v9 port: library state and APIs as v9 custom features, one `createTableHook`,
components reading state through feature APIs. Every file is compared with its MRT twin and
brought to the same shape unless a recorded deviation says otherwise.

## Non-goals

- No public API change: `useShadcnTable`, `ShadcnTable`, `ST_TableOptions`, `ST_*` prop and
  option names stay. The app table hook and column helper stay internal, as in MRT.
- No markup or styling change in components, no change to the 23 Base UI override files
  beyond what the rewrite forces.
- No docs content rewrite beyond API pages that list new or removed options.
- No compatibility layer for the previous internals (no users of them).

## Reference

- MRT v9 port: `React-table/tanstack-table/examples/react/material-react-table/src/material-react-table/`
  (sparse clone of `TanStack/table` `main`; `git -C React-table/tanstack-table pull` before
  each phase; record the head commit in the tracker).
- Kitchen sink on shadcn: `examples/react/kitchen-sink-shadcn-radix/` in the same clone, for
  idiomatic v9 use of shadcn parts only.
- TanStack v9 docs: migration guide and custom features guide under
  https://tanstack.com/table/latest/docs/framework/react/guide/.
- Name map: `MRT_` to `ST_`, `useMRT_` to `useST_`, `mrt*Feature` to `st*Feature`,
  `MaterialReactTable` to `ShadcnTable`. MRT's `components/<group>/` is our `<group>/`.

## File map (measured 2026-10-20, MRT head 95c476849)

- 123 files with a twin.
- Ours only: `fns/sortFns.ts` (MRT: `fns/sortingFns.ts`), `ST_Tooltip.tsx`,
  `table/ST_TableLayout.tsx`, `toolbar/useST_MediaQuery.ts`, `utils/pagination.utils.ts`,
  `utils/tanstack.features.ts` (replaced by `features/`).
- MRT only: `features/` (12 features and `mrtFeatures.ts`), `hooks/mrtTableHook.ts`,
  `table/MRT_TablePaper.tsx`, `locales/mk.ts`.

## Phases

Each phase ends with the gates green on both trees and a commit per cluster on the work
branch. Tracker: `v9-architecture-tracker.md` next to this file, decisions and deviations
only.

### 00 Comparison

Read-only. Produces `00-comparison.md`:

- Per twin file: v9 API divergences (state reads, setters, feature APIs, `Subscribe`, types),
  one line each, with the MRT line reference.
- State ownership map: every piece of state, ref and setter our hooks hold today, and which
  MRT feature owns it in the port. This is the work list for 01.
- Our-only and MRT-only files: keep, align or drop, with reason.
- Each finding verified by a second agent against both sources before it enters the file.

Owner reads the file before 01 starts.

### 01 Features and hook

- `features/`: port the 12 features under `st*` names, each with the MRT module
  augmentation pattern (`Plugins`, `TableState_FeatureMap`, `TableOptions_FeatureMap`,
  `Table_FeatureMap`, plus row, column, cell and header maps where MRT has them).
- `features/stFeatures.ts`: `tableFeatures({ ...stockFeatures, ...custom, row models, fn
  registries })`, mirroring `mrtFeatures.ts`.
- `hooks/stTableHook.ts`: `createTableHook({ features: stFeatures, ... })`, exporting
  `useAppTable`, `useTableContext`, `useCellContext`, `useHeaderContext` for internal use.
- `types.ts`: derive `ST_TableInstance`, `ST_TableState`, `ST_DefinedTableOptions`,
  `ST_StatefulTableOptions` from `ST_Features` as MRT's `types.ts` does.
- Delete `utils/tanstack.features.ts`.

### 02 Instance and options

- `useST_TableInstance`: wrap `useAppTable`; remove hand-rolled state, setter aliases, refs
  and `table.state` patching that the features now provide; keep display-column injection,
  skeleton rows and initial-state massaging as MRT does.
- `useST_TableOptions`: defaults that MRT moved into `getDefaultTableOptions` of a feature
  move there too.
- `useST_Effects`, `useST_Rows`, virtualizer hooks: align with twins.

### 03 Components

Per cluster, in render-tree order: table, head, body, footer, toolbar, inputs, menus,
buttons, modals, display columns. For each file: state reads go through feature APIs or
`table.Subscribe` where the twin does; props and markup unchanged. Both trees; a file in the
Base UI diff list is edited by hand in both, every other file is edited in `registry/radix`
and copied, the CI guard confirms.

### 04 Our-only files and locales

- `ST_TableLayout.tsx`, `ST_Tooltip.tsx`, `useST_MediaQuery.ts`, `pagination.utils.ts`:
  keep as recorded deviations (owner-approved idioms) unless 00 finds a v9 reason to change.
- `fns/sortFns.ts`: keep the name, align the contents.
- `locales/mk.ts`: add.
- `ST_TablePaper`: not ported before, stays out unless 00 shows a dependency.

### 05 Gates, stories, docs, release

- `tsc:radix`, `tsc:baseui`, stories tsc, `lint`, `test` and `test:base` 400/400,
  `storybook:build` both editions, `check-storybook.mjs`.
- Docs: API pages for any option added or removed; `getting-started/migrating-v1` note for
  internals that a user who copied the source might have touched.
- Registry build, CI install scenarios, Storybook deploy check, release notes.

## Workflow

One Workflow run per phase, resumable. Agents work in
`shadcn-react-table.worktrees/<name>` on their own branches, push only; the lead merges.

- 00: one comparison agent per cluster in parallel, one for hooks and types, one for the
  state ownership map; a verifier per finding; a merge agent writes `00-comparison.md`.
- 01 and 02: one coder per feature, reviewer bounce up to 3, gates on the merged result.
- 03: pipeline per cluster: coder, reviewer (walks the MRT twin top to bottom), verifier
  runs the gates and the cluster's stories in both editions through Playwright.
- Halt and ask the owner on: an unprecedented public API choice, more than 3 review bounces,
  an unfixable gate, a finding that contradicts a recorded owner decision.

## Open

- Version for the release that ships this: `0.4.0`, or `1.0.0` because the internals are
  now v9-native. Default `0.4.0` until the owner says otherwise.
