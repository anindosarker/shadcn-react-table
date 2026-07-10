# Plan: SRT_ToolbarInternalButtons ← MRT_ToolbarInternalButtons

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/toolbar/SRT_ToolbarInternalButtons.tsx`.
Garbage-zone; author fresh. Simple dispatcher.

## Resolved decisions

- Interface `extends DivProps { table }` (MRT extends BoxProps). NOTE: there
  is NO srt slot for this component in MRT (no muiToolbarInternalButtonsProps)
  — only `...rest` spreads onto the div. If the garbage file reads a
  `srtToolbarInternalButtonsProps`-like slot, drop it (no MRT counterpart).
- cva `toolbarInternalButtonsVariants` base `flex items-center z-[3]` (maps
  the sx; zIndex 3 → z-[3]).
- `{...rest}` then className cn AFTER spread.
- Children verbatim: `renderToolbarInternalActions?.({ table }) ??` fragment
  with the five buttons under MRT's exact conditions (ToggleGlobalFilter:
  enableFilters && enableGlobalFilter && !initialState?.showGlobalFilter;
  ToggleFilters: enableFilters && enableColumnFilters &&
  columnFilterDisplayMode !== 'popover'; ShowHideColumns: enableHiding ||
  enableColumnOrdering || enableColumnPinning; ToggleDensePadding:
  enableDensityToggle; ToggleFullScreen: enableFullScreenToggle). All five
  buttons are garbage-zone imports — as-is; STOP if any rejects `table`.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/toolbar/SRT_ToolbarInternalButtons.tsx`
--max-warnings=0. Only this file. No core, no git.
