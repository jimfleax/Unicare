# Authentication & Role-Based Access Control (RBAC) Architecture

## Overview
Unique-Care (Unicare) supports a strict tri-role system: **Student**, **Technician**, and **Admin**. The authentication architecture must securely identify users, authorize access to specific endpoints, and integrate seamlessly with a Vercel Serverless environment.

## 1. Authentication Strategy (Hybrid)
To reduce friction for the primary user base (Students) while maintaining strict control for staff (Admins/Techs), the system employs a dual-strategy approach:
*   **OAuth 2.0 (Google):** Primarily for Students. Users can authenticate using their campus Google Workspace accounts. The backend verifies the Google ID token and issues a custom Unicare JWT.
*   **Custom Credentials (Email/Password):** For Technicians and Admins. Follows the CodeCrusade reference implementation using `bcrypt` for password hashing and internal JWT issuance.

## 2. JWT & Session Management
Because Vercel functions are stateless, we use JSON Web Tokens (JWT) rather than stateful server sessions.
*   **Token Issuance:** Upon successful login (via Google or Password), the backend generates a signed JWT containing `{ id, role }`.
*   **Token Storage (Frontend):** Stored securely in memory or `localStorage`, managed by the React `AuthContext`.
*   **Token Verification (Backend):** An `authMiddleware.ts` intercepts requests, extracts the Bearer token, verifies the signature against `JWT_SECRET`, and attaches the decoded `req.user` object to the Express request pipeline.

## 3. RBAC Implementation
Role authorization is enforced at the route level using a higher-order middleware factory `authorize(...roles)`.

### Example Flow:
```typescript
// backend/src/routes/incidentRoutes.ts
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// All authenticated users can view incidents (filtered by their role in the controller)
router.get('/', authenticate, IncidentController.getAll);

// Only Techs and Admins can update the status of an incident
router.patch('/:id/status', authenticate, authorize('Tech', 'Admin'), IncidentController.updateStatus);
```

### Frontend Guarding
The frontend routing (React Router v6) utilizes a `ProtectedRoute` component that reads the `AuthContext`. If a Student attempts to access `/analytics`, the `ProtectedRoute` intercepts the render and redirects them to `/student`.
