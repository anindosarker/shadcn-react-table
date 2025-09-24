import {
  parseFromValuesOrFunc,
  type LayoutDivProps,
  type SRT_RowData,
  type SRT_TableInstance,
} from 'shadcn-react-table-core';
import SRT_TableContainer from './SRT_TableContainer';

export interface SRT_TableLayoutProps<TData extends SRT_RowData>
  extends LayoutDivProps {
  table: SRT_TableInstance<TData>;
}

const baseClasses =
  'relative overflow-hidden rounded-md border bg-background shadow transition-all duration-100 p-2';
const fullScreenClasses =
  'fixed inset-0 z-50 h-dvh w-screen rounded-none border-0 m-0';

export const SRT_TableLayout = <TData extends SRT_RowData>({
  table,
  ...rest
}: SRT_TableLayoutProps<TData>) => {
  const {
    getState,
    options,
    refs: { tableLayoutRef },
  } = table;

  const { isFullScreen } = getState();

  const layoutDivProps = {
    ...parseFromValuesOrFunc(options?.srtTableLayoutProps, { table }),
    ...rest,
  };

  return (
    <div
      ref={(ref: HTMLDivElement) => {
        tableLayoutRef.current = ref;
      }}
      onKeyDown={(e) => e.key === 'Escape' && table.setIsFullScreen(false)}
      className={`${baseClasses} ${isFullScreen ? fullScreenClasses : ''} ${layoutDivProps.className ?? ''}`}
      {...layoutDivProps}
    >
      <SRT_TableContainer table={table} />
    </div>
  );
};

export default SRT_TableLayout;
