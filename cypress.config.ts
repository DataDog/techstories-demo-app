import { loadEnvConfig } from "@next/env";
import { defineConfig } from "cypress";

const { combinedEnv } = loadEnvConfig(process.cwd());

export default defineConfig({
  env: combinedEnv,
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      require("dd-trace/ci/cypress/plugin")(on, config);
    },
    specPattern: "cypress/e2e/**/*.spec.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    retries: {
      runMode: 3,
    },
    viewportHeight: 1080,
    viewportWidth: 1920,
    video: false,
    screenshotOnRunFailure: false,
  },
});
