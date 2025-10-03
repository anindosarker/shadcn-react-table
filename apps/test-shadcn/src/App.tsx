import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import ShadcnReactTable from './components/ui/shadcn-react-table/ShadcnReactTable';
import {
  type SRT_TableOptions,
  useShadcnReactTable,
} from 'shadcn-react-table-core';

type Person = { name: string; email: string; age: number };

const data: Person[] = [
  { name: 'Ada Lovelace', email: 'ada@example.com', age: 36 },
  { name: 'Grace Hopper', email: 'grace@example.com', age: 45 },
  { name: 'Edsger Dijkstra', email: 'edsger@example.com', age: 51 },
];

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'age', header: 'Age' },
];
const tableOptions: SRT_TableOptions<Person> = {
  columns,
  data,
};

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const table = useShadcnReactTable<Person>({
    columns,
    data,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enableToolbarInternalActions: true,
    enableFullScreenToggle: true,
    enableDensityToggle: true,
    enableGlobalFilter: true,
    positionGlobalFilter: 'right',
    state: {
      // isLoading: false,
      // showProgressBars: false,
      isLoading: false,
      showProgressBars: true,
    },
    // enableTableHead: false,
  });
  return (
    <div className="min-h-screen p-6">
      {/* Theme Controls */}
      <div className="mb-6 flex gap-4">
        <Button onClick={() => setIsDark(!isDark)} variant="outline">
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </Button>
      </div>

      <h1 className="mb-4 text-2xl font-bold">shadcn-react-table Demo</h1>

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
          🧪 Testing Toolbar Components
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>
            • <strong>Fullscreen Toggle</strong> - Click the maximize icon to
            enter fullscreen
          </li>
          <li>
            • <strong>Density Toggle</strong> - Click to cycle: Comfortable →
            Compact → Spacious
          </li>
          <li>
            • <strong>Global Search Toggle</strong> - Click search icon to
            show/hide search
          </li>
          <li>
            • <strong>Theme Toggle</strong> - Test dark/light mode with toolbar
            components
          </li>
          <li>
            • <strong>Loading States</strong> - Toolbar progress bars and
            overlay
          </li>
        </ul>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="mb-2 text-lg font-semibold">
            Hook Example - Full Featured
          </h2>
          <ShadcnReactTable table={table} />
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">
            Table Options API - Minimal
          </h2>
          <ShadcnReactTable {...tableOptions} />
        </div>
      </div>
    </div>
  );
}

export default App;
