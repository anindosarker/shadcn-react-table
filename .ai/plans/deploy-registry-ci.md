# Deploy, registry and CI plan

Status: written 2026-10-17, not started.

Goal: users install the library with one command from GitHub, the docs site and Storybook each
deploy on Vercel from this repo, and one GitHub Actions workflow gates every push. Nothing here
changes the library source. Deploy dashboard clicks are the owner's and are listed in the
ATTENTION file; this plan produces the config files and the verified commands.

## Starting point (measured 2026-10-17)

- `packages/shadcn-react-table/registry.json`: shadcn registry with the `shadcn-react-table`
  item (7 dependencies, 23 shadcn/ui `registryDependencies`, files under
  `src/components/ui/shadcn-react-table/`) plus one item per locale, `homepage`
  `https://shadcn-table.com` (not ours). `scripts/build-registry.mjs` generates it;
  `registry:build` also runs `shadcn build` into `public/r/*.json` (committed).
- No root `registry.json`, so the GitHub address
  `anindosarker/shadcn-react-table/shadcn-react-table` does not resolve yet.
- Docs app installs the library through `lib:install` (`shadcn add <public/r json> --overwrite`).
- No `.github/workflows`, no `vercel.json` anywhere. `storybook-static` and `.next/` are
  gitignored at the root.
- Root scripts: `test` runs vitest through turbo (399 render tests, Chromium through
  `@vitest/browser-playwright`); `lib:build` still copies a README into
  `packages/material-react-table` (dead path, purge plan).

## 1. GitHub registry

1. Root `registry.json`: `$schema` `https://ui.shadcn.com/schema/registry.json`, `name`
   `shadcn-react-table`, `homepage` `https://github.com/anindosarker/shadcn-react-table`,
   `include: ["packages/shadcn-react-table/registry.json"]`. File paths inside the included
   registry stay relative to that file (they already are).
2. `scripts/build-registry.mjs`: `homepage` becomes the GitHub URL; every `registryDependencies`
   entry that names one of our own items (locale items depending on `shadcn-react-table`) becomes
   the GitHub address `anindosarker/shadcn-react-table/shadcn-react-table`; bare names stay for
   shadcn/ui items. Regenerate `registry.json` and `public/r/*` with `registry:build`; commit.
3. Root script `registry:serve`: `serve packages/shadcn-react-table/public -l 5310` with `serve`
   as a root devDependency. Local two-step install (documented in the docs install page only as
   the contributor path): `pnpm registry:build`, `pnpm registry:serve`, then in the consumer
   `pnpm dlx shadcn@latest add http://localhost:5310/r/shadcn-react-table.json`.
4. Validation, after push: `pnpm dlx shadcn@latest registry validate anindosarker/shadcn-react-table#claude/review`.
   Install test without side effects, from `apps/shadcn-react-table-docs` (has a
   `components.json`): `pnpm dlx shadcn@latest add anindosarker/shadcn-react-table/shadcn-react-table#claude/review --dry-run`
   and `pnpm dlx shadcn@latest view anindosarker/shadcn-react-table/shadcn-react-table#claude/review`.
   A private repo needs `GITHUB_TOKEN`; check `gh repo view --json visibility` and write the
   result into the ATTENTION file.
5. The docs install page command stays `pnpm dlx shadcn@latest add anindosarker/shadcn-react-table/shadcn-react-table`
   (default branch). Until `main` carries the registry, the ATTENTION file notes that the
   command works with `#claude/review` appended.

## 2. Vercel

Two Vercel projects from one repo, both created by the owner in the dashboard (import repo,
set Root Directory, production branch). Config files committed here:

1. Docs: `apps/shadcn-react-table-docs/vercel.json` with `framework: "nextjs"`. Vercel detects
   pnpm from the lockfile and installs at the repo root. If the installed library copy
   (`components/ui/shadcn-react-table`) is committed, no pre-build step; otherwise
   `buildCommand: "pnpm lib:install && next build"`. Check with `git ls-files`.
2. Storybook: `packages/shadcn-react-table/vercel.json` with `framework: null`,
   `buildCommand: "pnpm storybook:build"`, `outputDirectory: "storybook-static"`.
3. Both: `installCommand` left to Vercel (root `pnpm install --frozen-lockfile`). Verify the
   build commands locally from the repo root exactly as Vercel runs them
   (`pnpm --filter shadcn-react-table-docs build`, `pnpm --filter shadcn-react-table storybook:build`).

## 3. CI

One workflow `.github/workflows/ci.yml`, on `push` to `main` and `claude/review` and on
`pull_request`. Ubuntu, Node from `.nvmrc` or 22, pnpm from the root `packageManager` field
(`pnpm/action-setup`), `pnpm install --frozen-lockfile`, pnpm store cache. Jobs:

1. `library`: `pnpm --filter shadcn-react-table tsc`, `pnpm --filter shadcn-react-table lint`,
   `pnpm --filter shadcn-react-table storybook:build`.
2. `test`: `pnpm --filter shadcn-react-table exec playwright install --with-deps chromium`
   (confirm the exact package the browser provider needs), then `pnpm test`.
3. `docs`: `pnpm --filter shadcn-react-table-docs types:check`,
   `pnpm --filter shadcn-react-table-docs build`.
4. `registry`: `pnpm dlx shadcn@latest registry validate anindosarker/shadcn-react-table#${{ github.sha }}`
   and the `--dry-run` add from the docs app with the same ref. Runs on `push` only (the ref must
   exist on GitHub).

Jobs run in parallel. No deploy step: Vercel deploys from its own Git integration.

## Gates

- Root `registry.json` and the rebuilt package registry committed; `registry validate` green
  against the pushed branch; `--dry-run` add lists the files and 23 registry dependencies.
- Both Vercel build commands green locally.
- Workflow YAML passes `actionlint` if available (`pnpm dlx actionlint` or skip and say so);
  first run on GitHub checked with `gh run list --workflow ci.yml --limit 1` and
  `gh run view --log-failed` on failure, fixed until green or the failure is logged in the
  ATTENTION file with the exact step.
- Commits on `claude/review`, one per section (`chore: github registry root + addresses`,
  `chore: vercel config for docs and storybook`, `ci: github actions workflow`), pushed after each,
  no trailers, no attribution. Stage only paths this plan names.

## Out of scope

npm publish, release tags, Storybook tests beyond `pnpm test`, the dev-server page gate in CI,
custom domains, analytics, purge of the dead `lib:*` scripts (purge plan).
