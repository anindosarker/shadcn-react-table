# Plan: SRT_EditRowModal ← MRT_EditRowModal

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/modals/SRT_EditRowModal.tsx`.
Garbage-zone; author fresh. Shell = shadcn Dialog family (June idiom, kept).
PRECONDITION: core `srtCreateRowModalProps`/`srtEditRowDialogProps` converted
to value-or-func DivProps with `{row, table}` context (types-coder task; STOP
if still `SRT_HTMLProps`).

## Resolved decisions

- Interface `extends Partial<React.ComponentPropsWithRef<typeof DialogContent>>
  { open: boolean; table }` (MRT extends Partial<DialogProps>; DialogContent
  is the SRT prop surface — radix root only takes open/onOpenChange).
- row = `(creatingRow ?? editingRow) as SRT_Row<TData>` verbatim.
- dialogProps merge verbatim: srtEditRowDialogProps({row,table}) →
  `creatingRow && srtCreateRowModalProps({row,table})` → {...rest}. Slots are
  DivProps; spread onto DialogContent.
- internalEditComponents verbatim (getAllCells filter columnDefType==='data',
  SRT_EditCellTextField `cell={cell as any}` `table={table as any}` + key —
  keep the `as any`s with authorized eslint-disables).
- Close: MUI `onClose(event, reason)` → Dialog `onOpenChange={(o) => { if (!o)
  handleClose(); }}` where handleClose = MRT's onClose body verbatim
  (creatingRow ? onCreatingRowCancel+setCreatingRow(null) :
  onEditingRowCancel+setEditingRow(null); `row._valuesCache = {} as any`
  reset + comment). MRT's `dialogProps.onClose?.(event, reason)` compose has
  no radix analog on DivProps — dropped with `// Note:` (users hook
  onOpenChange via srtEditRowDialogProps? No — DivProps has no onOpenChange;
  Note this as the deviation: close interception not exposed).
- `fullWidth maxWidth="xs"` → `sm:max-w-[444px]` on DialogContent (MUI xs
  breakpoint 444px) + Note.
- Content precedence verbatim: `((creatingRow && renderCreateRowDialogContent?.
  ({internalEditComponents, row, table})) || renderEditRowDialogContent?.(...))
  ?? (default body)`.
- Default body: DialogHeader + DialogTitle `text-center` localization.edit;
  form onSubmit preventDefault verbatim; Stack → div `flex w-full flex-col
  gap-8 pt-4` (32px/16px); DialogActions → DialogFooter `p-5` (1.25rem) +
  SRT_EditActionButtons row/table variant="text".
- cva at top per convention; user className merges last.

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
