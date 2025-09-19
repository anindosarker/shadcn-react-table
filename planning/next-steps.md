# shadcn-react-table – Next Steps

## What exists now
- packages/shadcn-react-table-core: headless hook `useDataTable`, re-exports `ColumnDef`; Rollup build + d.ts
- packages/shadcn-react-table-cli: `shadcn-rt add data-table` → generates `src/components/ui/data-table/index.tsx`
- apps/test-shadcn: local shadcn-style `DataTable` using TanStack; Tailwind v4 wired

## Short-term plan (MVP → parity-ready)
1) Core features (headless)
   - Sorting, filtering, pagination, selection, row actions, column visibility
   - Virtualization helpers via `@tanstack/react-virtual`
   - Column/row helpers, default options, feature state types
2) CLI templates
   - Toolbar (search, density), menus (column visibility, row actions)
   - Slots pattern (Row, Cell, Toolbar, Menus) with cva maps (editable in-app)
   - (Later) `diff` command to compare local template with latest
3) Test app usage
   - Add example pages using one generated `DataTable` + different props
   - Ensure no node_modules Tailwind content scanning is required
4) Quality
   - Unit tests for core hooks; smoke tests for generated UI
   - Storybook/examples app later if needed

## Milestones
- M1: Sorting + pagination + toolbar template; examples in test app
- M2: Filtering (text/select/range) + column visibility + row selection
- M3: Virtualization + row actions + menus; examples scaled
- M4: Diff command, docs, and versioned templates

## Release notes (when publishing)
- Publish `shadcn-react-table-core` (peer deps: react, react-dom, @tanstack/react-table)
- Keep CLI local initially; publish later as `shadcn-react-table-cli`
