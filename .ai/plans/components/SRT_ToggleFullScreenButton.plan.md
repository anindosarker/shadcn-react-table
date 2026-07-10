# Plan: SRT_ToggleFullScreenButton ← MRT_ToggleFullScreenButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_ToggleFullScreenButton.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends ButtonProps { table }`.
- tooltipOpened state + handleToggleFullScreen verbatim (close tooltip then
  setIsFullScreen).
- Controlled SRT_Tooltip (open) title `rest?.title ??
  localization.toggleFullScreen`.
- Button ghost/icon; onBlur/onFocus/onMouseEnter/onMouseLeave verbatim;
  {...rest}, `title={undefined}`; `isFullScreen ? FullscreenExitIcon :
  FullscreenIcon` h-4 w-4.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git.
