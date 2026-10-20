# ATTENTION: copy prompt default and scrollbar sweep

- The library was briefly changed in a94707d and reverted in 04af5c2. Nothing under packages/ or components/ui/shadcn-table differs from 786a5d6.
- Prop tables (table, column and state options): the Type and More Info Links columns went from 180 to 150 so the tables fit at 1440. Long types and links now wrap onto more lines.
- These docs tables still show a small scrollbar at 1440, because the library cell `minWidth` is max(size, minSize). Fixing them means changing the column sizes in each example, which is code users copy:
  - guides/toolbar-customization +12px
  - examples/editing-crud-tree +15px
  - getting-started/usage +19px
  - examples/react-query +26px
  - guides/async-loading +32px
  - guides/row-pinning and guides/row-selection +57 to +59px
- The playground's ▾ button label is now "More actions" (it was "More ways to open"). The menu order is: Copy install command, then a separator, then Open in GitHub, StackBlitz and CodeSandbox.
- Already broken before this work: /docs/examples/virtualized logs "Maximum update depth exceeded" in Code mode.
