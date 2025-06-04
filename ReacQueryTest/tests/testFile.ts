import { Page, expect } from "@playwright/test";

// Define the test interface
export interface TestDefinition {
  title: string;
  execute: (
    page: Page,
    logToFile: (message: string) => Promise<void>
  ) => Promise<void>;
}

// Collection of all test definitions
export const tests: TestDefinition[] = 
[
  // Test 1: Verify 10 random values are loaded initially
  {
    title: "Test 1 - Verify 10 random values are loaded initially",
    execute: async (page, logToFile) => {
      // Navigate to the application
      await page.goto("http://localhost:5173/");
      await logToFile("Navigated to app in test tab");

      // Wait for the random list to be visible
      await page.waitForSelector(".random-list");

      // Get all list items in the random list
      const randomItems = await page.locator(".random-item").count();

      // Verify there are exactly 10 items
      expect(randomItems).toBe(10);

      await logToFile(`Found ${randomItems} random items on initial load`);
    },
  },

  // Test 2: Generate new random number and verify count increases
  {
    title: "Test 2 - Generate new random number and verify count increases",
    execute: async (page, logToFile) => {
      // Navigate to the application
      await page.goto("http://localhost:5173/");
      await logToFile("Navigated to app in test tab");

      // Navigate to the New Random page
      await page.click("text=Navigate to New Random Page");

      // Wait for the new page to load
      await page.waitForSelector(".new-random-container");
      await logToFile("Navigated to New Random Page");

      // Click the generate button
      await page.click(".generate-button");
      await logToFile("Clicked Generate New Random Number button");

      // Wait for redirect back to home page
      await page.waitForSelector(".random-list", { timeout: 10000 });
      await logToFile("Redirected back to home page");

      // Wait additional 6 seconds for the data to refresh
      await page.waitForTimeout(6000);

      // Get all list items in the random list
      const randomItems = await page.locator(".random-item").count();

      // Verify there are now 11 items
      expect(randomItems).toBe(11);
      await logToFile(
        `Found ${randomItems} random items after generating new one`
      );
    },
  },

  // Test 3: Delete top 3 random numbers and verify count decreases
  {
    title: "Test 3 - Delete top 3 random numbers and verify count decreases",
    execute: async (page, logToFile) => {
      // Navigate to the application
      await page.goto("http://localhost:5173/");
      await logToFile("Navigated to app in test tab");

      // Get initial count
      const initialCount = await page.locator(".random-item").count();
      await logToFile(`Initial count before deletion: ${initialCount}`);

      // Delete the first 3 items - clicking on first delete button 3 times
      for (let i = 0; i < 3; i++) {
        await page.locator(".delete-button").first().click();
        await logToFile(`Deleted item ${i + 1} of 3`);

        // Wait a short time for the deletion to process
        await page.waitForTimeout(500);
      }

      // Wait 6 seconds for all deletions to complete and UI to update
      await page.waitForTimeout(6000);

      // Get all list items in the random list
      const randomItems = await page.locator(".random-item").count();

      // Verify there are now 8 items (11 - 3 = 8)
      expect(randomItems).toBe(8);
      await logToFile(
        `Found ${randomItems} random items after deleting 3 items`
      );
    },
  },

// Test 4: Verify React logo opens correct page in a new tab
{
    title: "Test 4 - Verify React logo navigation",
    execute: async (page, logToFile) => {
      // Navigate to the application
      await page.goto("http://localhost:5173/");
      await logToFile("Navigated to app in test tab");
      
      // Wait to ensure the page is fully loaded and stable
      await page.waitForLoadState('networkidle');
      
      // Use a more specific selector with force:true to handle stability issues
      const reactLogo = page.locator('img.logo.react[alt="React logo"]');
      
      // Make sure the element is visible before continuing
      await reactLogo.waitFor({state: 'visible'});
      await logToFile("React logo is visible and ready for interaction");
      
      // Set up a promise to catch the new page JUST before clicking
      const pagePromise = page.context().waitForEvent('page');
      
      // Click with force option to bypass stability checks
      await reactLogo.click({force: true});
      await logToFile("Clicked on React logo");
      
      try {
        // Wait for the new page with a reasonable timeout
        const newPage = await pagePromise;
        await logToFile("Detected new page opening");
        
        // Wait for the new page to load
        await newPage.waitForLoadState('networkidle');
        
        // Get the URL of the new tab
        const newTabUrl = newPage.url();
        await logToFile(`New tab opened with URL: ${newTabUrl}`);
        
        // Verify the URL is correct
        expect(newTabUrl).toContain("react.dev");
        await logToFile("Successfully verified navigation to React website");
        
        // Close the new tab
        await newPage.close();
        await logToFile("Closed React website tab");
      } catch (error) {
        await logToFile(`Error handling new page: ${error.message}`);
        throw error; // Re-throw to mark the test as failed
      }
    },
  }
];
