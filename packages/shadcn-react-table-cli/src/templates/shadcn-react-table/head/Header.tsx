import type { Table } from 'shadcn-react-table-core';
import { HeaderCell } from './HeaderCell';

export function Header<TData>({ table }: { table: Table<TData> }) {
  return (
    <thead className="border-b">
      {table.getHeaderGroups().map((group) => (
        <tr key={group.id} className="border-b">
          {group.headers.map((header) => (
            <HeaderCell key={header.id} header={header as any} />
          ))}
        </tr>
      ))}
    </thead>
  );
}
