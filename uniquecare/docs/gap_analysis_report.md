# Unique-Care: Cross-Stack Gap Analysis & Synchronization Report

## Executive Summary
This report aggregates the findings from frontend, backend, and cross-stack integration audits for the Unique-Care project. It highlights disconnected endpoints, mock implementations, hardcoded UI components, and technical debt that must be addressed to achieve a fully synchronized, production-ready system.

## 1. Integration & API Sync Issues (Cross-Stack Gaps)
* **Analytics Mismatch (404 Error)**: The frontend `AdminDashboard` calls `useSWR('/analytics/trends?period=...')`, but the backend `analyticsRoutes.ts` only exposes the root `GET /api/analytics`. The trends endpoint is completely missing, causing silent failures on the frontend.
* **Ignored Requisitions API**: The backend exposes full CRUD operations for requisitions (`/api/requisitions`). However, the frontend (`TechnicianDashboard.tsx`) completely ignores these endpoints, relying instead on a static `alert('Requisition request submitted...')` placeholder.
* **Duplicated Issues vs. Incidents Concept**: The backend implements both `/api/issues` and `/api/incidents`. The frontend `api.ts` correctly points to `/incidents` for reporting and status updates, making the `/api/issues` implementation completely redundant and obsolete. 
* **Missing Push Notification Subscription**: The backend exposes `POST /api/notifications/subscribe` for Web Push notifications. However, the frontend lacks a Service Worker, a web app manifest, and any UI/logic to request push permissions. It currently falls back to SWR short-polling (`15000ms`) for updates.
* **Unutilized Google Auth**: The backend has a `POST /api/auth/google` endpoint (albeit mocked), but the frontend `api.ts` lacks any corresponding `googleLoginApi` integration to consume it.
* **Unused Inventory Management & Assets Routes**: The backend exposes `POST`, `PUT`, and `DELETE` for `/api/inventory` and `GET /api/assets/:tagId`, but the frontend only implements `GET /inventory` and `GET /assets`, lacking any admin UI to actively manage inventory or fetch specific asset tags.
* **Health Check Not Integrated**: The backend exposes `GET /api/health`, but the frontend has no integration for this endpoint to display a system status indicator.

## 2. Backend Gaps & Technical Debt
### Endpoints Defined but Empty or Mocked
* **Google Login**: The `/api/auth/google` route completely mocks JWT verification instead of using `google-auth-library`. Code comments explicitly indicate it is a mocked assumption.
* **Health Check**: `GET /api/health` returns a hardcoded success message rather than pinging the database or external services.
* **Missing User Profile Operations**: The user controller only exports `getTechnicians`. There are no endpoints to update user profiles, change working status, or fetch individual users.

### Models with Unutilized Fields
* **User Model**: Fields like `carePoints` (no reward logic implemented), `title`, `specialty`, `status`, `phone`, `avatarColor`, `batch`, `batchCode`, `branch`, and `rollNo` exist in the schema but are neither initialized during registration nor updatable later.
* **Incident Model**: The `mediaUrls` array is accepted directly from the request body without an actual media storage service (e.g., AWS S3, local multer) to validate or store the files.

### Stubbed Services & Security Risks
* **Push Service**: VAPID keys are hardcoded with a dummy email (`mailto:example@yourdomain.org`).
* **Auth Service**: Uses a hardcoded, exposed JWT fallback secret (`ucare_super_secret_jwt_key_2026`). Token invalidation and refresh tokens are completely missing.
* **Analytics Performance Gap**: The `getAnalytics` endpoint loads the entire incidents collection into memory (`await Incident.find()`) and loops to calculate SLA breaches, rather than utilizing MongoDB aggregations. This poses a catastrophic performance risk as data grows.
* **Missing Explicit `TODO` Keywords**: The codebase relies on instructional comments (e.g., "Normally we would...") instead of standard `TODO` or `FIXME` tags to track incomplete work.

## 3. Frontend Gaps & Unfinished UI
### Hardcoded UI Components
* **Admin Dashboard Charts**: The analytics line chart relies on a hardcoded object (`chartData`) for `reported` and `resolved` datapoints, completely ignoring the `trendsData` it tries to fetch.
* **Dynamic Colors & Mocks**: Priority breakdowns and campus hotspots rely on static fallback colors (`fallbackLocColors`, `donutColors`) instead of backend metadata schemas. Numerous unused mock layout classes exist in `style.css` (`.ticket-feed-mock`, etc.).

### UI Placeholders
* **Auth Modal**: "Forgot password?" links to a dead-end `e.preventDefault()` with no reset logic or modal.
* **Admin Quick Actions**: "Schedule Maintenance" and "Manage Technicians" simply navigate to the technician view, lacking dedicated admin management pages.

### Missing Role-Standard Features
* **Technician Auth Separation**: The `TechnicianDashboard` lacks real session isolation. Anyone can switch the active technician context client-side via a `<select>` dropdown. Technicians cannot natively update their availability/shift status.
* **Admin User Management**: Admin view lacks a user management portal (to configure student/tech accounts, roles, and categories).

### Service Worker & Push Deficiencies
* No Service Worker (`sw.js`) or web app manifest for PWA installation is present.
* Without push subscriptions, the app heavily relies on resource-intensive SWR short-polling.

## 4. Future Plans & Remediation Strategy
To resolve these gaps and synchronize the stacks, the following actions are planned:
1. **API Alignment**: 
   - Remove the redundant `/api/issues` domain on the backend.
   - Create the missing `/api/analytics/trends` endpoint to satisfy the frontend's SWR requirements.
   - Connect the frontend Requisition button to the actual `/api/requisitions` POST route.
2. **Implement PWA & Web Push**: Add `sw.js` and `manifest.json` to the frontend, wire up subscription logic to `/api/notifications/subscribe`, and replace SWR short-polling with true push events.
3. **Database Performance**: Refactor `analyticsController.ts` to use MongoDB `$match` and `$group` aggregations instead of in-memory JS loops.
4. **Security & Auth Overhaul**: Move VAPID and JWT keys to environment variables (`.env`). Implement true Google OAuth validation via `google-auth-library`. Build out the "Forgot Password" flow across both stacks.
5. **Admin Portals**: Build dedicated Admin views for User Management and Inventory Management, connecting them to the unused backend CRUD endpoints.
6. **Media Handling**: Introduce an S3 or Multer service for handling `mediaUrls` in incident reports securely.
7. **Profile Management**: Implement backend routes and frontend UI for technicians to update their active status, specialty, and contact information.
