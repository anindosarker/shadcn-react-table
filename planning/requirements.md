# Material React Table to Shadcn UI Migration - Requirements

## Project Overview

This document outlines the goals and requirements for migrating the `material-react-table` library from Material UI (MUI) to Shadcn UI. The goal is to create a modern, accessible, and customizable table component library that leverages Shadcn UI's component system while maintaining the powerful functionality of TanStack Table V8.

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

## Component Migration Requirements

### Core Component Replacements

**Material UI → Shadcn UI Component Mapping:**

| MUI Component | Shadcn UI Component | Priority |
|---------------|---------------------|----------|
| `Alert` | `Alert` | High |
| `Autocomplete` | `Combobox` | High |
| `Box` | `div` (with Tailwind classes) | High |
| `Button` | `Button` | High |
| `Checkbox` | `Checkbox` | High |
| `Chip` | `Badge` | Medium |
| `CircularProgress` | `Spinner` | Medium |
| `Dialog` | `Dialog` | High |
| `IconButton` | `Button` (variant="ghost") | High |
| `LinearProgress` | `Progress` | Medium |
| `MenuItem` | `DropdownMenuItem` | High |
| `Paper` | `Card` | High |
| `Select` | `Select` | High |
| `Slider` | `Slider` | Medium |
| `Table` | `Table` | High |
| `TableCell` | `TableCell` | High |
| `TableContainer` | `div` | High |
| `TableHead` | `TableHead` | High |
| `TableRow` | `TableRow` | High |
| `TextField` | `Input` | High |
| `Tooltip` | `Tooltip` | Medium |
| `Typography` | `span`, `p`, `h1-h6` | Medium |

### Icon System Migration
- Replace all `@mui/icons-material` imports with `lucide-react` equivalents
- Update icon mapping throughout the codebase
- Create custom icon components for complex icons

### Date Picker Migration
- Replace `@mui/x-date-pickers` with `react-datepicker` or custom solution
- Maintain date filtering and editing functionality

## Technical Requirements

### Dependencies to Remove
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

### Dependencies to Add
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

## Styling System Requirements

### Replace Emotion with Tailwind CSS
- Remove `sx` prop usage throughout the codebase
- Replace with Tailwind CSS classes
- Create utility functions for dynamic styling
- Implement CSS-in-JS alternative for complex dynamic styles

### Theme System Migration
- Replace MUI theme with Tailwind CSS configuration
- Update theme context to work with Tailwind
- Create CSS custom properties for dynamic theming

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

## Scope

### In Scope
- Core table component migration
- All UI component replacements
- Icon system migration
- Styling system migration
- Documentation updates
- Test application updates

### Out of Scope
- Adding new features beyond what's currently available
- Changing the core table functionality
- Modifying the TanStack Table integration
- Adding new build tools or frameworks

## Deliverables

1. **Migrated Library**: Complete migration from MUI to Shadcn UI
2. **Updated Documentation**: All docs and examples updated
3. **Migration Guide**: Clear instructions for existing users
4. **Test Applications**: Working examples across different frameworks
5. **Performance Report**: Bundle size and performance metrics

## Conclusion

This migration represents a significant modernization of the material-react-table library, moving from Material UI to Shadcn UI while maintaining the powerful functionality that users depend on. The success of this migration will depend on careful planning, thorough testing, and clear communication with the existing user base.