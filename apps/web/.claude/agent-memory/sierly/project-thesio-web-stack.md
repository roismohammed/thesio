---
name: project-thesio-web-stack
description: Thesio apps/web frontend stack and conventions for UI work
metadata:
  type: project
---

`apps/web` is a React 19 SPA (Vite 8, TS strict, `verbatimModuleSyntax`).

**Why:** Stack choices are fixed by the monorepo `CLAUDE.md` and existing scaffold; deviating breaks the base-nova component contract.

**How to apply:**
- React Compiler is ON — do not use `useMemo`/`useCallback`/`React.memo`.
- shadcn "base-nova" style on `@base-ui/react` (NOT Radix). UI primitives in `src/components/ui/*`.
- Icons: `lucide-react` (in ui/*) and `@hugeicons/react` + `@hugeicons/core-free-icons` (in layout/*).
- Tailwind v4, tokens are CSS variables in `src/index.css`. Dark mode via `.dark` class.
- Path alias `@/*` → `src/*`. File/folder kebab-case. Type-only imports use `import type`.
- Theme: `next-themes` `useTheme()` (localStorage `theme`). Accent: `useAccentColor()` (cookie `accent-color`). Sidebar variant: `useSidebarVariant()` (cookie `sidebar-variant`).
- Layout shell: `AppLayout` from `@/components/layout/app-layout` (pageTitle + breadcrumb). Sidebar variant is wired inside `app-sidebar.tsx` — do not re-wire.
- base-ui `render` prop swaps the rendered element: `render={<Link to={x} />}`. See [[reference-base-ui-toggle-group]].
- Routing: `react-router-dom@^7`. Swap `<a href>` navigations to `<Link to>` in layout components.

Related: [[reference-base-ui-toggle-group]]