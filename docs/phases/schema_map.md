# Database Schema Map

## Entity Relationship Overview
- Incident -> references Asset (assetId)
- Incident -> references User (reportedBy)
- Incident -> references User (assignedTo)
- Incident.activityLogs -> references User (createdBy)

## Models Scaffolded
| Model | File | Fields | References | Status Enum |
|-------|------|--------|------------|-------------|
| User  | backend/src/models/User.ts | name, email, password, role, carePoints | — | role: student, technician, admin |
| Asset | backend/src/models/Asset.ts | tagId, name, healthStatus | — | healthStatus: healthy, degraded, broken |
| Incident | backend/src/models/Incident.ts | assetId, reportedBy, assignedTo, status, description, mediaUrls, activityLogs | Asset, User | Open, In Progress, Resolved |

## Cascade Rules
- No explicit cascade rules defined in PRD.
