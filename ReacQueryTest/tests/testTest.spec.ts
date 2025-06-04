import {
  test,
  expect,
  chromium,
  Browser,
  BrowserContext,
  Page,
} from "@playwright/test";
import fs from "fs/promises";
import { tests } from "./testFile";
import path from "path";

interface TestResult {
  test: string;
  status: "PASSED" | "FAILED";
  error?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

// Global variables to share state between tests and aggregate results
let sharedBrowser: Browser;
let sharedContext: BrowserContext;
let sharedPage: Page;
let testResults: TestResult[] = [];

const getCurrentDateTime = () => {
  const now = new Date();
  return now
    .toISOString()
    .replace(/:/g, "-") // Replace colons with dashes for valid filename
    .replace(/\..+/, "") // Remove milliseconds
    .replace("T", "_"); // Replace T with underscore for readability
};

// File logging configuration
const getLogFilePath = async () => {
  const fileName = `Test-Results-${getCurrentDateTime()}.log`;
  const resultsDir = path.resolve(process.cwd(), "test-logs"); // Use a different directory from Playwright's artifacts

  try {
    // Check if directory exists synchronously
    await fs.access(resultsDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(resultsDir, { recursive: true });
  }

  return path.join(resultsDir, fileName);
};

// We need to initialize this async
let LOG_FILE: string;

// Initialize log file path before tests run
test.beforeAll(async () => {
  LOG_FILE = await getLogFilePath();
});
let logBuffer: string[] = [];

const logToFile = async (message: string) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  logBuffer.push(logEntry);
  console.log(logEntry);
};

const flushLogs = async () => {
  if (logBuffer.length > 0) {
    const content = logBuffer.join("\n") + "\n";
    await fs.appendFile(LOG_FILE, content);
    logBuffer = [];
  }
};

// Format seconds with one decimal place
const formatDuration = (durationMs: number): string => {
  return (durationMs / 1000).toFixed(1) + "s";
};

// Auto logger helper method with timing information
const autoLogger = async (testTitle: string) => {
  const result = testResults.find((r) => r.test === testTitle);

  if (result) {
    // Calculate duration if we have both start and end times
    if (result.startTime && result.endTime) {
      result.duration = result.endTime - result.startTime;
    }

    const durationStr = result.duration
      ? ` (${formatDuration(result.duration)})`
      : "";

    if (result.status === "PASSED") {
      await logToFile(`${testTitle}${durationStr}: PASSED`);
    } else if (result.status === "FAILED") {
      await logToFile(`${testTitle}${durationStr}: FAILED - ${result.error}`);
    }
  } else {
    await logToFile(`${testTitle}: NOT FOUND IN RESULTS`);
  }
};

test.describe.serial("React Query App Tests", () => {
  test("Setup - Launch browser and navigate to app", async () => {
    // Create/append to log file instead of overwriting
    await fs.appendFile(LOG_FILE, "\n=== TEST SESSION STARTED ===\n");

    // Launch browser manually instead of using auto-managed context
    sharedBrowser = await chromium.launch({ headless: false });
    sharedContext = await sharedBrowser.newContext();
    sharedPage = await sharedContext.newPage(); // This will be our main page

    // Navigate to your application on the main page
    await sharedPage.goto("http://localhost:5173/");
    await logToFile("Setup complete - browser window and app loaded");
  });

  // Dynamically generate tests from the imported test definitions
  for (const testDef of tests) {
    test(testDef.title, async () => {
      const testTitle = testDef.title;
      const startTime = Date.now();

      // Create a new tab for this test
      const testPage = await sharedContext.newPage();
      await logToFile(`Opened new tab for ${testTitle}`);

      try {
        // Execute the test using the execute function from the test definition
        await testDef.execute(testPage, logToFile);

        testResults.push({
          test: testTitle,
          status: "PASSED",
          startTime,
          endTime: Date.now(),
        });
      } catch (error) {
        testResults.push({
          test: testTitle,
          status: "FAILED",
          error: error.message,
          startTime,
          endTime: Date.now(),
        });
      } finally {
        await autoLogger(testTitle);
        await flushLogs();

        // Close the tab when test is done
        await testPage.close();
        await logToFile(`Closed tab for ${testTitle}`);
      }
    });
  }

  test("Teardown - Close browser and report results", async () => {
    // Calculate overall status
    const failedTests = testResults.filter(
      (result) => result.status === "FAILED"
    );
    const overallStatus =
      failedTests.length === 0 ? "ALL_PASSED" : "SOME_FAILED";

    // Calculate total test duration
    const totalDuration = testResults.reduce((total, result) => {
      return total + (result.duration || 0);
    }, 0);

    // Log final results to file
    await logToFile("\n=== FINAL RESULTS ===");

    for (const result of testResults) {
      const durationStr = result.duration
        ? ` (${formatDuration(result.duration)})`
        : "";
      await logToFile(`${result.test}${durationStr}: ${result.status}`);
      if (result.error) {
        await logToFile(`  Error: ${result.error}`);
      }
    }

    await logToFile(`\nOverall Status: ${overallStatus}`);
    await logToFile(
      `Passed: ${testResults.length - failedTests.length}/${testResults.length}`
    );
    await logToFile(`Total Duration: ${formatDuration(totalDuration)}`);

    // Add session end marker
    await logToFile("=== TEST SESSION COMPLETED ===\n");

    // Close browser
    await sharedBrowser.close();
    await logToFile("Browser closed");
    await flushLogs();
  });
});
