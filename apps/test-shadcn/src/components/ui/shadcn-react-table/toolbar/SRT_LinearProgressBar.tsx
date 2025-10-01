import {
  parseFromValuesOrFunc,
  type SRT_RowData,
  type SRT_TableInstance,
} from 'shadcn-react-table-core';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

export interface SRT_LinearProgressBarProps<TData extends SRT_RowData> {
  isTopToolbar: boolean;
  table: SRT_TableInstance<TData>;
  className?: string;
}

export const SRT_LinearProgressBar = <TData extends SRT_RowData>({
  isTopToolbar,
  table,
  className,
}: SRT_LinearProgressBarProps<TData>) => {
  const {
    getState,
    options: { srtLinearProgressProps },
  } = table;
  const { isSaving, showProgressBars } = getState();

  const { wrapper, progressRoot } =
    parseFromValuesOrFunc(srtLinearProgressProps, { isTopToolbar, table }) ??
    {};

  const show = showProgressBars !== false && (showProgressBars || isSaving);

  const [value, setValue] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!show) return;
    setValue(undefined);
    const id = setInterval(() => {
      setValue((prev) => {
        const next = typeof prev === 'number' ? prev + 10 : 10;
        return next > 100 ? 0 : next;
      });
    }, 150);
    return () => clearInterval(id);
  }, [show]);

  return (
    <Collapsible open={show}>
      <CollapsibleContent
        {...wrapper}
        className={cn(
          'absolute left-0 right-0 w-full',
          isTopToolbar ? 'bottom-0' : 'top-0',
          wrapper?.className,
        )}
      >
        <Progress
          value={value}
          {...progressRoot}
          className={cn('h-0.5', progressRoot?.className)}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

// TODO: srtLinearProgressProps - add props support similar to MRT's muiLinearProgressProps
// Example shape (commented for future parity):
// const linearProgressProps = parseFromValuesOrFunc(options?.srtLinearProgressProps, { isTopToolbar, table });
// <Progress value={value} className={cn('h-0.5', linearProgressProps?.className)} />

export default SRT_LinearProgressBar;
