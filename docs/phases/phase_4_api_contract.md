## POST /api/incidents
- Auth required: JWT required (Student, Technician, Admin)
- Request body: { assetId: ObjectId, description: string, mediaUrls: string[] }
- Success: 201 { status: string, data: { incident: { _id, assetId, reportedBy, status: "Open", description, mediaUrls, createdAt } } }
- Errors: 400 (validation), 401 (unauthorized), 404 (asset not found), 500 (server error)

## GET /api/incidents
- Auth required: JWT required (Student: own tickets, Tech/Admin: all tickets)
- Request body: none
- Success: 200 { status: string, data: { incidents: [ ... ] } }
- Errors: 401 (unauthorized), 500 (server error)

## GET /api/incidents/:id
- Auth required: JWT required
- Request body: none
- Success: 200 { status: string, data: { incident: { ... } } }
- Errors: 401, 404 (not found), 500

## PATCH /api/incidents/:id/status
- Auth required: JWT required (Technician, Admin)
- Request body: { status: "In Progress" | "Resolved" }
- Success: 200 { status: string, data: { incident: { ... } } }
- Errors: 400, 401, 403 (forbidden for Student), 404, 500

## POST /api/incidents/:id/activity
- Auth required: JWT required (Technician, Admin)
- Request body: { content: string }
- Success: 201 { status: string, data: { activityLog: { ... } } }
- Errors: 400, 401, 403, 404, 500

## GET /api/assets/:tagId
- Auth required: JWT required
- Request body: none
- Success: 200 { status: string, data: { asset: { _id, tagId, name, healthStatus } } }
- Errors: 401, 404, 500

## GET /api/analytics
- Auth required: JWT required (Admin only)
- Request body: none
- Success: 200 { status: string, data: { slaCompliance: number, mttr: number, ... } }
- Errors: 401, 403, 500

## POST /api/notifications/subscribe
- Auth required: JWT required (Technician)
- Request body: { subscription: object }
- Success: 200 { status: string, message: "Subscribed" }
- Errors: 400, 401, 403, 500
