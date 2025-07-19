 

## Project Overview

This document outlines the comprehensive plan for migrating the `material-react-table` library from Material UI (MUI) to Shadcn UI. The goal is to create a modern, accessible, and customizable table component library that leverages Shadcn UI's component system while maintaining the powerful functionality of TanStack Table V8.

## Current State Analysis

### Current Dependencies
- **Material UI V6**: `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`
- **Emotion**: `@emotion/react`, `@emotion/styled` (for MUI styling)
- **Core Dependencies**: `@tanstack/react-table`, `@tanstack/react-virtual`, `@tanstack/match-sorter-utils`
- **Build Tools**: Rollup, TypeScript, Storybook

### Current Architecture
- **Package Structure**: Monorepo with `packages/material-react-table` and `apps/material-react-table-docs`
- **Component Organization**: Modular structure with separate directories for body, buttons, footer, head, inputs, menus, modals, table, and toolbar components
- **Type System**: Comprehensive TypeScript types extending MUI component props
- **Documentation**: Next.js-based documentation site with MDX support

## Migration Goals

### Primary Objectives
1. **Replace Material UI with Shadcn UI**: Migrate all MUI components to their Shadcn UI equivalents
2. **Maintain API Compatibility**: Preserve the existing API surface where possible
3. **Update Documentation**: Reflect all changes in documentation and examples
4. **Modernize Dependencies**: Remove MUI-specific dependencies and add Shadcn UI requirements

### Secondary Objectives
1. **Improve Accessibility**: Leverage Shadcn UI's built-in accessibility features
2. **Enhanced Customization**: Provide better theming and styling options
3. **Performance Optimization**: Reduce bundle size by removing MUI dependencies
4. **Developer Experience**: Maintain excellent TypeScript support and developer tooling

## Detailed Migration Plan

### Phase 1: Dependency Analysis and Setup

#### 1.1 Remove Material UI Dependencies
**Files to Update:**
- `packages/material-react-table/package.json`
- `apps/material-react-table-docs/package.json`
- `apps/test-cra/package.json`
- `apps/test-vite/package.json`
- `apps/test-remix/package.json`

**Dependencies to Remove:**
```json
{
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.0",
  "@mui/icons-material": "^6.2.1",
  "@mui/material": "^6.2.1",
  "@mui/x-charts": "^7.23.2",
  "@mui/x-date-pickers": "^7.23.3"
}
```

#### 1.2 Add Shadcn UI Dependencies
**New Dependencies to Add:**
```json
{
  "@radix-ui/react-alert-dialog": "^1.0.5",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-popover": "^1.0.7",
  "@radix-ui/react-progress": "^1.0.3",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-switch": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-tooltip": "^1.0.7",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "lucide-react": "^0.294.0",
  "tailwind-merge": "^2.0.0",
  "tailwindcss-animate": "^1.0.7"
}
```

#### 1.3 Update Build Configuration
**Files to Update:**
- `packages/material-react-table/rollup.config.mjs`
- `packages/material-react-table/.eslintrc`
- `apps/material-react-table-docs/next.config.js`

**Changes Required:**
- Remove MUI-specific ESLint rules
- Update build process to handle Tailwind CSS
- Configure PostCSS for Tailwind processing

### Phase 2: Component Migration

#### 2.1 Core Component Replacements

**Material UI → Shadcn UI Component Mapping:**

| MUI Component | Shadcn UI Component | Location |
|---------------|---------------------|----------|
| `Alert` | `Alert` | `components/toolbar/MRT_ToolbarAlertBanner.tsx` |
| `Autocomplete` | `Combobox` | `components/inputs/MRT_FilterTextField.tsx` |
| `Box` | `div` (with Tailwind classes) | Throughout codebase |
| `Button` | `Button` | `components/buttons/*.tsx` |
| `Checkbox` | `Checkbox` | `components/inputs/MRT_FilterCheckbox.tsx` |
| `Chip` | `Badge` | `components/inputs/MRT_FilterTextField.tsx` |
| `CircularProgress` | `Spinner` | `components/table/MRT_TableLoadingOverlay.tsx` |
| `Dialog` | `Dialog` | `components/modals/MRT_EditRowModal.tsx` |
| `IconButton` | `Button` (variant="ghost") | Throughout codebase |
| `LinearProgress` | `Progress` | `components/toolbar/MRT_LinearProgressBar.tsx` |
| `MenuItem` | `DropdownMenuItem` | `components/menus/*.tsx` |
| `Paper` | `Card` | `components/table/MRT_TablePaper.tsx` |
| `Select` | `Select` | `components/inputs/MRT_SelectCheckbox.tsx` |
| `Slider` | `Slider` | `components/inputs/MRT_FilterRangeSlider.tsx` |
| `Table` | `Table` | `components/table/MRT_Table.tsx` |
| `TableCell` | `TableCell` | `components/body/MRT_TableBodyCell.tsx` |
| `TableContainer` | `div` | `components/table/MRT_TableContainer.tsx` |
| `TableHead` | `TableHead` | `components/head/MRT_TableHead.tsx` |
| `TableRow` | `TableRow` | `components/body/MRT_TableBodyRow.tsx` |
| `TextField` | `Input` | `components/inputs/MRT_FilterTextField.tsx` |
| `Tooltip` | `Tooltip` | Throughout codebase |
| `Typography` | `span`, `p`, `h1-h6` | Throughout codebase |

