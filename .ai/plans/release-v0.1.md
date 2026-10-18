# Release v0.1

How to publish shadcn-react-table v0.1. Stages run in order; each stage is discussed and ticked
before the next starts. Owner: dashboard and GitHub clicks. Agents: everything with a command.

Done means: `pnpm dlx shadcn@latest add anindosarker/shadcn-react-table/shadcn-react-table`
installs from the default branch, the docs site is live on the domain, `/SKILL.md` and the copied
prompts carry that domain, tag `v0.1.0` exists.

## Stage 1: Freeze the branch (agents)

- Push `claude/review`. Revert the `.next-*` lines in `apps/shadcn-react-table-docs/tsconfig.json`.
- Delete the `/dev/*` homepage variants (`app/dev`, `components/dev-home` except what the real
  home page imports).
- Background agents finish their work and land on `claude/review`. CI green.

## Stage 2: Presentable repo (agents)

- Rewrite `README.md`: what it is, install command, docs link, status, MIT credit to
  material-react-table. `CONTRIBUTING.md` points at `LOCAL_DEVELOPMENT.md`.
- Versions `0.1.0` in `packages/shadcn-react-table/package.json` and
  `apps/shadcn-react-table-docs/package.json`. Drop the root `lib:build` script
  (copies into `packages/material-react-table`).
- Replace the two `www.shadcn-react-table.com` links (`guides/column-filtering.mdx`,
  `guides/global-filtering.mdx`) with site-relative links.

## Stage 3: Hosting setup (owner, in parallel with 1 and 2)

- Vercel docs project: import the repo, Root Directory `apps/shadcn-react-table-docs`, Framework
  Next.js, production branch `master`, env `NEXT_PUBLIC_SITE_URL=https://<domain>`.
- Domain: add to the Vercel project, DNS records.
- Optional: Storybook project, Root Directory `packages/shadcn-react-table` (build settings come
  from its `vercel.json`).
- GitHub: branch protection on `master` (require CI), Discussions on, repo description and
  website set to the domain.

## Stage 4: Point at the default branch (agents)

- `gitConfig.branch = 'master'` in `apps/shadcn-react-table-docs/lib/shared.ts`.
- `pnpm registry:items`, commit the regenerated `apps/shadcn-react-table-docs/registry.json`.
- `ci.yml`: keep `master`, drop `claude/review` once merged.
- Commit, push, CI green.

## Stage 5: Merge (owner)

- PR `claude/review` into `master`. Default branch is `master`, not `main`.
- Merge. CI on `master` green, registry job included. Vercel production deploy runs.

## Stage 6: Verify the public release (agents)

- `pnpm dlx shadcn@latest registry validate anindosarker/shadcn-react-table`.
- Dry-run adds from the docs app: `shadcn-react-table`, one locale item, one example item
  (locale dependencies resolve only now).
- Real install into a fresh Vite app per `LOCAL_DEVELOPMENT.md`, with the GitHub address.
- Site: `/`, `/docs/getting-started/install`, `/SKILL.md`, `/llms.txt` return 200 and show the
  domain. `npx skills add anindosarker/shadcn-react-table` works.

## Stage 7: Tag and release (owner)

- `git tag v0.1.0` on the merge commit, push the tag.
- GitHub Release `v0.1.0`: install command, docs link, known gaps from
  `.ai/plans/handoff/ATTENTION-2026-10-17-claude-review.md`.

## Rollback

- Docs: promote the previous Vercel deployment.
- Registry: users pin a ref, `anindosarker/shadcn-react-table/shadcn-react-table#<sha>`.
