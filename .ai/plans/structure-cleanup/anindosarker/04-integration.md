# 04: integration

1. Merge order onto `structure-cleanup`: 01, 03, 02 (02 is built on 01 and touches docs
   script paths, so it lands after the rename and fixes the final paths).
2. Gates on the merged tree, with numbers: library `tsc:radix` 0, `tsc:baseui` 0, lint 0,
   `test` 400/400, `test:base` 400/400, both Storybook builds and the `/base/` serve check;
   `shadcn registry validate` 3 files 190 items; `registry:hosted` counts; docs `types:check`,
   lint, build, page gates a and e 0 failures; scratch installs radix and base (phase 02 step
   6) with the 92-file list identical to v0.2.0.
3. CI: `.github/workflows/ci.yml` uses `tsc:radix` / `tsc:baseui`, no `diff-bases` job,
   docs path `apps/docs`; remove the `tsc:base` alias from `package.json` once CI is
   updated. Temporary push trigger for `structure-cleanup`, all jobs green, trigger removed.
4. Tick the State list in `structure-cleanup-plan.md`.
5. Lead: merge onto `claude/review` only after PR #19 is merged; then update
   `.ai/plans/tanstack-v9/anindosarker/` for the new layout (one shared port plus the 23
   overrides instead of two tree ports) and start the v9 workflow from the merged tip.
