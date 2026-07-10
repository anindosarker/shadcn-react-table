# Plan: SRT_TableHeadCellSortLabel ← MRT_TableHeadCellSortLabel

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/head/SRT_TableHeadCellSortLabel.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHeadCellSortLabel.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends ButtonProps { header, table }` (MUI TableSortLabel is a
  ButtonBase → native `<button type="button">`). `ButtonProps` comes from core
  (added by the head-cluster types task).
- MUI `Tooltip` → `SRT_Tooltip` (existing deviation component,
  `../SRT_Tooltip` — import as-is even though garbage-zone; its own pair later)
  with `placement="top" title={sortTooltip}`.
- MUI `Badge` (multi-sort index) → conditional absolute-positioned
  `<span>` rendering `column.getSortIndex() + 1` only when
  `sorting.length > 1 && column.getSortIndex() >= 0` (MUI hides badgeContent 0
  — mirror that semantics). Classes: tiny round bottom-right offset badge,
  `absolute -right-1.5 -top-1 text-[0.65rem] text-muted-foreground`.
  Wrapper `<span className="relative">` replaces Badge's anchor.
- Icon logic mirrors MRT exactly: unsorted → `SyncAltIcon` from
  `table.options.icons` with inline
  `style={{ transform: 'rotate(-90deg) scaleX(0.9) translateX(-1px)' }}` (keep
  MRT's literal transform, inline style is what MRT uses); sorted →
  `ArrowDownwardIcon`, `direction === 'asc'` adds `rotate-180` class (MUI
  TableSortLabel flips the arrow for asc), with `transition-transform`.
- sx map → cva `sortLabelVariants`: base
  `w-[3ch] shrink-0 transition-all duration-150` + variant
  `sorted: { true: 'opacity-100', false: 'opacity-30' }`. Icon color →
  `text-muted-foreground` on the icon (maps MUI's forced secondary text color).
- `active`, `aria-label={sortTooltip}`, `direction`, onClick
  (stopPropagation + `header.column.getToggleSortingHandler()?.(e)`), `{...rest}`
  — all mirrored. MUI-only props (`active`, `direction`, `IconComponent`) have
  no native equivalent as ATTRS: `direction` drives the rotate class,
  `IconComponent` becomes the ternary icon render inside the button, `active`
  is dropped with a commented line + `// Note:` (always-true in MRT here).
- `sortTooltip` string logic copied verbatim (all 4 localization branches).
- Icon size: `size={16}` on both icons (compact header icon, matches June
  sizing) — user-overridable via nothing (icons not slotted in MRT either).

## Structure

Mirror MRT order: destructure (`icons: { ArrowDownwardIcon, SyncAltIcon }`,
`localization`), `column`/`columnDef`, state (`isLoading, showSkeletons,
sorting`), `isSorted`, `sortTooltip`, `direction`, JSX
Tooltip > badge-anchor span > button. Comments: only dropped-construct notes.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHeadCellSortLabel.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
