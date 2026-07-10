# Plan: SRT_TableHeadRow ← MRT_TableHeadRow

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/head/SRT_TableHeadRow.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHeadRow.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends TableRowProps { columnVirtualizer?, headerGroup, table }`
  — core `TableRowProps` (`ComponentPropsWithRef<'tr'>`). MUI TableRowProps →
  core TableRowProps swap.
- MUI TableRow → `<tr>`.
- Slot merge: `{ ...parseFromValuesOrFunc(srtTableHeadRowProps, { headerGroup,
  table }), ...rest }` (slot already converted with headerGroup context).
- sx → cva `tableHeadRowVariants`:
  - base: `top-0 bg-background shadow-[4px_0_8px_rgba(0,0,0,0.1)]` — maps
    `backgroundColor: baseBackgroundColor` (mrtTheme dropped → bg-background,
    keep the commented mrtTheme destructure line + Note) and MRT's literal
    boxShadow `4px 0 8px alpha(black, 0.1)`.
  - variants: `layout: { grid: 'flex', semantic: '' }` (maps
    `display: layoutMode?.startsWith('grid') ? 'flex' : undefined` — pass
    grid for both grid modes);
    `sticky: { true: 'sticky', false: 'relative' }` (maps
    `position: enableStickyHeader && layoutMode === 'semantic' ? 'sticky' :
    'relative'` — compute the boolean at the call site with MRT's exact
    condition).
- Virtual padding cells verbatim: `<th style={{ display: 'flex', width:
  virtualPaddingLeft }} />` left/right conditionals (inline style — runtime px).
- Header map verbatim incl. the virtualizer index reassignment
  (`staticColumnIndex = (headerOrVirtualHeader as SRT_VirtualItem).index`),
  key, null guard, `<SRT_TableHeadCell columnVirtualizer header key
  staticColumnIndex table />` (garbage-zone import as-is; STOP if its props
  reject these — note its rebuild is wave 3 too, so if it currently lacks
  `staticColumnIndex` prop, report instead of modifying it).
- `{...tableRowProps}` spread then className composition after spread:
  `className={cn(tableHeadRowVariants({...}), tableRowProps.className)}`.

## Structure

Mirror MRT order: destructure (enableStickyHeader, layoutMode, commented
mrtTheme line, srtTableHeadRowProps), virtualizer destructure, merge, JSX.
Comments: only the mrtTheme dropped-construct note.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHeadRow.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
