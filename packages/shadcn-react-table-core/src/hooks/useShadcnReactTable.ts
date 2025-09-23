import { useReactTable } from '@tanstack/react-table';
import { SRT_RowData, SRT_TableInstance, SRT_TableOptions } from '../types';

const useShadcnReactTable = <TData extends SRT_RowData>(
  tableOptions: SRT_TableOptions<TData>,
): SRT_TableInstance<TData> => useReactTable(tableOptions);
