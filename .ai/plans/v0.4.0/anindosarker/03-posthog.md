# 03: PostHog

Decision: [decisions.md](decisions.md) "Docs site" 2. Product and web analytics for the docs
app on PostHog US cloud, the library itself untouched.

## Acceptance

- With `NEXT_PUBLIC_POSTHOG_KEY` set, a visit to any docs page produces a `$pageview` in
  the PostHog project; navigating between pages produces one per route change.
- Each custom event below fires once per user action with the listed properties.
- Without the key (local dev, forks) nothing loads and nothing errors.
- Requests go to `www.shadcn-table.com/ingest/...`, not to `posthog.com`, so ad blockers
  do not drop them and no third-party origin appears in the network tab.

## Pieces

### Dependency and env

- `posthog-js` in the docs app only.
- `NEXT_PUBLIC_POSTHOG_KEY` on Vercel (Production and Preview) and in `.env.local`;
  `.env*.local` added to the docs `.gitignore`. Host is fixed in code (US), not an env.

### `components/posthog-provider.tsx` (client)

- `posthog.init(key, { api_host: '/ingest', ui_host: 'https://us.posthog.com',
  capture_pageview: 'history_change', capture_pageleave: true, person_profiles:
  'identified_only', autocapture: false })` inside `useEffect`, once, only when the key is
  set. `autocapture` off: the custom events below are the signal; autocapture on a docs site
  with hundreds of buttons is noise and quota.
- Wraps `children` in `PostHogProvider` from `posthog-js/react`. Mounted in
  `app/layout.tsx` inside `RootProvider`.

### `next.config.mjs`

- Rewrites added to `afterFiles`: `/ingest/static/:path*` to
  `https://us-assets.i.posthog.com/static/:path*`, `/ingest/:path*` to
  `https://us.i.posthog.com/:path*`. `skipTrailingSlashRedirect: true` (PostHog paths end
  with a slash). External rewrites run on the edge; no function invocations.

### `lib/analytics.ts`

One module, one function per event, each a thin `posthog.capture` with typed properties.
Components call these, never `posthog` directly, so renaming an event is one file.

| event | properties | hook point |
| --- | --- | --- |
| `base_switched` | `from`, `to`, `surface` (`header`, `command_bar`, `tabs`) | `components/base-selector.tsx` `setBase` callers |
| `install_command_copied` | `item`, `base`, `package_manager`, `surface` (`docs_page`, `example`, `home`) | `components/mdx/copy-button.tsx` via a `onCopied` prop; `install-command.tsx` and the example panel pass the properties |
| `example_code_opened` | `example`, `base`, `mode` (`code`, `both`) | `components/example-playground.tsx` mode change |
| `example_file_viewed` | `example`, `base`, `file` | `components/code-explorer.tsx` active file change |
| `storybook_opened` | `base`, `surface` (`mdx_link`, `nav`, `footer`) | `components/mdx/storybook-link.tsx`, nav and footer links |
| `outbound_clicked` | `target` (`github`, `discord`), `surface` | `components/site-nav.tsx`, footer |
| `search_opened` | none | `RootProvider` `search` options if fumadocs exposes an open callback; otherwise skip this event, do not patch fumadocs |

Page views carry the current base as a person property (`posthog.register({ base })`) so
every report can be broken down by base.

### `CONTRIBUTING.md`, section "Analytics"

How it is wired (the above in five lines), how to run locally with a key, and how to read
the data (the "Reading it" section below, kept in the repo so the next person has it).

## Reading it (also delivered in chat when the phase lands)

- **Web analytics** (left nav, Web analytics): visitors, page views, top pages, referrers,
  countries, devices. The daily glance.
- **Product analytics, Trends**: pick an event, for example `install_command_copied`,
  breakdown by `base` and by `package_manager`. Save as an insight, pin to a dashboard
  named "shadcn-table".
- **Funnels**: `$pageview` on an example page, then `example_code_opened`, then
  `install_command_copied`. Breakdown by `base` shows which base converts.
- **Paths**: start at `$pageview` with the install page to see where readers go next.
- Three insights to create on day one: page views by base, install copies by base and
  package manager, example-to-install funnel.

## Not in scope

- Session replay, surveys, feature flags, error tracking: not enabled, not configured.
- Analytics in Storybook or in the installed library.
- Cookie banner: PostHog with `person_profiles: 'identified_only'` and no identify call
  stores an anonymous id only; no consent UI is added. Revisit if an EU audience grows.

## Gates

- Docs `types:check`, `lint`, `build`.
- Playwright against `next start` with a test key: load a page, switch base, copy an install
  command, open Code and a file; assert one request per event to `/ingest/e/` (or the
  batched `/ingest/batch/`) carrying the event name and properties. Then the same with no
  key: zero `/ingest` requests, no console errors.
- On the first production deploy with the real key: PostHog "Verify installation" turns
  green and `$pageview` events show the production host.
