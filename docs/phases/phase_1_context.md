# Phase 1 Context: Backend Foundation (TDD): Initialize Express/TS, port jest.config.js and tests/setup.ts for DB teardown, setup app.ts for Supertest.

## Global Project Guidelines
*   **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB).
*   **Frontend:** React 19, Vite, React Router v6, Tailwind CSS, SWR (Data Fetching).
*   **Deployment:** Vercel (Serverless Functions for Backend, Static Hosting for Frontend).
*   **Database:** MongoDB Atlas.
*   **Media Storage:** Vercel Blob / Cloudinary.
*   **Testing:** Jest, Supertest (TDD).

## Phase-Specific Requirements
### Phase 1: Backend Foundation (TDD)
1. Initialize the Express/TS backend.
2. Port the robust `jest.config.js` and `tests/setup.ts` database teardown mechanisms from the CodeCrusade reference.
3. Setup the Express `app.ts` (without `app.listen()`) to allow Supertest integration.

## Resolved Clarifications (Relevant to This Phase)
None.

## Schema Context
Schema map not yet generated. This phase will create it.

## Shared Utilities Available
- **`AppError`**: Custom error class extending `Error` to attach HTTP status codes.
- **`errorHandler` middleware**: Express middleware to catch errors, format them consistently (e.g., `{ status: 'error', message: '...' }`), and prevent stack trace leaks in production.
- **`catchAsync` wrapper**: Utility to wrap async controllers to pass promise rejections directly to the `next()` middleware.
- **VAPID Keys**: Ensure a consistent module for VAPID Web Push setup and broadcasting.

## API Contracts from Previous Phases
No API contracts from previous phases.
