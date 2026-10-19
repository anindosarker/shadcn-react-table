# Plan: SRT_TableHeadCellResizeHandle ← MRT_TableHeadCellResizeHandle

Pair: `packages/shadcn-react-table/src/components/ui/shadcn-react-table/head/SRT_TableHeadCellResizeHandle.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHeadCellResizeHandle.tsx`.
Garbage-zone; author fresh. This restores working column resizing (drag +
double-click reset).

## Resolved decisions

- Interface `extends DivProps { header, table }` (MRT extends DividerProps;
  the `...rest` lands on the divider element — SRT divider is a plain element,
  DivProps is the honest analogue).
- MUI `Box` wrapper → `<div>`; MUI `Divider` → `<hr>` (MUI Divider renders an
  `<hr>`; keeping the element preserves MRT's `&:active > hr` selector shape).
- MRT's class hooks `Mui-TableHeadCell-ResizeHandle-Wrapper` /
  `Mui-TableHeadCell-ResizeHandle-Divider` → keep, renamed prefix:
  `Srt-TableHeadCell-ResizeHandle-Wrapper` / `...-Divider` (public CSS hook
  parity, honest naming).
- Wrapper sx → cva `resizeHandleVariants` with variants:
  - base: `absolute cursor-col-resize px-1` + active rule via arbitrary
    variant: `[&:active>hr]:bg-primary` (maps `theme.palette.info.main` →
    `bg-primary`, the shadcn accent tier).
  - `density` variant maps the mx values: compact → `-mr-2`, comfortable →
    `-mr-4`, spacious → `-mr-6` (ltr; for rtl use `-ml-*` — implement exactly
    MRT's ltr/rtl branching with `columnResizeDirection`, choosing ml vs mr and
    left-0 vs right-0 / `left/right = lr` where `lr` is `4px` for display
    columns else `0` → conditional classes `right-1`/`right-0` etc. Runtime
    branching in the cva call is fine.)
  - active-opacity condition (`header.subHeaders.length || columnResizeMode
    === 'onEnd' ? 1 : 0` on active hr) → conditional class string
    `[&:active>hr]:opacity-100` vs `[&:active>hr]:opacity-0`.
- hr sx → classes: `h-6 w-0 rounded-[2px] border-l-2 border-border
  translate-x-[4px] touch-none select-none z-[4]` + transition only when NOT
  resizing: conditional `transition-all duration-150`.
- Interactions mirrored exactly: `onDoubleClick` (setColumnSizingInfo
  isResizingColumn false + `column.resetSize()`), `onMouseDown={handler}`,
  `onTouchStart={handler}` where `handler = header.getResizeHandler()`.
- `onEnd` deltaOffset transform stays inline `style` (runtime px), exact MRT
  expression incl. rtl sign flip.
- `{...rest}` spreads onto the `<hr>` (MRT spreads rest.sx into the Divider);
  user className composes via `cn(<hr classes>, rest.className)` — put
  className after the spread.

## Structure

Mirror MRT order: destructure (`columnResizeDirection, columnResizeMode`,
`setColumnSizingInfo`), `density`, `column`, `handler`, `mx`, `lr`, JSX div>hr.
Comments: none needed beyond any dropped constructs encountered.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p packages/shadcn-react-table/tsconfig.app.json --noEmit` clean;
`pnpm --filter shadcn-react-table exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHeadCellResizeHandle.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
