# Real-time Synchronization & Web Push Architecture

## Overview
Unique-Care relies on real-time awareness for the Technician Queue. When a student reports an issue via the QR scanner, Technicians must be alerted immediately. However, native WebSockets are not persistent in Vercel Serverless environments.

## The Hybrid Solution
We achieve "production-level" real-time sync using a hybrid of **SWR Polling** (for state consistency) and **VAPID Web Push** (for instant event signaling).

### 1. SWR Polling (The Baseline Guarantee)
The React frontend utilizes `swr` (or React Query) to fetch data.
*   **Behavior:** The Tech Dashboard polls the `/api/incidents?status=Open` endpoint every 15 seconds.
*   **Why:** It is completely stateless, zero-cost, and guarantees the UI eventually reaches a consistent state, entirely bypassing OS-level push notification limits (e.g., iOS Safari restrictions).

### 2. VAPID Web Push (The Instant Trigger)
To provide instant alerts (and immediate UI invalidation) without waiting for the 15-second polling interval, we use the browser's native Push API.

**Architecture:**
1.  **Subscription:** The React frontend registers a Service Worker. The user grants Notification permissions. The frontend sends the `PushSubscription` object to the backend, which stores it in the `User` document.
2.  **Trigger:** A Student POSTs a new incident to `/api/incidents`.
3.  **Broadcast:** The Vercel function (before terminating) queries the DB for all active Technicians. It uses the `web-push` npm library to send a tiny JSON payload to their respective `PushSubscription` endpoints (handled by Google/Apple/Mozilla).
4.  **Reception:** The Technician's Service Worker wakes up, receives the push, and does two things:
    *   Displays a system notification ("New Incident Reported!").
    *   Uses `Client.postMessage()` to tell the open React tab to instantly call `mutate('/api/incidents')`, refreshing the queue instantly.

## Advantages
*   **Zero Infrastructure Cost:** No need to pay for Pusher, Ably, or run a separate WebSocket server.
*   **Serverless Native:** HTTP POSTs from the backend to the push servers fit perfectly within Vercel's lambda lifecycle.
*   **Resilience:** If the user blocks notifications, the 15s SWR polling still ensures the app functions perfectly.
