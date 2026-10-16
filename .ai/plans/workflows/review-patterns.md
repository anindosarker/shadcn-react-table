# Review patterns (the owner's method, observed)

Living file. Every session that reviews with the owner appends here. Agents
reviewing or fixing SRT files read this first, then `earn-its-place-review.md`.

## Vision (settled 2026-10-16)

- End state = ONE copy-in folder: `components/ui/shadcn-react-table/` holds
  components, types, hooks, utils, fns, locales, icons. No separate core
  package. Imports between them are relative, like MRT.
- MRT is the spec. Where MRT leans on MUI, the MUI type/default/behaviour is
  the spec. shadcn is the material, not the spec: check the shadcn registry
  for a counterpart before porting MUI by hand (NativeSelect, Pagination).
- Everything carries the SRT prefix, including string ids (`srt-row-select`,
  not `mrt-row-select`) and option keys (`srt*Props`).
- Development happens only in `apps/test-shadcn`. The CLI package
  (`packages/shadcn-react-table-cli`) is a later concern: never work on it,
  never delete it, never let it block a change. Minimum edits only when
  the workspace would otherwise fail to install.
- Stories (`apps/test-shadcn/stories`, `.storybook`) are deferred until the
  library is finished. No story edits, no stories tsc gate, until then.
- Colours: theme tokens over Tailwind palette literals. No new CSS variables
  for one-off colours. Expose restyle hooks with `data-slot`, shadcn's own
  convention.

## How the owner reviews

- One file at a time, VS Code diff SRT ↔ MRT, top-down. Does not pass a line
  until it is cleared.
- Reads the component first, then the definitions it touches, then
  `pnpm review SRT_X` for the defs diff as a fast cross-check (owner,
  2026-10-16).
- Does NOT re-review definitions already reviewed. A type or util checked
  once is trusted until a weird case shows the earlier check was wrong; then
  it is reopened. Reads names as claims: a type named after a MUI type must
  have that MUI type's shape and element.
- Core questions are "why is this written differently from MRT?" and "why
  is there a separate function/type/const the original does not have?".
  Lead the review with those two, per differing block.
- Ignores: prefix renames, imports, cva blocks, theme/useTheme lines.
- Everything else must be: mirrored MRT, MUI-inherited behaviour the
  component consumed, or a ruling recorded in the tracker. Otherwise delete
  or rebuild MRT-exact.
- Asks one question at a time. Wants one short answer, a decision, then
  "go". No code before "go". Coding is delegated to one agent; the owner and
  the lead keep reviewing.
- No review workflows / agent fan-out unless asked. A 45-agent run on one
  file was called out as unnecessary.

## Questions the owner asks, and what the answer must contain

1. "Why is this here? It wasn't in MRT." → Cite the MRT or MUI line it
   mirrors, or the tracker ruling. If none, say so and propose delete.
2. "Shouldn't this be a type / a util / a function?" → Mirror MRT's named
   shape. Algorithm → `utils/*.utils.ts`. Public prop shape → `types.ts`.
   Render-only glue → inline in the component. Say where it lives and why.
3. "Do we even need this at all?" → Default answer is no. Prefer the MUI
   shape (`Partial<Record<…>>`) over an invented guard or helper.
4. "Why aren't we using shadcn's X?" → Either we are (list the parts), or
   shadcn's X lacks the MUI behaviour (say which), or we missed it (switch).
5. "Why more options / extra consts?" → Usually MRT utils inlined
   (`getCommonMRTCellStyles`) or MUI defaults (`usePagination`). Defaults
   stay where MUI keeps them (in the util), not in the component.
6. "Why are these different?" → One line per difference. Mark which one is
   a judgment call and what verbatim would look like.
7. "Why is X missing?" → Check user-override paths through `srt*Props`
   slots survive class overrides (`align` was lost to `text-start`).
8. "Why is this named X?" → Names match the MUI element or MRT symbol.
   Prefer one alias with MUI's name over a precise split with an invented
   name (`TableCellProps = th & td`, not `TdProps`).
9. "Why such a huge function?" → Explain the architectural cause, offer the
   MRT-exact alternative, say the cost. (Dispatch functions existed only
   because core was a separate package; vision removes them.)
10. "Where does this live / which package.json?" → Inside the test-shadcn
    project. Nothing goes to the monorepo root.

## Delivery

- Terse bullets, ≤ ~10 lines. Lead with the decision. One question at the
  end at most.
- Coder reports relayed in ≤ 5 lines: hash, gates, browser counts,
  deviations.
- Never mark `[x]`; the owner does. One commit per tracker entry, named
  `review: SRT_X.tsx : MRT_X.tsx`, pushed on `claude/review`, no trailers.

## Catches log (what the owner found that agents missed)

| Date | File | Miss | Why missed | Rule derived |
| --- | --- | --- | --- | --- |
| 2026-09-29 | SRT_TablePagination | `isNavType` guard, inline `usePagination` port, `SelectGroup`, native select dropped, MUI defaults in component | agents stop at "compiles + mirrors behaviour" | #2, #3, #4, #5 |
| 2026-10-16 | types.ts | `TableSectionProps = 'thead'` used for tfoot too | shared-symbol rule said "check spread target only"; never compared alias to MUI type | #8 |
| 2026-10-16 | types.ts | `TdProps` split with invented name | same | #8 |
| 2026-10-16 | SRT_TableBodyCell | `align` override inert; dispatch function; `mrt-row-*` ids kept | June ruling treated as spec; ids never questioned | #7, #9, Vision |
