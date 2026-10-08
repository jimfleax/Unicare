# Phase 1: Backend Foundation (TDD): Initialize Express/TS, port jest.config.js and tests/setup.ts for DB teardown, setup app.ts for Supertest.

## Context
- The backend is currently in vanilla JS (`server.js`, `package.json` with `"type": "module"`).
- We need to initialize TypeScript (`tsconfig.json`), create `src/app.ts` (with express setup and exports) and `src/server.ts` (for `app.listen`).
- We need to install `jest`, `ts-jest`, `supertest`, `typescript`, `@types/express`, `@types/jest`, `@types/supertest`, etc.
- We need to create `jest.config.js` and `tests/setup.ts` for isolated DB testing (usually via `mongodb-memory-server` or dedicated test DB connection handling).

## Dependency Map
- `package.json` → installs new TS/Jest tools.
- `src/app.ts` → exports the configured Express app.
- `src/server.ts` → imports `app` and binds to PORT.

## Proposed Changes

### Backend Setup

#### [MODIFY] /run/media/jimfleax/DEV/Projects/Unique-Care/uniquecare/backend/package.json
- What: Add `typescript`, `ts-node`, `jest`, `ts-jest`, `supertest`, `mongodb-memory-server`, and `@types/*` devDependencies. Update `main` to `dist/server.js` and add `build` and `test` scripts.
- Why: Fundamental requirement for TS compilation and TDD testing.

#### [NEW] /run/media/jimfleax/DEV/Projects/Unique-Care/uniquecare/backend/tsconfig.json
- What: TypeScript configuration (strict, outDir, module, etc.).
- Why: Required for TS.

#### [NEW] /run/media/jimfleax/DEV/Projects/Unique-Care/uniquecare/backend/jest.config.js
- What: Configure Jest to use `ts-jest`, `testEnvironment: "node"`, and specify `setupFilesAfterEnv`.
- Why: Required to compile TS tests and set up the DB before tests run.

#### [NEW] /run/media/jimfleax/DEV/Projects/Unique-Care/uniquecare/backend/tests/setup.ts
- What: Database setup/teardown using `mongodb-memory-server`. `beforeAll` starts in-memory mongo, `afterAll` disconnects, `afterEach` clears collections.
- Why: TDD requires clean, isolated database states per test.

#### [NEW] /run/media/jimfleax/DEV/Projects/Unique-Care/uniquecare/backend/src/app.ts
- What: Create the Express `app` instance without `app.listen()`. Port over the existing middlewares from `server.js`, but typed with TS.
- Why: Separation of app instantiation and server listening allows Supertest to bind the app dynamically for testing.

#### [NEW] /run/media/jimfleax/DEV/Projects/Unique-Care/uniquecare/backend/src/server.ts
- What: Import `app` and start the server.
- Why: Entry point for `npm start`.

#### [DELETE] /run/media/jimfleax/DEV/Projects/Unique-Care/uniquecare/backend/src/server.js
- What: Delete old JS entrypoint.
- Why: Replaced by TS.

## DRY Context
- None available yet.

## Risks & Edge Cases
- Breaking existing Vercel deployment if `api/index.js` relies on `src/server.js`.
- Make sure `tsconfig.json` handles ESM or CommonJS properly (since `package.json` had `"type": "module"`). We might want to remove `"type": "module"` or set TS to output ESM/CommonJS accordingly to make Jest simpler.
