import type { SRT_RowData, SRT_TableInstance } from 'shadcn-react-table-core';
import SRT_TableContainer from './SRT_TableContainer';

export interface SRT_TableLayoutProps<TData extends SRT_RowData> {
  table: SRT_TableInstance<TData>;
}

export const SRT_TableLayout = <TData extends SRT_RowData>({
  table,
}: SRT_TableLayoutProps<TData>) => {
  const isFullScreen = table.getState?.().isFullScreen;

  const baseClasses =
    'relative overflow-hidden rounded-md border bg-background shadow transition-all duration-100';
  const fullScreenClasses =
    'fixed inset-0 z-50 h-dvh w-screen rounded-none border-0 m-0';

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') {
      (
        table as unknown as { setIsFullScreen?: (v: boolean) => void }
      ).setIsFullScreen?.(false);
    }
  };

  return (
    <div
      className={`${baseClasses} ${isFullScreen ? fullScreenClasses : ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <SRT_TableContainer table={table} />
    </div>
  );
};

export default SRT_TableLayout;
