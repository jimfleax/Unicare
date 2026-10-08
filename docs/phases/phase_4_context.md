# Phase 4 Context: Core Domain Endpoints: Develop CRUD for /api/incidents, /api/assets, /api/analytics. Implement VAPID Web Push trigger.

## Global Project Guidelines
- Backend: Node.js, Express, TypeScript, Mongoose (MongoDB).
- Deployment: Vercel (Serverless Functions).
- Testing: Jest, Supertest (TDD).
- Authentication: JWT Bearer tokens. Centralized authMiddleware.
- Role-Based Access Control (RBAC): Student, Technician, Admin.

## Phase-Specific Requirements
### 3.1 Role-Based Access Control (RBAC)
- Student (End User): Can report faults via QR scanning, upload photos, and track the status of their own tickets. Earns gamified "Care Points".
- Technician: Can view the active queue of assigned/unassigned tickets, update ticket statuses (Open -> In Progress -> Resolved), and add activity logs.
- Admin: Can view all tickets, manage asset inventory, and view analytics (SLA compliance, MTTR).

### 3.2 Real-time Sync & Notifications
- Instant Trigger: The backend uses standard VAPID Web Push (Service Workers) to send tiny push payloads to Technician devices when a ticket is created.

### 3.3 Asset & QR Code Management
- Data Model: The backend maintains an Asset collection (tagId, name, healthStatus).

### 3.5 SLA Tracking
- Calculation: SLA breach detection is calculated dynamically at read-time. The backend compares the ticket's createdAt timestamp against the current server time. If status is not 'Resolved' and the delta exceeds the allowed limit (e.g., 24h), it is flagged as breached.

### Phase 4: Core Domain Endpoints
1. Develop /api/incidents (CRUD, status updates, activity threading).
2. Develop /api/assets (Inventory lookup).
3. Develop /api/analytics (Aggregation pipelines).
4. Implement the VAPID Web Push trigger inside the incident creation controller.

## Resolved Clarifications (Relevant to This Phase)
No explicit clarifications.

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
- **`AppError`**: Custom error class extending `Error` to attach HTTP status codes.
- **`errorHandler` middleware**: Express middleware to catch errors, format them consistently.
- **`catchAsync` wrapper**: Utility to wrap async controllers to pass promise rejections directly to the `next()` middleware.
- **VAPID Keys**: Ensure a consistent module for VAPID Web Push setup and broadcasting.

## API Contracts from Previous Phases
N/A
