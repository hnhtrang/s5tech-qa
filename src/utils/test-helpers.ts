import { Page, Browser, BrowserContext } from '@playwright/test';
import { TestData } from '../data/test-data';

/**
 * Test utilities and helper functions
 */
export class TestHelpers {
  /**
   * Generate random string
   */
  static generateRandomString(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Generate random email
   */
  static generateRandomEmail(): string {
    return `test_${this.generateRandomString(8)}@example.com`;
  }

  /**
   * Generate random phone number
   */
  static generateRandomPhoneNumber(): string {
    return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  }

  /**
   * Wait for a specific amount of time
   */
  static async wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Generate test screenshot name
   */
  static generateScreenshotName(testName: string, status: 'pass' | 'fail' = 'fail'): string {
    const timestamp = this.getCurrentTimestamp();
    const cleanTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${cleanTestName}_${status}_${timestamp}`;
  }

  /**
   * Clear browser data
   */
  static async clearBrowserData(context: BrowserContext): Promise<void> {
    await context.clearCookies();
    await context.clearPermissions();
  }

  /**
   * Set viewport size
   */
  static async setViewport(page: Page, width: number = 1920, height: number = 1080): Promise<void> {
    await page.setViewportSize({ width, height });
  }

  /**
   * Take screenshot with timestamp
   */
  static async takeTimestampedScreenshot(page: Page, name: string): Promise<string> {
    const screenshotName = this.generateScreenshotName(name);
    const path = `test-results/screenshots/${screenshotName}.png`;
    await page.screenshot({ path, fullPage: true });
    return path;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate test data for form fields
   */
  static generateFormData(): {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  } {
    return {
      firstName: this.generateRandomString(8),
      lastName: this.generateRandomString(10),
      email: this.generateRandomEmail(),
      phone: this.generateRandomPhoneNumber(),
      address: `${Math.floor(Math.random() * 9999)} Test Street, Test City, TC 12345`
    };
  }

  /**
   * Convert string to Title Case
   */
  static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Remove special characters from string
   */
  static sanitizeString(str: string): string {
    return str.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  }

  /**
   * Check if string contains only numbers
   */
  static isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }

  /**
   * Generate random number within range
   */
  static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get random element from array
   */
  static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Retry function with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.wait(delay * Math.pow(2, i));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Performance timing utility
   */
  static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return { result, duration };
  }

  /**
   * Compare arrays
   */
  static arraysEqual<T>(a: T[], b: T[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Check if object is empty
   */
  static isEmpty(obj: any): boolean {
    return obj === null || obj === undefined || 
           (typeof obj === 'object' && Object.keys(obj).length === 0) ||
           (typeof obj === 'string' && obj.trim().length === 0) ||
           (Array.isArray(obj) && obj.length === 0);
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date, format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM-DD-YYYY' = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'YYYY-MM-DD':
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Log test step
   */
  static logStep(step: string, details?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] STEP: ${step}`);
    if (details) {
      console.log(`[${timestamp}] DETAILS:`, details);
    }
  }

  /**
   * Create test context with common setup
   */
  static async createTestContext(browser: Browser): Promise<{
    context: BrowserContext;
    page: Page;
  }> {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      permissions: [],
      recordVideo: {
        dir: 'test-results/videos/',
        size: { width: 1920, height: 1080 }
      }
    });

    const page = await context.newPage();
    
    // Set longer timeouts for slower environments
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    return { context, page };
  }

  /**
   * Verify performance metrics
   */
  static verifyPerformance(duration: number, threshold: number, operation: string): boolean {
    const passed = duration <= threshold;
    const status = passed ? 'PASS' : 'FAIL';
    
    console.log(`[PERFORMANCE] ${operation}: ${duration.toFixed(2)}ms (threshold: ${threshold}ms) - ${status}`);
    
    return passed;
  }

  /**
   * Generate test report summary
   */
  static generateTestSummary(results: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    duration: number;
  }): string {
    const passRate = ((results.passed / results.total) * 100).toFixed(2);
    
    return `
Test Execution Summary:
========================
Total Tests: ${results.total}
Passed: ${results.passed}
Failed: ${results.failed}
Skipped: ${results.skipped}
Pass Rate: ${passRate}%
Duration: ${(results.duration / 1000).toFixed(2)}s
========================
    `.trim();
  }
}

/**
 * Page-specific utilities
 */
export class PageUtils {
  /**
   * Wait for page to be fully loaded
   */
  static async waitForPageReady(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  }

  /**
   * Scroll to element
   */
  static async scrollToElement(page: Page, selector: string): Promise<void> {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Check if element exists
   */
  static async elementExists(page: Page, selector: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element text safely
   */
  static async getTextSafely(page: Page, selector: string): Promise<string> {
    try {
      const element = page.locator(selector);
      await element.waitFor({ timeout: 5000 });
      return await element.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Click element with retry
   */
  static async clickWithRetry(page: Page, selector: string, maxRetries: number = 3): Promise<void> {
    await TestHelpers.retryWithBackoff(async () => {
      await page.locator(selector).click();
    }, maxRetries);
  }
} 