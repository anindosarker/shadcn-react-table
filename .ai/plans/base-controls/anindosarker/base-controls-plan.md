# Base controls: command-bar dropdown, Storybook edition button, "Radix UI" label

Status: planned 2026-10-19, owner review of v0.2. Branch `base-controls` from `claude/review`;
merged onto `claude/review` when green, so PR #19 carries it.

## Why

- The home page has no base control: the hero command follows the site-wide base group, but
  the pill that sets it lives only in the docs layout header (`components/site-nav.tsx`), not
  in the home header (`components/dev-home/v12/nav.tsx`), and the docs pill is desktop-only.
- Storybook ships one build per edition with a text link between them and nothing in the
  toolbar.
- The owner wants the label "Radix UI", not "Radix", everywhere a base is named.

## Scope

1. **Command-bar dropdown** (`apps/shadcn-table-docs/components/agent-bar.tsx`). The COMMAND
   tab becomes a split control: the tab itself still switches PROMPT | COMMAND; its label
   reads `COMMAND: RADIX UI` or `COMMAND: BASE UI` with a chevron; the chevron opens a shadcn
   `DropdownMenu` (the pattern of "Open in GitHub ▾" in `components/example-playground.tsx`)
   with two items, Radix UI and Base UI, the current one checked. Picking one calls the base
   group's setter (`setBase`, exported from `components/base-selector.tsx`), so the command
   text, the docs header pill, examples and code views all follow. The PROMPT tab shows no
   base (the prompt is base-agnostic). The home header gets no pill.
2. **"Radix UI" label.** `baseLabels.radix` in `apps/shadcn-table-docs/lib/install.ts`
   becomes `'Radix UI'`; every place that prints the Radix base name follows: docs header
   pill, install page tabs, `components/base-selector.tsx`, Storybook brand title
   (`packages/shadcn-table/.storybook/themes.ts`: "shadcn-table (Radix UI)") and the preview
   edition line (`.storybook/preview.tsx`), page checks that assert the text. Prose that says
   "Radix" as the library name (README, CONTRIBUTING, SKILL, mdx) stays unless it names the
   base as a choice next to "Base UI"; then it reads "Radix UI".
3. **Storybook edition button** (`packages/shadcn-table/.storybook/manager.ts`, plus
   `main.ts` if the port must be injected). A manager toolbar tool labelled with the other
   edition ("Base UI" on the Radix UI build, "Radix UI" on the Base UI build). Click navigates
   the top window to the other edition keeping the `path` query (same story): on the static
   build `./base/` from the root and `../` from `/base/`; in dev, port 6006 to 6007 and back
   (ports read from `ST_BASE`, injected the way `__ST_BASE__` already is). Root script
   `storybook:all`: `pnpm --filter shadcn-table run --parallel "/^storybook(:base)?$/"`, so one
   command starts both dev servers.
4. **Checks.** `scripts/page-checks/a.mjs`: on the home page, the COMMAND tab label contains
   "RADIX UI", opening the menu and choosing Base UI changes the command to `/r/base/` and the
   label to "BASE UI", and back. Playwright on the static Storybook (both dirs served on one
   port): the toolbar button exists with the right label and its href points at the other
   edition with the story id preserved.

## Gates

Docs `types:check` 0, lint 0 errors, `NEXT_DIST_DIR=.next-bc build` exit 0, page gate a on a
private port 0 failures; library lint 0; `storybook:build` and `storybook:build:base` exit 0;
the Storybook Playwright check above.

## State

- [ ] 1 dropdown
- [ ] 2 Radix UI label
- [ ] 3 Storybook button and `storybook:all`
- [ ] 4 checks
- [ ] merged onto `claude/review`
