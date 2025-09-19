import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

export type UseDataTableOptions<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
};

export function useDataTable<TData>({
  columns,
  data,
}: UseDataTableOptions<TData>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });
  return table;
}
