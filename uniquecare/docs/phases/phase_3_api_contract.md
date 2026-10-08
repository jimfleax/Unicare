# API Contract: Phase 3

## POST /api/auth/google
- Auth required: No
- Request body: { token: string (required, Google OAuth token) }
- Success: 200 { status: 'success', data: { user: { _id: string, name: string, email: string, role: string }, token: string } }
- Errors: 400 (validation), 401 (invalid token), 500 (server error)

## POST /api/auth/login
- Auth required: No
- Request body: { email: string (required), password: string (required) }
- Success: 200 { status: 'success', data: { user: { _id: string, name: string, email: string, role: string }, token: string } }
- Errors: 400 (validation), 401 (invalid credentials), 500 (server error)

## GET /api/auth/me
- Auth required: Yes
- Request body: None
- Success: 200 { status: 'success', data: { user: { _id: string, name: string, email: string, role: string } } }
- Errors: 401 (unauthorized)
