# Plan: SRT_EditCellTextField ← MRT_EditCellTextField

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/inputs/SRT_EditCellTextField.tsx`.
Garbage-zone; author fresh — but READ the garbage file first and PRESERVE the
June first-class `onEditingCellSave` wiring (SRT-only API, fired on
blur/Enter for editDisplayMode 'cell'|'table'; documented in tracker/core
types). Also reuse its input/select class strings.

## Resolved decisions

- Interface `extends InputProps { cell, table }`.
- Double slot merge verbatim (srtEditTextFieldProps table-level →
  columnDef-level → rest) with {cell, column, row, table} contexts;
  parseFromValuesOrFunc only.
- selectOptions read verbatim; `isSelectEdit = editVariant === 'select'`
  (MRT's extra `|| textFieldProps?.select` is a MUI TextField prop with no
  input analogue — dropped-construct comment + Note).
- saveInputValueToRowCache verbatim incl. `//@ts-expect-error` + reason.
- Handlers verbatim (compose user handler first): handleChange (+ select-edit
  immediate save), handleBlur (+ setEditingCell(null)) — PLUS the June
  onEditingCellSave call per the garbage file's wiring; handleEnterKeyDown
  (Enter + !shiftKey + completesComposition → blur via editInputRefs);
  composition start/end state verbatim; onClick stopPropagation compose.
- `columnDef.Edit` early-return verbatim.
- Render: `isSelectEdit` → native `<select>` (June classes) with
  `textFieldProps.children ?? selectOptions?.map` via getValueAndLabel
  (`<option>` elements; MenuItem = dropped construct); else `<input>` (June
  classes). Common attrs: disabled
  `parseFromValuesOrFunc(columnDef.enableEditing, row) === false`, w-full
  (fullWidth), name={column.id}, autoComplete off, value={value ?? ''},
  placeholder per MRT's NOT-modal/custom condition; MUI `label` → dropped +
  Note (modal labels are SRT_EditRowModal's concern); variant/size/margin/
  disableUnderline/SelectProps/InputProps.sx → dropped constructs w/ Notes.
- inputRef registry verbatim spirit: ref callback storing
  `editInputRefs.current[column.id] = node` (select node itself for selects —
  MRT's `.node` unwrap is MUI-specific, native select IS the node); MRT's
  self-assignment `textFieldProps.inputRef = inputRef` dropped + Note.
- `{...textFieldProps}` spread position mirrors MRT (before the composed
  handlers so composed versions win); className composed after spread.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/inputs/SRT_EditCellTextField.tsx`
--max-warnings=0. Only this file. No core, no git.
