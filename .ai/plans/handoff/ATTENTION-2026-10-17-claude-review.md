# ATTENTION 2026-10-17 (claude/review)

Judgment calls made under the handoff. Revert any you disagree with.

- `SRT_Tooltip` keeps applying `getCommonTooltipProps` (1000 ms, non-hoverable) to all 33 tooltips. MRT spreads it at 12 call sites; the other 21 run MUI defaults (100 ms, interactive). Left as is. MRT-exact would mean MUI defaults in the wrapper and the spread at those 12 consumers.
- Dropped because Conventions forbid sizing/opacity overrides on shadcn Buttons: `SRT_ToggleRowActionMenuButton` 2rem box and opacity 0.5 to 1 on hover; `SRT_EditActionButtons` text variant `minWidth: 100px`; `SRT_RowPinButton` 24px box. Say so if you want the MRT look back.
- Five menus now carry the same ghost-span trigger plus focus-restore handler. An `SRT_Menu` wrapper with MUI Menu's shape (anchorEl, open, onClose) would hold it once, like `SRT_Tooltip`. Not done.
- `SRT_ActionMenuItem` submenu arrow uses the registry size `icon-xs` for MRT's `sx={{ p: 0 }}`; `divider` is `border-b` on the item like MUI, not a `DropdownMenuSeparator`.
- Agent-decided taste items, kept with their recommendation: `icons.ts` keeps shadcn-conventional glyphs for DragHandle and Density over MUI pixel-twins; filter label popover stays non-modal; detail panel keeps `overflow-hidden` during the collapse; date filters hand the filter a `Date` like MRT; edit select stays radix Select; `getCommonToolbarStyles` stays exported though the ticked toolbars inline it.
- Stories (deferred): `apps/test-shadcn/stories/features/Editing.stories.tsx` still uses the deleted `onEditingCellSave`.
- Audit trail of the last 25 entries: `.ai/plans/handoff/findings-2026-10-17.md`.
