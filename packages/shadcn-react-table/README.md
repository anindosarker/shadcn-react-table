# shadcn-react-table (WIP)

A Tailwind/shadcn-style React table built on TanStack Table v8.

## Install

Peer dependencies required in your app:

```bash
pnpm add @tanstack/react-table react react-dom
```

Library dependencies are bundled as externals.

## Tailwind setup (consumer app)

1. Ensure Tailwind is installed and configured.
2. Add the library to `content` so classes aren't purged:

```ts
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/shadcn-react-table/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [],
};
```

3. Import Tailwind layers in your app CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Usage

```tsx
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'shadcn-react-table';

interface Person { name: string; age: number }

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
];

export function Example() {
  return <DataTable columns={columns} data={[{ name: 'Ana', age: 30 }]} />;
}
```

## Notes
- This library ships React components with Tailwind classNames; your app compiles the CSS.
- Roadmap: sorting, pagination, selection, filters, shadcn UI primitives.
