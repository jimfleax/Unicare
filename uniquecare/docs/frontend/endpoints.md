# API Endpoints Integration

This document outlines the REST (or GraphQL) API endpoints required by the Uniquecare frontend to fully function with a backend. The frontend (`api.ts` configured for `http://localhost:5000/api`) currently relies on mocked data and graceful fallbacks, and replacing them with live endpoints is necessary. Note that Assets, Users, Authentication, and Notifications appear to be entirely mocked currently.

## Tickets / Issues
- **`GET /api/issues`**
  - *Usage:* Fetch issues/records. Fetched on mount in `App.tsx` (`syncBackendData`).
  - *Expected Response:* `{ success: true, data: IssueRecord[] }`
- **`POST /api/issues`**
  - *Usage:* Log a new issue. Called in `StudentDashboard` via `createIssueApi`.
  - *Expected Payload:* JSON representing `Partial<IssueRecord>`.
  - *Expected Response:* `{ success: true, data: IssueRecord }`
- **`PATCH /api/issues/:id` / `PATCH /api/issues/:id/status`**
  - *Usage:* Update ticket status (e.g., from 'Open' to 'In Progress' or 'Resolved'). Triggered by `onStatusChange` in `TechnicianDashboard` or `App.tsx`.
  - *Expected Payload:* `{ status: "Open" | "In Progress" | "Resolved" }`
  - *Expected Response:* Standard HTTP 200/204 (evaluates `res.ok`).
- **`POST /api/issues/:id/logs`**
  - *Usage:* Post a technician repair note/log to a specific ticket.

## Users / Technicians
- `GET /api/technicians`: Fetch the on-duty technician roster.

## Infrastructure / Assets
- `GET /api/workstations`: Fetch the lab asset health grid.
- `GET /api/inventory/spares`: Fetch spare parts stock in the inventory.
- `POST /api/inventory/requisition`: Trigger a spare part restock/requisition request.

## Miscellaneous (Global Features)
- `POST /api/newsletter/subscribe`: Add an email to the "Uniques Digest" newsletter list.
- `POST /api/support/contact`: Submit a query via the campus helpdesk support drawer.
