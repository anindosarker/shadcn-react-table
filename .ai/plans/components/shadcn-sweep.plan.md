# Plan: shadcn-first sweep (all components below ToolbarAlertBanner)

User directive (2026-07-11): wherever a shadcn/ui component exists, use it —
don't reinvent. **NO className overrides of shadcn component default styles.
Variants only.** className on a shadcn component is allowed ONLY for layout
(positioning, margins, flex/grid placement, transforms for icon direction) —
never colors, typography, opacity, sizing, padding, radius. Hand-rolled
elements that duplicate a shadcn component get replaced. MRT structure/logic
stays verbatim as always; where shadcn defaults differ visually from MRT
(size-9 vs MUI small, rounded-md vs rounded-full, h-2 progress vs h-1), the
shadcn default WINS — drop the MRT pixel value with a `// Note:`.

Newly installed (CLI, formatted, do not hand-edit): `ui/spinner.tsx`,
`ui/input-group.tsx`, `ui/skeleton.tsx`, `ui/pagination.tsx`, `ui/field.tsx`.
Already installed: alert badge button checkbox collapsible command dialog
dropdown-menu input label popover progress select separator slider switch
table textarea tooltip.

Shared rules for every file:
- parseFromValuesOrFunc only; MRT-exact deps + authorized eslint-disable;
  dropped constructs stay as comments + `// Note:`.
- cva stays ONLY for the component's own non-shadcn elements/wrappers. If a
  file's cva existed solely to restyle a shadcn component, delete it.
- Icons inside Button: no size classes (button.tsx auto-sizes svg). Keep
  rtl/rotation transform classes (directional semantics, layout).
- Raw `<table>/<tr>/<td>` markup stays (user-approved exception).
- SINGLE CORE WRITER: only coder-sweep-toolbar may edit
  packages/shadcn-react-table-core. Anyone else needing a core change STOPS
  and reports to main.
- Gates per file: prettier --write; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json
  --noEmit` clean (ignore TS5101); `pnpm --filter test-shadcn exec eslint
  <app-relative path> --max-warnings=0`. No git. Never touch the shared dev
  server (:5273).

## Cluster T — toolbar (coder-sweep-toolbar; ONLY core writer)

### SRT_LinearProgressBar.tsx
- Hand-rolled bar divs → `<Progress value={value} />` (ui/progress,
  installed). Keep wrapper div + its cva (own element, positioning variants).
  `progressRoot` slot (DivProps) spreads onto Progress (radix root = div).
  Existing useSRT_ProgressAnimation value drives `value`. Shadcn default look
  (h-2, rounded-full, bg-primary/20) replaces the hand-rolled equivalents —
  delete linearProgressRootVariants cva. aria: Progress supplies
  role/progressbar; drop manual aria-busy/aria-label with Note.

### SRT_TablePagination.tsx
- 4 raw first/prev/next/last icon buttons → `<Button variant="ghost"
  size="icon" type="button">`; delete paginationIconButtonVariants cva. Keep
  SRT_Tooltip + disabled logic + rtl rotate classes on icons; drop h-4 w-4
  icon sizing.
- Rows-per-page native `<select>` → shadcn Select (installed):
  Select value={String(pageSize)} onValueChange={(v) => setPageSize(+v)};
  SelectTrigger size="sm" + SelectValue; SelectContent > SelectGroup >
  SelectItem per rowsPerPageOptions. MRT's SelectProps.native mobile branch
  stays a dropped-construct comment.
- CORE EDIT (only one authorized): `srtPaginationProps` slot's `SelectProps?:
  Partial<ComponentPropsWithRef<'select'>>` no longer matches — retype to
  `SelectProps?: Partial<ButtonProps>` (spread target = SelectTrigger, a
  button) + `// Note:`; keep showFirstButton/showLastButton literals.
  Existing `SelectProps?.children` custom-options branch: children can't
  inject native options into radix — keep reading `children` off the slot
  before spreading (exclude from trigger spread) and render them inside
  SelectContent when provided, else map rowsPerPageOptions.
