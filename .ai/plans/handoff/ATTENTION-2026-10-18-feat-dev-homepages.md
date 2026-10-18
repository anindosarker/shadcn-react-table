# ATTENTION: production tables guide (5cb28be, moved later)

The guide was written as /docs/guides/server-side-data (5cb28be) and then moved to /docs/getting-started/production-ready-tables ("Building Production-Ready Tables"), after Usage. The old URL redirects there (next.config.mjs, permanent: false). The example folder is still `examples/server-side-data` and renders as `<ServerSideDataExample />`.

- The guide's example includes column filter modes (`columnFilterFns` sent as `field[$op]=value`). Remove them if you want the guide shorter.
- The demo server sorts with `sortBy=field:desc` (colon). Your monorepo uses `field=desc`; change `app/api/users/route.ts` and the guide's hook if you want them to match.
- Regenerating `registry.json` also picked up two pending title changes (the Editing CRUD Inline Cell/Table examples) from the generator's current output.
- `app/api/data/route.ts` now imports shared row data from the new `app/api/data/db.ts`. Its behavior is unchanged.
- `lib/routes.ts` now lists the guide under Getting Started, after Usage. It did not list AI agents before either, so that entry is still missing.
