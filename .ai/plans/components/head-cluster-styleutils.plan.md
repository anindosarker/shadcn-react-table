# Plan: core cell-style helpers (style.utils.ts only)

Single-writer task on `packages/shadcn-react-table-core/src/utils/style.utils.ts`.
Reference: MRT `packages/material-react-table/src/utils/style.utils.ts`
(`getCommonMRTCellStyles`, `getCommonPinnedCellStyles`). Goal: give
SRT_TableHeadCell / SRT_TableBodyCell / SRT_TableFooterCell the shared RUNTIME
style logic MRT keeps in core, WITHOUT importing MUI theme concepts. Visual
styling (colors/opacity) stays at the component layer as Tailwind classes —
these helpers return only positional/sizing CSSProperties.

## Add two exports (mirror MRT logic, strip theme/sx)

1. `getSRTPinnedCellStyles({ column, table })` — mirrors MRT
   getCommonPinnedCellStyles POSITIONAL output only:
   ```
   left: isPinned==='left' ? `${column.getStart('left')}px` : undefined,
   right: isPinned==='right' ? `${column.getAfter('right')}px` : undefined,
   position: 'sticky',
   zIndex: /* mirror MRT: 1, or 2 when... read MRT and copy its zIndex rule */
   ```
   No backgrounds, no box-shadows (component layer paints those via
   data-pinned + classes — locked June deviation).
2. `getSRTCellWidthStyles({ column, header, table })` — mirrors MRT's
   widthStyles + layoutMode flex logic from getCommonMRTCellStyles verbatim:
   minWidth `max(calc(var(--header|col-X-size) * 1px), ${minSize ?? 30}px)`,
   width `calc(var(--header|col-X-size) * 1px)`, and the grid /
   grid-no-grow flex branches (grid: `flex: ${grow===0/false ? 0 :
   var(--...-size)} 0 auto`; grid-no-grow: `flex: ${+(grow||0)} 0 auto`).
   Uses parseCSSVarId. Returns CSSProperties.

Type them with existing SRT types (SRT_Column, SRT_Header,
SRT_TableInstance); import CSSProperties from react (type-only, inline `type`
marker style). Export both from the file (core index already `export *`).

## Gates

`pnpm prettier --write` the file; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean.
Touch ONLY style.utils.ts. Do not modify parseCSSVarId/getCommonTooltipProps.
No git.