- 'pages' mode → shadcn Pagination composition (ui/pagination, installed):
  Pagination > PaginationContent > PaginationItem with PaginationLink
  isActive={page===current} onClick (no href), PaginationPrevious/Next if the
  current code renders prev/next there, PaginationEllipsis for gaps. Replaces
  the current Button-built pages row. No className restyling of Pagination
  parts.

## Cluster H — head (coder-sweep-head)

### SRT_TableHeadCellColumnActionsButton.tsx
- Raw button → `<Button variant="ghost" size="icon" type="button">` +
  {...iconButtonProps} + aria-label kept. Delete columnActionsButtonVariants
  cva (was pure Button restyle). Keep opacity/hover MRT sx? NO — styling
  classNames forbidden; shadcn default look. Note the dropped sx.
- Slot iconButtonProps is ButtonProps — still spreads clean.

### SRT_TableHeadCellFilterLabel.tsx
- Raw button → Button ghost icon type="button"; delete filterLabelVariants
  styling; keep the popover anchoring logic + span wrapper (tooltip anchor
  while transitioning). Icon keeps no size class.

### SRT_TableHeadCellSortLabel.tsx
- Raw button → `<Button variant="ghost" size="icon" type="button">` with
  DEFAULT styles (user ruling — no className overrides at all here). Keep
  stopPropagation + getToggleSortingHandler + {...rest} + aria-label. Sort
  direction icon + its rotation transform classes stay (directional). Delete
  the restyling cva; keep badge/active-opacity behavior ONLY if it lives on
  SRT-owned elements (icons), never on Button.

### SRT_TableHeadCellResizeHandle.tsx
- `<hr>` divider → `<Separator orientation="vertical">` (installed). Keep the
  outer grab div + its cva (own element). Active-state highlight via parent
  selector on the OWN wrapper (e.g. `[&:active>[data-slot=separator]]:bg-primary`)
  — allowed (wrapper is SRT-owned; no className on Separator itself beyond
  none). rest spread: currently cast to hr props — Separator root is a div;
  DivProps spread fits, drop the hr cast + update Note.

## Cluster I — inputs (coder-sweep-inputs; NO core edits — STOP if needed)

### SRT_GlobalFilterTextField.tsx
- Raw `<input>` + 2 absolute-positioned raw adornment buttons → InputGroup
  composition (ui/input-group): `<InputGroup><InputGroupAddon
  align="inline-start"><InputGroupButton onClick={handleGlobalFilterMenuOpen}
  aria-label={localization.changeSearchMode}><SearchIcon/></InputGroupButton>
  </InputGroupAddon><InputGroupInput {...}/><InputGroupAddon
  align="inline-end"><InputGroupButton disabled={!searchValue?.length}
  onClick={handleClear} aria-label={localization.clearSearch}><CloseIcon/>
  </InputGroupButton></InputGroupAddon></InputGroup>`. Read ui/input-group.tsx
  first for exact API (align values, InputGroupButton size). Keep SRT_Tooltip
  wrappers around the addon buttons (tooltip anchors the disabled clear via
  span if still needed). Collapse animation/width behavior (if any) stays on
  the SRT-owned wrapper. Delete globalFilterIconButtonVariants cva. searchInputRef
  wiring moves onto InputGroupInput ref. InputProps slot still spreads onto
  InputGroupInput (input element ✓).

### SRT_FilterTextField.tsx
- Text/autocomplete variants: raw Input + absolute adornments → same
  InputGroup composition (mode button = inline-start addon when
  showChangeModeButton; clear button = inline-end addon). Badge chip block
  stays as-is (already compliant). Select/multi/range/date variants keep
  their existing shadcn controls. Delete now-unused absolute-positioning
  cva/classes that existed to fake adornments. This file is large — change
  ONLY the adornment/input shell, keep all filter logic verbatim.

### SRT_EditCellTextField.tsx
- Raw `<input>` → ui/Input (spreads InputProps slot fine). Keep all
  handlers/refs/controlled-value ordering (incl. the value-after-spread Note).
