import type { Header } from 'shadcn-react-table-core';

export function HeaderCell<TData>({ header }: { header: Header<TData> }) {
  return (
    <th className="h-10 px-2 text-left align-middle font-medium text-gray-500">
      {header.isPlaceholder ? null : (
        <div>{header.column.columnDef.header as any}</div>
      )}
    </th>
  );
}
