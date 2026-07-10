# Plan: SRT_TableFooterCell ← MRT_TableFooterCell

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/footer/SRT_TableFooterCell.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends TdProps { footer, staticColumnIndex?, table }` (element
  `<td>` — MUI TableCell renders td in footer context).
- useTheme dropped (Note): align → `text-center` when columnDefType==='group'
  else `text-start` (logical, rtl-safe).
- Double merge verbatim: `args = { column, table }`; table
  srtTableFooterCellProps → columnDef.srtTableFooterCellProps → rest.
- handleKeyDown compose + `cellKeyboardShortcuts({ event, cellValue:
  footer.column.columnDef.footer, table })` verbatim.
- td attrs: colSpan, data-index, data-pinned, tabIndex, `{...tableCellProps}`,
  onKeyDown AFTER spread. MUI `variant="footer"` → dropped-construct comment +
  Note (no native analogue; styling in classes).
- Classes (HeadCell precedent): base `relative bg-inherit font-bold align-top`
  + density p map `p-2`/`p-4`/`p-6` + getCommonMRTCellStyles pieces: grid →
  `flex`, group → `justify-center`, transition `transition-[padding]
  duration-150 ease-in-out` unless enableColumnVirtualization, zIndex
  conditionals (z-[2] resizing/dragging column, z-[1] pinned, z-0), pinned →
  `bg-background opacity-[0.97]`, dragging/hovered column → `opacity-50`.
- Inline style: `{ ...getSRTCellWidthStyles({ column, header: footer, table }),
  ...(isColumnPinned ? getSRTPinnedCellStyles({ column, table }) : {}),
  ...tableCellProps?.style }`.
- isColumnPinned calc verbatim.
- Children verbatim: `tableCellProps.children ?? (footer.isPlaceholder ? null
  : (parseFromValuesOrFunc(columnDef.Footer, { column, footer, table }) ??
  columnDef.footer ?? null))`.
- cva `footerCellVariants` holds static base; runtime conditionals in cn()
  (HeadCell precedent).

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/footer/SRT_TableFooterCell.tsx`
--max-warnings=0. Only this file. No core, no git.
