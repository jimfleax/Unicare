# Unicare Backend API & Domain Reference

This document provides a comprehensive overview of the backend structure, detailing all data models, API endpoints, functionalities, schemas, requirements, and dependencies. It is intended to serve as a guide for frontend integration and architectural understanding.

---

## 1. Auth and Users Module

### Data Model (`User.ts`)
The `User` model manages authentication and profile data for students, technicians, and administrators.
- **Key Fields**: 
  - `name` (String, required)
  - `email` (String, required, unique)
  - `password` (String)
  - `role` (Enum: `'student'`, `'technician'`, `'admin'`, default: `'student'`)
  - `carePoints` (Number, default: 0)
  - `status` (Enum: `'On Shift'`, `'In Field'`, `'On Call'`, `'Off Duty'`, default: `'On Shift'`)
- **Additional Fields**: `title`, `specialty`, `phone`, `avatarColor`. Student-specific fields include `batch`, `batchCode`, `branch`, and `rollNo`.
- **Auth Fields**: `resetPasswordToken`, `resetPasswordExpires`.

### Endpoints (`authRoutes.ts`, `userRoutes.ts`)
#### Authentication
- **`POST /api/auth/register`**: Registers a new user. Hashes the password and returns a JWT.
- **`POST /api/auth/login`**: Authenticates a user with email/password and returns a JWT. Prevents login for OAuth-only users.
- **`POST /api/auth/google`**: Handles Google OAuth login (currently mocks decoding). Finds/creates user and returns a JWT.
- **`POST /api/auth/forgot-password`**: Generates a 1-hour expiry hex token and sends a reset link (mocked via console logs).
- **`POST /api/auth/reset-password/:token`**: Validates the reset token and hashes the new password.
- **`GET /api/auth/me`** (Protected): Returns the currently authenticated user's details.

#### User Management
- **`GET /api/users/technicians`**: Returns all users with the `technician` role. Converts `_id` to `id`.
- **`PATCH /api/users/me/status`** (Protected): Updates the current user's `status` (validates against the enum).
- **`GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`** (Protected, Admin): Full CRUD for all users. The GET endpoint supports optional filtering by `role` via query param.
- **`POST /api/users/technicians`, `PUT /api/users/technicians/:id`, `DELETE /api/users/technicians/:id`** (Protected, Admin): Admin endpoints to manage technicians specifically.

### Dependencies
- `bcryptjs` for password hashing.
- `jsonwebtoken` (JWT) for stateless authentication. Expires in 30 days.
- `authMiddleware.ts` provides `protect` (verifies Bearer token) and `authorize(...roles)` (role-based access control).

---

## 2. Incident and Asset Modules

### Data Models
**Asset (`Asset.ts`)**
- Represents physical/general items or locations.
- **Schema**: `tagId` (String, unique), `name` (String, required), `healthStatus` (Enum: `'healthy'`, `'degraded'`, `'broken'`, default: `'healthy'`), `location` (String, default: `'Campus'`), `category` (String, default: `'General'`), Timestamps.

**Incident (`Incident.ts`)**
- Represents issues or faults reported against specific assets.
- **Schema**: `assetId` (ObjectId, ref: 'Asset'), `reportedBy` (ObjectId, ref: 'User'), `assignedTo` (ObjectId, ref: 'User', optional), `status` (Enum: `'Open'`, `'In Progress'`, `'Resolved'`, default: `'Open'`), `description` (String, required), `mediaUrls` (Array of Strings), `activityLogs` (Array of `{ message, createdBy, createdAt }`), Timestamps.

### Endpoints
#### Assets (`/api/assets`)
*Protected by `protect`.*
- **`GET /`**: Retrieve all assets.
- **`POST /`**: Create a new asset.
- **`GET /:tagId`**: Retrieve an asset by `tagId` (404 if not found).
- **`PUT /:tagId`**: Update an existing asset by `tagId`.
- **`DELETE /:tagId`**: Delete an asset by `tagId`.

#### Incidents (`/api/incidents`)
*Protected by `protect`. Certain routes restricted to `technician` and `admin`.*
- **`POST /`**: Report a new incident. Auto-creates a "General Facility Issue" asset if `assetId`/`tagId` is not found. Sends targeted notification to technicians.
- **`GET /`**: List incidents based on role. Students only see their reported incidents.
- **`GET /:id`**: Retrieve details of a specific incident (populated with Asset, User details). 403 Forbidden if a student didn't report it.
- **`PATCH /:id` / `PATCH /:id/status`** (Technician/Admin): Updates the workflow status (`'In Progress'`, `'Resolved'`). Auto-assigns the requester if changing to `'In Progress'` and unassigned. Sends notifications.
- **`POST /:id/activity` / `POST /:id/logs`** (Technician/Admin): Appends a new entry to `activityLogs`. Sends targeted notifications to the reporter and assigned technician.

---

## 3. Inventory and Requisition Modules

