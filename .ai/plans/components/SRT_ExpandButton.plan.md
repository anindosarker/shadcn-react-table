# Plan: SRT_ExpandButton ← MRT_ExpandButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_ExpandButton.tsx`.
Garbage-zone; author fresh. Slot `srtExpandButtonProps` converted
(`{row, staticRowIndex?, table}` → ButtonProps; verify; STOP if still
`SRT_HTMLProps`). Called by body display-column dispatch (`mrt-row-expand`).

## Resolved decisions

- Interface `extends ButtonProps { row, staticRowIndex?, table }`. MRT does
  NOT spread ...rest (destructures only the 3 named props; rest unused) —
  mirror exactly: no rest capture, no spread.
- iconButtonProps = slot parse only (`{row, staticRowIndex, table}`).
- canExpand/isExpanded/detailPanel (`!!renderDetailPanel?.({row, table})`)
  verbatim; handleToggleExpand verbatim (stopPropagation, toggleExpanded,
  compose slot onClick).
- Tooltip → SRT_Tooltip: `disableHoverListener={!canExpand && !detailPanel}`
  → `disabled` prop; title precedence verbatim; keep `<span>` wrapper.
- Button ghost/icon; disabled verbatim; density sizing cva: compact `h-7 w-7`
  else `h-9 w-9`; opacity `!canExpand && !detailPanel ? opacity-30 :
  opacity-100` conditional class.
- Depth indent: MRT `[rtl || positionExpandColumn === 'last' ? 'mr' : 'ml']:
  row.depth * 16px` — DROP the theme.direction rtl check (`// Note:` no theme
  direction in SRT), keep `positionExpandColumn === 'last' ? marginRight :
  marginLeft` as inline style (runtime value).
- Icon: children precedence verbatim; rotation formula verbatim (90/-90 when
  leaf-without-detail by positionExpandColumn==='last' [rtl dropped], else
  isExpanded ? -180 : 0) → inline style transform (multi-branch runtime
  formula) + `transition: transform 150ms` kept in same style object.
- `title={undefined}` after spread verbatim.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
