# Release v0.1 checklist

Owner items: dashboard and GitHub clicks. Agent items: commands, land on `claude/review`.
Tick as you go.

Done means: `pnpm dlx shadcn@latest add anindosarker/shadcn-react-table/shadcn-react-table`
installs from the default branch, the docs site is live on the domain, `/SKILL.md` and the copied
prompts carry that domain, tag `v0.1.0` exists.

## Baseline merge

- [x] PR `claude/review` into `master`: https://github.com/anindosarker/shadcn-react-table/pull/8
- [ ] Owner: merge with "Create a merge commit" (not squash). CI on `master` green.
- [ ] Owner: merge `feat/dev-homepages` into `claude/review` when that agent is done.

## Hosting (owner)

- [ ] Vercel docs project: import repo, Root Directory `apps/shadcn-react-table-docs`, Framework
      Next.js, production branch `master`.
- [ ] Env `NEXT_PUBLIC_SITE_URL=https://<domain>` on the docs project, then redeploy.
- [ ] Domain on the Vercel project, DNS records, HTTPS live.
- [ ] GitHub: repo description and website set to the domain, Discussions on, branch protection on
      `master` requiring CI.
- [ ] Optional: Storybook project, Root Directory `packages/shadcn-react-table` (settings in its
      `vercel.json`).

## Cleanup (agent, running now)

- [ ] Revert the `.next-*` lines in `apps/shadcn-react-table-docs/tsconfig.json`.
- [ ] `README.md` rewrite: what it is, install command, docs link, status, MIT credit to
      material-react-table. `CONTRIBUTING.md` points at `LOCAL_DEVELOPMENT.md`.
- [ ] Versions `0.1.0` in `packages/shadcn-react-table/package.json` and
      `apps/shadcn-react-table-docs/package.json`.
- [ ] Drop the root `lib:build` script (copies into `packages/material-react-table`).
- [ ] Replace the two `www.shadcn-react-table.com` links (`guides/column-filtering.mdx`,
      `guides/global-filtering.mdx`) with site-relative links.
- [ ] Delete the `/dev/*` homepage variants (`app/dev`, unused parts of `components/dev-home`).
      After the `feat/dev-homepages` merge, to avoid conflicts.

## Point at the default branch (agent, after the baseline merge)

- [ ] `gitConfig.branch = 'master'` in `apps/shadcn-react-table-docs/lib/shared.ts`.
- [ ] `pnpm registry:items`, commit the regenerated `apps/shadcn-react-table-docs/registry.json`.
- [ ] `ci.yml`: drop `claude/review` from the push branches.
- [ ] PR into `master`, owner merges.

## Verify the public release (agent)

- [ ] `pnpm dlx shadcn@latest registry validate anindosarker/shadcn-react-table`.
- [ ] Dry-run adds from the docs app: `shadcn-react-table`, one locale item, one example item.
- [ ] Real install into a fresh Vite app per `LOCAL_DEVELOPMENT.md`, GitHub address, no `#ref`.
- [ ] Site: `/`, `/docs/getting-started/install`, `/SKILL.md`, `/llms.txt` return 200 and show the
      domain. `npx skills add anindosarker/shadcn-react-table` works.

## Tag and release (owner)

- [ ] `git tag v0.1.0` on the final merge commit, push the tag.
- [ ] GitHub Release `v0.1.0`: install command, docs link, known gaps from
      `.ai/plans/handoff/ATTENTION-2026-10-17-claude-review.md`.

## Rollback

- Docs: promote the previous Vercel deployment.
- Registry: users pin a ref, `anindosarker/shadcn-react-table/shadcn-react-table#<sha>`.
