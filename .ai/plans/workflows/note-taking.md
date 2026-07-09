# Note-taking guideline (srt-review-notes.md)

`srt-review-notes.md` is the single tracker. It records WHAT was decided, never
HOW the work happened. If a note doesn't change how a future component gets
built, it doesn't belong.

## Write these

- **Key decisions** — one line each: API shape, renames, new SRT-only
  constructs (e.g. "Created `LayoutDivProps` to mirror `PaperProps`").
- **Deviations from MRT** that later pairs must repeat or know about.
- **Deferred gaps**: behavior known-broken/missing, one line + which pair fixes it.
- **General notes**: a convention that applies to many future files. Promote an
  entry note to General notes when it starts repeating; don't restate it per
  entry after that.

## Never write these

- Process narration: which agent/loop ran, what review caught, test PASS
  counts, gate results, screenshots, plan-file pointers, dates. Reports live in
  chat; the tracker outlives them.
- Anything the code or diff already shows.
- Tooling/TS trivia and workarounds, unless it changed an API decision.
- Undecided suggestions ("could later widen X"). Decide it or drop it.
- No-op observations ("correct as-is", "checked, fine").

## Format

- Entry: `### [status] SRT_X.tsx : MRT_X.tsx` + at most ~3 terse bullets.
- One fact per line, fragment style fine ("ok. almost same.").
- `[ ]` pending · `[x]` done.
- Only the lead writes to the tracker — agents report in chat, lead distills.
