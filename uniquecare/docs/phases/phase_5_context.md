# Phase 5 Context: Frontend Refactoring: Replace static mocks in App.tsx with SWR hooks, AuthContext for JWT, and ProtectedRoute for RBAC.

## Global Project Guidelines
*   **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB).
*   **Frontend:** React 19, Vite, React Router v6, Tailwind CSS, SWR (Data Fetching).
*   **Deployment:** Vercel (Serverless Functions for Backend, Static Hosting for Frontend).
*   **Database:** MongoDB Atlas.
*   **Media Storage:** Vercel Blob / Cloudinary.
*   **Testing:** Jest, Supertest (TDD).

## Phase-Specific Requirements
### 3.1 Role-Based Access Control (RBAC)
The system strictly supports three roles:
1.  **Student (End User):** Can report faults via QR scanning, upload photos, and track the status of their own tickets. Earns gamified "Care Points".
2.  **Technician:** Can view the active queue of assigned/unassigned tickets, update ticket statuses (Open -> In Progress -> Resolved), and add activity logs.
3.  **Admin:** Can view all tickets, manage asset inventory, and view analytics (SLA compliance, MTTR).

**Implementation Details:**
*   **Authentication:** Hybrid approach. Students can use Google OAuth. Staff (Techs/Admins) use manual Email/Password with bcrypt hashing.
*   **Authorization:** JWT Bearer tokens. A centralized `authMiddleware` verifies the token signature and enforces route-level role access.

### 3.2 Real-time Sync & Notifications
To ensure Technicians are alerted instantly when a fault is reported, without violating Vercel Serverless WebSocket constraints:
*   **Hybrid Real-time Architecture:** 
    *   **Baseline:** The frontend uses `swr` to poll the backend every 15 seconds, ensuring eventual consistency.
    *   **Instant Trigger:** The backend uses standard VAPID Web Push (Service Workers) to send tiny push payloads to Technician devices when a ticket is created. The Service Worker intercepts the push and forces an immediate SWR revalidation.

### Phase 5: Frontend Refactoring
1. Replace static mock arrays in `App.tsx` with SWR hooks calling the real endpoints.
2. Implement `AuthContext` to manage the JWT lifecycle.
3. Wrap role-specific routes in a `ProtectedRoute` component to intercept and redirect unauthorized navigation.

## Resolved Clarifications (Relevant to This Phase)
None explicitly mentioned in the PRD for frontend refactoring other than standard behavior.

## Schema Context
# Database Schema Map

## Entity Relationship Overview
- Incident -> references Asset (assetId)
- Incident -> references User (reportedBy)
- Incident -> references User (assignedTo)
- Incident.activityLogs -> references User (createdBy)

## Models Scaffolded
| Model | File | Fields | References | Status Enum |
|-------|------|--------|------------|-------------|
| User  | backend/src/models/User.ts | name, email, password, role, carePoints | — | role: student, technician, admin |
| Asset | backend/src/models/Asset.ts | tagId, name, healthStatus | — | healthStatus: healthy, degraded, broken |
| Incident | backend/src/models/Incident.ts | assetId, reportedBy, assignedTo, status, description, mediaUrls, activityLogs | Asset, User | Open, In Progress, Resolved |

## Cascade Rules
- No explicit cascade rules defined in PRD.

## Shared Utilities Available
# Shared Utilities (Backend)

- **`AppError`**: Custom error class extending `Error` to attach HTTP status codes.
- **`errorHandler` middleware**: Express middleware to catch errors, format them consistently (e.g., `{ status: 'error', message: '...' }`), and prevent stack trace leaks in production.
- **`catchAsync` wrapper**: Utility to wrap async controllers to pass promise rejections directly to the `next()` middleware.
- **VAPID Keys**: Ensure a consistent module for VAPID Web Push setup and broadcasting.

## API Contracts from Previous Phases
Phase 3 API Contract:
- POST /api/auth/google
- POST /api/auth/login
- GET /api/auth/me

Phase 4 API Contract:
- POST /api/incidents
- GET /api/incidents
- GET /api/incidents/:id
- PATCH /api/incidents/:id/status
- POST /api/incidents/:id/activity
- GET /api/assets/:tagId
- GET /api/analytics
- POST /api/notifications/subscribe
