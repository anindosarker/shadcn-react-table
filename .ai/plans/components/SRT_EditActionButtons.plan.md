# Plan: SRT_EditActionButtons ← MRT_EditActionButtons

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/buttons/SRT_EditActionButtons.tsx`.
Garbage-zone; author fresh.

## Resolved decisions

- Interface `extends DivProps { row, table, variant?: 'icon' | 'text' }`,
  default `variant = 'icon'` (MRT extends BoxProps).
- handleCancel + handleSubmitRow VERBATIM incl. editInputRefs auto-fill scan
  (`row.id === inputRef?.name?.split('_')?.[0]`, Object.hasOwn guard,
  `// @ts-expect-error` kept), exitCreatingMode/exitEditingMode closures,
  `row._valuesCache = {} as any` reset + MRT comments.
- Root Box → div: onClick stopPropagation verbatim; cva base `flex gap-3`
  (0.75rem); {...rest} + cn merge.
- icon branch: cancel = Button variant="ghost" size="icon" + CancelIcon,
  aria-label localization.cancel; save gated `(isCreating &&
  onCreatingRowSave) || (isEditing && onEditingRowSave)` verbatim, disabled
  isSaving, MUI `color="info"` → `text-primary` on the save button
  (`// Note:` — no info palette token in shadcn).
- CircularProgress size 18 → `LoaderCircleIcon` lucide `size-[18px]
  animate-spin` (SRT_TableLoadingOverlay precedent).
- text branch: cancel = Button variant="ghost" `min-w-[100px]`; save = Button
  (default/primary, maps MUI contained) `min-w-[100px]` disabled isSaving,
  spinner + label children order verbatim.
- Tooltips → SRT_Tooltip (localization.cancel / localization.save).

## Gates

prettier; tsc clean; eslint on the file --max-warnings=0. Only this file. No
core, no git. parseFromValuesOrFunc only.
