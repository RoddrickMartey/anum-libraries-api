# Anum Libraries — Backend API

Anum Libraries Management System — REST API server built with Node.js and TypeScript.

---

## Overview

This is the single API server for TLMS. It serves two completely isolated route trees:

| Route Prefix | Purpose | Who uses it |
|---|---|---|
| `/api/v1/` | Branch operations | All branch staff |
| `/api/v1/network/` | Network admin | SUPER_ADMIN only |

Both share the same Node.js process, Prisma client, and PostgreSQL database. They do **not** share middleware, controllers, or services. A SUPER_ADMIN token is rejected on branch routes and vice versa.

---

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (access token) + refresh token (httpOnly cookie)
- **Validation**: Zod
- **Job Queue**: BullMQ + Redis (notifications)
- **Logging**: Winston
- **Testing**: Jest + Supertest

---

## Prerequisites

- Node.js >= 20 LTS
- PostgreSQL >= 15
- Redis >= 7 (for notification job queue)
- npm or yarn

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/anum-libraries-api.git
cd anum-libraries-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables)).

### 3. Set up the database

```bash
# Run migrations
npx prisma migrate deploy

# (Optional) Seed with initial super admin account
npm run seed
```

### 4. Start the development server

```bash
npm run dev
```

Server runs at `http://localhost:3000` by default.

---

## Project Structure

```
/src
  app.ts                    # App setup — mounts both routers
  server.ts                 # Entry point — starts HTTP server

  /config
    env.ts                  # Typed env vars via envalid
    constants.ts            # System-wide constants (default loan rules, etc.)

  /shared
    /types                  # Re-exported Prisma types + custom interfaces
    /utils                  # Shared utilities (dates, pagination, error helpers)
    prisma.ts               # Prisma client singleton

  /network                  # Super admin module (self-contained)
    /middleware
      networkAuth.ts        # Validates JWT, asserts role === SUPER_ADMIN
    /routes
      branches.ts
      networkBans.ts
      networkAudit.ts
    /controllers/
    /services/

  /branch                   # Branch operations module
    /middleware
      branchAuth.ts         # Validates JWT, extracts branchId, rejects SUPER_ADMIN
      requireRole.ts        # Role-level guard for individual routes
    /routes
      auth.ts
      staff.ts
      books.ts
      copies.ts
      members.ts
      loans.ts
      reservations.ts
      fines.ts
      bans.ts
      audit.ts
    /controllers/
    /services/
    /validators/            # Zod schemas per resource

  /jobs
    /workers
      notificationWorker.ts
    /queues
      notificationQueue.ts
```

---

## Environment Variables

Copy `.env.example` and fill in all values before running.

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/anum_libraries

# Auth
JWT_SECRET=your-access-token-secret-minimum-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-different-from-above
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Redis (for notification job queue)
REDIS_URL=redis://localhost:6379

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@anum-libraries.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@anum-libraries.com

# CORS (comma-separated allowed origins)
CORS_ORIGINS=http://localhost:5173,https://app.anum-libraries.com,https://network.anum-libraries.com
```

---

## Available Scripts

```bash
npm run dev          # Start dev server with hot reload (tsx watch)
npm run build        # Compile TypeScript to /dist
npm run start        # Run compiled production build
npm run test         # Run all tests (Jest)
npm run test:watch   # Run tests in watch mode
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run migrate      # Run Prisma migrations (production)
npm run migrate:dev  # Run and generate Prisma migrations (development)
npm run seed         # Seed initial super admin account
npm run studio       # Open Prisma Studio (database browser)
```

---

## Authentication

### Login

```
POST /api/v1/auth/login
{ "email": "staff@library.com", "password": "..." }
```

Returns:
- `accessToken` in response body (use as `Authorization: Bearer <token>`)
- `refreshToken` as an `httpOnly` cookie

### Token Refresh

```
POST /api/v1/auth/refresh
```

Reads the `refreshToken` cookie and returns a new `accessToken`.

### Token Payload

```typescript
interface JwtPayload {
  staffId: string;
  branchId: string | null;  // null for SUPER_ADMIN
  role: Role;
  iat: number;
  exp: number;
}
```

---

## Middleware Architecture

### Branch routes (`/api/v1/*`)

```
Request → branchAuthMiddleware → requireRole(minRole) → controller
```

`branchAuthMiddleware` validates the JWT and attaches `req.staff` (staffId, branchId, role). It **rejects** any token where `branchId` is null (i.e. SUPER_ADMIN tokens). All service-layer DB calls are then automatically scoped to that `branchId`.

### Network routes (`/api/v1/network/*`)

```
Request → networkAuthMiddleware → controller
```

`networkAuthMiddleware` validates the JWT and asserts `role === SUPER_ADMIN`. Any other role receives a `403 BRANCH_TOKEN_NETWORK_ACCESS` error. No further role check is needed — all network routes require SUPER_ADMIN.

---

## API Overview

Full API reference is in the technical documentation. Summary:

**Branch routes** — Auth, Staff, Books, Copies, Members, Loans, Reservations, Fines, Bans, Audit

**Network routes** — Branch management, Network bans, Network audit log

---

## Error Format

All errors follow this shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

Common codes: `MEMBER_SUSPENDED`, `COPY_UNAVAILABLE`, `LOAN_LIMIT_REACHED`, `INSUFFICIENT_ROLE`, `SUPER_ADMIN_BRANCH_ACCESS`, `BRANCH_TOKEN_NETWORK_ACCESS`

---

## Database

Managed with Prisma. Schema at `/prisma/schema.prisma`.

Every tenant-scoped table has a `branchId` column. The `AuditLog` table is append-only — records are never updated or deleted.

```bash
# View/edit data in browser
npm run studio

# Create a new migration after schema changes
npm run migrate:dev -- --name describe_your_change

# Apply migrations on production
npm run migrate
```

---

## Testing

```bash
npm run test                        # All tests
npm run test -- --testPathPattern=loans  # Specific module
npm run test -- --coverage          # With coverage report
```

Tests use a separate test database. Set `DATABASE_URL` in `.env.test`.

---

## Security Notes

- `branchId` is **always** taken from the validated JWT — never from the request body
- Passwords hashed with bcrypt (12+ rounds) — `passwordHash` is never returned in API responses
- Refresh tokens stored as hashed values in the database
- Login is rate-limited: 5 attempts per 15 minutes per IP
- All inputs validated with Zod before business logic runs
- CORS restricted to known frontend origins

---

## Deployment

```bash
npm run build
npm run migrate     # Apply any pending migrations
npm run start
```

Use a process manager (PM2, systemd) for production. Ensure PostgreSQL and Redis are running and accessible.
