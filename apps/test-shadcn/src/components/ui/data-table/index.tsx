import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  className?: string;
};

export function DataTable<TData>({
  columns,
  data,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={className ?? 'w-full overflow-x-auto'}>
      <table className="w-full text-sm">
        <thead className="border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-10 px-2 text-left align-middle font-medium text-gray-500"
                >
                  {header.isPlaceholder ? null : (
                    <div>{header.column.columnDef.header as any}</div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b transition-colors hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 align-middle">
                  {cell.column.columnDef.cell
                    ? (cell.column.columnDef.cell as any)({
                        ...cell.getContext(),
                      })
                    : (cell.getValue() as any)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
