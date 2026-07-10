# Plan: SRT_ToggleGlobalFilterButton ← MRT_ToggleGlobalFilterButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_ToggleGlobalFilterButton.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends ButtonProps { table }`.
- handleToggleSearch verbatim incl. `queueMicrotask(() =>
  searchInputRef.current?.focus())`.
- Tooltip → SRT_Tooltip title `rest?.title ?? localization.showHideSearch`;
  aria-label same precedence (MRT uses rest?.title ?? … here too).
- Button ghost/icon; disabled `!!globalFilter && showGlobalFilter` verbatim;
  {...rest}, `title={undefined}`; `showGlobalFilter ? SearchOffIcon :
  SearchIcon` h-4 w-4.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git.
