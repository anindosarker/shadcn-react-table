# Plan: SRT_ShowHideColumnsButton ← MRT_ShowHideColumnsButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_ShowHideColumnsButton.tsx`.
Garbage-zone; author fresh. Menu dependency review-clean
(menus/SRT_ShowHideColumnsMenu — anchorEl/setAnchorEl/table interface).

## Resolved decisions

- Interface `extends ButtonProps { table }`.
- anchorEl state + handleClick (`event.currentTarget`) verbatim.
- Tooltip → SRT_Tooltip title `rest?.title ?? localization.showHideColumns`.
- Button ghost/icon, aria-label verbatim, {...rest}, `title={undefined}`
  after spread; ViewColumnIcon h-4 w-4.
- `{anchorEl && <SRT_ShowHideColumnsMenu anchorEl setAnchorEl table/>}`
  verbatim.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git.
