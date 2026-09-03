# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TechStories is a Next.js application designed for Datadog training demonstrations. It's a simple web app where users can post tech stories, comment, and upvote. The app integrates with Datadog for CI Test Optimization, RUM, and APM monitoring.

## Key Commands

### Starting the Application
```bash
# Development mode
docker compose -f docker-compose.dev.yml up -d  # Start all services including app
# OR
docker compose up -d                            # Start supporting services only
npm run dev                                     # Then run app on host machine

# Production mode  
docker compose up -d                            # Start supporting services
npm run build                                   # Build the app
npm run start                                   # Start production server on host
```

### Database Setup
```bash
npm run db-prep           # Complete database setup (create + seed + generate)
npm run db-create         # Push schema to database
npm run db-seed           # Seed database with initial data
```

### Testing
```bash
# Unit Tests
npm run test              # Run Jest tests with increased memory
npm run test:watch        # Run tests in watch mode
npm run test:ci           # CI mode with coverage
npm run test:integration  # Run integration tests only
npm run test:components   # Run component tests only
npm run test:coverage     # Run tests with coverage report

# E2E Tests
npm run e2e               # Open Cypress UI
npm run e2e:headless      # Run Cypress headless
```

### Running a Single Test
```bash
# Jest single test file
npm test -- path/to/test.test.ts

# Jest single test suite
npm test -- --testNamePattern="test name"

# Cypress specific test
npx cypress run --spec "cypress/e2e/specific.cy.ts"
```

### Broken Tests for Training
The `broken-tests/` directory contains intentionally flaky tests for Datadog CI Test Optimization demos:

```bash
# List available broken tests
./broken-tests/swap-tests.sh list

# Replace working test with broken version (auto-creates backup)
./broken-tests/swap-tests.sh integration/post-comment.test.ts break

# Restore working test from backup
./broken-tests/swap-tests.sh integration/post-comment.test.ts fix

# Manually backup a test
./broken-tests/swap-tests.sh components/Header.test.tsx backup
```

**Note:** The `broken-tests/` and backup directories are excluded from Jest runs via `jest.config.cjs`.

## Architecture

### Tech Stack
- **Runtime**: Node.js 26 (see `.nvmrc`)
- **Framework**: Next.js 16 with React 19, using T3 Stack patterns (Pages Router)
- **API Layer**: tRPC 11 with TanStack React Query 5
- **Database**: PostgreSQL 18 with Prisma 7 (`prisma.config.ts`, `@prisma/adapter-pg`)
- **Authentication**: Auth.js v5 (`next-auth@5`) with credentials provider and bcrypt
- **Styling**: Tailwind CSS 4
- **Testing**: Jest 30 for unit/integration, Cypress 15 for E2E
- **Monitoring**: Datadog APM, RUM v7, and CI Test Optimization

### Project Structure
- `broken-tests/` - Intentionally flaky tests for CI Test Optimization demos
- `src/server/api/` - tRPC routers and API logic
- `src/server/auth.ts` - Auth.js v5 configuration (credentials provider)
- `src/server/auth.config.ts` - Edge-safe auth config for middleware
- `src/pages/api/` - Next.js API routes and tRPC/auth handlers
- `src/components/` - React components with auth forms and UI elements
- `prisma/` - Database schema, migrations, and seed scripts
- `services/` - Microservice for inspirational quotes (Node.js/Express)

### Key Patterns

#### Authentication Flow
- Auth.js v5 handles session management with JWT strategy
- Credentials provider validates against database users
- Protected routes use middleware with `authorized` callback (`src/middleware.ts`)
- tRPC context uses `auth()` from `~/server/auth`

#### tRPC Integration
- Router definitions in `src/server/api/routers/`
- Root router aggregates all sub-routers
- Client-side hooks via `@trpc/react-query`
- Type safety maintained across client-server boundary

#### Database Access
- Prisma 7 client with PostgreSQL driver adapter in `src/server/db.ts`
- Generated client output: `src/generated/prisma/`
- Config: `prisma.config.ts` (replaces `package.json#prisma`)

#### Testing Strategy
- Component tests for auth forms and UI validation
- Integration tests simulate real-world issues (race conditions, timeouts)
- E2E tests cover full user workflows
- Intentionally flaky tests help identify production issues

## Docker Services

The application uses Docker Compose for supporting services:
- **PostgreSQL**: Main database on port 5432
- **Datadog Agent**: Monitoring and APM collection
- **Quote Service**: Microservice for inspirational quotes
- **Service Proxy** (optional): nginx reverse proxy with `ENABLE_SSL` for Instruqt external ingress

Start services: `docker compose up -d`

Hybrid model: compose runs supporting services only; run `npm run dev` on the host. See [README.md — Enable SSL/TLS](README.md#enable-ssltls) for Instruqt HTTPS setup. Optional background traffic uses the external `techstories-aws-traffic-generator` image with `TECHSTORIES_URL=https://lab-host.${_SANDBOX_ID}.instruqt.io` (documented in [deploy/instruqt/README.md](deploy/instruqt/README.md#optional-traffic-generator)).

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth encryption key
- `NEXTAUTH_URL` - Application URL (must be HTTPS public URL in Instruqt SSL labs)
- `ENABLE_SSL` - Enables TLS on `service-proxy` (default `false`)
- `DD_API_KEY` - Datadog API key (for monitoring)

## Common Development Workflows

### Adding New API Endpoints
1. Create router in `src/server/api/routers/`
2. Add to root router in `src/server/api/root.ts`
3. Use via `api` object in components

### Modifying Database Schema
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev` for development
3. Run `npm run db-prep` to recreate and seed

### Running Tests Locally
1. Ensure database is running: `docker compose up -d db`
2. Set up test database: `npm run db-prep`
3. Run tests: `npm test` or `npm run e2e:headless`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
