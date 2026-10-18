# ATTENTION: server-side data guide (5cb28be)

- The guide's example includes column filter modes (`columnFilterFns` sent as `field[$op]=value`). Remove them if you want the guide shorter.
- The demo server sorts with `sortBy=field:desc` (colon). Your monorepo uses `field=desc`; change `app/api/users/route.ts` and the guide's hook if you want them to match.
- Regenerating `examples/registry.json` also picked up two pending title changes (the Editing CRUD Inline Cell/Table examples) from the generator's current output.
- `app/api/data/route.ts` now imports shared row data from the new `app/api/data/db.ts`. Its behavior is unchanged.
