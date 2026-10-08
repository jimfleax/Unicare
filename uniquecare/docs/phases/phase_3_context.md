# Phase 3 Context: Authentication & Security: Implement authService (JWT), authController, and authMiddleware. Verify via Jest.

## Global Project Guidelines
- Backend: Node.js, Express, TypeScript, Mongoose (MongoDB).
- Authorization: JWT Bearer tokens. A centralized authMiddleware verifies the token signature and enforces route-level role access.

## Phase-Specific Requirements
### 3.1 Role-Based Access Control (RBAC)
The system strictly supports three roles:
1.  **Student (End User):** Can report faults via QR scanning, upload photos, and track the status of their own tickets. Earns gamified "Care Points".
2.  **Technician:** Can view the active queue of assigned/unassigned tickets, update ticket statuses (Open -> In Progress -> Resolved), and add activity logs.
3.  **Admin:** Can view all tickets, manage asset inventory, and view analytics (SLA compliance, MTTR).

**Implementation Details:**
*   **Authentication:** Hybrid approach. Students can use Google OAuth. Staff (Techs/Admins) use manual Email/Password with bcrypt hashing.
*   **Authorization:** JWT Bearer tokens. A centralized `authMiddleware` verifies the token signature and enforces route-level role access.

### Phase 3: Authentication & Security
1. Implement `authService` (JWT generation/verification).
2. Implement `authController` and `authMiddleware`.
3. Verify all endpoints using Jest.

## Resolved Clarifications (Relevant to This Phase)
N/A

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
[None]
