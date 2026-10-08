# Unicare: Smart Lab Maintenance System

Welcome to the **Unicare** documentation. Unicare is a smart, frictionless, and automated digital platform built to manage campus infrastructure and lab assets for "The Uniques Community".

## Project Motive & Goals

Campus infrastructure and laboratory equipment are vital for educational environments, but tracking their status, reporting issues, and managing repairs can be cumbersome and fragmented. 

**Goals:**
- **Frictionless Reporting:** Allow users (students and faculty) to instantly report issues by scanning QR codes on lab assets.
- **Streamlined Workflow:** Automate the pipeline from ticket creation to technician assignment and final resolution.
- **Real-time Alerting:** Notify administrators and technicians of new issues or required parts immediately.
- **Inventory & Asset Management:** Maintain a complete hardware registry, track health status, and manage spare parts efficiently.
- **Data-Driven Insights:** Provide telemetry and analytics on system uptime, SLA adherence, and preventive upkeep.

## Technology Stack

The project is divided into a high-performance modern frontend and a robust backend API.

**Frontend:**
- **Framework:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS v4, Custom 3D components (`three`, `postprocessing`)
- **Routing:** `react-router-dom` (v7)
- **State/Fetching:** `swr` (Stale-While-Revalidate), React Context
- **Extras:** `face-api.js`, `lucide-react`

**Backend:**
- **Framework:** Node.js, Express, TypeScript
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT)
- **Services:** Web Push Notifications (`web-push`)

## Complete Structure

The repository is organized into frontend and backend workspaces:

```text
Unicare/
├── README.md               # This file
├── docs/                   # Detailed documentation
│   ├── architecture.md     # System architecture and technical design
│   ├── backend.md          # Backend API, models, and services
│   ├── frontend.md         # Frontend routing, state, and UI features
│   └── workflows.md        # User roles and application workflows
├── frontend/               # React 19 Frontend application
│   ├── src/
│   │   ├── components/     # UI components and role-based dashboards
│   │   ├── context/        # Global state (e.g., AuthContext)
│   │   ├── services/       # API integration layers
│   │   └── config/         # App configuration and branding
└── backend/                # Node.js/Express API
    ├── src/
    │   ├── controllers/    # API endpoint handlers
    │   ├── models/         # Mongoose schemas (User, Asset, Incident, etc.)
    │   ├── routes/         # Express route definitions
    │   ├── services/       # Core business logic and background jobs
    │   └── middleware/     # JWT validation and RBAC
```

## System Workflow Overview

1. **Discovery & Reporting:** A user discovers a faulty PC or AC. They scan the SVG-generated QR code on the asset to instantly log a location-aware issue.
2. **Triage & Routing:** The backend registers the incident, and background jobs emit Web Push alerts to Admins and Technicians.
3. **Action & Repair:** A technician claims the ticket in their real-time dashboard. If parts are needed, they submit an inventory Requisition Request.
4. **Resolution:** After repair, the technician marks the incident as "Resolved", appending notes to the activity stream and earning `carePoints`.
5. **Analytics Oversight:** Admins monitor overall system health, resolution times, and inventory depletion via the Analytics dashboard.

---
**Explore further detailed documentation in the [`docs/`](./docs/) directory.**
