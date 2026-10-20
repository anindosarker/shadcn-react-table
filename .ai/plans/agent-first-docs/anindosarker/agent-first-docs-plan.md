# Agent-first docs plan

Status: sections 1 to 3 done 2026-10-18 (70b5df0, 944c2eb, f031554, fa7cda7, 50c8cfc). Follows `.ai/plans/docs-example-pages/anindosarker/docs-example-pages-plan.md` (playground
panel, sticky bar, single-example pages), which must be committed first.

Goal: an agent (or a person) adds any docs example to a project with one command and no extra
dependencies beyond what the example's feature needs, and every example page offers a prompt that
says exactly that. Later rounds (skill, "For agents" page, evals) are out of scope here.

## Starting point (measured 2026-10-18)

- 113 examples under `apps/shadcn-react-table-docs/examples/<slug>/` with `index.tsx` (docs
  wrapper), `TS.tsx` (the component) and, for 96 of them, `makeData.ts`.
- 91 of the 96 `makeData.ts` files are already static (`export const data: Person[] = [...]`,
  plus types and lists). Only 5 import `@faker-js/faker`: `chart-detail-panel`,
  `customize-filter-variants`, `enable-column-virtualization`, `enable-row-virtualization`,
  `virtualized`. All 5 seed faker, so their output is deterministic already.
- Third-party imports across `TS.tsx`: `@tanstack/react-query` (10 examples), `recharts`,
  `jspdf` + `jspdf-autotable`, `export-to-csv`, `@fortawesome/*` (1 each), `lucide-react` (16,
  already a library dependency). shadcn parts imported from `@/components/ui/*`: button,
  dropdown-menu, spinner, tooltip, table, radio-group, label, dialog, alert. Library paths
  (`@/components/ui/shadcn-react-table`, `.../SRT_Tooltip`, `.../locales/*`,
  `.../toolbar/useSRT_MediaQuery`) are all covered by the library item.
- Registry: root `registry.json` with `include: ["packages/shadcn-react-table/registry.json"]`;
  the package item is `shadcn-react-table` (`registry:ui`, files with `@ui/...` targets, paths
  relative to the included registry file). Install command on the docs:
  `pnpm dlx shadcn@latest add anindosarker/shadcn-react-table/shadcn-react-table`. CI job
  `registry` runs `registry validate anindosarker/shadcn-react-table#<sha>` and a `--dry-run`
  add on push.
- `app/llms.txt/route.ts` and `app/llms-full.txt/route.ts` exist (fumadocs `llms()` helper over
  the docs source); per-page markdown at `/llms.mdx/docs/<path>`. Nothing to build for the
  llms index; the gate below only verifies it.
- 41 examples have their own page `content/docs/examples/<slug>.mdx` (title, description);
  the other 72 render inside guides only.
- Playground split button (`components/example-playground.tsx`): "Open in GitHub" main action,
  caret menu with StackBlitz and CodeSandbox disabled.

## 1. Examples without faker

Replace faker in the 5 files with a small deterministic generator inside the same `makeData.ts`
(seeded linear congruential generator, name and word lists of 20 to 30 entries, same field
shapes and row counts as today). `@faker-js/faker` leaves the docs app's dependencies. The
examples keep their file names (`TS.tsx`, `makeData.ts`) so MRT parity diffs stay readable.
Acceptance: the five example pages render the same columns and row counts as before, no faker
import anywhere under `examples/`.

## 2. Examples as registry items

