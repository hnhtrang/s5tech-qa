import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly orangeHrmLogo: Locator;
  private readonly usernameRequiredMessage: Locator;
  private readonly passwordRequiredMessage: Locator;
  private readonly credentialsContainer: Locator;
  private readonly loginFormTitle: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.usernameInput = page.locator('[name="username"]');
    this.passwordInput = page.locator('[name="password"]');
    this.loginButton = page.locator('[type="submit"]');
    this.errorMessage = page.locator('.oxd-alert-content-text');
    this.forgotPasswordLink = page.locator('.orangehrm-login-forgot-header');
    this.orangeHrmLogo = page.locator('.orangehrm-login-branding img');
    this.usernameRequiredMessage = page.locator('.oxd-input-group').filter({ hasText: 'Username' }).locator('.oxd-text--span');
    this.passwordRequiredMessage = page.locator('.oxd-input-group').filter({ hasText: 'Password' }).locator('.oxd-text--span');
    this.credentialsContainer = page.locator('.orangehrm-demo-credentials');
    this.loginFormTitle = page.locator('.orangehrm-login-title');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.goto('/web/index.php/auth/login');
    await this.waitForPageLoad();
  }

  /**
   * Verify login page elements are visible
   */
  async verifyLoginPageElements(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.orangeHrmLogo).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  /**
   * Perform complete login action
   */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElementVisible(this.errorMessage);
    return await this.getTextContent(this.errorMessage);
  }

  /**
   * Verify login error message
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }

  /**
   * Verify username required message
   */
  async verifyUsernameRequiredMessage(): Promise<void> {
    await expect(this.usernameRequiredMessage).toBeVisible();
    await expect(this.usernameRequiredMessage).toHaveText('Required');
  }

  /**
   * Verify password required message
   */
  async verifyPasswordRequiredMessage(): Promise<void> {
    await expect(this.passwordRequiredMessage).toBeVisible();
    await expect(this.passwordRequiredMessage).toHaveText('Required');
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Get credentials from demo section
   */
  async getDemoCredentials(): Promise<{ username: string; password: string }> {
    const credentialsText = await this.getTextContent(this.credentialsContainer);
    // Parse demo credentials from the text
    const usernameMatch = credentialsText.match(/Username\s*:\s*(\w+)/);
    const passwordMatch = credentialsText.match(/Password\s*:\s*(\w+)/);
    
    return {
      username: usernameMatch ? usernameMatch[1] : 'Admin',
      password: passwordMatch ? passwordMatch[1] : 'admin123'
    };
  }

  /**
   * Clear username field
   */
  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  /**
   * Clear password field
   */
  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  /**
   * Clear all form fields
   */
  async clearAllFields(): Promise<void> {
    await this.clearUsername();
    await this.clearPassword();
  }

  /**
   * Get username input value
   */
  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  /**
   * Get password input value
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Verify login page title
   */
  async verifyLoginPageTitle(): Promise<void> {
    await this.verifyPageTitle('OrangeHRM');
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink);
  }

  /**
   * Verify successful login by checking URL redirect
   */
  async verifySuccessfulLogin(): Promise<void> {
    await this.verifyUrlContains('/dashboard');
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  /**
   * Get login form title
   */
  async getLoginFormTitle(): Promise<string> {
    return await this.getTextContent(this.loginFormTitle);
  }
} 