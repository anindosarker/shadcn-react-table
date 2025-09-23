import type { ColumnDef, SRT_RowData, SRT_TableInstance } from 'shadcn-react-table-core';
import { useDataTable } from 'shadcn-react-table-core';
import { Header } from './head/Header';

//TODO fix it
export type ShadcnReactTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  className?: string;
};

type TableInstanceProp<TData extends MRT_RowData> = {
  table: SRT_TableInstance<TData>;
};

export type MaterialReactTableProps<TData extends SRT_RowData> = Xor<
  TableInstanceProp<TData>,
  MRT_TableOptions<TData>
>;


export default function ShadcnReactTableOld<TData>({
  columns,
  data,
  className,
}: ShadcnReactTableProps<TData>) {
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

export const ShadcnReactTable = <TData extends SRT_RowData>(
  props: MaterialReactTableProps<TData>,
) => {
  return (
    <div className={className ?? 'w-full overflow-x-auto'}>
      <table className="w-full text-sm">
        <Header table={table} />
      </table>
    </div>
  );
};
