import { lazy, Suspense, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  type MRT_Row,
} from 'material-react-table';
import { Alert, CircularProgress, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MinusIcon from '@mui/icons-material/Remove';
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'; //note: this is TanStack React Query V5

//Your API response shape will probably be different. Knowing a total row count is important though.
type UserApiResponse = {
  data: Array<User>;
  meta: {
    totalRowCount: number;
  };
};

type User = {
  firstName: string;
  lastName: string;
  address: string;
  state: string;
  phoneNumber: string;
  lastLogin: Date;
};

type FullUserInfoApiResponse = FullUserInfo;

type FullUserInfo = User & {
  favoriteMusic: string;
  favoriteSong: string;
  quote: string;
};

const DetailPanel = ({ row }: { row: MRT_Row<User> }) => {
  const {
    data: userInfo,
    isLoading,
    isError,
  } = useFetchUserInfo(
    {
      phoneNumber: row.id, //the row id is set to the user's phone number
    },
    {
      enabled: row.getIsExpanded(),
    },
  );
  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Error Loading User Info</Alert>;

  const { favoriteMusic, favoriteSong, quote } = userInfo ?? {};

  return (
    <Stack gap="0.5rem" minHeight="00px">
      <div>
        <b>Favorite Music:</b> {favoriteMusic}
      </div>
      <div>
        <b>Favorite Song:</b> {favoriteSong}
      </div>
      <div>
        <b>Quote:</b> {quote}
      </div>
    </Stack>
  );
};

const Example = () => {
  //manage our own state for stuff we want to pass to the API
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const {
    data: { data = [], meta } = {},
    isError,
    isRefetching,
    isLoading,
  } = useFetchUsers({
    columnFilters,
    globalFilter,
    pagination,
    sorting,
  });

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    //column definitions...
    () => [
      {
        accessorKey: 'firstName',
        header: 'First Name',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
      },
      {
        accessorKey: 'address',
        header: 'Address',
      },
      {
        accessorKey: 'state',
        header: 'State',
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
      },
    ],
    [],
    //end
  );

  const table = useMaterialReactTable({
    columns,
    data,
    getRowId: (row) => row.phoneNumber,
    manualFiltering: true, //turn off built-in client-side filtering
    manualPagination: true, //turn off built-in client-side pagination
    manualSorting: true, //turn off built-in client-side sorting
    muiExpandButtonProps: ({ row }) => ({
      children: row.getIsExpanded() ? <MinusIcon /> : <AddIcon />,
    }),
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderDetailPanel: ({ row }) => <DetailPanel row={row} />,
    rowCount: meta?.totalRowCount ?? 0,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  return <MaterialReactTable table={table} />;
};

//react query setup in App.tsx
const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
      <Suspense fallback={null}>
        <ReactQueryDevtoolsProduction />
      </Suspense>
    </QueryClientProvider>
  );
}

//fetch user hook
const useFetchUsers = ({
  columnFilters,
  globalFilter,
  pagination,
  sorting,
}: {
  columnFilters: MRT_ColumnFiltersState;
  globalFilter: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
}) => {
  return useQuery<UserApiResponse>({
    queryKey: [
      'users', //give a unique key for this query
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
    ],
    queryFn: async () => {
      const fetchURL = new URL('/api/data', location.origin);

      //read our state and pass it to the API as query params
      fetchURL.searchParams.set(
        'start',
        `${pagination.pageIndex * pagination.pageSize}`,
      );
      fetchURL.searchParams.set('size', `${pagination.pageSize}`);
      fetchURL.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
      fetchURL.searchParams.set('globalFilter', globalFilter ?? '');
      fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []));

      //use whatever fetch library you want, fetch, axios, etc
      const response = await fetch(fetchURL.href);
      const json = (await response.json()) as UserApiResponse;
      return json;
    },
    placeholderData: keepPreviousData, //don't go to 0 rows when refetching or paginating to next page
  });
};

//fetch more user info hook
const useFetchUserInfo = (
  params: { phoneNumber: string },
  options: { enabled: boolean },
) => {
  return useQuery<FullUserInfoApiResponse>({
    enabled: options.enabled, //only fetch when the detail panel is opened
    staleTime: 60 * 1000, //don't refetch for 60 seconds
    queryKey: ['user', params.phoneNumber], //give a unique key for this query for each user fetch
    queryFn: async () => {
      const fetchURL = new URL(
        `/api/moredata/${params.phoneNumber
          .replaceAll('-', '')
          .replaceAll('.', '')
          .replaceAll('(', '')
          .replaceAll(')', '')}`,
        location.origin,
      );

      //use whatever fetch library you want, fetch, axios, etc
      const response = await fetch(fetchURL.href);
      const json = (await response.json()) as FullUserInfoApiResponse;
      return json;
    },
  });
};
