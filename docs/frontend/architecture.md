# Frontend Architecture & Data Models

This document details the anticipated backend data models, state management, and overarching architecture for the Uniquecare application.

## Application Stack & Theming
- **Frameworks/Libraries**: React 18, React Router v6 (`BrowserRouter`), `lucide-react` for icons, TypeScript.
- **Theming**: Includes a custom Dark/Light mode toggle (`theme` state) synced with `localStorage('ucare-theme')` and applied via `data-theme` on the `documentElement`.
- **Name/Design**: The application, named "Unicare", uses a highly stylized "cyber-aesthetic" facility/maintenance tracking portal designed for SVIET Campus / The Uniques Community.

## State Management & Flow
- Avatar pictures in the student dashboard are currently cached in `localStorage` under `ucare-student-avatar`.
- Technician dashboards currently handle technical repair logs in local state, which will need to be elevated to backend API requests.
- The `onStatusChange` event handler is used in the `TechnicianDashboard` to transition states (e.g., 'Open' to 'In Progress').
- Gamification is handled through "Care Points", where students earn 50 points per legitimate report.

## Anticipated Data Models

Based on the TypeScript interfaces and mock data used within the components, the following core database models are expected:

### 1. IssueRecord (Tickets)
- `id`
- `title`
- `description`
- `location`
- `category`
- `priority` (Critical, High, Medium, Low)
- `status` (Open, In Progress, Resolved)
- `assignee`
- `reporter`
- `date`
- `time`
- Support for attachments and repair logs

### 2. User / Student
- Name
- Roll No.
- Batch
- Branch
- Avatar URL
- Care Points

### 3. Technician
- `id`
- `name`
- `title`
- `specialty`
- `status` (On Shift, In Field, On Call, Off Duty)
- `phone`
- `activeJobsCount`
- `avatarColor`

### 4. Workstation / AssetRecord
- `id`
- `name`
- `location`
- `category`
- `status` (Operational, Degraded, Faulty, Active, Maintenance, Decommissioned)
- `lastChecked` / `lastService`
- `nextDue`
- `health`
- `specs`

### 5. SparePart (Inventory)
- `id`
- `name`
- `category`
- `stock`
- `unit`
- `status` (In Stock, Low Stock, Reorder)
