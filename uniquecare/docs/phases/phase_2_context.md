# Phase 2 Context: Mongoose Schemas: Create strongly typed Mongoose documents for User, Asset, and Incident.

## Global Project Guidelines
*   **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB).
*   **Database:** MongoDB Atlas.
*   **Testing:** Jest, Supertest (TDD).

## Phase-Specific Requirements
### 3.1 Role-Based Access Control (RBAC)
The system strictly supports three roles:
1.  **Student (End User):** Can report faults via QR scanning, upload photos, and track the status of their own tickets. Earns gamified "Care Points".
2.  **Technician:** Can view the active queue of assigned/unassigned tickets, update ticket statuses (Open -> In Progress -> Resolved), and add activity logs.
3.  **Admin:** Can view all tickets, manage asset inventory, and view analytics (SLA compliance, MTTR).

**Implementation Details:**
*   **Authentication:** Hybrid approach. Students can use Google OAuth. Staff (Techs/Admins) use manual Email/Password with bcrypt hashing.

### 3.3 Asset & QR Code Management
*   **Data Model:** The backend maintains an `Asset` collection (`tagId`, `name`, `healthStatus`).

### 3.4 Media Uploads
*   **Storage:** Images are uploaded to a cloud provider (e.g., Vercel Blob). The backend merely stores the resulting URL string in the `Incident` document's `mediaUrls` array.

### 3.5 SLA Tracking
*   **Calculation:** SLA breach detection is calculated dynamically at read-time. The backend compares the ticket's `createdAt` timestamp against the current server time. If `status` is not 'Resolved' and the delta exceeds the allowed limit (e.g., 24h), it is flagged as breached.

## Resolved Clarifications (Relevant to This Phase)
None in PRD.

## Schema Context
Schema map not yet generated. This phase will create it.

## Shared Utilities Available
- **`AppError`**: Custom error class extending `Error` to attach HTTP status codes.
- **`errorHandler` middleware**: Express middleware to catch errors, format them consistently (e.g., `{ status: 'error', message: '...' }`), and prevent stack trace leaks in production.
- **`catchAsync` wrapper**: Utility to wrap async controllers to pass promise rejections directly to the `next()` middleware.
- **VAPID Keys**: Ensure a consistent module for VAPID Web Push setup and broadcasting.

## API Contracts from Previous Phases
None.
