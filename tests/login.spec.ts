import { test, expect } from '../src/fixtures/base.fixture';
import { TEST_DATA } from '../src/data/test-data';

test.describe('Login Module Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test.describe('Functional Tests', () => {
    test('L001 - Valid login with correct credentials', async ({ loginPage, page }) => {
      await loginPage.login(TEST_DATA.validCredentials.username, TEST_DATA.validCredentials.password);
      await loginPage.waitForLogin();

      // wait browser 1 seconds
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveURL(/.*dashboard\/index/);
      await expect(page).toHaveTitle(/OrangeHRM/);
    });

    test('L002 - Login is case sensitive', async ({ loginPage, page }) => {
      await loginPage.login('admin', TEST_DATA.validCredentials.password);
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('auth/login');
      expect(currentUrl).not.toContain('dashboard');
    });

    test('L003 - Forgot password link functionality', async ({ loginPage, page }) => {
      await loginPage.clickForgotPassword();
      
      await expect(page).toHaveURL(/.*requestPasswordResetCode/);
      await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    });

    test('L004 - Session persistence after login', async ({ loginPage, page }) => {
      await loginPage.login(TEST_DATA.validCredentials.username, TEST_DATA.validCredentials.password);
      await loginPage.waitForLogin();
      
      await page.reload();
      await expect(page).toHaveURL(/.*dashboard\/index/);
    });
  });

  test.describe('Negative Tests', () => {
    test('L005 - Empty credentials validation', async ({ loginPage, page }) => {
      await loginPage.click(loginPage.loginButton);
      
      await expect(loginPage.usernameInput).toHaveClass(/oxd-input--error/);
      await expect(loginPage.passwordInput).toHaveClass(/oxd-input--error/);
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('auth/login');
    });

    test('L006 - Invalid username handling', async ({ loginPage }) => {
      await loginPage.login(TEST_DATA.invalidCredentials.wrongUsername.username, TEST_DATA.invalidCredentials.wrongUsername.password);
      
      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Invalid credentials');
    });

    test('L007 - Invalid password handling', async ({ loginPage }) => {
      await loginPage.login(TEST_DATA.invalidCredentials.wrongPassword.username, TEST_DATA.invalidCredentials.wrongPassword.password);
      
      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Invalid credentials');
    });
  });

  test.describe('Edge Cases', () => {
    test('L008 - SQL injection protection', async ({ loginPage }) => {
      await loginPage.login(TEST_DATA.edgeCaseCredentials.sqlInjection.username, TEST_DATA.edgeCaseCredentials.sqlInjection.password);
      
      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Invalid credentials');
    });

    test('L009 - XSS protection', async ({ loginPage, page }) => {
      await loginPage.login(TEST_DATA.edgeCaseCredentials.xssAttempt.username, TEST_DATA.edgeCaseCredentials.xssAttempt.password);
      
      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Invalid credentials');
      
      const alerts: any[] = [];
      page.on('dialog', dialog => {
        alerts.push(dialog);
        dialog.accept();
      });
      expect(alerts).toHaveLength(0);
    });

    test('L010 - Very long username handling', async ({ loginPage }) => {
      await loginPage.login(TEST_DATA.edgeCaseCredentials.longUsername.username, TEST_DATA.edgeCaseCredentials.longUsername.password);
      
      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Invalid credentials');
    });

    test('L011 - Special characters validation', async ({ loginPage }) => {
      await loginPage.login(TEST_DATA.edgeCaseCredentials.specialChars.username, TEST_DATA.edgeCaseCredentials.specialChars.password);
      
      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Invalid credentials');
    });
  });
});