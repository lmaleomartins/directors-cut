# Copilot Instructions for directors-cut

## Project Overview

- **Type:** Vite + React + TypeScript SPA
- **UI:** Tailwind CSS, shadcn-ui
- **Purpose:** Video/movie management platform with user authentication and admin features
- **Cloud Integration:** Supabase (see `src/integrations/supabase/`)

## Key Architecture & Patterns

- **Pages:** All main routes in `src/pages/` (e.g., `Auth.tsx`, `Admin.tsx`, `MovieDetail.tsx`)
- **Components:** Reusable UI in `src/components/` and `src/components/ui/` (shadcn-ui patterns)
- **Hooks:** Custom hooks in `src/hooks/` (e.g., `useAuth.tsx`, `useUserRole.tsx`)
- **Supabase:** API client and types in `src/integrations/supabase/`
- **Assets:** Images in `src/assets/`
- **Lib:** Utility functions in `src/lib/utils.ts`

## Developer Workflows

- **Install:** `npm i`
- **Dev Server:** `npm run dev` (hot reload)
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Lint:** `npm run lint` (uses ESLint config)
- **Tailwind:** Config in `tailwind.config.ts`, styles in `index.css`/`App.css`

## Conventions & Patterns

- **Component Structure:** Prefer function components, colocate styles (CSS) with components
- **UI Library:** Use shadcn-ui primitives from `src/components/ui/` for consistent design
- **Auth:** Use hooks from `src/hooks/useAuth.tsx` and Supabase client for authentication
- **Role Management:** Use `useUserRole.tsx` for role-based UI logic
- **Error Handling:** Use toast notifications (`use-toast.ts` and `components/ui/sonner.tsx`)
- **Routing:** Page components in `src/pages/` are mapped to routes
- **No backend in repo:** All backend logic is via Supabase (see migrations in `supabase/migrations/`)

## External Integrations

- **Supabase:** Configure in `src/integrations/supabase/client.ts` and `supabase/config.toml`
- **Lovable Platform:** Project can be edited/deployed via [Lovable](https://lovable.dev/projects/dc879b82-7487-4363-9146-114f7f05187f)

## Examples

- **Add a new page:** Create a file in `src/pages/`, export a React component
- **Add a UI element:** Use or extend a component from `src/components/ui/`
- **Add a hook:** Place in `src/hooks/`, follow existing patterns
- **Supabase query:** Use client from `src/integrations/supabase/client.ts`

## References

- See `README.md` for setup and deployment
- See `src/pages/` and `src/components/` for main app structure
- See `src/integrations/supabase/` for cloud integration

---

_If any section is unclear or missing, please provide feedback for improvement._
