#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { cyan, green } from 'kolorist';
import { join } from 'path';

const [, , cmd, target] = process.argv;

if (cmd !== 'add' || target !== 'data-table') {
  console.log('Usage: shadcn-rt add data-table');
  process.exit(1);
}

const cwd = process.cwd();
const outDir = join(cwd, 'src/components/ui/data-table');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const indexTsx = `import { type ColumnDef } from 'shadcn-react-table-core'
import { useDataTable } from 'shadcn-react-table-core'

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  className?: string
}

export function DataTable<TData>({ columns, data, className }: DataTableProps<TData>) {
  const table = useDataTable({ columns, data })
  return (
    <div className={className ?? 'w-full overflow-x-auto'}>
      <table className="w-full text-sm">
        <thead className="border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="h-10 px-2 text-left align-middle font-medium text-gray-500">
                  {header.isPlaceholder ? null : (
                    <div>
                      {header.column.columnDef.header as any}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b transition-colors hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 align-middle">
                  {cell.column.columnDef.cell
                    ? (cell.column.columnDef.cell as any)({ ...cell.getContext() })
                    : (cell.getValue() as any)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
`;

writeFileSync(join(outDir, 'index.tsx'), indexTsx);
console.log(
  green('✔'),
  cyan('Generated:'),
  'src/components/ui/data-table/index.tsx',
);
