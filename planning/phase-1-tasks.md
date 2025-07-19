**Phase 1: Dependency Analysis and Setup - Material React Table to Shadcn UI Migration**

---

### Requirements:

#### 1.1 Remove Material UI Dependencies
* [ ] Remove `@emotion/react` and `@emotion/styled` from all package.json files
* [ ] Remove `@mui/icons-material` from all package.json files  
* [ ] Remove `@mui/material` from all package.json files
* [ ] Remove `@mui/x-charts` from docs package.json
* [ ] Remove `@mui/x-date-pickers` from all package.json files
* [ ] Update peer dependencies in main package.json to remove MUI dependencies
* [ ] Remove MUI-specific ESLint rules from `.eslintrc` files

#### 1.2 Add Shadcn UI Dependencies
* [ ] Add `@radix-ui/react-alert-dialog` to main package.json
* [ ] Add `@radix-ui/react-checkbox` to main package.json
* [ ] Add `@radix-ui/react-dialog` to main package.json
* [ ] Add `@radix-ui/react-dropdown-menu` to main package.json
* [ ] Add `@radix-ui/react-label` to main package.json
* [ ] Add `@radix-ui/react-popover` to main package.json
* [ ] Add `@radix-ui/react-progress` to main package.json
* [ ] Add `@radix-ui/react-select` to main package.json
* [ ] Add `@radix-ui/react-separator` to main package.json
* [ ] Add `@radix-ui/react-slot` to main package.json
* [ ] Add `@radix-ui/react-switch` to main package.json
* [ ] Add `@radix-ui/react-tabs` to main package.json
* [ ] Add `@radix-ui/react-toast` to main package.json
* [ ] Add `@radix-ui/react-tooltip` to main package.json
* [ ] Add `class-variance-authority` to main package.json
* [ ] Add `clsx` to main package.json
* [ ] Add `lucide-react` to main package.json
* [ ] Add `tailwind-merge` to main package.json
* [ ] Add `tailwindcss-animate` to main package.json
* [ ] Add Tailwind CSS as a peer dependency
* [ ] Update peer dependencies to include Shadcn UI requirements

#### 1.3 Update Build Configuration
* [ ] Create `tailwind.config.js` in main package directory
* [ ] Create `postcss.config.js` in main package directory
* [ ] Create `src/styles/globals.css` with Tailwind directives
* [ ] Update `rollup.config.mjs` to handle CSS processing
* [ ] Configure PostCSS for Tailwind processing in build pipeline
* [ ] Update `next.config.js` in docs app for Tailwind support
* [ ] Remove MUI-specific build configurations
* [ ] Update bundle size limits for new dependencies

#### 1.4 Update Test Applications
* [ ] Update `apps/test-cra/package.json` to remove MUI dependencies
* [ ] Update `apps/test-vite/package.json` to remove MUI dependencies
* [ ] Update `apps/test-remix/package.json` to remove MUI dependencies
* [ ] Add Shadcn UI dependencies to test applications
* [ ] Configure Tailwind CSS in test applications

#### 1.5 Package Metadata Updates
* [ ] Update package name (consider: `shadcn-react-table`)
* [ ] Update package description to reflect Shadcn UI migration
* [ ] Update keywords to include "shadcn-ui" and remove "material-ui"
* [ ] Update repository URLs if needed
* [ ] Update homepage URL if needed

---

**Outcome:**
A clean project setup with all Material UI dependencies removed, Shadcn UI dependencies properly installed, build system configured for Tailwind CSS, and all package metadata updated to reflect the migration. The project should build successfully without any MUI dependencies while maintaining the core TanStack Table functionality. 