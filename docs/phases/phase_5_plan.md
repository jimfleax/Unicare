# Phase 5: Frontend Refactoring

## Context
- `App.tsx` currently contains monolithic frontend logic and static mock arrays (`initialRecords`, `initialAssets`).
- Need to integrate with the backend API from Phases 3 and 4 using `swr` for data fetching and real-time polling (15s interval).
- Need to implement JWT-based auth via Context and RBAC using a ProtectedRoute wrapper.

## Dependency Map
- `frontend/src/App.tsx` → imports → `frontend/src/components/ProtectedRoute.tsx`, `frontend/src/contexts/AuthContext.tsx`, `frontend/src/services/api.ts`

## Proposed Changes

### AuthContext
#### [NEW] `frontend/src/contexts/AuthContext.tsx`
- What: Create `AuthProvider` and `useAuth` hook managing `user` state and `token` (localStorage + state).
- Why: Centralize authentication state and provide simple access to `user.role` across the app.
- Impact: Wraps `<App />` or `<BrowserRouter>`.

### ProtectedRoute
#### [NEW] `frontend/src/components/ProtectedRoute.tsx`
- What: `<ProtectedRoute allowedRoles={['Student', 'Admin']}>` which checks `useAuth().user.role`. Redirects if unauthorized.
- Why: Enforces RBAC on the frontend to match the backend.
- Impact: Used in `App.tsx` router.

### API Services & SWR
#### [MODIFY] `frontend/src/services/api.ts`
- What: Export a custom `fetcher` for SWR that automatically attaches the JWT Bearer token to headers.
- Why: Standardizes API requests.
- Impact: Used by all components fetching data.

### App Component
#### [MODIFY] `frontend/src/App.tsx`
- What: Delete mock data. Refactor components to use `useSWR('/api/incidents', fetcher, { refreshInterval: 15000 })`. Wrap secure routes with `<ProtectedRoute>`. Wrap the app in `<AuthProvider>`.
- Why: Connect the UI to the live backend with eventual consistency.
- Impact: Major refactor of the monolithic file.

## DRY Context
- Use existing styling conventions in `App.tsx`.
- Import backend URL from an environment variable (e.g. `import.meta.env.VITE_API_URL`).

## Risks & Edge Cases
- Token expiration handling (needs to clear state and redirect to login).
- SWR caching might show stale data for a split second before revalidating; consider optimistic UI updates where applicable.

## Scope Validation Notes
- PRD Contradiction / Completeness: Added `refreshInterval: 15000` to SWR hooks in App.tsx as per PRD requirement for 15-second polling.
