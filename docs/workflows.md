# User Workflows & Roles

Unicare implements strict Role-Based Access Control (RBAC). The system adapts its interface and capabilities based on the authenticated user's role.

## 1. Student / Faculty Workflow
**Goal:** Quickly report infrastructure problems with zero friction.
- **Reporting:** A student encounters a broken projector. They scan the QR code attached to it using their mobile device.
- **Submission:** The web app opens the `/report` route, pre-filling the Asset ID. The student uploads a photo and describes the issue.
- **Tracking:** Using the `/student` dashboard, they can view the status of their reported issues, seeing when it transitions from `Open` to `Resolved`.

## 2. Technician Workflow
**Goal:** Efficiently manage assigned maintenance tasks and procure necessary parts.
- **Alerting:** Technicians receive a Web Push notification when a new `Incident` is generated in their specialty.
- **Triage:** Visiting the `/technician` queue, they review and "Claim" the ticket, changing its state to `In Progress`.
- **Requisition:** If the projector needs a new bulb, the technician navigates to `/inventory` and files a `RequisitionRequest` for the item.
- **Resolution:** Once parts are acquired and the fix is complete, the technician adds notes/photos to the ticket's activity stream and marks it `Resolved`. The technician earns `carePoints` for their profile.

## 3. Administrator Workflow
**Goal:** Oversee operations, manage assets, and ensure SLAs are met.
- **Oversight:** Admins utilize the `/dashboard` and `/issues` kanban boards to view all campus incidents. They can manually override assignments if needed.
- **Inventory Approval:** Admins review pending `RequisitionRequests` from technicians, Approving or Rejecting them based on current stock levels.
- **Asset Management:** Admins maintain the registry of equipment, generating and printing new SVG QR tags for newly acquired assets.
- **Analytics:** Using the `/analytics` dashboard, Admins review system uptime, average time-to-resolution, and identify recurring hardware failures to plan preventive maintenance.
