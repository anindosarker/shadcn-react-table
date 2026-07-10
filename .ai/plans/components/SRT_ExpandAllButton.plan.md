# Plan: SRT_ExpandAllButton ← MRT_ExpandAllButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_ExpandAllButton.tsx`.
Garbage-zone; author fresh. Slot `srtExpandAllButtonProps` converted to
value-or-func ButtonProps (verify; STOP if still `SRT_HTMLProps`). CALLED BY
core display-column dispatch in SRT_TableHeadCell (`mrt-row-expand`) — keep
the `{ table }`-only required props.

## Resolved decisions

- Interface `extends ButtonProps { table }`.
- iconButtonProps = slot (`{table}` context) + {...rest} merge verbatim.
- Tooltip → SRT_Tooltip with getCommonTooltipProps defaults, title precedence
  `iconButtonProps?.title ?? (isAllRowsExpanded ? localization.collapseAll :
  localization.expandAll)`; keep the `<span>` wrapper (disabled-button
  tooltip anchor, MRT-verbatim).
- Button ghost/icon; disabled `isLoading || (!renderDetailPanel &&
  !getCanSomeRowsExpand())` verbatim; onClick toggleAllRowsExpanded verbatim;
  `title={undefined}` after spread.
- Density sizing via cva variants: compact → `h-7 w-7`; else `h-9 w-9 -mt-1`
  (1.75rem/2.25rem, mt -0.25rem only when not compact).
- children precedence `iconButtonProps?.children ?? <KeyboardDoubleArrowDownIcon/>`
  verbatim; icon rotation `-180 / -90 / 0` by
  isAllRowsExpanded/getIsSomeRowsExpanded → conditional classes
  `-rotate-180`/`-rotate-90`/`rotate-0` + `transition-transform duration-150`.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
