# Testing steps after one component is finished

- Update the /Users/anindosarker/Work/Personal/React-table/shadcn-react-table/apps/test-shadcn/src/App.tsx file accordingly to the usecase of the component.
  - After editing App.tsx, re-run `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` — the staged demo must not break the tsc gate (e.g. `data-*` keys are rejected in `srt*Props` object literals; use `id`/`className` as test hooks).
- Dev server: shared instance at http://localhost:5273 (lead starts/health-checks it before testing). NEVER `pkill vite`, never start a server on the default port; if an isolated server is truly needed, use a unique port and kill only your own PID.
- Open browser with playwright and test
  - See the component. 
  - Test out its features and functionality. Make sure it works as expected.
  - Take screenshots and compare with the expected output.
  - Store all playwright related files in /Users/anindosarker/Work/Personal/React-table/shadcn-react-table/apps/test-shadcn/.playwright/ folder
- The expected behavior can be found in the original MRT component and relevant storybooks. All are available in /Users/anindosarker/Work/Personal/React-table/shadcn-react-table/packages/material-react-table
- Depending on the test, send out result of the test to the relevant stakeholders. Use a very short concise format to send out the result. 
  - The testing agent must report explicitly (SendMessage to main): per test case PASS/FAIL + one-line evidence + screenshot filename. Going idle without a report is a failure.
- The coding agents will fix it after test