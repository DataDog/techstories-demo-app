# TechStories - a demo app for Datadog Training

This application is used to demonstrate and teach [Datadog](https://www.datadoghq.com/) features through labs and workshops at the [Datadog Learning Center](https://learn.datadoghq.com/).

## What is TechStories?

TechStories is a simple web application that allows users to post stories about technology. Users can also comment on stories and upvote stories and comments. The application is written using Next.js and uses a PostgreSQL database to store data. It also uses a Node.js microservice to serve inspirational quotes.

### Technology Stack

- [Next.js](https://nextjs.org/)
  - [React](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com)
  - [Prisma](https://www.prisma.io/)
  - [Cypress](https://www.cypress.io/)
  - [Jest](https://jestjs.io/)

- [PostgreSQL](https://www.postgresql.org/)

- [Node.js](https://nodejs.org/en/)
  - [Express](https://expressjs.com/)

## How do I run TechStories?

TechStories is designed to be run directly on the host machine, as it was primarily built to demonstrate Datadog CI Test Visibility, but its other services can be run in containers using Docker Compose.

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

## How do I run the tests?

TechStories uses [Cypress](https://www.cypress.io/) for end-to-end testing and [Jest](https://jestjs.io/) for unit testing.

### End-to-end tests

To run the end-to-end tests, use the following command:

```bash
npm run e2e
# or
npm run e2e:headless # Run in headless mode
```

To run the tests for Datadog CI Test Visibility, use the following command:

```bash
npm run dd-e2e
```

### Unit tests

To run the unit tests, use the following command:

```bash
npm run test
```

To run the tests for Datadog CI Test Visibility, use the following command:

```bash
npm run dd-test
```

