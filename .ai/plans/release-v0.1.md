# Release v0.1 checklist

Owner items: dashboard and GitHub clicks. Agent items: commands, land on `claude/review`.
Tick as you go.

Done means: `pnpm dlx shadcn@latest add anindosarker/shadcn-table/shadcn-table`
installs from the default branch, the docs site is live on the domain, `/SKILL.md` and the copied
prompts carry that domain, tag `v0.1.0` exists.

## Baseline merge

- [x] PR `claude/review` into `master`: https://github.com/anindosarker/shadcn-react-table/pull/8
- [x] Owner: merge with "Create a merge commit" (not squash). CI on `master` green.
- [x] Owner: merge `feat/dev-homepages` into `claude/review` when that agent is done.

## Hosting (owner)

- [ ] Vercel project: import repo at root `./`, services preset reads `vercel.json` (`docs`,
      `storybook`), production branch `master`.
- [ ] Env `NEXT_PUBLIC_SITE_URL=https://shadcn-table.com` on the docs project, then redeploy.
- [ ] Domains `shadcn-table.com`, `www.shadcn-table.com`, `storybook.shadcn-table.com` on the Vercel project, DNS records, HTTPS live.
- [ ] GitHub: repo description and website set to the domain, Discussions on, branch protection on
      `master` requiring CI.
- [x] Storybook: service `storybook` in the root `vercel.json`, host rewrite `storybook.` (no separate
      project).

## Cleanup (agent)

- [x] Revert the `.next-*` lines in `apps/shadcn-react-table-docs/tsconfig.json`.
- [x] `README.md` rewrite: what it is, install command, docs link, status, MIT credit to
      material-react-table. `CONTRIBUTING.md` points at `LOCAL_DEVELOPMENT.md`.
- [x] Versions `0.1.0` in `packages/shadcn-react-table/package.json` and
      `apps/shadcn-react-table-docs/package.json`.
- [x] Drop the root `lib:build` script (copies into `packages/material-react-table`).
- [x] Replace the two `www.shadcn-react-table.com` links (`guides/column-filtering.mdx`,
      `guides/global-filtering.mdx`) with site-relative links.
- [x] Delete the `/dev/*` homepage variants (`app/dev`, unused parts of `components/dev-home`).
      After the `feat/dev-homepages` merge, to avoid conflicts.

## Rename to shadcn-table (agent, branch `rename-st`)

- [x] GitHub repo renamed to `anindosarker/shadcn-table`, origin updated.
- [x] Code rename: `shadcn-react-table` to `shadcn-table`, `SRT_` to `ST_`, dirs, registry, skill,
      page checks for the new code explorer UI. Lands on `claude/review`.
- [ ] Owner: restart the docs dev server from `apps/shadcn-table-docs` (old dirs removed, `pnpm install` done).
- [ ] PR into `master`, owner merges. First Vercel build after this.

## Guide, install CI, license (agent, plan `local-dev-guide-and-install-ci.md`)

- [x] `CONTRIBUTING.md` single guide (`LOCAL_DEVELOPMENT.md` removed), `install` CI job (fresh and existing app), `LICENSE`
      copyright line, README links and feature list.

## Point at the default branch (agent, after the baseline merge)

- [ ] `gitConfig.branch = 'master'` in `apps/shadcn-table-docs/lib/shared.ts`.
- [ ] `pnpm registry:items`, commit the regenerated `apps/shadcn-table-docs/registry.json`.
- [ ] `ci.yml`: drop `claude/review` from the push branches.
- [ ] PR into `master`, owner merges.

## Verify the public release (agent)

- [ ] `pnpm dlx shadcn@latest registry validate anindosarker/shadcn-table`.
- [ ] Dry-run adds from the docs app: `shadcn-table`, one locale item, one example item.
- [ ] Real install into a fresh Vite app per `CONTRIBUTING.md`, GitHub address, no `#ref`.
- [ ] Site: `/`, `/docs/getting-started/install`, `/SKILL.md`, `/llms.txt` return 200 and show the
      domain. `npx skills add anindosarker/shadcn-table` works.

## Tag and release (owner)

- [ ] `git tag v0.1.0` on the final merge commit, push the tag.
- [ ] GitHub Release `v0.1.0`: install command, docs link, known gaps from
      `.ai/plans/handoff/ATTENTION-2026-10-17-claude-review.md`.

## Rollback

- Docs: promote the previous Vercel deployment.
- Registry: users pin a ref, `anindosarker/shadcn-table/shadcn-table#<sha>`.
