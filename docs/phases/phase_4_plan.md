# Phase 4: Core Domain Endpoints

## Context
- The backend needs CRUD endpoints for `Incident`, `Asset`, and `Analytics`.
- We need to implement a VAPID Web Push trigger.
- Mongoose models (`Incident`, `Asset`, `User`) are already scaffolded.

## Dependency Map
- `backend/src/controllers/incidentController.ts` → imports `Incident`, `Asset`, `User`, `AppError`
- `backend/src/controllers/assetController.ts` → imports `Asset`, `AppError`
- `backend/src/controllers/analyticsController.ts` → imports `Incident`, `Asset`, `User`, `AppError`
- `backend/src/routes/incidentRoutes.ts` → imports `incidentController`, `authMiddleware`
- `backend/src/routes/assetRoutes.ts` → imports `assetController`, `authMiddleware`
- `backend/src/routes/analyticsRoutes.ts` → imports `analyticsController`, `authMiddleware`
- `backend/src/services/pushService.ts` → handles VAPID subscription and pushing
- `backend/src/app.ts` → will import all new routes.

## Proposed Changes

### Controllers

#### [NEW] backend/src/controllers/incidentController.ts
- What: Create CRUD for incidents. `createIncident` (with web push trigger), `getIncidents`, `getIncidentById`, `updateIncidentStatus`, `addActivityLog`.
- Why: Feature requirements.
- Impact: Routes and client consumers.

#### [NEW] backend/src/controllers/assetController.ts
- What: Create `getAssetByTagId`.
- Why: Inventory lookup.
- Impact: Routes.

#### [NEW] backend/src/controllers/analyticsController.ts
- What: Create `getAnalytics` for SLA compliance and MTTR.
- Why: Admin dashboard requirements.
- Impact: Routes.

### Services

#### [NEW] backend/src/services/pushService.ts
- What: Setup web-push, functions to `sendPushNotification`, controller to `subscribe` a technician.
- Why: Need to alert technicians instantly.
- Impact: `incidentController`.

### Routes

#### [NEW] backend/src/routes/incidentRoutes.ts
- What: Mount incident routes. Use auth middleware.
- Why: Required for API.
- Impact: `app.ts`.

#### [NEW] backend/src/routes/assetRoutes.ts
- What: Mount asset routes. Use auth middleware.
- Why: Required for API.
- Impact: `app.ts`.

#### [NEW] backend/src/routes/analyticsRoutes.ts
- What: Mount analytics routes. Admin only auth.
- Why: Required for API.
- Impact: `app.ts`.

#### [NEW] backend/src/routes/notificationRoutes.ts
- What: Mount subscription route for technician VAPID.
- Why: Required for API.
- Impact: `app.ts`.

#### [MODIFY] backend/src/app.ts
- What: Import and use the new routes.
- Why: Expose the endpoints.
- Impact: Entire API.

## DRY Context
- Use `catchAsync` for async controller wrappers.
- Use `AppError` for throwing formatted errors.
- Use `authMiddleware.protect` and `authMiddleware.restrictTo`.

## Risks & Edge Cases
- Test coverage for each endpoint (incidents, assets, analytics, notifications).
- VAPID push service could fail; make sure it does not break the `createIncident` response. Catch push errors gracefully.

### Models
#### [NEW] backend/src/models/Subscription.ts
- What: Create a Mongoose model for Push Subscriptions (userId, endpoint, keys).
- Why: Needed to store technician VAPID subscriptions.
- Impact: notificationRoutes.

## Scope Validation Notes
- Added Subscription model to satisfy VAPID push persistence.
