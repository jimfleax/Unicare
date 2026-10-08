# Backend Documentation

The Unicare backend is a robust RESTful API built on Node.js, Express, and TypeScript, serving as the system's brain for data management and automation.

## Core Structure
- **`src/app.ts` & `src/server.ts`**: Express configuration and server initialization.
- **`src/routes/`**: API endpoint definitions categorized by domain.
- **`src/controllers/`**: HTTP request handlers that coordinate request data with business logic.
- **`src/services/`**: Independent modules containing the core business rules (Push Notifications, Auth, etc.).
- **`src/middleware/`**: Shared functions for request validation, JWT checking, and global error handling.

## Database Models (MongoDB)
The domain is modeled via Mongoose schemas to ensure data integrity and track relationships:

1. **User**
   - Tracks roles (`student`, `technician`, `admin`), availability statuses (`On Shift`, `In Field`), specialties, and gamified metrics like `carePoints`.
2. **Asset**
   - Represents physical infrastructure. Tracks an RFID/Tag ID, location, and a computed `healthStatus` (`healthy`, `degraded`, `broken`).
3. **Incident**
   - A specific problem related to an `Asset`. Features an assigned technician and lifecycle states (`Open` -> `In Progress` -> `Resolved`). Maintains a rich activity log and media URLs.
4. **Issue**
   - General complaint form (not strictly bound to an Asset tag) with category, priority, and location details.
5. **Inventory & RequisitionRequest**
   - **Inventory:** Tracks lab supplies and spares (stock counts, `minStockLevel`). Uses pre-save hooks to compute `In Stock`, `Low Stock`, or `Out of Stock` statuses.
   - **RequisitionRequest:** A formal request workflow for technicians to withdraw parts (`Pending`, `Approved`, `Rejected`).
6. **Notification & Subscription**
   - Handles persistent in-app notifications and manages Web Push subscription keys per user/device.

## Background Services
- **`pushService.ts`**: Integrates with the `web-push` library. Maps user IDs or role groups to active VAPID subscriptions, pushing instant alerts without requiring the frontend to poll continuously.
- **`notificationService.ts`**: The facade for creating persistent `Notification` documents in the DB while orchestrating the `pushService` simultaneously.