#### 2.2 Icon System Migration
**File to Update:** `packages/material-react-table/src/icons.ts`

**Changes Required:**
- Replace all `@mui/icons-material` imports with `lucide-react` equivalents
- Update icon mapping throughout the codebase
- Create custom icon components for complex icons

**Icon Mapping:**
```typescript
// Material UI → Lucide React
ArrowDownwardIcon → ChevronDown
ArrowRightIcon → ChevronRight
CancelIcon → X
ChevronLeftIcon → ChevronLeft
ChevronRightIcon → ChevronRight
ClearAllIcon → Trash2
CloseIcon → X
ContentCopy → Copy
DensityLargeIcon → Maximize2
DensityMediumIcon → Square
DensitySmallIcon → Minimize2
DragHandleIcon → GripVertical
DynamicFeedIcon → Grid
EditIcon → Edit
ExpandMoreIcon → ChevronDown
FilterAltIcon → Filter
FilterListIcon → Filter
FilterListOffIcon → FilterX
FirstPageIcon → ChevronsLeft
FullscreenIcon → Maximize
FullscreenExitIcon → Minimize
KeyboardDoubleArrowDownIcon → ChevronsDown
LastPageIcon → ChevronsRight
MoreHorizIcon → MoreHorizontal
MoreVertIcon → MoreVertical
PushPinIcon → Pin
RestartAltIcon → RotateCcw
SaveIcon → Save
SearchIcon → Search
SearchOffIcon → SearchX
SortIcon → ArrowUpDown
SyncAltIcon → RefreshCw
ViewColumnIcon → Columns
```

#### 2.3 Date Picker Migration
**Current:** `@mui/x-date-pickers`
**Replacement:** `react-datepicker` or `@radix-ui/react-popover` with custom date input

**Files to Update:**
- `components/inputs/MRT_FilterTextField.tsx`
- `components/inputs/MRT_EditCellTextField.tsx`

### Phase 3: Type System Updates

#### 3.1 Update Type Definitions
**File to Update:** `packages/material-react-table/src/types.ts`

**Changes Required:**
- Remove all MUI component prop type imports
- Add Shadcn UI component prop types
- Update theme type definitions
- Maintain backward compatibility where possible

#### 3.2 Component Prop Updates
**Files to Update:** All component files in `packages/material-react-table/src/components/`

**Changes Required:**
- Replace `mui...Props` with `shadcn...Props`
- Update prop forwarding patterns
- Maintain existing API surface where possible

### Phase 4: Styling System Migration

#### 4.1 Replace Emotion with Tailwind CSS
**Files to Update:**
- All component files
- `packages/material-react-table/src/components/*.tsx`

**Changes Required:**
- Remove `sx` prop usage
- Replace with Tailwind CSS classes
- Create utility functions for dynamic styling
- Implement CSS-in-JS alternative for complex dynamic styles

#### 4.2 Theme System Migration
**Files to Update:**
- `apps/material-react-table-docs/styles/MuiTheme.ts`
- `apps/material-react-table-docs/styles/ThemeContext.tsx`

**Changes Required:**
- Replace MUI theme with Tailwind CSS configuration
- Update theme context to work with Tailwind
- Create CSS custom properties for dynamic theming

#### 4.3 CSS Configuration
**New Files to Create:**
- `packages/material-react-table/tailwind.config.js`
- `packages/material-react-table/postcss.config.js`
- `packages/material-react-table/src/styles/globals.css`

### Phase 5: Documentation Updates

#### 5.1 Update Installation Guide
**File to Update:** `apps/material-react-table-docs/pages/docs/getting-started/install.mdx`

**Changes Required:**
- Replace MUI installation instructions with Shadcn UI setup
- Update peer dependencies list
- Add Tailwind CSS configuration instructions
- Update compatibility table

#### 5.2 Update Usage Examples
**Files to Update:**
- All example files in `apps/material-react-table-docs/examples/`
- `apps/material-react-table-docs/example-groups/*.tsx`

