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
- CI Test Visibility
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
  * Form field validation
  * Password matching
  * Error handling
  * Submission flows

#### Integration Tests
Includes intentionally flaky tests to simulate real-world scenarios:
- Concurrent registration attempts (race conditions)
- Database timeout simulation
- Network latency effects
- Session state race conditions

These tests help identify potential issues in production environments.

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

### How do I run the tests?

TechStories uses [Cypress](https://www.cypress.io/) for end-to-end testing and [Jest](https://jestjs.io/) for unit testing.

#### End-to-end tests

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

#### Unit tests

To run the unit tests, use the following command:

```bash
npm run test
```

To run the tests for Datadog CI Test Visibility, use the following command:

```bash
npm run dd-test
```

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

> **Note**: This will sometimes lag or fail due to the microservice being slow or down. This is intentional.

## Folder structure

The TechStories repository is organized as follows:

- `cypress` - Contains the end-to-end tests for the application and any supporting files. The actual tests are in the `cypress/e2e` folder.

- `prisma` - Contains the Prisma schema and migrations for the application, along with the seed data and a script to seed the database.

  Use the `schema.prisma` file to better understand the relationships between the tables in the database.

- `public` - Contains the public assets for the application, such as images and fonts.

- `services` - Contains the Node.js microservice that serves inspirational quotes.

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

