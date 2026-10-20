# 03: docs app folder

Owns: `apps/shadcn-table-docs` to `apps/docs` and every path reference outside
`packages/shadcn-table/**` and the registry scripts (phase 02 owns those; coordinate on
`vercel.json`, `ci.yml`, root `package.json` by touching only the lines about the docs path).
Independent of phase 01; can run in parallel.

## Steps

1. `git mv apps/shadcn-table-docs apps/docs`. Package name stays `shadcn-table-docs`
   (`pnpm --filter shadcn-table-docs` keeps working).
2. Path references: `vercel.json` (service root), `.github/workflows/ci.yml`,
   `turbo.json` if any, root `package.json` scripts, `CONTRIBUTING.md`, `README.md`,
   `apps/docs/README.md`, `skills/shadcn-table/SKILL.md` (if it names the path),
   `.ai/**` is NOT edited. `apps/docs/scripts/check-pages.mjs` resolves Playwright from
   `packages/shadcn-table/node_modules` by a relative path; verify it still resolves.
3. `git mv apps/docs/scripts/build-example-registry.mjs apps/docs/scripts/example-map.mjs`;
   update its header comment and every caller (`package.json` scripts, `components/mdx.tsx`
   comment, docs text). It generates `examples/registry.ts`; rename that output to
   `examples/map.ts` and the import in `components/mdx.tsx` (one import).
4. Gates: `pnpm --filter shadcn-table-docs types:check` 0, lint 0 errors,
   `NEXT_DIST_DIR=.next-s3 pnpm --filter shadcn-table-docs build` exit 0 (294 pages), page
   gates a and e on your own port (5341, `NEXT_DIST_DIR=.next-5341`) 0 failures; `grep -rn
   shadcn-table-docs --include='*.{json,yml,yaml,md,mjs,ts,tsx}' .` outside `.ai/` returns
   only the package name uses.
5. Commits: `chore(docs): apps/docs`, `chore(docs): example-map script`.