**Changes Required:**
- Replace MUI imports with Shadcn UI components
- Update styling approaches
- Maintain functionality while using new components

#### 5.3 Update API Documentation
**Files to Update:**
- All prop table components in `apps/material-react-table-docs/components/prop-tables/`
- Component documentation pages

**Changes Required:**
- Update prop descriptions to reflect Shadcn UI components
- Remove MUI-specific prop documentation
- Add Shadcn UI-specific customization options

### Phase 6: Testing and Validation

#### 6.1 Update Test Applications
**Files to Update:**
- `apps/test-cra/src/`
- `apps/test-vite/src/`
- `apps/test-remix/app/`

**Changes Required:**
- Replace MUI dependencies with Shadcn UI
- Update component usage
- Verify functionality across different build systems

#### 6.2 Storybook Updates
**Files to Update:**
- `packages/material-react-table/stories/`
- `packages/material-react-table/.storybook/`

**Changes Required:**
- Update Storybook configuration for Tailwind CSS
- Replace MUI components in stories
- Update theme configuration

### Phase 7: Package Configuration

#### 7.1 Update Package Metadata
**File to Update:** `packages/material-react-table/package.json`

**Changes Required:**
- Update package name (consider: `shadcn-react-table`)
- Update description and keywords
- Update repository URLs
- Update peer dependencies

#### 7.2 Update Build Process
**Files to Update:**
- `packages/material-react-table/rollup.config.mjs`
- `packages/material-react-table/build-locales.mjs`

**Changes Required:**
- Configure CSS processing for Tailwind
- Update bundle size limits
- Ensure proper tree-shaking

## Implementation Timeline

### Week 1-2: Foundation
- Set up Shadcn UI dependencies
- Create basic component structure
- Configure build system

### Week 3-4: Core Components
- Migrate table components
- Update type system
- Implement basic styling

### Week 5-6: Advanced Components
- Migrate complex components (modals, menus)
- Update icon system
- Implement date picker replacement

### Week 7-8: Documentation
- Update all documentation
- Create migration guide
- Update examples

### Week 9-10: Testing & Polish
- Test across all environments
- Performance optimization
- Final documentation review

## Risk Assessment

### High Risk
1. **API Breaking Changes**: Some MUI-specific props may not have direct Shadcn UI equivalents
2. **Styling Complexity**: Converting from Emotion to Tailwind CSS may be complex for dynamic styles
3. **Bundle Size**: Need to ensure the new dependencies don't significantly increase bundle size

### Medium Risk
1. **Date Picker Migration**: Finding a suitable replacement for MUI's date picker
2. **Theme System**: Ensuring the new theme system is as flexible as MUI's
3. **Accessibility**: Ensuring all accessibility features are maintained

### Low Risk
1. **Build System**: Rollup configuration updates should be straightforward
2. **TypeScript Support**: Shadcn UI has good TypeScript support
3. **Documentation**: Most documentation updates are mechanical

## Success Criteria

### Functional Requirements
- [ ] All existing table functionality works with Shadcn UI components
- [ ] No breaking changes to the core API (where possible)
- [ ] All examples and documentation are updated
- [ ] Bundle size is maintained or reduced
- [ ] Performance is maintained or improved

### Quality Requirements
- [ ] All components pass accessibility tests
- [ ] TypeScript types are comprehensive and accurate
- [ ] Documentation is clear and complete
- [ ] Migration guide is provided for existing users
- [ ] All test applications work correctly

### Technical Requirements
- [ ] Zero MUI dependencies in the final package
- [ ] Proper tree-shaking support
- [ ] Compatible with React 18+
- [ ] Works with all major bundlers (Webpack, Vite, Rollup)
- [ ] Supports both CommonJS and ESM

## Post-Migration Tasks

### Immediate (Week 11)
1. Publish new package version
2. Update GitHub repository
3. Announce migration to community
4. Monitor for issues and feedback

### Short-term (Month 3)
1. Address community feedback
2. Optimize performance based on usage
3. Add new features leveraging Shadcn UI capabilities
4. Create additional examples and use cases

### Long-term (Month 6+)
1. Consider additional Shadcn UI integrations
2. Explore new table features
3. Community-driven improvements
4. Performance monitoring and optimization

## Conclusion

This migration represents a significant modernization of the material-react-table library, moving from Material UI to Shadcn UI while maintaining the powerful functionality that users depend on. The phased approach ensures minimal disruption while providing a path to a more modern, accessible, and customizable table component library.

The success of this migration will depend on careful planning, thorough testing, and clear communication with the existing user base. By following this comprehensive plan, we can create a library that leverages the best of both TanStack Table and Shadcn UI while providing an excellent developer experience.