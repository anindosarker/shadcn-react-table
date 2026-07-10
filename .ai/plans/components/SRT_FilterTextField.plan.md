# Plan: SRT_FilterTextField ← MRT_FilterTextField

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/inputs/SRT_FilterTextField.tsx`.
The inputs monster. Garbage-zone BUT the garbage file embodies the June
browser-verified variant renderings (native date/datetime/time inputs, native
select + multi-select, autocomplete) — locked deviations. Strategy: MRT's
LOGIC skeleton verbatim; June's variant RENDERING preserved; slots via
parseFromValuesOrFunc.

## Resolved decisions

- Interface `extends InputProps { header, rangeFilterIndex?, table }`.
- Slot merges verbatim with `args = { column, rangeFilterIndex, table }`:
  textFieldProps (table + columnDef + rest), autocompleteProps,
  datePickerProps, dateTimePickerProps, timePickerProps (all table+columnDef
  double merges; keep MRT's `as any` casts ONLY if tsc requires — try without
  first, precedent). parseFromValuesOrFunc ONLY.
- getColumnFilterInfo destructure + useDropdownOptions verbatim.
- filterChipLabel / filterPlaceholder / showChangeModeButton VERBATIM.
- States verbatim: anchorEl; filterValue lazy init (all four branches);
  autocompleteValue lazy init.
- handleChangeDebounced verbatim (June/local debounce helper like
  SRT_GlobalFilterTextField — reuse that file's helper style in-file; delay
  `isTextboxFilter ? (manualFiltering ? 400 : 200) : 1`; eslint-disable at
  the useCallback line per that precedent). handleChange /
  handleTextFieldChange (type date valueAsDate / number valueAsNumber
  branches verbatim) / autocomplete handlers / handleClear (all four
  branches + MRT's own explanatory comment kept) /
  handleClearEmptyFilterChip / handleFilterMenuOpen / isMounted effect —
  ALL verbatim (+ eslint-disable where flagged; keep
  `[column.getFilterValue()]` deps as MRT wrote them).
- `columnDef.Filter` early-return verbatim.
- Adornments (absolute-overlay layout per SRT_GlobalFilterTextField
  precedent): end = clear button (hidden-not-removed via `invisible` class
  when empty — maps MRT visibility; extra right offset `mr-5` equivalent when
  select/multi-select; h-8 w-8 scale-90 per MRT 2rem+scale(0.9); SRT_Tooltip
  placement right, span-wrapped, aria-label clearFilter) — only when
  `!isAutocompleteFilter && !isDateFilter && !filterChipLabel`; start = mode
  button (h-7 w-7, FilterListIcon, tooltip changeFilterMode, opens menu) +
  filterChipLabel chip (June chip span idiom + delete →
  handleClearEmptyFilterChip) — only when showChangeModeButton.
- commonInputProps object mirroring commonTextFieldProps' INTENT: w-full;
  helper text `<label className="text-xs leading-[0.8rem] whitespace-nowrap
  text-muted-foreground">` with filterMode lookup verbatim (below the input,
  when showChangeModeButton); ref registry
  `filterInputRefs.current[`${column.id}-${rangeFilterIndex ?? 0}`]`;
  placeholder suppressed when chip/select/multiselect; aria-label + title =
  filterPlaceholder; autoComplete off; disabled when filterChipLabel; input
  width 0 when chip (MRT hack — keep); onKeyDown stopPropagation + compose;
  minWidth map verbatim (date 160 / modes+range0 110 / range 100 / no-chip
  120 / auto) as inline style or arbitrary classes — runtime conditional
  string fine; `-mx-[2px] p-0 w-[calc(100%+4px)]`.
- Variant dispatch — PRESERVE the garbage file's June renderings, driven by
  MRT's exact conditions/order (`filterVariant?.startsWith('time'/'datetime'/
  'date')` → native `<input type="time|datetime-local|date">` with
  commonDatePickerProps semantics (onChange handleChange, value ||'') +
  picker slot props spread + clearability via the shared clear button (MUI
  field.clearable dropped + Note); autocomplete → June's input+datalist (or
  whatever the garbage uses) w/ freeSolo semantics (inputValue-driven
  handleAutocompleteInputChange + selection handleAutocompleteChange);
  else → June's native select / multi-select (multi via the garbage's
  mechanism; option rows include June checkbox + faceted counts
  `(${facetedUniqueValues.get(value)})` when !filterSelectOptions, disabled
  placeholder option) or plain `<input>` for text with
  handleTextFieldChange + onClick stopPropagation.
- `<SRT_FilterOptionMenu anchorEl header setAnchorEl setFilterValue table />`
  after, verbatim. STOP if its props reject.
- MUI-only drops with Notes: MUI pickers, Autocomplete component,
  InputAdornment, slotProps plumbing, MenuProps, inputLabel shrink, variant/
  margin, renderValue-chips for multiselect IF June solved differently
  (mirror June; if June rendered selected chips, keep).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/inputs/SRT_FilterTextField.tsx`
--max-warnings=0. Only this file. No core, no git.