### Data Models
**Inventory (`Inventory.ts`)**
- Manages spare parts.
- **Schema**: `name`, `sku` (unique), `category`, `stock` (default: 0), `minStockLevel` (default: 0), `unit`, `status` (Enum: `'In Stock'`, `'Low Stock'`, `'Out of Stock'`, default: `'In Stock'`), `location`, `price`.
- **Hooks**: A `pre('save')` hook automatically recalculates the `status` based on `stock` and `minStockLevel`.

**RequisitionRequest (`RequisitionRequest.ts`)**
- Tracks part requests by technicians.
- **Schema**: `inventoryId` (ObjectId, ref: 'Inventory'), `technicianId` (ObjectId, ref: 'User'), `quantityRequested` (Number), `status` (Enum: `'Pending'`, `'Approved'`, `'Rejected'`, default: `'Pending'`), `reason` (String).

### Endpoints
#### Inventory (`/api/inventory`)
- **`GET /`**: Returns all inventory items.
- **`GET /:id`**: Returns a specific item by `_id`.
- **`POST /`**: Creates a new inventory item.
- **`PUT /:id`**: Updates an existing item. Evaluates `pre-save` hook for stock status.
- **`DELETE /:id`**: Deletes an item by `_id`.

#### Requisitions (`/api/requisitions`)
- **`GET /`**: Fetches all requisition requests (populates `inventoryId` and `technicianId`).
- **`POST /`**: Creates a new requisition request (defaults to 'Pending').
- **`PUT /:id/status`**: Updates the status (e.g., to 'Approved'). If marked `'Approved'`, it retrieves the corresponding `Inventory` item, deducts the `quantityRequested` from `stock`, and triggers the status re-evaluation hook.

---

## 4. Maintenance and Metadata Modules

### Data Models
**MaintenanceSchedule (`MaintenanceSchedule.ts`)**
- **Schema**: `assetId` (ObjectId, ref: 'Asset'), `assignedTo` (ObjectId, ref: 'User'), `scheduledDate` (Date), `description` (String), `status` (Enum: `'Pending'`, `'Completed'`, `'Cancelled'`, default: `'Pending'`).

**Metadata (`Metadata.ts`) & Faq (`Faq.ts`)**
- **Metadata Schema**: `type` (String, e.g., 'priority', 'location'), `value`, `label`, `color`.
- **Faq Schema**: `question`, `answer` (plain text), `order`, `active` (default: true).

### Endpoints
#### Maintenance (`/api/maintenance`)
*Protected by `protect` and `authorize('admin', 'lab_admin')`.*
- **`POST /`**: Creates a new maintenance schedule.
- **`GET /`**: Retrieves all maintenance schedules (populating `assetId` and `assignedTo`).

#### Metadata (`/api/metadata`)
*Protected by `protect`.*
- **`GET /locations`**: Aggregates distinct locations from `Asset` model and maps colors from `Metadata`. Seeds defaults if empty.
- **`GET /categories`**: Aggregates distinct categories from `Asset` model.
- **`GET /priorities`**: Fetches priority metadata from the DB.
- **`GET /statuses`**: Returns hardcoded incident statuses.
- **`GET /faqs`**: Fetches active FAQs, sorting by `order` (seeds defaults if empty).
- **`GET /student-profile`**: Extracts and returns `batch`, `batchCode`, `branch`, and `rollNo` from `req.user`.

---

## 5. Health, Analytics, and Notifications Modules

### Endpoints & Functionality
#### Health (`/api/health`)
- **`GET /`**: Public endpoint. Returns `{ success: true, message: 'Ucare backend is running' }`.

#### Analytics (`/api/analytics`)
*Protected, Admin only.*
- **`GET /`**: Calculates stats across all incidents, including total, resolved, SLA breaches (>24h), compliance percentage, average speed, and jobs complete.
- **`GET /trends`**: Generates time-series data for reported vs. resolved incidents based on the `period` query (`7d`, `30d`, `6m`, `1y`). Returns arrays for labels, reported counts, and resolved counts.

#### Notifications (`/api/notifications`)
- **Models**:
  - `Notification`: `title`, `message`, `location`, `priority`, `time`, `unread`, `incidentId`, `recipient` (User ref).
  - `Subscription`: Web Push config (`userId`, `endpoint`, `keys`).
- **`GET /`**: Retrieves paginated notifications for the authenticated user.
- **`PUT /mark-read`**: Marks all unread notifications for the user as read.
- **`PUT /:id/mark-read`**: Marks a specific notification as read.
- **`POST /subscribe`** (Technician/Admin): Upserts a push notification subscription (`endpoint` and `keys`).
- **Services**:
  - `notificationService.ts`: `createTargetedNotification` creates DB records and triggers push.
  - `pushService.ts`: Configures `web-push` using VAPID keys to send async Web Push notifications and delete expired subscriptions.

---

## Key Backend Utilities and Dependencies
- **Express & Mongoose**: Core routing and data modeling/ODM. Mongoose hooks (e.g., pre-save) and Population (`.populate()`) are extensively used.
- **`catchAsync` Wrapper**: All controller methods are wrapped to handle async rejections seamlessly, passing errors to a global error handling middleware.
- **`AppError`**: Custom error class extending `Error` for predictable HTTP status codes and operational error tracking.
