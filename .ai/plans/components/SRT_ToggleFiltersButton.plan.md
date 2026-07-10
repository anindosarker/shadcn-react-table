# Plan: SRT_ToggleFiltersButton ← MRT_ToggleFiltersButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_ToggleFiltersButton.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends ButtonProps { table }`.
- handleToggleShowFilters verbatim.
- Tooltip → SRT_Tooltip title `rest?.title ?? localization.showHideFilters`.
- Button ghost/icon, aria-label verbatim, {...rest}, `title={undefined}`;
  `showColumnFilters ? FilterListOffIcon : FilterListIcon` h-4 w-4.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git.
