# Plan: SRT_LinearProgressBar ← MRT_LinearProgressBar

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/toolbar/SRT_LinearProgressBar.tsx`.
Garbage-zone; author fresh — BUT read the garbage file first: it (and core's
`useSRT_ProgressAnimation` hook + `SRT_LinearProgressProps` type with
wrapper/progressRoot) embodies the June indeterminate-progress deviation.
Mirror the June rendering approach with MRT's exact structure/conditions.

## Resolved decisions

- Interface: MRT extends LinearProgressProps; SRT slot type
  `SRT_LinearProgressProps` = `{ wrapper?: HTMLAttributes<div>, progressRoot?:
  HTMLAttributes<div> }` (existing core type — component extends nothing,
  takes `{ isTopToolbar, table, ...rest }` where rest folds into progressRoot?
  NO — mirror MRT: interface `extends SRT_LinearProgressProps { isTopToolbar,
  table }`, and merge `{ ...parseFromValuesOrFunc(srtLinearProgressProps,
  { isTopToolbar, table }), ...rest }`).
- MUI Collapse wrapper → conditional render with MRT's exact condition
  `showProgressBars !== false && (showProgressBars || isSaving)` +
  dropped-Collapse comment/Note. Wrapper div classes: `absolute w-full` +
  `bottom-0` when isTopToolbar / `top-0` when not (MRT sx map), merged with
  `linearProgressProps.wrapper` (className/style compose, user wins).
- MUI LinearProgress → indeterminate bar: div progressRoot
  `relative h-1 w-full overflow-hidden bg-primary/20` containing an animated
  child `h-full w-1/3 bg-primary` with the June animation (check
  `useSRT_ProgressAnimation` in core or the garbage file's classes — reuse
  the existing working mechanism; if the garbage file uses a plain CSS
  animation class, keep it; do NOT invent a new animation system).
  `aria-busy="true" aria-label="Loading"` on the progress root; spread
  `linearProgressProps.progressRoot` there (user wins).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/toolbar/SRT_LinearProgressBar.tsx`
--max-warnings=0. Only this file. No core, no git.
