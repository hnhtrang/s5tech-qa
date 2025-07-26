import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TEST_DATA } from '../data/test-data';

export class DirectoryPage extends BasePage {
  readonly employeeNameInput: Locator;
  readonly jobTitleDropdown: Locator;
  readonly locationDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly employeeCards: Locator;
  readonly noRecordsMessage: Locator;
  readonly employeePhotos: Locator;

  constructor(page: Page) {
    super(page, TEST_DATA.urlPaths.directory);
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = page.locator('.oxd-select-text').first();
    this.locationDropdown = page.locator('.oxd-select-text').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.employeeCards = page.locator('.oxd-sheet');
    this.noRecordsMessage = page.getByText('No Records Found');
    this.employeePhotos = page.locator('.employee-image');
  }

  async searchByEmployeeName(name: string): Promise<void> {
    await this.fill(this.employeeNameInput, name);
    await this.click(this.searchButton);
  }

  async selectJobTitle(title: string): Promise<void> {
    await this.click(this.jobTitleDropdown);
    await this.page.getByText(title).click();
  }

  async selectLocation(location: string): Promise<void> {
    await this.click(this.locationDropdown);
    await this.page.getByText(location).click();
  }

  async resetSearch(): Promise<void> {
    await this.click(this.resetButton);
  }

  async getEmployeeCardCount(): Promise<number> {
    return await this.employeeCards.count();
  }

  async hasNoRecords(): Promise<boolean> {
    return await this.isVisible(this.noRecordsMessage);
  }

  async arePhotosDisplayed(): Promise<boolean> {
    const photoCount = await this.employeePhotos.count();
    return photoCount > 0;
  }

  async getFirstEmployeeName(): Promise<string> {
    const firstCard = this.employeeCards.first();
    return await this.getText(firstCard.locator('.employee-name'));
  }
}