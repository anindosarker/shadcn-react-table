# Plan: SRT_GlobalFilterTextField ← MRT_GlobalFilterTextField

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/inputs/SRT_GlobalFilterTextField.tsx`.
Garbage-zone; author fresh — but READ the garbage file first for (a) its input
class string (browser-verified June styling) and (b) its debounce mechanism;
reuse both.

## Resolved decisions

- Interface `extends InputProps { table }` (MRT extends TextFieldProps).
- Slot merge `{ ...parseFromValuesOrFunc(srtSearchTextFieldProps, { table }),
  ...rest }`.
- MUI Collapse (horizontal) → conditional render on `showGlobalFilter` +
  dropped-Collapse Note.
- MUI TextField anatomy → wrapper div `relative flex items-center` containing:
  - start adornment: `enableGlobalFilterModes ? <search-mode button>` (icon
    button reset classes h-7 w-7 per MRT 1.75rem, SRT_Tooltip
    title=changeSearchMode, onClick opens menu) `: <SearchIcon
    style={{marginRight:'4px'}} size={16}/>` (MRT literal inline mr).
  - `<input>` with June's class string (from garbage file),
    `autoComplete="off"`, `placeholder={localization.search}`,
    onChange=handleChange, `value={searchValue ?? ''}`, `{...textFieldProps}`
    spread (user wins; className composed after), ref callback assigning
    `searchInputRef.current`.
  - end adornment: SRT_Tooltip(title=clearSearch ?? '') wrapping span>button
    (disabled when !searchValue?.length, aria-label clearSearch, onClick
    handleClear, CloseIcon size 16, icon-button reset classes).
- State/logic VERBATIM: isMounted ref, anchorEl state, searchValue state,
  handleChangeDebounced via useCallback + debounce (reuse June's debounce —
  garbage file has one; if it used a util, keep it local in-file; delay
  `manualFiltering ? 500 : 250`; authorized eslint-disable on the empty deps),
  handleChange, handleGlobalFilterMenuOpen, handleClear, the globalFilter
  useEffect verbatim (+ eslint-disable if flagged).
- `<SRT_FilterOptionMenu anchorEl onSelect={handleClear} setAnchorEl table />`
  after the input (garbage-zone menus/ import as-is; STOP if props reject).
- MUI-only drops with comments: size/variant props, InputAdornment wrappers,
  InputProps.sx mb:0, MRT's odd `textFieldProps.inputRef = inputRef`
  assignment (write a Note: user input-ref forwarding deferred to a
  slot-props style if needed).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/inputs/SRT_GlobalFilterTextField.tsx`
--max-warnings=0. Only this file. No core, no git. Use parseFromValuesOrFunc
(NOT parseSRT_HtmlProps).