- New `apps/shadcn-react-table-docs/scripts/build-registry-items.mjs` writes
  `apps/shadcn-react-table-docs/registry.json` (committed, regenerated on demand) with one item
  per example:
  - `name`: `example-<slug>`; `type`: `registry:block`; `title`: the page title when a page
    exists, else the slug in Title Case; `description`: the page description or
    `"<title> example from shadcn-react-table."`.
  - `registryDependencies`: `anindosarker/shadcn-react-table/shadcn-react-table` plus the
    shadcn part names found in the example's `@/components/ui/<part>` imports (library paths
    excluded).
  - `dependencies`: third-party packages imported by `TS.tsx` or `makeData.ts` other than the
    library's own (`lucide-react`, `react`), unversioned.
  - `files`: `TS.tsx` and, when present, `makeData.ts` with `type: registry:component` and
    explicit `target` so the two files land side by side and the `./makeData` import resolves:
    `components/examples/<slug>/<slug>.tsx` and `components/examples/<slug>/makeData.ts`.
    Confirm the target form against the shadcn CLI version in the lockfile (plain
    project-relative path vs alias prefix) with a `--dry-run` add.
- Root `registry.json` `include` gains `apps/shadcn-react-table-docs/registry.json`.
- Root script `registry:items` runs the generator; `registry:build` unchanged (the GitHub
  namespace serves files straight from the repo, no build output needed for examples).
- CI `registry` job: the existing `registry validate` covers the new items automatically; add
  one `--dry-run` add of `anindosarker/shadcn-react-table/example-basic#<sha>` next to the
  library one.
- Acceptance: `registry validate anindosarker/shadcn-react-table#claude/review` green after
  push; `--dry-run` add of `example-basic`, `example-virtualized` and one react-query example
  (`example-remote-fetching` or equivalent) lists exactly the expected files, dependencies and
  registry dependencies; a real add into a scratch Next app under
  `$HOME/.claude/jobs/e3e57716/tmp/` type-checks.

## 3. Copy prompt on every example

- `lib/example-prompt.ts` (server): builds the prompt string from the registry item (read from
  the generated `registry.json`), the example source and the docs URLs:

  ```
  Add the "<title>" example of shadcn-react-table to this project.

  1. Run: pnpm dlx shadcn@latest add anindosarker/shadcn-react-table/example-<slug>
     It installs the example into components/examples/<slug>/ and, if missing,
     shadcn-react-table itself with its dependencies.<, plus: <deps>>
  2. Import the default export from "@/components/examples/<slug>/<slug>" and render it
     where the table belongs.
  3. Read before changing options: <docs page .md url, when the example has a page>
     Table options used: <top-level keys of the useShadcnReactTable call>
     Reference: /llms.mdx/docs/api/table-options, /llms.mdx/docs/api/column-options
  4. Verify: the project type-checks and the table renders with its rows.
  ```

  URLs are absolute, built from the site origin (`NEXT_PUBLIC_SITE_URL` with a localhost
  fallback, same source the `og` routes use if one exists). Option keys come from a
  brace-balanced scan of the `useShadcnReactTable({ ... })` argument; no keys found, line
  omitted.
- `ExampleSnippet` passes `prompt` and `installCommand` strings to the playground; the caret
  menu gets "Copy install command" and "Copy prompt" items above the disabled ones, each
  writes to the clipboard and shows a 1.5 s "Copied" state on the item label.
- Page checks (`scripts/page-checks/_helpers.mjs` `codeToggle`): the menu holds the two copy
  items; clicking "Copy prompt" writes text containing `shadcn@latest add` and the example's
  item name (grant clipboard permission in the Playwright context or read the written value
  through a `navigator.clipboard.writeText` stub).

## Gates

`pnpm prettier --write` on written files; `pnpm --filter shadcn-react-table-docs types:check`;
full page gate green (`node scripts/check-pages.mjs --base http://localhost:<port>` with a dev
server on an agent port and `NEXT_DIST_DIR`); `pnpm --filter shadcn-react-table-docs build`;
`curl -s http://localhost:<port>/llms.txt | head` shows the page index; registry validate and
dry-run adds as in section 2 (after push).

## Commits

On `claude/review`, no trailers, no attribution, stage only touched paths:
1. `docs: examples drop faker for deterministic generators`
2. `registry: one item per docs example`
3. `docs: copy install command and prompt on example panels`

## Out of scope

Skill and generated references, the "For agents" page, evals, StackBlitz and CodeSandbox
templates, renaming `makeData.ts`, library changes.
