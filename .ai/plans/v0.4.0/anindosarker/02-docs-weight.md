# 02: docs weight

Decision: [decisions.md](decisions.md) "Docs site" 1. The code view highlights on the client,
on demand; pages ship raw source strings only.

## Why (measured 2026-10-20 on the v0.3.0 build)

`components/mdx/example-snippet.tsx` highlights every file of every example for both bases
at build with `fumadocs-core/highlight` and passes the resulting React trees as props to the
client `ExamplePlayground`. The editing guide is 2.7 MB HTML plus 2 MB RSC with 13,605 inline
`style` props; docs pages total 131 MB of the 265 MB server output, duplicated again in the
66 MB route cache. Multiplied by retained deployments this filled the Hobby 10 GB.

## Acceptance

- `guides/editing.html` and its `.rsc` together under 400 KB after `next build`; total
  `server/app/docs` under 15 MB.
- Code view behaviour unchanged for the reader: file tree, active file, copy button, max
  height, both bases, the live example untouched.
- Page checks (`scripts/check-pages.mjs`, `scripts/page-checks/*`) pass; the check that reads
  code view text waits for the highlighted block.

## Change

### `components/code-explorer.tsx`

- `ExplorerFile` loses `node: ReactNode`, gains `lang: string`.
- The active file renders `<DynamicCodeBlock lang={active.lang} code={active.source}
  codeblock={{ allowCopy: false, className: 'my-0 rounded-none border-0', viewportProps:
  { className: 'max-h-[32rem]' } }} />` from `fumadocs-ui/components/dynamic-codeblock`,
  the same component `components/mdx/install-command.tsx` already uses. It highlights in
  the browser with lazily loaded grammars and renders inside Suspense with a plain `<pre>`
  of the raw source as fallback, so the text is readable before highlighting lands.

### `components/mdx/example-snippet.tsx`

- Drop the `highlight` import, the `render` cache and `CodeBlock`/`Pre`. `variantFor` maps
  each file to `{ path, source, lang: LANGS[ext] ?? 'text' }`.
- Everything else stays: install command, agent prompt, GitHub URL, `ExampleVariant`.

### `components/example-playground.tsx`

- No change beyond the `ExplorerFile` type; `variants[base].files` stays a per-base record
  of strings.

### Page checks

- `scripts/page-checks/_helpers.mjs` around lines 276 to 327 reads the code view's text to
  assert the Base UI variant's imports. It must wait for the `DynamicCodeBlock` output
  (a `code` element inside the explorer) before reading; add the wait, keep the assertion.

## Not in scope

- Prebuilt per-file highlight assets (option 2 in the discussion).
- Changing which files or bases the explorer shows; that is phase 05.
- OG images, `llms.mdx`, Storybook sizes.

## Gates

- Docs `types:check`, `lint`, `build`; sizes above checked with `du` on
  `apps/<docs>/.next/server/app/docs` and reported in the tracker.
- `check-pages.mjs a` and `e` against `next start` on a port from the allowed range.
- Playwright: open one guide, switch to Code, click a non-entry file, confirm highlighted
  tokens appear and the copy button copies the raw source; both bases.
