/** @jsxImportSource react */
import { useDataTable, type ColumnDef } from 'shadcn-react-table-core';
import { Header } from '../shadcn-react-table/head/Header';

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
  const table = useDataTable({ columns, data });
  return (
    <div className={className ?? 'w-full overflow-x-auto'}>
      <table className="w-full text-sm">
        <Header table={table} />
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
