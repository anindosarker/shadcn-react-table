# 01: release automation

Decision: [decisions.md](decisions.md) "Release". A release is one command; a workflow does
the verification and the GitHub release, or fails without releasing.

## Acceptance

- `pnpm release 0.4.0` from a clean `master` checkout bumps both versions, commits, tags
  `v0.4.0`, pushes commit and tag, and exits. Nothing else is typed.
- The tag push runs `release.yml`; on success a GitHub release `v0.4.0` exists with the
  `## 0.4.0` section of `CHANGELOG.md` as notes, marked latest. On any failed check there is
  no release and the run is red with the failing step named.
- Running the script on a dirty tree, off `master`, or with a version that is not greater
  than the current one exits non-zero before touching anything.

## Pieces

### `scripts/release.mjs` (repo root `package.json`: `"release": "node scripts/release.mjs"`)

1. Guards: `git status --porcelain` empty, branch `master`, `git fetch` then local equals
   `origin/master`, argument is semver and greater than `packages/shadcn-table/package.json`
   `version`, `CHANGELOG.md` has a `## <version>` heading.
2. Writes `version` into `packages/shadcn-table/package.json` and the docs app
   `package.json` (same value; the docs version mirrors the library).
3. `git commit -m "chore: version <v>"` with only those two files, `git tag v<v>`,
   `git push origin master v<v>`.

### `app/version.txt/route.ts` in the docs app

Static route (`revalidate = false`) returning the library version from
`packages/shadcn-table/package.json` at build time. The workflow polls it to know production
serves the tagged commit. One line, text/plain.

### `.github/workflows/release.yml`

Trigger `push: tags: ['v*']`. Jobs, in order; every job `needs` the previous.

1. **wait-for-production**: poll `https://www.shadcn-table.com/version.txt` every 30 s until
   it equals the tag's version, timeout 20 minutes. Vercel builds `master` on the version
   commit, so the tag's commit and the deployed commit are the same.
2. **smoke**: a Node script `scripts/release/smoke.mjs` (no curl, `fetch`):
   `/r/radix/shadcn-table.json` and `/r/base/shadcn-table.json` return 200 and their
   `dependencies` contain the `@tanstack/react-table` pin from
   `packages/shadcn-table/package.json`; `/r/radix/registry.json` and `/r/base/registry.json`
   list the same item names as the committed catalog; `https://storybook.shadcn-table.com/`
   and `/base/` return 200 HTML; `/SKILL.md` returns 200 and contains both base labels;
   `/llms.txt` returns 200. Then `apps/<docs>/scripts/check-pages.mjs` against the production
   URL (it takes a base URL today; confirm, else add the flag).
3. **install**: the existing `install` matrix from `ci.yml` (`fresh`, `existing`, `base`,
   `nextjs`), extracted into a reusable workflow `install.yml` with an input `source` that is
   either a GitHub address with a ref (CI) or a public URL prefix (release). Release passes
   `https://www.shadcn-table.com/r/<base>/shadcn-table.json`. `ci.yml` calls the same
   reusable workflow so the two cannot drift.
4. **release**: `node scripts/release/notes.mjs <version>` extracts the `## <version>`
   section of `CHANGELOG.md` to a file; `gh release create v<v> --title v<v> --latest
   --notes-file`. For a version containing `-` (pre-release such as `0.4.0-rc.1`) pass
   `--prerelease` instead of `--latest`.

### `CHANGELOG.md`

Keep a Changelog format, newest first. `## Unreleased` on top during work; `scripts/release.mjs`
renames it to `## <version>` with the date as part of its bump. Seed it with the v0.3.0
notes from PR #19 and the v0.1.x entries from the existing GitHub releases.

## Not in scope

- Changesets or any per-PR version files.
- npm publishing: the library is registry-distributed only.
- Automated rollback. A bad release is fixed forward with the next version.

## Gates

- `node scripts/release.mjs 0.0.0` on a dirty tree, on a non-master branch and with a lower
  version each exit non-zero with the reason, nothing written (test in a scratch clone).
- `act` is not required; prove `release.yml` with the first real tag (see the master plan
  "Open" for which).
- `ci.yml` still green after the install job moves to `install.yml`.
