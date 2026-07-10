# Plan: SRT_ToolbarAlertBanner ← MRT_ToolbarAlertBanner

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/toolbar/SRT_ToolbarAlertBanner.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends DivProps { stackAlertBanner?, table }` (MRT extends
  AlertProps). MRT reads `alertProps.title` / `alertProps.children` — DivProps
  has children but NOT title-as-ReactNode (HTML title attr is string).
  Decision: keep `alertProps?.title` read but typed via the DivProps `title`
  (string) rendered in the AlertTitle slot — MUI AlertTitle → `<div
  className="mb-1 font-medium">`; Note the string-vs-node narrowing.
- Core util: `getSRT_SelectAllHandler` (row.utils) — verify export; STOP if
  missing.
- MUI Collapse (timeout 200/0) → conditional render on MRT's exact condition
  `showAlertBanner || !!selectedAlert || !!groupedAlert` + dropped-Collapse
  Note (timeout nuance dropped with it).
- MUI Alert color="info" icon={false} → div, class hook `Srt-ToolbarAlertBanner`;
  cva `toolbarAlertBannerVariants` base `relative left-0 right-0 top-0 z-[2]
  w-full rounded-none p-0 text-base bg-primary/10 text-foreground` (info alert
  → primary-tinted banner; Note) + conditional `-mb-4` when `!stackAlertBanner
  && positionToolbarAlertBanner === 'bottom'` (mb -1rem).
- `.MuiAlert-message` maxWidth → inline style on the content wrapper div:
  `maxWidth: calc(${tableLayoutRef.current?.clientWidth ?? 360}px - 1rem)`,
  width 100% (tablePaperRef → tableLayoutRef rename) — runtime, inline.
- selectedAlert verbatim: Stack → div `flex flex-row items-center gap-4`;
  localization replace chain verbatim; MUI Button size=small →
  `<button type="button" className="rounded-md p-[2px] text-sm text-primary
  hover:underline">` (text-button map) with
  `getSRT_SelectAllHandler({ table })(event, false, true)` verbatim.
- groupedAlert verbatim: span; Chip → `<span className="inline-flex
  items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-sm">`
  with label + a delete `<button>` (X icon from registry: CloseIcon, size 14)
  wired to `toggleGrouping()`; `{...chipProps}` spread on the chip span
  (converted slot, DivProps).
- Padding Stack → div with MRT's density-conditional padding map verbatim
  (head-overlay: spacious px-5 py-3 / comfortable px-3 py-2 / compact
  px-2 py-1; else px-4 py-2).
- Children layout verbatim: renderToolbarAlertBannerContent ?? (title +
  stack: children, br logic, flex Box with head-overlay SelectCheckbox
  condition + selectedAlert, br, groupedAlert). SRT_SelectCheckbox import
  (inputs/ garbage) as-is; STOP if `table`-only props rejected.
- selectedRowCount useMemo verbatim + authorized eslint-disable if flagged.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/toolbar/SRT_ToolbarAlertBanner.tsx`
--max-warnings=0. Only this file. No core, no git.
