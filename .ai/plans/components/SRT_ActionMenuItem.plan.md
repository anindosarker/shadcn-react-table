# Plan: SRT_ActionMenuItem ← MRT_ActionMenuItem

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/menus/SRT_ActionMenuItem.tsx`.
Garbage-zone; author fresh — READ the garbage file first: the June menu shell
(shadcn DropdownMenu family + the anchorEl bridge) is the locked deviation;
this item component must match whatever menu-item primitive the June menus
use (likely shadcn DropdownMenuItem or a plain div row). Mirror that shell.

## Resolved decisions

- Interface mirrors MRT: `{ icon: ReactNode; label: string; onOpenSubMenu?;
  table }` extending the June item element's props (if the June shell uses
  DropdownMenuItem, extend `ComponentPropsWithRef<typeof DropdownMenuItem>`;
  if a plain div/button row, extend DivProps/ButtonProps to match — report
  which).
- Classes map MRT sx: item `items-center justify-between min-w-[120px] my-0
  py-1.5` + tabIndex={0} + {...rest} (className composed after).
- Left group: div `flex items-center`; ListItemIcon → span
  `mr-2 inline-flex w-6 items-center` (MUI ListItemIcon default min-width
  ~36px/mr — map visually, note it) + `{label}`.
- Sub-menu affordance verbatim: `onOpenSubMenu && <button>` (icon-button
  reset, p-0, size small dropped Note) with BOTH onClick and onMouseEnter
  wired to onOpenSubMenu (keep MRT's `as any` casts only if tsc requires;
  try typed first), ArrowRightIcon from registry.
- cva `actionMenuItemVariants` for the item classes.

## Gates

prettier; tsc clean; eslint on
`src/components/ui/shadcn-react-table/menus/SRT_ActionMenuItem.tsx`
--max-warnings=0. Only this file. No core, no git.
