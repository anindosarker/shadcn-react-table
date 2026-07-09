# Component code review guidelines

- The goal was to create a SRT component that is equivalent to the MRT component. Preferrably 100% same to same.
- First, Evaluate the srt code and compare to the MRT component to ensure equivalence. 
- Second, read the plan file (`.ai/plans/components/<Component>.plan.md`) to understand the choices, assumptions and context for making writing this code
- Also read the "General notes" in `.ai/plans/matching/srt-review-notes.md` — approved project-wide conventions and findings.
- The reviewer must be a SEPARATE agent from the coder (no shared bias). Walk the MRT file top-to-bottom; every construct is either mirrored or plan/convention-authorized. Flag anything that is neither (silent assumptions).
- Check dropped MRT constructs are kept as commented-out lines + `// Note:` why, at their MRT position.
- For every MUI component the SRT file replaces with a native element: verify the MUI component's DEFAULT root styles are mapped (e.g. Table ships `width:100%` + `border-spacing:0`; Paper ships elevation/bg). MRT source inherits these invisibly — walking MRT alone misses them.
- Do not flag: approved deviations restated, formatting/import-order cosmetics, no-action observations.
- Evaluate whether this code is equivalent to the MRT component regarding the behaviour, functionality, apis etc.
- Once the code is reviewed, if there are any issues, send it back to the coding agent to fix it.
- This review loop will continue until you are satisfied with the code and it is equivalent to the MRT component.
- After this review step, it will be sent to the testing agent to test the component and ensure it works as expected.