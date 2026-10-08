# Phase 3: Authentication & Security

## Context
- `authController.ts` and `authMiddleware.ts` already partially exist but need to be aligned with the API Contract and PRD (e.g., Google OAuth route).
- JWT logic should be moved to an `authService.ts`.
- Tests are missing and need to be added to `backend/tests/auth.test.ts`.

## Dependency Map
- `routes/authRoutes.ts` → imports → `controllers/authController.ts`
- `controllers/authController.ts` → imports → `services/authService.ts`
- `middleware/authMiddleware.ts` → imports → `services/authService.ts`

## Proposed Changes

### Auth Service

#### [NEW] backend/src/services/authService.ts
- What: Extract JWT generation and verification logic here.
- Why: Separation of concerns as requested by PRD.
- Impact: Controllers and middleware will import this.

### Auth Controller

#### [MODIFY] backend/src/controllers/authController.ts
- What: Import `generateToken` from `authService`. Implement `googleLogin` logic (verify token, create/find user). Update response format to match API contract. Ensure `AppError` and `catchAsync` are used.
- Why: Fulfill PRD requirement for Student Google OAuth. Fix error handling.
- Impact: `authRoutes.ts`.

### Auth Routes

#### [MODIFY] backend/src/routes/authRoutes.ts
- What: Add `POST /google` route mapping to `googleLogin`.
- Why: Fulfill PRD requirement.
- Impact: App router.

### Auth Middleware

#### [MODIFY] backend/src/middleware/authMiddleware.ts
- What: Use `authService` for JWT verification. Use `AppError` and `catchAsync`.
- Why: Standardization.
- Impact: Protected routes.

### Tests

#### [NEW] backend/tests/auth.test.ts
- What: Implement Jest tests for register, login, google login, and me endpoints.
- Why: Verification gate.
- Impact: None.

## DRY Context
- Use `catchAsync` and `AppError` for error handling if available in project.

## Risks & Edge Cases
- Test coverage must reach 100%. Open DB handles might hang Jest.
