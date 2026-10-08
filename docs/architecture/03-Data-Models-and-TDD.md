# Data Models & TDD Methodology

## Overview
Unique-Care uses MongoDB (via Mongoose) for data persistence. The backend is designed strictly using Test-Driven Development (TDD) using Jest and Supertest, ensuring all business logic is verified before production deployment.

## 1. Domain Models (Mongoose)

### User Model
Unified collection representing all humans interacting with the system.
*   `name`: String
*   `email`: String (Unique)
*   `passwordHash`: String (Optional if OAuth)
*   `role`: Enum `['Student', 'Tech', 'Admin']`
*   `carePoints`: Number (Default 0, applicable to Students)
*   `pushSubscriptions`: Array of Objects (For Web Push routing)

### Asset Model (Inventory)
Represents physical equipment. QR codes in the frontend simply encode the `_id` or `tagId` of this document.
*   `tagId`: String (e.g., `LAB-AC-01`, indexed for fast lookup via QR scan)
*   `name`: String
*   `category`: Enum `['Workstation', 'HVAC', 'Projector', 'Networking']`
*   `location`: String
*   `healthStatus`: Enum `['Healthy', 'Degraded', 'Offline']`

### Incident Model (Tickets)
Represents a reported fault and its lifecycle.
*   `title`: String
*   `description`: String
*   `assetId`: ObjectId (Ref -> Asset)
*   `reportedBy`: ObjectId (Ref -> User)
*   `assignedTo`: ObjectId (Ref -> User, Optional)
*   `status`: Enum `['Open', 'In Progress', 'Resolved']`
*   `priority`: Enum `['Low', 'Medium', 'High', 'Critical']`
*   `mediaUrls`: Array of Strings (Cloudinary/Vercel Blob links)
*   `activityThread`: Subdocument array containing `{ author, note, timestamp }`

## 2. Test-Driven Development (TDD) Setup
Mirroring the `CodeCrusade-portal-api` architecture, we ensure pristine test environments.

### Database Teardown (`tests/setup.ts`)
When `npm test` runs, the setup script intercepts the `MONGODB_URI`.
1.  It automatically appends `_test` to the database name (e.g., `unicare_prod` becomes `unicare_prod_test`).
2.  Before tests start, it connects to the test database and drops it entirely.
3.  After tests finish, it drops the database again and disconnects.
This guarantees that tests are isolated, deterministic, and never accidentally corrupt production or staging data.

### Supertest Integration
Express routes are tested via `supertest` without binding to a physical network port.
```typescript
// Example: tests/incidents.test.ts
import request from 'supertest';
import app from '../src/app'; // The Express app WITHOUT app.listen()

describe('POST /api/incidents', () => {
  it('should allow a Student to report an incident', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Broken Mouse', assetId: '...' });
      
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Open');
  });
});
```
