# Literal Parity Contract

Goal: make each `SRT_X.tsx` read line-for-line like its `MRT_X.tsx` source, EXCEPT
the locked deviations below. MRT is source of truth.

## DO

1. **Strip stale comments.** MRT files have no doc-block or inline comments. Remove
   every `/** ... */` header and `// ...` note that was hand-added to SRT (they were
   scaffolding). Keep a comment ONLY if MRT has the exact same comment at the same place.
2. **Align ordering** to MRT, line-by-line where structurally possible:
   - destructuring order (options, state, refs)
   - JSX prop order (alphabetical-ish as MRT writes them: `onClick, size, type, variant`)
   - variable/handler declaration order
   - control-flow / conditional order
3. **Match identifier names** to MRT where SRT renamed for no reason.
4. **Preserve behavior exactly.** No feature change, no logic change.

## DO NOT CHANGE (locked deviations — leave as-is, do NOT "fix" toward MUI)

- **Slot props API**: `parseSRT_HtmlProps` / `mergeSRT_HtmlProps` instead of MUI
  `parseFromValuesOrFunc` + `sx` spread. `srt*Props` names, not `mui*Props`.
- **Styling**: cva + `className` + `cn()` instead of `sx={...}`.
- **Tooltip**: `<SRT_Tooltip title=...>` wrapper instead of MUI `<Tooltip {...getCommonTooltipProps}>` + `title={undefined}`.
- **Icons**: lucide via `table.options.icons` registry (MRT keys preserved).
- **Display columns**: headless defs in core; component layer dispatches by id.
- **Inputs**: native shadcn inputs (Input/Select/Checkbox) instead of MUI TextField/DatePicker.
- **children/className** explicit props where MRT folds them into `...rest` (ButtonProps).
- **Portals/refs**: shadcn primitives (DropdownMenu/Popover) handle anchoring; the
  `anchorEl`→fixed-span bridge stays.

## Gates (per teammate)

- `npx prettier --write <your files>` after edits.
- `npx tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` must be clean (ignore the
  preexisting `baseUrl` TS5101 deprecation — that is config, not code).
- Report files touched + any pair where you could NOT reach parity and why.

## Out of scope

- No behavior fixes from `srt-review-notes.md` gaps (separate pass).
- No git commits.
- Do not touch `packages/shadcn-react-table-cli` (unsynced mirror).
