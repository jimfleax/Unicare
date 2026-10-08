# Frontend Components & UI Features

This document details the various UI components, features, and purpose within the Uniquecare application.

## Core Application & Routing

### `App.tsx` & `main.tsx`
- **Architecture**: React 18, React Router v6 (`BrowserRouter`), `lucide-react` for icons, TypeScript.
- **Entry Point**: Standard setup using `createRoot` and `<StrictMode>`, rendering `<App />`.
- **Theming**: Custom Dark/Light mode toggle (`theme` state) synced with `localStorage('ucare-theme')` and applied via `data-theme` on the `documentElement`.
- **Role-Based Views (Simulated)**: A mock role toggler switches between `Admin` (`/dashboard`), `Tech` (`/technician`), and `Student` (`/student`).
- **Features**:
  - **QR-Based Complaint System (`/report`)**: Generate tickets by scanning an asset tag via `BarcodeDetector` API (real web-camera scanning), with image upload/simulate fallbacks.
  - **Inventory Management (`/inventory`)**: Ledger of `AssetRecord` entities with interactive SVGs for QR codes (`GeneratedQRCode`).
  - **Issue Tracking (`/issues`)**: Complaint ledger with a drawer/modal (`IssueDetailModal`) showing threaded activity, notes, and metadata.

## Dashboard Components

### `StudentDashboard.tsx`
- **Purpose**: A comprehensive portal for students to manage and report laboratory infrastructure issues.
- **Key Features**:
  - **Hero Profile Banner**: Displays student details (Name, Roll No., Batch, Branch) and allows avatar picture upload (currently stored in `localStorage` as `ucare-student-avatar`).
  - **Metric Stats Grid**: Shows ticket counts filtered by "All", "In Progress", "Open", and "Resolved".
  - **Tabs**:
    - **My Active Tickets**: Searchable/filterable list of tickets with a 3-step timeline tracker (Report Filed -> Tech Assigned -> Repaired & Resolved).
    - **Instant Incident Reporter**: A form to log new incidents. Includes a built-in camera UI and "Quick Desk Tag Scanner" that autofills data based on mock workstation QR codes. Supports file attachments. Uses `createIssueApi` to post to the backend.
    - **Workstation Health Grid**: Displays hardware status (Operational, Degraded, Faulty) across campus lab blocks, allowing users to report faults on specific assets instantly.
    - **Guidelines & SLAs**: FAQ section explaining ticket resolution timelines (SLA rules) and a "Care Points" system (gamification).

### `TechnicianDashboard.tsx`
- **Purpose**: A workspace for maintenance staff and technicians to handle incoming work orders and manage inventory.
- **Key Features**:
  - **Technician Roster Dropdown**: Allows toggling between active on-duty technicians.
  - **Metric Stats Grid**: Telemetry stats for shift queue, active jobs, and resolved jobs.
  - **Tabs**:
    - **Work Order Triage Queue**: Searchable list of reported issues. Technicians can start repairs (triggers `onStatusChange` to 'In Progress'), mark as resolved ('Resolved'), and add technical repair logs (currently handled in local state).
    - **On-Duty Technician Roster**: Displays available technicians, their specialties (e.g., HVAC, AV Equipment, Networking), and contact info.
    - **Spare Parts & Inventory Stock**: A table listing spare parts, quantities, and statuses (In Stock, Low Stock, Reorder), with a button to "Requisition Item".

## Landing Page & Global Components

### `UniquesCommunitySections.tsx`
- **Purpose**: Marketing/Landing page UI explaining the product's underlying "Smart Routing" workflow.
- **Key Features**:
  - **Smart Routing Section**: A vertical timeline showing how issues are automatically categorized, located, matched to technicians, and prioritized.
  - **What Happens Next Section**: A zigzag pinboard flow detailing the user journey from logging a ticket to resolution.

### `PreventiveMaintenanceSection.tsx`
- **Purpose**: Landing page infographic describing AI/Predictive maintenance features.
- **Key Features**:
  - **4-Step Process**: "Detect Patterns" -> "Identify Risk" -> "Schedule Maintenance" -> "Prevent Downtime". Features custom SVG graphics and hover animations.

### `Footer.tsx`
- **Purpose**: Site-wide footer with stats, navigation, and user interaction.
- **Key Features**:
  - **Quick Stats Strip**: Displays platform stats (e.g., 500+ users, 99.4% uptime).
  - **Newsletter Subscription**: Email input form to subscribe to the "Uniques Digest".
  - **Interactive Support Drawer**: An "I'm here to help" modal allowing users to contact the campus helpdesk directly.

## UI Effects & Aesthetic Components

### `CursorGrid.tsx`
- **Purpose**: Interactive background grid component reacting to cursor movements.
- **Implementation**: HTML `<canvas>` with 2D Context API for high performance.
- **Features**: Visualizes grid of regular pentagons that increase opacity when near the pointer. Supports click pulse animations. Uses typed arrays for memory efficiency.

### `GridScan.tsx`
- **Purpose**: 3D perspective scanning grid with sci-fi aesthetics (lasers, bloom, aberration).
- **Implementation**: Uses `THREE.js` and `postprocessing` library for glowing/glitch effects.
- **Features**: Supports mouse, gyro (mobile), and webcam facial tracking (via `face-api.js`) to tilt the grid. Features animated scanning beams on click.

### `Hero3DHub.tsx`
- **Purpose**: 3D interactive hero graphic with a glowing crystal, orbital rings, and floating HUD cards.
- **Implementation**: Directly utilizes `THREE.js`.
- **Features**: Interactive parallax based on mouse movement. Includes three floating HTML cards ("SVIET Telemetry Core", "Lab SLA Monitor", "Thinkspace Lab") overlaid on the canvas. Supports a light-mode theme override (`[data-theme="light"]`).

### `StarBorder.tsx`
- **Purpose**: Reusable wrapper component for applying a glowing "shooting star" border effect.
- **Implementation**: Uses a highly polymorphic component (defaults to `<button>`) with CSS animations and radial gradients.
- **Features**: Uses rotating gradients hidden behind the inner content with `overflow: hidden` to create dynamic glowing borders.
