# ATTENTION 2026-10-17 (claude/review)

Judgment calls made under the handoff. Revert any you disagree with.

- `SRT_Tooltip` keeps applying `getCommonTooltipProps` (1000 ms, non-hoverable) to all 33 tooltips. MRT spreads it at 12 call sites; the other 21 run MUI defaults (100 ms, interactive). Left as is. MRT-exact would mean MUI defaults in the wrapper and the spread at those 12 consumers.
- Dropped because Conventions forbid sizing/opacity overrides on shadcn Buttons: `SRT_ToggleRowActionMenuButton` 2rem box and opacity 0.5 to 1 on hover; `SRT_EditActionButtons` text variant `minWidth: 100px`; `SRT_RowPinButton` 24px box. Say so if you want the MRT look back.
- Five menus now carry the same ghost-span trigger plus focus-restore handler. An `SRT_Menu` wrapper with MUI Menu's shape (anchorEl, open, onClose) would hold it once, like `SRT_Tooltip`. Not done.
- `SRT_ActionMenuItem` submenu arrow uses the registry size `icon-xs` for MRT's `sx={{ p: 0 }}`; `divider` is `border-b` on the item like MUI, not a `DropdownMenuSeparator`.
- Agent-decided taste items, kept with their recommendation: `icons.ts` keeps shadcn-conventional glyphs for DragHandle and Density over MUI pixel-twins; filter label popover stays non-modal; detail panel keeps `overflow-hidden` during the collapse; date filters hand the filter a `Date` like MRT; edit select stays radix Select; `getCommonToolbarStyles` stays exported though the ticked toolbars inline it.
- Stories (deferred): `packages/shadcn-react-table/stories/features/Editing.stories.tsx` still uses the deleted `onEditingCellSave`.
- Audit trail of the last 25 entries: `.ai/plans/handoff/findings-2026-10-17.md`.
- registry (d6ad8f6): locale items depend on `https://shadcn-table.com/r/shadcn-react-table.json` because bare `registryDependencies` names always resolve to shadcn/ui. Resolves only after the docs deploy. Local test: `REGISTRY_BASE_URL=http://localhost:<port>/r pnpm registry:build`.
- registry: cva, lucide-react, radix-ui, tw-animate-css shipped unversioned (fresh `shadcn init` installs lucide-react 1.x, radix-ui 1.8; a pinned lucide-react@^0.544 downgraded the test app). Only tanstack x3 and highlight-words pinned. Revert if you want pins.
- registry: `shadcn` ^4.22.0 added as devDependency instead of `pnpm dlx`. shadcn v4 init defaults to Base UI; users and the docs app need `shadcn init -b radix -p nova`.
- library (not edited): shipped files still carry commented-out `@mui` imports (e.g. `SRT_TableHeadCell.tsx`), visible in users' projects.
- library bug found by CellActions stories (not fixed, out of scope): `SRT_CellActionMenu` opens on `contextmenu` but Radix closes it on the right-button `pointerup` of a real right-click, so the menu never stays open in a real browser. Logged under `## Library gaps` in the tracker.
- stories: `Meta` import moved from `@storybook/react` to `@storybook/react-vite` in every file (plan definition). One-line revert per file if you consider it churn.
- library gaps from styling stories (logged in tracker, not fixed): `SRT_Table` `<caption>` has no caption-bottom default (Caption `BottomCaption` renders on top); `srtTableBodyRowProps` has no `hover: false` (story uses className workaround); no per-subtree light theme in shadcn (Theming `CustomLightTheme` overrides only --background/--primary/--secondary).
