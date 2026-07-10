# Plan: SRT_ToolbarDropZone ← MRT_ToolbarDropZone

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/toolbar/SRT_ToolbarDropZone.tsx`.
Garbage-zone (already slot-stripped by the types task); author fresh.

## Resolved decisions

- Interface `extends DivProps { table }` (MRT extends BoxProps). NO srt slot —
  removed from core; `...rest` only (matches MRT).
- MUI Fade → conditional render `{showToolbarDropZone && <div ...>}`? NO —
  Fade keeps the element mounted; MRT relies on the drop-zone existing for
  drag events only while shown. Use conditional render (unmount) + dropped-
  Fade comment/Note (consistent with Grow/Collapse precedent).
- Classes (cva `toolbarDropZoneVariants`): base `absolute z-[4] flex h-full
  w-full box-border items-center justify-center backdrop-blur-sm border-2
  border-dashed border-primary` (info.main → primary token); variant
  `hovered: { true: 'bg-primary/20', false: 'bg-primary/10' }` (maps
  alpha(info, 0.2/0.1) on hoveredColumn?.id === 'drop-zone').
- Class hook `Srt-ToolbarDropZone` (Mui-→Srt-).
- handleDragEnter/handleDragOver verbatim (drop `_event` param if lint
  complains — precedent). useEffect verbatim (condition + deps; authorized
  eslint-disable if flagged).
- Typography → `<p className="italic">` with the dropToGroupBy replace
  verbatim.
- `{...rest}` then className composition after spread.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/toolbar/SRT_ToolbarDropZone.tsx`
--max-warnings=0. Only this file. No core, no git.
