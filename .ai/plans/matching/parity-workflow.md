# SRT ← MRT Parity Workflow (per-component)

MRT is the source of truth. One component at a time, render-tree top-down.

- Deviations spec: `literal-parity-contract.md` (read first, every run).
- Single tracker + gap sink: `srt-review-notes.md` (order + status + notes).
- No separate order/status file. No git commits. Don't touch
  `packages/shadcn-react-table-cli` (unsynced mirror).

## Trust map (what exists vs what to rebuild)

- **Trusted (do not rebuild):** `ShadcnReactTable`, `SRT_TableLayout`, and the
  hand-written core (hooks/utils). These mirror MRT already.
- **`types.ts`:** only partial — complete it against MRT `types.ts` when reached.
- **REBUILD from `SRT_TableContainer` and everything below:** prior opus runs
  produced garbage here. DO NOT trust or tweak the existing SRT code. Author the
  SRT component fresh from the MRT spec, modulo locked deviations.

## The loop (per component pair `SRT_X` ↔ `MRT_X`)

Pipelined at the PLAN level — while an implementer codes pair N, we discuss N+1.

1. **Plan discussion (chat, human + lead).**
   - Read `MRT_X.tsx` (the spec) + `SRT_X.tsx` (garbage below TableLayout — read
     only to see what's salvageable, assume nothing).
   - Produce a PLAN: how to author `SRT_X` to read like `MRT_X`, calling out:
     - **mechanical** (comment strip, ordering, renames per contract rule 3),
     - **locked deviations** to apply (slot-props, cva/className, SRT_Tooltip,
       lucide icons, headless display-cols, shadcn inputs, portal/ref model),
     - **decisions** — genuine judgment calls only (behavior-touching, contract
       conflicts, ambiguity). Verify slot-prop TYPES before flagging (e.g.
       `SRT_HTMLPropsValue = Omit<HTMLAttributes,'color'|'size'>` has no `ref`
       → dropped ref-forwarding is forced, NOT a decision). No no-op noise.
     - **behavior gaps** to log (out of scope now) → note under the file in
       `srt-review-notes.md`.
   - Human decides the decisions. (Plan-discussion FORMAT is provisional —
     human gives feedback on it after a couple runs; iterate the format then.)
2. **Hand off to implementer subagent.** Give it: the agreed plan, the pair
   paths, the contract, the trust note. It authors `SRT_X.tsx`, then gates:
   - `npx prettier --write <file>`
   - `npx tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean
     (ignore only the preexisting `baseUrl` TS5101 config warning).
   - Reports files touched + any parity it could not reach + why.
3. **Meanwhile:** lead + human discuss the plan for pair N+1.
4. **Human read-through.** Human reads all produced code, asks questions, makes
   fixes. Rinse and repeat until the file is right → mark `[x]` in the tracker.

## Autonomy goal (drop the manual read step)

End state: agents complete the whole codebase unsupervised. The manual read is
the trust-building phase; prior opus4.8 runs "messed up," so trust is earned by
making verification catch those failures WITHOUT a human:

- `tsc` + `prettier` catch type/format breaks (necessary, not sufficient).
- Add an **independent reviewer subagent** per file: diffs the produced `SRT_X`
  against `MRT_X` + contract, adversarially flags any behavior drift, missing
  branch, or locked-deviation violation. Implementer and reviewer are separate
  agents (no shared bias). File is auto-accepted only if reviewer finds nothing;
  otherwise it bounces back with the findings.
- Once reviewer verdicts match the human's for several consecutive files, the
  human step is dropped for the safe categories (leaf buttons/inputs first,
  complex head/body/core last).

## Handoff message template (implementer)

> Author `SRT_<X>` to mirror `MRT_<X>`. Spec = MRT file (source of truth).
> SRT: `<srt path>`  MRT: `<mrt path>`
> Read `literal-parity-contract.md` + this workflow first.
> Trust note: existing `SRT_<X>` is [garbage — rebuild | trusted — tweak].
> Agreed plan: <paste plan + resolved decisions>.
> Apply the plan. Preserve locked deviations verbatim. Then `prettier --write`
> and `tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean. Report files
> touched + any unreachable parity + why. Do NOT commit. Do NOT decide open
> questions yourself — if something is ambiguous beyond the plan, stop and ask.
