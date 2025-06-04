import { defineConfig, devices } from "@playwright/test";
import path from "path";

const baseURL = "http://localhost:5173";
const webServerURL = "http://localhost:5173";
const startAppCommand = "npm run dev";
const testTimeout = 30 * 1000;
const expectedDuration = 5000;

export default defineConfig({
  testDir: "./tests",
  /* Maximum time one test can run for */
  timeout: testTimeout,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met
     */
    timeout: expectedDuration,
  },
  /* Specify where test artifacts like screenshots and traces will be stored */
  outputDir: path.join(process.cwd(), "test-results/artifacts"),
  /* Preserve output directory between test runs */
  preserveOutput: "always",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use */
  reporter: [
    [
      "html",
      { outputFolder: path.join(process.cwd(), "test-results/html-report") },
    ],
    ["list"],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: baseURL,

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Automatically capture screenshots on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for different browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: startAppCommand,
    url: webServerURL,
    reuseExistingServer: !process.env.CI,
  },
});
