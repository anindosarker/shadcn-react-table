# Plan: SRT_ColumnPinningButtons ← MRT_ColumnPinningButtons

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_ColumnPinningButtons.tsx`.
Garbage-zone; author fresh. NOTE: menus/SRT_ShowHideColumnsMenuItems already
imports this with `{column, table}` — do not break that call.

## Resolved decisions

- Interface `extends DivProps { column, table }` (MRT extends BoxProps).
- Root Box → div: cva base `min-w-[70px] text-center`; {...rest}, user
  className merges last via cn.
- handlePinColumn verbatim.
- IconButton size="small" → shadcn Button variant="ghost" size="icon" +
  `h-8 w-8` in cva (small icon-button precedent); icons h-4 w-4.
- Branches verbatim: pinned → single unpin button (localization.unpin);
  else pinToLeft (PushPinIcon `rotate-90`) + pinToRight (`-rotate-90`) —
  static transforms as tailwind classes, not inline style.
- Tooltips → SRT_Tooltip (default side).

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
