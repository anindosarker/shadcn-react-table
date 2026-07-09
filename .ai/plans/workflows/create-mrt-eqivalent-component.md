# Create a MRT Equivalent Component in SRT

- The goal is to create a SRT component that is equivalent to the MRT component. The SRT component should have almost the same functionality, behavior, apis etc as the MRT component, while also adhering to the SRT design principles and guidelines.
- Try to create the SRT component strictly the exact same as the MRT equivalent. If there is even a slightest difference, halt. Ask for clarification.
- Don't make silent assumptions.
- Before coding, discuss a bit about creating the plan for that component.
- Before planning, read the "General notes" section of `.ai/plans/matching/srt-review-notes.md` — established conventions live there; don't re-ask anything already settled.
- In the discussion phase:
  - list out the choices in conscice manner with recommendations.
  - No need to repeat unnecessary details, no ask mechanical etc etc stuff
- Save the agreed plan to `.ai/plans/components/<Component>.plan.md` — the review agent reads it.
- Once plan is completed, finish the coding.
- Comment rules: no comments except (a) comments MRT itself has, (b) dropped
  MRT constructs kept commented out at their original position + short
  `// Note:` why, (c) a brief reason on `//@ts-expect-error`.
- Gates after coding: `pnpm prettier --write <file>`, then
  `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean. Also check for lint errors: `pnpm --filter test-shadcn exec eslint <path relative to apps/test-shadcn> --max-warnings=0` (eslint lives in the app package, not the workspace root).
- The coding agent must report back explicitly (SendMessage to main): files
  touched, gate results, unreachable parity + why, questions it stopped on.
  Going idle without a report is a failure.
- You will code in the test shadcn project, not in the package. we will code in the package later. /Users/anindosarker/Work/Personal/React-table/shadcn-react-table/apps/test-shadcn/src/components/ui/shadcn-react-table