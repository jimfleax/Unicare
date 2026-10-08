# Frontend Documentation

The Unique-Care frontend is a highly interactive, real-time single-page application (SPA). Built with React 19, Vite, and Tailwind CSS v4, it focuses on performance and role-specific user experiences.

## Key Technologies
- **React 19 & Vite**: Provides a fast development environment and optimized production builds.
- **Tailwind CSS v4**: Utility-first styling for rapid, responsive design. Features custom components like StarBorder and Hero3DHub.
- **React Router (v7)**: Manages protected and public routes dynamically.
- **SWR**: Handles remote data caching, pagination (`useSWRInfinite`), and background revalidation.
- **Three.js & Postprocessing**: Powers the immersive 3D landing page.

## Directory Layout
- **`src/components/`**: Modular UI pieces. Houses role-specific dashboards (`StudentDashboard.tsx`, `TechnicianDashboard.tsx`, `AdminDashboard.tsx`).
- **`src/context/`**: Home to `AuthContext.tsx` which manages the global authentication state.
- **`src/services/`**: Centralized API handlers (e.g., `api.ts`), standardizing backend fetches.
- **`src/config/`**: Configuration constants like `branding.ts`.

## Routing & Protected Portals
The application utilizes a `Portal` wrapper to gate authenticated content.
- `/` - Public landing page featuring 3D visuals.
- `/login` - Authentication gate.
- `/*` - Protected routes rendered conditionally by role:
  - `/student` - Simplified portal for tracking submitted tickets.
  - `/technician` - Focused queue for claiming and updating incidents.
  - `/dashboard` - Admin overview.
  - `/issues` - Global issue tracking (Kanban/List views).
  - `/report` - QR code scanning and reporting UI.
  - `/inventory` - Spare parts ledger and QR tag generation.
  - `/analytics` - Data visualization for SLA metrics.

## Standout Features
- **QR Asset Reporting:** Users can scan auto-generated QR codes on campus equipment. The frontend instantly parses the asset ID and opens a pre-filled reporting form, drastically reducing report friction.
- **Issue Tracking Dashboard:** A dynamic Kanban-style interface that prioritizes critical SLAs and allows drag-and-drop or quick-action status updates.
- **Analytics Telemetry:** Rich visual graphs and metrics tracking institutional uptime and technician response speeds.
