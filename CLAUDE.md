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
- **Framework**: Next.js 13 with React 18, using T3 Stack patterns
- **API Layer**: tRPC for type-safe API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider and bcrypt
- **Styling**: Tailwind CSS
- **Testing**: Jest for unit/integration, Cypress for E2E
- **Monitoring**: Datadog APM, RUM, and CI Test Optimization

### Project Structure
- `broken-tests/` - Intentionally flaky tests for CI Test Optimization demos
- `src/server/api/` - tRPC routers and API logic
- `src/server/auth.ts` - NextAuth configuration
- `src/pages/api/` - Next.js API routes and tRPC/auth handlers
- `src/components/` - React components with auth forms and UI elements
- `prisma/` - Database schema, migrations, and seed scripts
- `services/` - Microservice for inspirational quotes (Node.js/Express)

### Key Patterns

#### Authentication Flow
- NextAuth.js handles session management with JWT strategy
- Credentials provider validates against database users
- Protected routes use `getServerAuthSession` helper
- API endpoints secured via tRPC middleware

#### tRPC Integration
- Router definitions in `src/server/api/routers/`
- Root router aggregates all sub-routers
- Client-side hooks via `@trpc/react-query`
- Type safety maintained across client-server boundary

#### Database Access
- Prisma client singleton pattern in `src/server/db.ts`
- Schema defines User, Story, Comment, Vote models
- Relationships handled via Prisma relations

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

Start services: `docker compose up -d`

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth encryption key
- `NEXTAUTH_URL` - Application URL
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