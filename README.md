# React Query Test Application

A React application demonstrating React Query for data fetching and management based on the simple vite demo site. Has roughed out examples automated testing using Playwright using a test file to put the tests and a test execution file to execute the tests, providing a single location to add tests without needing to adjust the execution logic.

Comments left all over the place for those unfarmiliar with the librarie used.

NOTE: API has a deliberate delay introduced to emulate a slow network so calls take much longer than actually necessary.

## 🌟 Project Overview

This application provides an interface for managing randomly generated numbers with the following features:

- **View Numbers**: Display a list of randomly generated numbers
- **Generate New**: Create new random numbers on demand  
- **Delete Numbers**: Remove existing numbers from the collection

### Architecture

The project consists of two main components:

1. **Node.js Express Server** - Manages random number data via REST API
2. **React Client** - Interactive frontend using React Query for state management

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm package manager

### Installation

**Install server dependencies:**
```bash
cd ../
npm install
```

**Install client dependencies:**
```bash
cd ReacQueryTest
npm install
```

---

## 🏃‍♂️ Running the Application

### Start the Server

From the root directory:
```bash
node server.js
```

> The server will start on http://localhost:3000 and initialize with 10 random numbers.

### Start the Client

From the ReacQueryTest directory:
```bash
npm run dev
```

> The client application will be available at http://localhost:5173

---

## 🧪 Testing with Playwright

This project uses Playwright for comprehensive end-to-end testing.

### Running Tests

**Standard test execution:**
```bash
# From the ReacQueryTest directory
npx playwright test
```

**Interactive UI mode for debugging:**
```bash
npx playwright test --ui
```

### Test Architecture

- **Configuration**: Tests are configured in `playwright.config.ts` with settings for browsers, timeouts, and test output locations
- **Test Files**: All tests are located in the `tests/` directory
- **Test Structure**: 
  - Tests are defined as objects with `title` and `execute` properties in `testFile.ts`
  - The test runner in `testTest.spec.ts` executes these test definitions

### Test Outputs

Tests generate comprehensive outputs for analysis:

- **HTML Reports**: Detailed test results available in `index.html`
- **Logs**: Timestamped log files created in `test-logs/` for each test run
- **Screenshots**: Automatically captured on test failures in `test-results/artifacts/`

### Creating New Tests

To add a new test, add a test definition to the `tests` array in `testFile.ts`:

```javascript
{
  title: "Your Test Name",
  execute: async (page, logToFile) => {
    // Navigate to the application
    await page.goto("http://localhost:5173/");
    await logToFile("Navigated to app in test tab");

    // Add your test steps here
    // ...

    // Add assertions
    expect(someCondition).toBeTruthy();
    await logToFile("Test passed successfully");
  }
}
```

The test runner will automatically execute your new test and generate appropriate logs and reports.

---

## 📁 Project Structure

```
ReacQuery/
├── server.js                 # Express server for the API
├── package.json              # Server dependencies
└── ReacQueryTest/            # React client application
    ├── src/                  # React source code
    ├── tests/                # Playwright tests
    ├── test-logs/            # Test execution logs
    └── test-results/         # Test reports and artifacts
```

---

## 🛠️ Technologies Used

- **React** with TypeScript
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Express** for the backend API
- **Playwright** for automated testing

---

## 📝 License

This project is available for educational and demonstration purposes.
