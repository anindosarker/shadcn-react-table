# Plan: SRT_RowPinButton ← MRT_RowPinButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_RowPinButton.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends ButtonProps { pinningPosition: RowPinningPosition (from
  @tanstack/react-table), row, table }`.
- tooltipOpened state + controlled SRT_Tooltip (open prop) verbatim; title
  `isPinned ? localization.unpin : localization.pin`.
- handleTogglePin verbatim (close tooltip, stopPropagation, row.pin).
- Button ghost/icon size small; onBlur/onFocus/onMouseEnter/onMouseLeave
  tooltip handlers verbatim; {...rest}; cva base `h-6 w-6` (24px).
- Icon: isPinned → CloseIcon; else PushPinIcon h-4 w-4 with rotation
  `rowPinningDisplayMode === 'sticky' ? 135 : pinningPosition === 'top' ?
  180 : 0` → conditional classes `rotate-[135deg]` / `rotate-180` / none.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
