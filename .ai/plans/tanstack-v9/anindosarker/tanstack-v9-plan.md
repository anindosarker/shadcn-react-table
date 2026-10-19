# TanStack Table v9 port (toward v1.0)

Status: planned 2026-10-19, implementation on branch `feat/tanstack-v9` (from `claude/review`).
Owner decision: build on a separate branch, no merge; the owner tests locally first. Release as
v1.0.0 is a later step and not part of this branch.

Phases: [00 spike](00-spike.md), [01 shared source](01-radix-tree.md),
[02 Base UI overrides](02-base-tree.md), [03 stories, examples, docs](03-stories-examples-docs.md),
[04 registry, CI, install](04-registry-ci.md).

## Why

TanStack Table 9.3.1 is the stable `latest` (first v9 stable 2026, 9.3.1 on 2026-10-12). v8 stays
on 8.21.x maintenance. v9 brings tree-shakeable features, TanStack Store state (`table.state`,
`table.store`, per-slice atoms), lower memory, faster row models, and the `start`/`end` pinning
vocabulary. Shipping v1.0 on v8 would mean a breaking port right after.

## Facts (measured on `claude/review` ae2198d)

- Library source after the structure cleanup: `packages/shadcn-table/shared/components/ui/shadcn-table/**`
  (128 files, one copy) plus 23 Base UI overrides in
  `bases/base/components/ui/shadcn-table/**` (menus, inputs, tooltip, pagination, detail
  panel, edit modal, filter head cells, `ShadcnTable.tsx`, `utils/style.utils.ts`). 10 files
  import `@tanstack/react-table` (`types.ts`, `hooks/useST_TableInstance.ts`,
  `utils/tanstack.helpers.ts`, `fns/*`, display column defs); all of them are shared, so the
  port is one edit, and the overrides only need the renames that reach them (`table.state`,
  pinning values, indeterminate gates). Library files import each other through
  `@/components/ui/shadcn-table/...`; relative imports are lint errors.
- v8 API counts in the library: `sortingFn` 22, `sortingFns` 16, `columnSizingInfo` 15
  (`setColumnSizingInfo` 4, `onColumnSizingInfoChange` 2), pinning `'left'`/`'right'` 35
  (`getLeftLeafColumns` 5, `getRightLeafColumns` 5, `getLeftVisibleLeafColumns` 1,
  `getRightVisibleLeafColumns` 1, `getStart(` 1, `getAfter(` 1), `aggregationFn` 18 with 13
  custom aggregation functions, `getState()` 4, `useReactTable` 3, `getCoreRowModel` 5,
  `get*RowModel()` factories 20, `createRow` 1, `onStateChange` 1,
  `getIsSomeRowsSelected` 1, `getIsSomeSelected` 1, `enablePinning` 0 (already split).
  No destructuring of table/row/cell/column methods anywhere (v9 methods live on prototypes).
- Stories: 400 stories in 55 files; 7 `getState()`, 12 `'right'`, 4 `left:`, 4 `aggregationFn`,
  2 `enablePinning`, 1 `sortingFn`. Docs examples (115): 6 `getState()`, 6
  `getIsSomeRowsSelected`, 11 `'left'`/`'right'`, 3 `aggregationFn`, 1 `sortingFn`. Docs content:
  9 `getState()`, 7 `sortingFn`, 6 `aggregationFn`, 3 `useReactTable`, 3 `sortingFns`,
  1 `columnSizingInfo`, 2 `enablePinning`. README line 3 says "TanStack Table v8".
- v9.3.1 exports (checked): `useTable`, `tableFeatures`, `stockFeatures`, all 15 `*Feature`
  objects, `createFilteredRowModel` and the other `create*RowModel` factories,
  `createFacetedUniqueValues`, `createFacetedMinMaxValues`, `sortFns`, `filterFns`,
  `aggregationFns`, `constructAggregationFn`, `constructRow` (replaces `createRow`),
  `createColumnHelper`, `flexRender`, `functionalUpdate`, `makeStateUpdater`, `tableOptions`,
  `createTableHook`, `metaHelper`. Not exported: `createRow`, `useSelector` (that one lives in
  `@tanstack/react-store`, a new transitive dependency). Legacy v8 API only under
  `@tanstack/react-table/legacy` (`useLegacyTable`, deprecated, bigger bundle).
- CI install scenario `existing` adds `@tanstack/react-table@8.20.5` to simulate a project that
  already has TanStack and checks there is one entry in package.json.

## Decision

- Full v9 API, no `useLegacyTable`, no compatibility shims and no renamed public surface of our
  own: where v9 renamed something, the library and its public types follow v9
  (`sortFn`, `columnResizing`, `columnPinning.start`/`.end`, `table.state`). The MRT-shaped
  option names that are ours (`enableRowPinning`, `st*Props`, `renderDetailPanel`, ...) stay.
- One `tableFeatures({...})` declaration in `utils/tanstack.features.ts` registering all 15
  features, every row model factory and the three Fn registries; `export type ST_Features =
  typeof stFeatures`. Every internal TanStack generic becomes `<ST_Features, TData, ...>`; the
  public `ST_*` types keep their `<TData>` and `<TData, TValue>` signatures.
- The ST instance keeps being the TanStack table plus our refs and setters, but built with
  `Object.assign(table, {...})` instead of `{ ...table, ... }`: v9 assigns most APIs on
  prototypes, so a spread drops them.
- Shared source ported once; the 23 overrides get the same renames by hand; gates run per
  base (`tsc:radix`, `tsc:baseui`, `test`, `test:base`).
- Pin `@tanstack/react-table` 9.3.1 in both `package.json` files, both `registry.ts`, the
  registry item dependencies, the CI `existing` scenario and the docs.

## Non-goals

- `createTableHook`, `tableOptions()`, external atoms, per-slice subscriptions as an
  optimisation pass (candidates after v1.0; note where `table.state` selectors would help).
- Tree-shaking the library's feature set per consumer; the table registers all features.
- TanStack's new Shift range selection: the library keeps its own range-select logic and sets
  `enableRowRangeSelection: false`; revisit after v1.0.
- Release v1.0.0, changelog, docs deploy: separate step after the owner's local test.

## State

- [x] 00 spike: dependency bumped, `tsc` error inventory written to `00-spike.md` "Findings"
- [x] 01 shared source green: `tsc:radix`, `lint`, `test` 400/400, Storybook build
- [x] 02 Base UI overrides green: `tsc:baseui`, `test:base` 400/400, no override identical to its shared file
- [x] 03 stories, docs examples, docs content, SKILL on v9 names; docs `types:check`, `lint`,
      build, page gates a and e 0 failures
- [x] 04 registry rebuilt (76 items, validate 3 files 190 items), CI green on the branch
      (library, test, docs, install fresh/existing/base/nextjs), trigger removed
- [x] branch `feat/tanstack-v9` pushed, not merged; owner tests locally
