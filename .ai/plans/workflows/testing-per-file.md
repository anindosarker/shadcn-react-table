# Testing steps after one component is finished

- Stage the use case as a NEW self-contained demo component: `apps/test-shadcn/src/demos/<Component>Demo.tsx` (own data, columns, `useShadcnReactTable` instance). Then APPEND one `<XDemo />` section to App.tsx — never rewrite or remove existing demos. Demos accumulate so the user can rerun any component's test themselves, and appending keeps token cost small. Add each new demo at the top so user doesn't have to scroll down to find it.
- Demo header format (strict):
  - Title = component name.
  - 1–2 short lines of CONTEXT: what this component is / where it sits in the tree.
  - Then a SHORT BULLET LIST of exactly what to check ("sticky header stays visible when scrolling", "user maxHeight 400px wins"). No prose paragraphs, no param documentation dumps, no random garbage.
- Variant switching: render in-demo CONTROLS (buttons / select / toggles via existing shadcn ui components) to flip each tweakable setting live — e.g. loading on/off, layoutMode select, slot-props on/off. Local `useState` into the table options. Controls beat URL params for multi-setting demos; URL params optional extra only when a variant genuinely needs a fresh mount.
  - After edits, re-run `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` — staged demos must not break the tsc gate (e.g. `data-*` keys are rejected in `srt*Props` object literals; use `id`/`className` as test hooks).
- Dev server: shared instance at http://localhost:5273 (lead starts/health-checks it before testing). NEVER `pkill vite`, never start a server on the default port; if an isolated server is truly needed, use a unique port and kill only your own PID.
- Open browser with playwright and test
  - See the component. 
  - Test out its features and functionality. Make sure it works as expected.
  - Take screenshots and compare with the expected output.
  - Store all playwright related files in /Users/anindosarker/Work/Personal/React-table/shadcn-react-table/apps/test-shadcn/.playwright/ folder
- The expected behavior can be found in the original MRT component and relevant storybooks. All are available in /Users/anindosarker/Work/Personal/React-table/shadcn-react-table/packages/material-react-table
- Read the "General notes" in `.ai/plans/matching/srt-review-notes.md` + the component's plan in `.ai/plans/components/` first — approved deviations from MRT (design look, dropped constructs) are NOT test failures. Test behavior parity, not visual identity.
- Depending on the test, send out result of the test to the relevant stakeholders. Use a very short concise format to send out the result. 
  - The testing agent must report explicitly (SendMessage to main): per test case PASS/FAIL + one-line evidence + screenshot filename. Going idle without a report is a failure.
- The coding agents will fix it after test