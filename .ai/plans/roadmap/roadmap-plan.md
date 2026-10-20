1. Package: Base UI
   1. Doc update, test update etc etc
   2. Minor bug fixes, tweaks etc
2. Rewrite to Tanstack v9 port
   1. Doc update, test update etc
   2. bug fixes, tweaks etc
3. Package: React Aria
   1. Doc update, test update etc
   2. Minor bug fixes, tweaks etc
4. Optional Candidates Ordered By Priority
   1. API docs from types: generate table-options, column-options, st*Props pages from types.ts so the docs cannot drift from the code again.
   2. RTL: shadcn ships ui-rtl variants; the table has no RTL handling (pinning, drag, sticky).
   3. Accessibility gate: addon-a11y is installed, never run as a gate. Run over the 400 stories on all trees, fix, make it a CI leg. A table library sells on this.
   4. Bundle size: fresh install builds a 741 kB main chunk. Lazy menus and modals, tree-shake fns and locales, per-feature measurements in the docs.
   5. Release process: changelog file or changesets, so notes stop being hand-drafted.
