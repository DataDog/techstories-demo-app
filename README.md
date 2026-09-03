# TechStories - a demo app for Datadog Training

This application is used to demonstrate and teach [Datadog](https://www.datadoghq.com/) features through labs and workshops at the [Datadog Learning Center](https://learn.datadoghq.com/).

## What is TechStories?

TechStories is a simple web application that allows users to post stories about technology. Users can also comment on stories and upvote stories and comments. The application is written using Next.js and uses a PostgreSQL database to store data. It also uses a Node.js microservice to serve inspirational quotes.

### Technology used

- [T3 Stack](https://create.t3.gg/)
  - [Next.js](https://nextjs.org/)
  - [React](https://reactjs.org/)
  - [TRPC](https://trpc.io/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com)
  - [Prisma](https://www.prisma.io/)
  - [Cypress](https://www.cypress.io/)
  - [Jest](https://jestjs.io/)
  - [NextAuth.js](https://next-auth.js.org/)
  - [bcrypt](https://www.npmjs.com/package/bcrypt)

- [PostgreSQL](https://www.postgresql.org/)

- [Node.js](https://nodejs.org/en/)
  - [Express](https://expressjs.com/)

### Datadog features used

**Frontend Service**

- CI Test Optimization
- RUM
- APM

### Authentication Implementation

The application uses NextAuth.js with a Credentials provider for authentication:
- Password-based authentication with bcrypt hashing
- JWT session strategy with 2-day expiration
- Secure password validation and error handling
- Sign-in and sign-up flows with form validation
- Protected routes and API endpoints

### Testing Strategy

The application includes comprehensive test coverage:

#### Unit Tests

- Component testing for auth forms
  - Form field validation
  - Password matching
  - Error handling
  - Submission flows

#### Integration Tests

Includes intentionally flaky tests to simulate real-world scenarios:

- Concurrent registration attempts (race conditions)
- Database timeout simulation
- Network latency effects
- Session state race conditions

These tests help identify potential issues in production environments.

## How do I run TechStories?

TechStories is designed to be run directly on the host machine, as it was primarily built to demonstrate Datadog CI Test Optimization, but its other services can be run in containers using Docker Compose.

Use the following steps to run TechStories:

1. Clone this repository to your local machine.

1. Set your environment variables by copying the `.env.example` file to `.env` and filling in the values.

1. Install the dependencies for the Next.js application:

  ```bash
  cd techstories-demo-app
  npm install
  ```

1. Spin up the PostgreSQL database and Node.js microservice using Docker Compose:

  ```bash
  docker compose up -d
  ```

1. Prepare and seed the database:

  ```bash
  npm run db-prep
  ```

1. Start the Next.js application:

  ```bash
  npm run dev
  ```

1. Navigate to http://localhost:3000 to view the application.

If you want to build the application for production, use the following command:

```bash
npm run build
```

Then run the production build using the following command:

```bash
npm run start
```

## Enable SSL/TLS

TechStories serves HTTP on port 3000 by default. For Instruqt labs exposed via external ingress (`*.instruqt.io`), a `service-proxy` nginx container terminates TLS. The hybrid workflow is unchanged: Docker Compose runs supporting services plus the proxy; the Next.js app still runs on the host with `npm run dev` or `npm run start`.

See [services/nginx/README.md](services/nginx/README.md) for proxy configuration details.

### When SSL is required

| Access path | SSL in app? |
|-------------|-------------|
| Local development (`http://localhost:3000`) | No — default |
| Instruqt learner proxy (`*.env.play.instruqt.com`) | No — Instruqt terminates HTTPS |
| Instruqt external ingress (`*.instruqt.io`) | Yes — set `ENABLE_SSL=true` |
| AWS + ALB (intro-to-monitoring-aws) | Yes — lab-host proxy only (see below) |

GCP Cloud Run / GCE deployments use cloud load balancer TLS, not this feature.

### Hybrid VM / Instruqt (primary)

1. Ensure the lab `config.yml` has `provision_ssl_certificate: true` and `allow_external_ingress: [https]`.

1. Set environment variables (host `.env` or lab setup script):

   ```bash
   ENABLE_SSL=true
   NEXTAUTH_URL="https://lab-host.${_SANDBOX_ID}.instruqt.io"
   NEXT_PUBLIC_QUOTES_API_URL="${NEXTAUTH_URL}/services/quotes"
   ```

1. Start supporting services (includes `service-proxy`):

   ```bash
   docker compose up -d
   ```

1. Start the app on the host as usual:

   ```bash
   npm run db-prep   # if needed
   npm run dev
   ```

1. Open `https://lab-host.${_SANDBOX_ID}.instruqt.io`.

> [!IMPORTANT]
> When `ENABLE_SSL=true`, the proxy looks for certs at `./certs/cert.pem` and `./certs/key.pem`. If not mounted, it downloads them from GCP instance metadata (Instruqt-provisioned). For local testing, generate self-signed certs — see [Local SSL testing](#local-ssl-testing).

### Optional traffic generator

TechStories does not ship a traffic generator in this repo. AWS-focused learning-center labs use the optional container image `techstories-aws-traffic-generator` (see [introduction-to-monitoring-aws](https://github.com/DataDog/learning-center/tree/main/courses/introduction-to-monitoring-aws)).

Set `TECHSTORIES_URL` to the same HTTPS URL as `NEXTAUTH_URL` — the public lab-host hostname through `service-proxy`, not the host app or ALB directly:

| Do not use | Use instead |
|------------|-------------|
| `http://localhost:3000` | `https://lab-host.${_SANDBOX_ID}.instruqt.io` |
| `http://your-alb-dns-name.elb.amazonaws.com` (AWS labs) | `https://lab-host.${_SANDBOX_ID}.instruqt.io` |

Hybrid or AWS lab-host example:

```bash
export TECHSTORIES_PUBLIC_URL="https://lab-host.${_SANDBOX_ID}.instruqt.io"

docker run -d \
  --name techstories-traffic-generator \
  -e TECHSTORIES_URL="$TECHSTORIES_PUBLIC_URL" \
  europe-west1-docker.pkg.dev/datadog-community/training-images-docker/techstories-aws-traffic-generator:1.0.0
```

When `NEXTAUTH_URL` is HTTPS, the app sets Secure session cookies. Traffic sent to plain HTTP (localhost or the ALB) will not authenticate correctly. Cypress and other headless clients follow the same rule.

Lab author notes: [deploy/instruqt/README.md](deploy/instruqt/README.md#optional-traffic-generator).

### AWS + ALB (lab-host proxy)

TechStories runs on AWS behind an ALB (HTTP). TLS terminates on the GCP lab-host using `service-proxy` in external mode:

```yaml
environment:
  - ENABLE_SSL=true
  - PROXY_MODE=external
  - TECHSTORIES_UPSTREAM=http://your-alb-dns-name.elb.amazonaws.com
  - EXTERNAL_HOST=your-alb-dns-name.elb.amazonaws.com
```

CloudFormation must set `NEXTAUTH_URL` / `PublicAppUrl` to `https://lab-host.${_SANDBOX_ID}.instruqt.io`. Point the optional traffic generator at that same URL — see [Optional traffic generator](#optional-traffic-generator).

ECS Fargate + ALB uses the same TLS model; only the AWS stack differs.

Lab author integration notes: [deploy/instruqt/README.md](deploy/instruqt/README.md).

### Local SSL testing

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/key.pem -out certs/cert.pem -days 365 \
  -subj "/CN=localhost"

ENABLE_SSL=true docker compose up -d --build service-proxy
npm run dev
```

Visit `https://localhost` (accept the self-signed certificate warning).

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_SSL` | `false` | Exact `true` enables HTTPS on port 443 |
| `PROXY_MODE` | `hybrid` | `hybrid` or `external` (AWS ALB) |
| `TECHSTORIES_UPSTREAM` | `host.docker.internal:3000` | Host app or ALB URL |
| `QUOTES_UPSTREAM` | `quotes_api:3001` | Quotes API (hybrid only) |
| `EXTERNAL_HOST` | _(empty)_ | Host header for external mode |
| `NEXTAUTH_URL` | `http://localhost:3000` | Must match public HTTPS URL in SSL labs |
| `NEXT_PUBLIC_QUOTES_API_URL` | `http://localhost:3001` | Use `${NEXTAUTH_URL}/services/quotes` behind SSL |
| `TECHSTORIES_URL` | _(n/a)_ | Optional traffic generator only: set to `https://lab-host.${_SANDBOX_ID}.instruqt.io` (same as `NEXTAUTH_URL`) |

### How do I run the tests?

TechStories uses [Cypress](https://www.cypress.io/) for end-to-end testing and [Jest](https://jestjs.io/) for unit testing.

#### End-to-end tests

To run the end-to-end tests, use the following command:

```bash
npm run e2e
# or
npm run e2e:headless # Run in headless mode
```

To run the tests for Datadog CI Test Optimization, use the following command:

```bash
npm run dd-e2e
```

#### Unit tests

To run the unit tests, use the following command:

```bash
npm run test
```

To run the tests for Datadog CI Test Optimization, use the following command:

```bash
npm run dd-test
```

#### Broken/Flaky Tests for Training

The `broken-tests/` directory contains intentionally broken or flaky tests designed for Datadog CI Test Optimization demonstrations. These tests are separated from the main test suite to prevent CI/CD failures.

**Using the test swap script:**

```bash
# List available broken tests
./broken-tests/swap-tests.sh list

# Break a test (replaces working version with broken one)
./broken-tests/swap-tests.sh integration/post-comment.test.ts break

# Fix a test (restores working version from backup)
./broken-tests/swap-tests.sh integration/post-comment.test.ts fix

# Create a backup of current test
./broken-tests/swap-tests.sh components/Header.test.tsx backup
```

See `broken-tests/README.md` for detailed information about each broken test and their intended demonstration purposes.

## User stories

Use the following user stories to learn about the features of TechStories:

### As a user, I want to be able to view stories posted by other users.

1. Navigate to http://localhost:3000.

1. On the home page, you should see a list of stories that have been posted by other users. Each story should display the title, author, date, and number of votes and comments.

1. Click on a story to view the story's contents, comments, and upvote button.

### As a logged-in user, I want to be able to post a story.

1. Navigate to http://localhost:3000.

1. Click the "Sign in" button in the top right corner of the page.

1. Use the following credentials to log in:

  - Username: `alice.smith@example.com`
  - Password: `redRose456`

1. Click the "+ New Post" button in the top right corner of the page.

1. Enter a title and contents for your story, then click the "Submit" button. You can use Markdown.

1. You should be redirected to the home page, where you should see your story at the top of the list.

You can also register a new account:

1. Click "Sign in" and then "Sign up" to create a new account
2. Fill in your email, name, and password
3. After successful registration, you'll be automatically signed in

### As a logged-in user, I want to be able to vote on a story.

1. Navigate to http://localhost:3000.

1. Use the credentials from the previous user story to log in.

1. Click on a story to view the story's contents, comments, and upvote button.

1. Click the upvote button. The number of votes should increase by one.

### As a logged-in user, I want to be able to comment on a story.

1. Navigate to http://localhost:3000.

1. Use the credentials from the previous user story to log in.

1. Click on a story to view the story's contents, comments, and upvote button.

1. Scroll to the bottom of the page and enter a comment in the text box.

1. Click the "Submit" button. Your comment should appear at the bottom of the list of comments.

### As a user, I want to be able to view inspirational tech quotes.

1. Navigate to http://localhost:3000.

1. Scroll to the top of the page. You should see an inspirational quote.

1. Click the "Get a New Quote" button. A new quote should appear.

> [!NOTE]
> This will sometimes lag or fail due to the microservice being slow or down. This is intentional.

## Folder structure

The TechStories repository is organized as follows:

- `broken-tests` - Contains intentionally broken/flaky tests for Datadog CI Test Optimization training labs. Includes a swap script to easily switch between working and broken test versions.

- `cypress` - Contains the end-to-end tests for the application and any supporting files. The actual tests are in the `cypress/e2e` folder.

- `prisma` - Contains the Prisma schema and migrations for the application, along with the seed data and a script to seed the database.

  Use the `schema.prisma` file to better understand the relationships between the tables in the database.

- `public` - Contains the public assets for the application, such as images and fonts.

- `services` - Contains supporting microservices and the optional nginx `service-proxy` for Instruqt SSL.
  - `nginx` - Reverse proxy with optional `ENABLE_SSL` TLS termination. See [services/nginx/README.md](services/nginx/README.md).
  - `quotes_api` - Node.js microservice that serves inspirational quotes.

- `src` - Contains the source code for the Next.js application.
  - `__tests__` - Contains the tests for the application.
  - `components` - Contains the React components for the application's UI and functionality.
  - `hooks` - Contains the logic for some of the functionality utilized by the components.
  - `layouts` - Contains the React components for the application's layouts.
  - `pages` - Contains the Next.js pages and API routes for the application.
    - `api` - Contains the API routes for the application (accessible through `/api`).
    - `auth` - Contains the pages for the authentication flow (accessible through `/auth`).
    - `posts` - Contains the pages for viewing and creating posts (accessible through `/posts`).
    - `_app.tsx` - Contains the Next.js application component. This is where RUM is initialized.
    - `index.tsx` - Contains the home page for the application (accessible through `/`).
  - `server` - Contains the server-side code for the application. There's a lot of TRPC boilerplate here, along with the code for the Prisma client. 
  - `styles` - Contains the Tailwind CSS and custom CSS styles for the application.
  - `types` - Contains the TypeScript types for the application.
  - `utils` - Contains utility functions for the application.

