# Product Requirements Document (PRD): Unicare Backend & Frontend Refactoring

## 1. Project Objective
To transform the current mocked frontend of "Unique-Care" (Unicare) into a fully functional, production-ready full-stack application. Unicare is a Smart Lab Automation system designed to streamline issue reporting via QR codes, manage technician workflows, and provide administrative oversight through strict SLA tracking. 

The backend will be a robust, Test-Driven Express/Mongoose API deployed to Vercel. The frontend will be refactored to consume this API securely.

---

## 2. Technical Stack & Infrastructure
*   **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB).
*   **Frontend:** React 19, Vite, React Router v6, Tailwind CSS, SWR (Data Fetching).
*   **Deployment:** Vercel (Serverless Functions for Backend, Static Hosting for Frontend).
*   **Database:** MongoDB Atlas.
*   **Media Storage:** Vercel Blob / Cloudinary.
*   **Testing:** Jest, Supertest (TDD).

---

## 3. Core Features & Requirements

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

### 3.3 Asset & QR Code Management
*   **Data Model:** The backend maintains an `Asset` collection (`tagId`, `name`, `healthStatus`).
*   **QR Strategy:** The backend *does not* generate or store QR images. It solely provides the `tagId`. The frontend dynamically renders the SVG QR codes on the fly.
*   **Scanning Flow:** The `/report` route uses the device camera to decode the QR, reads the `tagId`, and hits the backend to auto-fill the asset details.

### 3.4 Media Uploads
*   Students can attach photos of hardware damage.
*   **Storage:** Images are uploaded to a cloud provider (e.g., Vercel Blob). The backend merely stores the resulting URL string in the `Incident` document's `mediaUrls` array.

### 3.5 SLA Tracking
*   **Calculation:** SLA breach detection is calculated dynamically at read-time. The backend compares the ticket's `createdAt` timestamp against the current server time. If `status` is not 'Resolved' and the delta exceeds the allowed limit (e.g., 24h), it is flagged as breached.

---

## 4. Architectural Deliverables & Phased Plan

We will execute the development in five distinct phases:

### Phase 1: Backend Foundation (TDD)
1. Initialize the Express/TS backend.
2. Port the robust `jest.config.js` and `tests/setup.ts` database teardown mechanisms from the CodeCrusade reference.
3. Setup the Express `app.ts` (without `app.listen()`) to allow Supertest integration.

### Phase 2: Mongoose Schemas
1. Create strongly typed Mongoose documents for `User`, `Asset`, and `Incident`.

### Phase 3: Authentication & Security
1. Implement `authService` (JWT generation/verification).
2. Implement `authController` and `authMiddleware`.
3. Verify all endpoints using Jest.

### Phase 4: Core Domain Endpoints
1. Develop `/api/incidents` (CRUD, status updates, activity threading).
2. Develop `/api/assets` (Inventory lookup).
3. Develop `/api/analytics` (Aggregation pipelines).
4. Implement the VAPID Web Push trigger inside the incident creation controller.

### Phase 5: Frontend Refactoring
1. Replace static mock arrays in `App.tsx` with SWR hooks calling the real endpoints.
2. Implement `AuthContext` to manage the JWT lifecycle.
3. Wrap role-specific routes in a `ProtectedRoute` component to intercept and redirect unauthorized navigation.

---

## 5. Success Criteria
*   **Test Coverage:** Backend tests (Jest) pass successfully on a transient database, covering 100% of the Controller logic.
*   **Security:** Attempting to alter a ticket status with a Student JWT results in a `403 Forbidden` response from the API.
*   **Functionality:** A full E2E flow (Student logs in -> Scans QR -> Reports Issue -> Technician sees it in queue -> Technician resolves it) works flawlessly.
