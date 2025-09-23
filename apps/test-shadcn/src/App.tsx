import { type ColumnDef } from '@tanstack/react-table';
import ShadcnReactTable from './components/ui/shadcn-react-table/ShadcnReactTable';

type Person = { name: string; email: string; age: number };

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'age', header: 'Age' },
];

const data: Person[] = [
  { name: 'Ada Lovelace', email: 'ada@example.com', age: 36 },
  { name: 'Grace Hopper', email: 'grace@example.com', age: 45 },
  { name: 'Edsger Dijkstra', email: 'edsger@example.com', age: 51 },
];

function App() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">shadcn-react-table Demo</h1>
      <ShadcnReactTable columns={columns} data={data} />
    </div>
  );
}

export default App;