- Raw `<select>` → shadcn Select (installed): Select value={value ?? ''}
  onValueChange={(v) => { saveInputValueToRowCache(v); }} +
  onOpenChange={(open) => { if (!open) handleBlur-equivalent }} — map the
  native blur-save/Enter-blur semantics: radix Select commits on item select;
  after commit, setEditingCell(null) per MRT's blur path. SelectTrigger
  size="sm" gets the ref wiring (editInputRefs — cast, keep existing `as
  unknown as HTMLInputElement` idiom + Note). placeholder option → SelectValue
  placeholder. selectOptions map → SelectContent > SelectGroup > SelectItem.
  `textFieldProps.children` native-option passthrough can't render inside
  radix — dropped-construct comment + Note (children ignored for select
  variant). Keep columnDef.Edit early return + disabled logic verbatim.
  This is the riskiest file of the sweep — flag anything ambiguous to main
  instead of inventing.

## Cluster B — body/table/buttons/menus/modals (coder-sweep-body)

### body/SRT_TableBodyCell.tsx (skeleton block only)
- animate-pulse div → `<Skeleton />` (ui/skeleton) with the SAME runtime
  width/height inline style (runtime values stay inline per convention).
  Remove 'animate-pulse rounded-md bg-muted' classes (Skeleton's defaults).
  Touch nothing else in the file.

### table/SRT_TableLoadingOverlay.tsx
- LoaderCircleIcon animate-spin → `<Spinner />` (ui/spinner) spread with
  circularProgressProps (slot extends LucideProps — svg props fit Spinner).
  Keep Component override precedence + overlay wrapper + localization.
  Delete the animate-spin/size classes (Spinner defaults). size-[18px] MRT
  value drops with Note (Spinner default size wins).

### buttons/SRT_EditActionButtons.tsx
- Saving LoaderCircleIcon → `<Spinner />`. Also strip styling classNames from
  its shadcn Buttons if any (variants only); keep layout-only classes.

### body/SRT_TableDetailPanel.tsx
- Commented-out MUI Collapse → `<Collapsible open={row.getIsExpanded()}>
  <CollapsibleContent>` (ui/collapsible, installed) around the panel content,
  replacing the bare conditional where it maps Collapse. Keep td/colSpan
  structure raw (table markup exception). If the Collapsible wrapper inside
  td breaks layout/virtualization measurement, STOP and report — do not force.

### menus/SRT_ActionMenuItem.tsx
- Submenu arrow raw button → `<Button variant="ghost" size="icon"
  type="button">` (keep onClick/onMouseEnter). DropdownMenuSeparator usage
  already correct.

### buttons/ style-normalization (all 13 files)
- Remove STYLING classNames/cva entries applied to shadcn Buttons: opacity-*,
  hover:opacity-*, transition-opacity, h-8/w-8 size overrides, text/color
  overrides. Keep: layout (ml-*, absolute, shrink-0), icon
  rotation/direction transforms. size="icon" default (size-9) replaces h-8
  w-8. Each removal → Note on the dropped MRT sx. This intentionally changes
  verified visuals (e.g. GrabHandle 0.5→1 opacity) per user ruling — list
  every behavior change in your report to main.

### modals/SRT_EditRowModal.tsx
- Internal edit stack `div flex flex-col gap-8` → `<FieldGroup>` (ui/field)
  if it composes cleanly with SRT_EditCellTextField children (they render
  bare inputs; Field wrappers per child are NOT required — FieldGroup as the
  stack container only). If FieldGroup's defaults fight the modal layout,
  keep the div and report. DialogFooter/Buttons untouched.

## Review + test

Per cluster: adversarial reviewer walks MRT source vs result (≤3 bounces).
After all clusters review-clean: one tester stages/extends demos at TOP of
App.tsx and playwright-verifies against :5273 — pagination (both modes +
rows-per-page select), progress bars, loading overlay spinner, skeletons,
global filter InputGroup (mode menu, clear), filter text field adornments,
edit cell select commit, detail panel expand animation, head buttons
(actions/filter/sort), grab-handle/copy/expand buttons post-normalization.
Console must stay clean. Screenshots `.playwright/screenshots/sweep-*`.
