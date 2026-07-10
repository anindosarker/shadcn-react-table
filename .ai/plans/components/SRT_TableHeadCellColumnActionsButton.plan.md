# Plan: SRT_TableHeadCellColumnActionsButton ← MRT_TableHeadCellColumnActionsButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/head/SRT_TableHeadCellColumnActionsButton.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHeadCellColumnActionsButton.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends ButtonProps { header, table }` (MRT extends IconButtonProps).
- MUI IconButton → native `<button type="button">`; MUI Tooltip → `SRT_Tooltip`
  with `{...getCommonTooltipProps('top')}` (core export, verify) and
  `title={iconButtonProps?.title ?? localization.columnActions}`; button gets
  `title={undefined}` after the spread exactly like MRT (strips native title so
  tooltip owns it).
- Double slot merge mirrors MRT: table-level `srtColumnActionsButtonProps`,
  then `columnDef.srtColumnActionsButtonProps`, then `...rest`.
- `anchorEl` useState + conditional `<SRT_ColumnActionMenu anchorEl={anchorEl}
  header setAnchorEl table />` — mirror verbatim. The menu is garbage-zone
  (`../menus/SRT_ColumnActionMenu`, import as-is; the anchorEl→shadcn-primitive
  bridge is ITS problem, rebuilt in menus/ cluster). If its props interface
  rejects these four props, STOP and report.
- `handleClick` verbatim (stopPropagation, preventDefault, setAnchorEl).
- sx → cva `columnActionsButtonVariants`: base
  `h-8 w-8 -my-2 -mx-1 opacity-30 transition-all duration-150 hover:opacity-100
  inline-flex items-center justify-center rounded-md` (last three = minimal
  native-button reset for the icon-button look; MUI IconButton default
  centering/rounding counts as spec per General notes).
- `size="small"` MUI prop → dropped construct comment + Note (sizing lives in
  the h-8/w-8 classes).
- children fallback: `iconButtonProps?.children ?? <MoreVertIcon
  style={{ transform: 'scale(0.9)' }} size={16} />` — icon from
  `table.options.icons`, MRT's literal inline transform.
- `aria-label={localization.columnActions}`, onClick BEFORE spread (user can
  override, same as MRT).
- className composes after spread: `className={cn(columnActionsButtonVariants(),
  iconButtonProps?.className)}` placed after `{...iconButtonProps}`.

## Structure

Mirror MRT order: destructure (`icons: { MoreVertIcon }, localization,
srtColumnActionsButtonProps`), `column`/`columnDef`, anchorEl state,
handleClick, merge, JSX fragment (Tooltip>button, then conditional menu).
Comments: only the dropped size="small" note.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHeadCellColumnActionsButton.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
