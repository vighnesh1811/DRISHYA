# DRISHYA

DRISHYA is a camera equipment rental and management system. The application is split into a Vite/React frontend, an Express API, and a MySQL database.

## Local development setup

1. Install Node.js 20 or newer and MySQL 8.
2. Copy `Backend/.env.example` to `Backend/.env` and set database credentials.
3. Run `Database/schema.sql`, then optionally `Database/seed_demo.sql` in MySQL.
4. Install and start the API:

   ```powershell
   cd Backend
   npm install
   npm run dev
   ```

5. In another terminal, install and start the frontend:

   ```powershell
   cd Frontend
   npm install
   npm run dev
   ```

The API health check is available at `http://localhost:5000/api/health`.

To create or reset the first administrator, set `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` in `Backend/.env`, then run `npm run create-admin` from `Backend`. There is intentionally no public administrator registration route.

## Production checklist

Before deployment:

1. Create a production `Backend/.env` outside source control with a long random `JWT_SECRET`, least-privilege MySQL credentials, and the production frontend origin.
2. Apply `Database/schema.sql`, then `Database/phase4-migration.sql` and `Database/phase5-migration.sql` when upgrading an existing installation.
3. Run `npm ci` and `npm run build` in `Frontend`.
4. Run `npm ci` and `npm start` in `Backend`.
5. Create the initial administrator with `npm run create-admin` from `Backend`.
6. Verify `GET /api/health`, then run `npm run test:validation` and `npm run test:e2e` against the deployed frontend.
7. Configure HTTPS at the reverse proxy so authentication cookies remain secure in production.

## Current scope

Phases 1–8 provide the project foundation, authentication, equipment catalog, booking workflow, admin operations, customer/admin pages, premium UI, and cinematic animation pass. Phase 9 completes the production hardening pass with accessibility semantics, an application error boundary, lazy image loading, local admin image uploads, production metadata, API hardening, dependency audits, and build/browser verification. The configured MySQL instance has been verified for health, catalog, admin login, units, and overview endpoints; the remaining end-to-end booking and rental-operation flows should still be exercised manually before production release. See [runtime-validation-report.md](./runtime-validation-report.md) for validation evidence and gaps.
