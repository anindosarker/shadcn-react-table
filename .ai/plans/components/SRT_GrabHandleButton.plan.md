# Plan: SRT_GrabHandleButton ← MRT_GrabHandleButton

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_GrabHandleButton.tsx`.
Garbage-zone; author fresh. FIXES LOGGED GAP: June file defaulted
`location = 'row'` → wrong opacity 1 everywhere; MRT default is undefined →
opacity 0.5 unless explicitly location="row". CALLERS (HeadCell/BodyRow
grab-handle + ShowHideColumnsMenuItems) pass onDragStart/onDragEnd via rest —
keep those flowing.

## Resolved decisions

- Interface `extends ButtonProps { iconButtonProps?: ButtonProps; location?:
  'column' | 'row'; onDragEnd: DragEventHandler<HTMLButtonElement>;
  onDragStart: DragEventHandler<HTMLButtonElement>; table }` — mirror MRT
  exactly incl. the odd declared-but-unused `iconButtonProps` (destructure
  only location/table/...rest like MRT; iconButtonProps flows into rest).
- NO default on `location` — opacity class `location === 'row' ? 'opacity-100'
  : 'opacity-50'` verbatim semantics.
- Tooltip → SRT_Tooltip side="top", title `rest?.title ?? localization.move`.
- Button ghost/icon `draggable="true"` size small → cva base: `m-0 -mx-[0.1rem]
  p-[2px] h-auto w-auto cursor-grab transition-all duration-150 ease-in-out
  active:cursor-grabbing hover:bg-transparent hover:opacity-100`; {...rest}
  then onClick compose verbatim (stopPropagation + rest.onClick), cn merge,
  `title={undefined}` after spread.
- disableRipple dropped `// Note:`.
- DragHandleIcon h-4 w-4.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
