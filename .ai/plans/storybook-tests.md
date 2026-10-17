# Storybook tests plan

Status: phase 1 done 2026-10-17, commit d58fb69. `pnpm test` runs 55 story files / 399 stories
as render tests in headless Chromium, 399 passed, about 16 s vitest duration (18 s wall through
turbo). No story file needed changes. Phase 2 not started.

Goal: every story in `packages/shadcn-react-table/stories` runs as an automated test through
Storybook's Vitest addon, in a real browser, from one command. Replaces the hand-written
Playwright smoke scripts in `apps/test-shadcn/.playwright` (`check-all-stories.mjs`,
`check-story-file.mjs`), which then go in the purge plan.

## Starting point (measured 2026-10-17)

- Storybook 10.6.2, `@storybook/react-vite`, 54 story files, 398 exports, `storybook:build`
  green, Playwright smoke green (399 ids) except the React 19 tbody text warning in
  `styling/CustomTableBody`, shared with MRT.
- No vitest in the package. MRT has no automated tests at all.

## Phase 1: render tests (this plan)

1. `pnpm dlx storybook add @storybook/addon-vitest` in `packages/shadcn-react-table`, or the
   manual steps from https://storybook.js.org/docs/writing-tests/integrations/vitest-addon:
   `vitest`, `@vitest/browser-playwright` (Vitest 4 browser mode, Chromium), `vitest.config.ts`
   with the `storybookTest` plugin and `storybookScript: "storybook dev -p 6306 --ci"`, the addon
   registered in `.storybook/main.ts`, `.storybook/vitest.setup.ts` applying the preview
   annotations (dark mode decorator included).
2. Script `"test": "vitest run"` in the package and `"test": "turbo run test --filter=shadcn-react-table"`
   at the root. `pnpm test` runs all 398 stories as render tests.
3. Expected failures to resolve, in the story or the test setup, never in the library:
   `styling/CustomTableBody` (React 19 warning about text nodes in tbody; allow that one
   console.error through a per-story `parameters.test` or a setup-level filter that names it),
   stories that depend on the manager channel (dark mode event) running without a manager,
   virtualization stories needing a sized container in headless Chromium.
4. Gates: `pnpm test` green locally; `pnpm storybook:build` still green; tsc on
   `tsconfig.stories.json` and `tsconfig.app.json` clean; eslint on files written.
5. One commit `test: storybook vitest addon, 398 render tests`, pushed. Plan status line updated.

## Phase 2: play functions (later plan)

Per feature file, `play` functions asserting the feature's visible marker (sorting arrows,
filter inputs, pagination buttons, expand buttons) with `userEvent`, mirroring the markers the
old Playwright checks looked for. One commit per story file.

## Out of scope

Visual regression, a11y addon, CI wiring (ci plan), library changes.
