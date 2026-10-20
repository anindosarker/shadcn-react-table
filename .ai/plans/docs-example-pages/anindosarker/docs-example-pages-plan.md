# Docs example pages plan

Status: done 2026-10-18 (commits 363a000 to 7a11ca7 on claude/review). Design: `.ai/plans/design/example-navigation.excalidraw`
(frames E, F, H, I; A to D and G are the rejected or superseded variants).

Goal: example pages read like TanStack's, without a sandbox: one pre-rendered table per page
in a static playground panel, a sticky page bar whose last breadcrumb is a searchable page
switcher, and no duplicated page title. The MRT tab strips survive only inside guides, trimmed
to the group's own tabs.

## Starting point (measured 2026-10-18)

- `examples/<name>/index.tsx` wraps `TS.tsx` in `components/mdx/example-snippet.tsx`
  (server: reads the source, shiki through `fumadocs-core/highlight`), which renders
  `components/mdx/source-code-snippet.tsx`: "Demo" heading, "Code" toggle button, the live
  table, the code block below. 113 examples, 96 with a `makeData.ts`.
- `components/example-tabs.tsx`: shadcn Tabs, sibling tabs plus MRT's link-out tabs
  (Data Export, DnD, ... More Examples); 10 groups in `example-groups/*.tsx` pass `links`.
  On example pages the active tab follows the route, in guides it is local state.
- `app/docs/[[...slug]]/page.tsx`: title row with the Copy page split button, description with
  the dashed rule, then the MDX body. Breadcrumb slot: `components/docs-breadcrumb.tsx`
  (Docs > Section > Page, all muted, last item plain text).
- Every synced page starts with an H2 equal to its frontmatter title (MRT repeats the
  `<Head>` title), so the title shows twice and the TOC's first entry is the page itself.
- `scripts/docs-diff.mjs` compares heading lists; `scripts/page-checks/*.mjs` count headings on
  best-practices (h2+h3 >= 4) and table-event-listeners (h4 > 3).
- Installed shadcn parts available: button, command, popover, dropdown-menu, tabs, tooltip.
- GitHub paths: `https://github.com/anindosarker/shadcn-react-table/tree/<branch>/apps/shadcn-react-table-docs/examples/<name>`,
  branch from `gitConfig.branch` in `lib/shared.ts`.

## 1. Playground panel (frames E, F)

`components/example-playground.tsx` (client) + the server reader in `example-snippet.tsx`:

- Server (`ExampleSnippet`, keep the name so `examples/*/index.tsx` stays untouched): read
  `TS.tsx` and, when present, `makeData.ts`; highlight both; pass `{ files: [{ name, node }] }`
  plus the live table as children into the client panel.
- Panel: one bordered box, `--docs-rule` not used here (component, solid border). Header row:
  left, file tabs (`TS.tsx`, `makeData.ts`) in the shadcn Tabs line variant, visible in Code and
  Split modes, hidden in Preview; right, a three-state toggle `Preview | Code | Split` (shadcn
  ToggleGroup if installed, otherwise three ghost buttons with `aria-pressed`) and the open
  split button: main action "Open in GitHub" (anchor to the example folder, new tab), caret
  menu with "Open in StackBlitz" and "Open in CodeSandbox" as disabled items labelled "soon".
  Same visual as the page's Copy page group (`srt-page-actions` classes).
- Body: Preview = the table; Code = the active file's code block (`max-h-[32rem]`, scroll
  inside, fumadocs CodeBlock keeps its copy button); Split = code left, preview right in a
  `grid-cols-2` at `xl:` and up, stacked below `xl:` (preview first).
- Mode persisted in `localStorage` key `srt-example-mode`, read after mount (default Preview,
  no hydration dependence). File tab state local.
- `source-code-snippet.tsx`, the "Demo" heading and the "Code" button go away. The `tableId`
  anchor (`#<name>`) stays on the panel root for deep links and the page checks.
- Page checks keyed on "demo heading" or the Code button change to: panel present, table
  rows, file tabs count, mode toggle switches to Code and the code block appears.

## 2. Sticky page bar with switcher (frame H)

- `app/docs/[[...slug]]/page.tsx`: breadcrumb and the Copy page group move into one row,
  `sticky top-(--fd-nav-height) z-10 -mx-4 px-4 bg-fd-background` with `border-bottom:
  var(--docs-rule)`; title and description follow as today. The breadcrumb stops being a
  `DocsPage` slot and is rendered directly in that row (`slots.breadcrumb` set to a no-op).
- `components/docs-breadcrumb.tsx`: the last crumb becomes `PageSwitcher`, a Combobox
  (Popover + Command): trigger shows the page name and a chevron; the list holds every page of
  the current top-level section from the page tree (`useTreeContext`), grouped by the
  separator labels (CommandGroup per `---Label---`, the section's own index page first), the
  current page checked, search input on top, Enter and click navigate with `useRouter`.
  Pages outside a section (none after the index removal) fall back to plain text.
- Mobile: the bar stays sticky; the switcher trigger truncates.

## 3. Tab strip trimmed (frame G)

- `example-tabs.tsx`: remove the `links` prop and the divider; keep sibling tabs and the
  wrapping line style. Groups lose their `links` arrays (10 files).
- Example pages: the group component is still what MRT's MDX renders (`<BasicExamples isPage />`
  from the sync), so the strip would still show. Per-path rule in `scripts/sync-mrt-docs.mjs`:
  on `examples/*.mdx`, replace `<XExamples isPage />` with `<XExample />` of the page's own
  example (slug to PascalCase, from the registry). Guides keep the group tags. Re-sync all
  example pages; `examples/registry.ts` unchanged.
- Rule carried into `scripts/docs-diff.mjs` TAG_MAP so the swapped tag is not a diff.

## 4. Duplicate title (frame I)

- `scripts/sync-mrt-docs.mjs`, global rule after the name map: drop the first body heading
  (any level) whose text equals the frontmatter title after normalisation; also drop one empty
  line that follows. Re-sync every page.
- `scripts/docs-diff.mjs`: same rule applied to the MRT side before comparing headings.
- Page checks: best-practices expects h2+h3 >= 3, table-event-listeners unchanged (h4), any
  check that located the first H2 by title text is updated.
- Pages left with no heading render no TOC (fumadocs hides an empty TOC).

## Gates

`pnpm prettier --write` on written files; `pnpm --filter shadcn-react-table-docs types:check`;
`pnpm --filter shadcn-react-table-docs docs:diff` 93 ok, 0 diff; full page gate green
(`node scripts/check-pages.mjs --base http://localhost:<port>` from `apps/test-shadcn/.playwright`,
dev server on 5328 or 5329 with `NEXT_DIST_DIR`); `pnpm --filter shadcn-react-table-docs build`.
Playwright screenshots of `/docs/examples/basic` at 1440 and 700 in Preview and Split, attached
to the report.

## Commits

On `claude/review`, pushed after each, no trailers, no attribution, stage only touched paths:
1. `docs: example playground panel (preview, code, split, open in github)`
2. `docs: sticky page bar with searchable page switcher`
3. `docs: example pages render one example, groups lose link tabs`
4. `docs: drop body heading that repeats the page title`
The uncommitted working-tree changes from 2026-10-18 (dashed seams, sidebar hierarchy and
collapse, theme pill, nav links, docs index removal, line tabs) are committed first as
`docs: sidebar hierarchy, dashed seams, theme pill, nav links, drop docs index`.

## Out of scope

StackBlitz and CodeSandbox templates, Storybook links, the "All examples" menu (frames A, B),
library changes, mobile sidebar changes.
