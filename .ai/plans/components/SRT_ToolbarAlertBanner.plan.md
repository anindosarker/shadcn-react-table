# Plan: SRT_ToolbarAlertBanner ← MRT_ToolbarAlertBanner

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/toolbar/SRT_ToolbarAlertBanner.tsx`.

## REV 2 (2026-07-10, user-approved shadcn-first rewrite) — SUPERSEDES Rev 1 below

User ruling: when a shadcn/ui component exists for the MUI counterpart, use it
(add via CLI if missing; components.json = radix/new-york flavor). Rev 1's raw
div/span/button mappings are replaced; everything else (structure, verbatim
logic, Notes, localization chains) carries over unchanged.

### Resolved decisions

- **Install shadcn Alert first**: `pnpm dlx shadcn@latest add alert` run in
  `apps/test-shadcn/` (creates `src/components/ui/alert.tsx` with Alert,
  AlertTitle, AlertDescription). STOP if CLI output deviates from radix/
  new-york flavor.
- **MUI `<Alert color="info" icon={false}>` → shadcn `<Alert>`** (renders div,
  role="alert"). Keep class hook `Srt-ToolbarAlertBanner`. Keep cva
  `toolbarAlertBannerVariants`, extended to neutralize shadcn Alert's own base
  where MRT's sx differs: `block` (kills the has-[>svg] grid — no icon),
  `border-none rounded-none p-0 text-base` + existing `relative left-0 right-0
  top-0 z-[2] w-full bg-primary/10 text-foreground` + bottomOffset `-mb-4`
  variant. Alert's internal `cn(alertVariants(), className)` twMerges our
  classes last, so conflicts resolve our way; user className still merges after
  ours via the existing `cn(...)` call.
- **Interface** `extends React.ComponentProps<typeof Alert> { stackAlertBanner?,
  table }` (EditRowModal/DialogContent precedent; MRT extends AlertProps).
  Table-option slot `srtToolbarAlertBannerProps` stays DivProps in core —
  Alert root is a div; spreads fine.
- **AlertTitle slot**: `alertProps?.title && <AlertTitle className="mb-1">` —
  replaces Rev 1's raw div. Note: shadcn AlertTitle line-clamp-1 truncates
  multi-line titles (MUI doesn't) — accepted; `title` remains the HTML string
  attr (string-vs-node narrowing Note stays). AlertDescription NOT used — the
  message wrapper stays the plain div carrying the runtime `maxWidth` inline
  style (maps MUI's internal `.MuiAlert-message` slot, not a component).
- **Chip → shadcn `<Badge variant="secondary">`**, exact FilterTextField
  precedent (`SRT_FilterTextField.tsx:363-373`): `<Badge variant="secondary"
  {...chipProps} className={cn('gap-1', chipProps?.className)}>` wrapping the
  header label + raw `<button type="button">` with `<CloseIcon
  className="size-3" />` wired to `toggleGrouping()`. Keep the
  `icons: { CloseIcon }` destructure (Badge has no built-in delete — MUI Chip
  onDelete's internal CancelIcon has no analog; Note). Delete button carries no
  aria-label (MUI's internal delete icon is likewise unlabeled; Note — do not
  invent localization keys). Note MUI Chip's rounded-full geometry yields to
  shadcn Badge rounded-md (matches filter-chip precedent).
- **Core type change (single-writer)**: add `export type SpanProps =
  React.ComponentPropsWithRef<'span'>` next to DivProps;
  `srtToolbarAlertBannerChipProps` DivProps → SpanProps (Badge renders span).
- **Clear-selection MUI `<Button size="small" sx={{p:'2px'}}>` → shadcn
  `<Button variant="ghost" size="sm">`** + cva `'p-[2px] text-primary'` (MUI
  text-variant map: primary text, ghost hover:bg-accent kept per CopyButton
  ruling). Replaces Rev 1's raw button + hover:underline (underline was
  invented — MUI text buttons don't underline; drop it).
- Everything else verbatim from current file: Collapse→conditional Note,
  selectedRowCount useMemo + eslint-disable, localization replace chains,
  density padding map, head-overlay SelectCheckbox block, br logic,
  renderToolbarAlertBannerContent precedence, alertProps/chipProps
  parseFromValuesOrFunc merges.

### Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Files touched: this
component, `ui/alert.tsx` (CLI-generated, don't hand-edit), core types.ts
(SpanProps + chip slot only). No git. Browser re-test: ToolbarsDemo banner
(selection count + clear, grouping chips + remove, head-overlay).

---

## Rev 1 (superseded)

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
