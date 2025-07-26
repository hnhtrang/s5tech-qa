import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TEST_DATA } from '../data/test-data';

export class AdminPage extends BasePage {
  readonly usernameInput: Locator;
  readonly userRoleDropdown: Locator;
  readonly employeeNameInput: Locator;
  readonly statusDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly resultsTable: Locator;
  readonly noRecordsMessage: Locator;

  constructor(page: Page) {
    super(page, TEST_DATA.urlPaths.admin);
    this.usernameInput = page.getByPlaceholder('Type for hints...').first();
    this.userRoleDropdown = page.locator('.oxd-select-text').first();
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').nth(1);
    this.statusDropdown = page.locator('.oxd-select-text').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.resultsTable = page.locator('.oxd-table-body');
    this.noRecordsMessage = page.getByText('No Records Found');
  }

  async searchByUsername(username: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.click(this.searchButton);
  }

  async selectUserRole(role: string): Promise<void> {
    await this.click(this.userRoleDropdown);
    await this.page.getByText(role).click();
  }

  async searchByEmployeeName(name: string): Promise<void> {
    await this.fill(this.employeeNameInput, name);
    await this.click(this.searchButton);
  }

  async selectStatus(status: string): Promise<void> {
    await this.click(this.statusDropdown);
    await this.page.getByText(status).click();
  }

  async resetSearch(): Promise<void> {
    await this.click(this.resetButton);
  }

  async getSearchResults(): Promise<number> {
    const rows = await this.resultsTable.locator('.oxd-table-row').count();
    return rows;
  }

  async hasNoRecords(): Promise<boolean> {
    return await this.isVisible(this.noRecordsMessage);
  }
}