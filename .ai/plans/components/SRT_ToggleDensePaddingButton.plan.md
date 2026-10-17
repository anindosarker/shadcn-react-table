# Plan: SRT_ToggleDensePaddingButton ← MRT_ToggleDensePaddingButton

Pair: `packages/shadcn-react-table/src/components/ui/shadcn-react-table/buttons/SRT_ToggleDensePaddingButton.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends ButtonProps { table }`.
- handleToggleDensePadding cycle verbatim (comfortable→compact→spacious→
  comfortable).
- Tooltip → SRT_Tooltip title `rest?.title ?? localization.toggleDensity`.
- Button ghost/icon, aria-label verbatim, {...rest}, `title={undefined}`;
  icon ternary verbatim: compact→DensitySmallIcon, comfortable→
  DensityMediumIcon, else DensityLargeIcon (h-4 w-4).

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git.
