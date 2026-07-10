# Plan: SRT_FilterRangeSlider ← MRT_FilterRangeSlider

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/inputs/SRT_FilterRangeSlider.tsx`.
Garbage-zone; author fresh — READ the garbage file first for its shadcn/radix
Slider usage (June browser-verified range slider); preserve its event mapping.

## Resolved decisions

- Interface `extends DivProps { header, table }` (MRT extends SliderProps →
  the converted slot is DivProps; shadcn Slider root receives the rest).
- Double slot merge verbatim (srtFilterSliderProps table → columnDef → rest),
  parseFromValuesOrFunc, {column, table}.
- Logic VERBATIM: currentFilterOption, showChangeModeButton, min/max
  resolution (slot min/max first — NOTE: DivProps has no min/max fields; read
  them via the garbage approach or from `(sliderProps as any).min/max` with a
  Note — prefer mirroring the garbage file's handling), the array/null
  fixups with MRT's own comment, filterValues state, isMounted, arrow-key
  stopPropagation handler + MRT's comment, the columnFilterValue effect
  verbatim (+ eslint-disable if flagged).
- shadcn Slider (ui/slider, radix): `value={filterValues}`,
  `onValueChange` → setFilterValues, `onValueCommit` → MRT's
  onChangeCommitted logic verbatim (entire-range → setFilterValue(undefined),
  else the tuple), min/max, onKeyDown; radix prevents thumb swap natively
  (disableSwap dropped + Note); `valueLabelDisplay="auto"` dropped + Note (no
  radix value labels; June parity).
- Wrapper Stack → div `flex flex-col`.
- Slider sizing classes/styles: inline style `minWidth: ${column.getSize() -
  50}px` (runtime) + classes `mx-auto w-[calc(100%-8px)] px-1` + conditional
  `mt-2.5` (10px, no mode button) / `mt-1.5` (6px).
- filterInputRefs registry: ref the slider's input/thumb node as
  `${column.id}-0` — mirror the garbage file's mechanism (radix slider has
  hidden inputs; June solved this — reuse).
- FormHelperText → `<p className="m-[-3px_-6px]... text-xs leading-[0.8rem]
  whitespace-nowrap text-muted-foreground">` with the filterMode localization
  lookup verbatim (`filter${Capitalized}` key).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/inputs/SRT_FilterRangeSlider.tsx`
--max-warnings=0. Only this file. No core, no git. parseFromValuesOrFunc only.
