# Plan: SRT_FilterOptionMenu ← MRT_FilterOptionMenu

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/menus/SRT_FilterOptionMenu.tsx`.
Garbage-zone; author fresh. Shell = DropdownMenu + fixed-span bridge (locked).

## Resolved decisions

- Export `srtFilterOptions(localization)` mirroring `mrtFilterOptions`
  VERBATIM (all 14 options, dividers, symbols) + the module consts
  (rangeModes/emptyModes/arrModes/rangeVariants) verbatim. Type
  `SRT_InternalFilterOption` exists in core.
- Interface `extends ComponentPropsWithRef<typeof DropdownMenuContent>
  { anchorEl, header?, onSelect?, setAnchorEl, setFilterValue?, table }`.
- ALL logic VERBATIM: allowedColumnFilterOptions + rangeVariants narrowing;
  internalFilterOptions useMemo (both branches, `[]` deps + authorized
  eslint-disable); handleSelectFilterMode COMPLETE (global branch, column
  branch with all four reset paths and MRT's inline comments preserved —
  they're MRT's own); filterOption ternary. `column as any` casts in the
  render-prop calls: try without, keep + disable if forced.
- Shell: DropdownMenu + bridge; MRT anchorOrigin right/center → Content
  `side="right" align="center"`; density dense → menu-level content class
  when compact; menuBackgroundColor/disableScrollLock dropped Notes.
- Children precedence verbatim (columnDef.renderColumnFilterModeMenuItems ??
  table option ?? global render ?? internal map). Item map: `<SRT_ActionMenuItem
  divider={divider} icon={<span>{symbol}</span>} key={index} label={label}
  onClick={() => handleSelectFilterMode(option)} table={table}
  className={option === filterOption ? 'bg-accent' : undefined} />` —
  MUI `selected` → conditional bg-accent className (call-site, no new prop;
  Note), MUI `value` dropped (form semantics, no visual role; Note). Symbol
  is a string → wrap in a span so the icon slot renders it.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/menus/SRT_FilterOptionMenu.tsx`
--max-warnings=0. Only this file. No core, no git. parseFromValuesOrFunc n/a
(no slots here — don't invent any).
