# Earn-its-place review (human method, 2026-09-19)

Per-file review of an SRT component against its MRT source. Replaces
ad-hoc "parity cards". Output is a short list of findings, then fixes.

## Method

1. Open SRT ↔ MRT side by side. Walk MRT top-down. Do not pass a line until
   it is cleared. One unresolved prop can cascade; resolve it before moving on.
2. Ignore on sight: `SRT_`/`srt` vs `MRT_`/`mui` prefixes, import blocks, the
   `xxxVariants` cva block, `useTheme`/`mrtTheme`/`flipIconStyles` lines.
3. Every other line that is added or differs must EARN its place. Exactly one
   of these justifies it:
   - mirrors an MRT construct (same behavior, shadcn/Tailwind idiom);
   - restores MUI-inherited behavior the component actually consumes
     (e.g. `showFirstButton` lived inside MUI `PaginationProps`; MUI
     `usePagination` computed the page items; MUI `ButtonBase` renders
     `type="button"`);
   - a ruling recorded in `srt-review-notes.md` (General notes or the entry).
   Anything else is deleted or rebuilt MRT-exact. Homegrown logic that
   approximates a MUI internal is rebuilt as a verbatim port of that internal.
4. Shared symbols (`srtXProps` slots, `parseFromValuesOrFunc`, icon keys,
   `SRT_Tooltip`, `DivProps`/`ButtonProps`): verify ONLY the spread target in
   this file (slot base type must match the element `...rest` lands on).
   Never chase the definition into core. Note "slot verified" in the entry.
5. Comments allowed: (a) comments MRT itself has, (b) dropped MRT construct
   kept as a commented line at its MRT position + ONE-line `// Note:` why,
   (c) brief reason on `//@ts-expect-error`. Everything else dies —
   narration, "preserved from June", explanations of SRT-only code.
6. MUI component replaced by a raw element → map the MUI DEFAULT root styles
   into the cva. Replaced by a shadcn COMPONENT → shadcn default variant, no
   styling className (layout-only className allowed).
7. Gates: `pnpm prettier --write <file>`; `pnpm tsc -p
   apps/test-shadcn/tsconfig.app.json --noEmit` (ignore TS5101; errors in
   OTHER files being edited concurrently are not yours); `pnpm --filter
   test-shadcn exec eslint <app-relative path> --max-warnings=0`.
8. Tracker: DO NOT mark `[x]` (only the user checks boxes). ≤3 bullets, decisions/deviations only
   (`note-taking.md`). Items the user should see → `## Open for user review`
   at the top of the tracker. Never touch entries already `[x]`.
9. Commit message = `review: <entry heading>`, e.g.
   `review: SRT_TablePagination.tsx : MRT_TablePagination.tsx`. One commit per
   entry. Push after every commit. No attribution lines. Git log = done-state.

## Reviewer report format (agents)

One bullet per finding: `<SRT line(s)>: <what differs> → <fix>`. No bullets
for things that pass. No praise, no status lines. End with either
`EQUIVALENT` or the count of findings.
