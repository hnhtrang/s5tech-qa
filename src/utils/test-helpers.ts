import { Page, expect } from '@playwright/test';

export class TestHelpers {
  static async retryAction(action: () => Promise<void>, maxRetries: number = 3): Promise<void> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await action();
        return;
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.wait(1000 * (i + 1));
        }
      }
    }
    
    throw lastError!;
  }

  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async waitForStableElement(page: Page, selector: string, timeout: number = 5000): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    await this.wait(500);
  }

  static async takeScreenshotOnFailure(page: Page, testName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `screenshots/failure-${testName}-${timestamp}.png`,
      fullPage: true
    });
  }

  static async handleSlowNetwork(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    return `test${this.generateRandomString(8)}@example.com`;
  }

  static async clearInput(page: Page, selector: string): Promise<void> {
    await page.click(selector);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
  }

  static async scrollToElement(page: Page, selector: string): Promise<void> {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  static async verifyElementText(page: Page, selector: string, expectedText: string): Promise<void> {
    const element = page.locator(selector);
    await expect(element).toHaveText(expectedText);
  }

  static async verifyElementVisible(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector);
    await expect(element).toBeVisible();
  }

  static async verifyElementNotVisible(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector);
    await expect(element).not.toBeVisible();
  }
}