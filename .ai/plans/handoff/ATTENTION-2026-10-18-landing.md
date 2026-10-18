# ATTENTION: /dev homepage variants

- `/dev/kit` (app/dev/kit/page.tsx) is an extra review page showing all shared dev-home pieces. Not requested; delete if unwanted.
- Pre-existing docs bug, not fixed: on `/docs/examples/advanced` the avatars render full size (Tailwind preflight `img { height: auto }` overrides `height={30}` / `height={200}` in examples/advanced/TS.tsx). Only worked around inside the dev LiveTable (`.dh-live` in components/dev-home/tokens.css). Real fix belongs in the example (e.g. `className="size-[30px]"`).
- Pre-existing SRT issue, not fixed: in the advanced example the right-pinned Actions column covers the "Job Info" header group label (visible on docs page and in variants).
- v1 (Orbit) and v4 (Box-drawing field) add Archivo via next/font/google as a display face.
- `tsc --noEmit` in the docs app still reports 36 pre-existing errors (duplicate @types/react, components/ui, examples/*); none in app/dev or components/dev-home.
