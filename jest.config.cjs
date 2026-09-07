const nextJest = require("next/jest");

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://user:password@127.0.0.1:5432/db?schema=techstories";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "secret";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
process.env.SKIP_ENV_VALIDATION = "true";

const createJestConfig = nextJest({
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$":
      "<rootDir>/__mocks__/file-mock.js",
  },
  moduleDirectories: ["node_modules", "src"],
  transformIgnorePatterns: ["/node_modules/(?!remark-gfm).+\\.js$"],
  testMatch: ["<rootDir>/src/__tests__/**/*.(test|spec).{ts,tsx}"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/cypress/",
    "<rootDir>/broken-tests/",
    "<rootDir>/src/__tests__/backups/",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
