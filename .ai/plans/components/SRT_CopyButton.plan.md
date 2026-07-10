# Plan: SRT_CopyButton ← MRT_CopyButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_CopyButton.tsx`.
Garbage-zone; author fresh. Slot types converted (`srtCopyButtonProps` →
value-or-func ButtonProps at BOTH table and columnDef level — verify before
starting; STOP if still `SRT_HTMLProps`).

## Resolved decisions

- Interface `extends ButtonProps { cell, table }`.
- copied state + handleCopy verbatim (stopPropagation, clipboard.writeText,
  4000ms reset).
- buttonProps merge order verbatim: table `srtCopyButtonProps` → columnDef
  `srtCopyButtonProps` → {...rest}; both slots parsed with full
  `{cell, column, row, table}` context.
- Tooltip → SRT_Tooltip side="top", title precedence `buttonProps?.title ??
  (copied ? localization.copiedToClipboard : localization.clickToCopy)`.
- Button: shadcn Button variant="ghost" size="sm" type="button"; cva maps sx:
  `m-[-0.25rem] min-w-0 border-none bg-transparent py-0 font-[inherit]
  text-[inherit] tracking-[inherit] text-inherit [text-align:inherit]
  [text-transform:inherit] cursor-copy h-auto` (inherit typography so the
  cell renders as plain text; hover keeps bg-transparent). `title={undefined}`
  after spread verbatim.
- onClick `(e) => handleCopy(e, cell.getValue())` BEFORE {...buttonProps}
  (MRT order — user onClick in slot/rest wins).

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
