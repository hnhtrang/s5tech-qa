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
    this.usernameInput = page.locator('.oxd-form-row').filter({ hasText: 'Username' }).locator('input').first();
    this.userRoleDropdown = page.locator('.oxd-select-text').first();
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.statusDropdown = page.locator('.oxd-select-text').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.resultsTable = page.locator('.oxd-table-body');
    this.noRecordsMessage = page.getByText('No Records Found');
  }

  async isSearchFormCollapsed(): Promise<boolean> {
    return !(await this.isVisible(this.usernameInput));
  }

  async expandSearchForm(): Promise<void> {
    const expandButton = this.page.locator('.oxd-icon-button:has(.bi-caret-down-fill)').first();
    await this.click(expandButton);
    await this.waitForElement(this.usernameInput);
  }

  async ensureSearchFormVisible(): Promise<void> {
    if (await this.isSearchFormCollapsed()) {
      await this.expandSearchForm();
    }
  }

  async searchByUsername(username: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.fill(this.usernameInput, username);
    await this.click(this.searchButton);
  }

  async fillUsername(username: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.fill(this.usernameInput, username);
  }

  async selectUserRole(role: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.userRoleDropdown);
    await this.page.getByRole('option', { name: role }).click();
  }

  async searchByEmployeeName(name: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.fill(this.employeeNameInput, name);
    await this.click(this.searchButton);
  }

  async fillEmployeeName(name: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.fill(this.employeeNameInput, name);
  }

  async selectStatus(status: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.statusDropdown);
    await this.page.getByRole('option', { name: status }).click();
  }

  async performSearch(): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.searchButton);
  }

  async resetSearch(): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.resetButton);
  }

  async getSearchResults(): Promise<number> {
    const rows = await this.resultsTable.locator('.oxd-table-card').count();
    return rows;
  }

  async hasNoRecords(): Promise<boolean> {
    return await this.isVisible(this.noRecordsMessage);
  }

  async verifyResultsContainUsername(username: string): Promise<boolean> {
    const rows = await this.resultsTable.locator('.oxd-table-card').all();
    if (rows.length === 0) return false;
    
    for (const row of rows) {
      const usernameCell = await row.locator('.oxd-table-cell').nth(1).textContent();
      if (usernameCell?.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  async verifyResultsMatchRole(role: string): Promise<boolean> {
    const rows = await this.resultsTable.locator('.oxd-table-card').all();
    if (rows.length === 0) return false;
    
    for (const row of rows) {
      const roleCell = await row.locator('.oxd-table-cell').nth(2).textContent();
      if (roleCell && !roleCell.includes(role)) {
        return false;
      }
    }
    return true;
  }

  async verifyResultsMatchStatus(status: string): Promise<boolean> {
    const rows = await this.resultsTable.locator('.oxd-table-card').all();
    if (rows.length === 0) return false;
    
    for (const row of rows) {
      const statusCell = await row.locator('.oxd-table-cell').nth(4).textContent();
      if (statusCell && !statusCell.includes(status)) {
        return false;
      }
    }
    return true;
  }
}