import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TEST_DATA } from '../data/test-data';

export class PIMPage extends BasePage {
  readonly employeeNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly employmentStatusDropdown: Locator;
  readonly includeDropdown: Locator;
  readonly supervisorNameInput: Locator;
  readonly jobTitleDropdown: Locator;
  readonly subUnitDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly resultsTable: Locator;
  readonly noRecordsMessage: Locator;
  readonly recordsCount: Locator;

  constructor(page: Page) {
    super(page, TEST_DATA.urlPaths.pim);
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
    this.employeeIdInput = page.locator('input[placeholder="Type for hints..."]').nth(1);
    this.employmentStatusDropdown = page.locator('.oxd-select-text').first();
    this.includeDropdown = page.locator('.oxd-select-text').nth(1);
    this.supervisorNameInput = page.getByPlaceholder('Type for hints...').nth(2);
    this.jobTitleDropdown = page.locator('.oxd-select-text').nth(2);
    this.subUnitDropdown = page.locator('.oxd-select-text').nth(3);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.resultsTable = page.locator('.oxd-table-body');
    this.noRecordsMessage = page.getByText('No Records Found');
    this.recordsCount = page.locator('.oxd-text--span');
  }

  async searchByEmployeeName(name: string): Promise<void> {
    await this.fill(this.employeeNameInput, name);
    await this.click(this.searchButton);
  }

  async searchByEmployeeId(id: string): Promise<void> {
    await this.fill(this.employeeIdInput, id);
    await this.click(this.searchButton);
  }

  async selectEmploymentStatus(status: string): Promise<void> {
    await this.click(this.employmentStatusDropdown);
    await this.page.getByText(status).click();
  }

  async selectInclude(option: string): Promise<void> {
    await this.click(this.includeDropdown);
    await this.page.getByText(option).click();
  }

  async searchBySupervisor(name: string): Promise<void> {
    await this.fill(this.supervisorNameInput, name);
    await this.click(this.searchButton);
  }

  async selectJobTitle(title: string): Promise<void> {
    await this.click(this.jobTitleDropdown);
    await this.page.getByText(title).click();
  }

  async selectSubUnit(unit: string): Promise<void> {
    await this.click(this.subUnitDropdown);
    await this.page.getByText(unit).click();
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

  async getRecordsCount(): Promise<string> {
    return await this.getText(this.recordsCount);
  }
}