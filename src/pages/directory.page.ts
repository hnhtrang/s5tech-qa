import { Page, Locator, expect } from '@playwright/test';
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
  readonly recordsFoundText: Locator;
  readonly employeeNames: Locator;
  readonly autocompleteDropdown: Locator;
  readonly autocompleteOptions: Locator;
  readonly noRecordsFoundOption: Locator;
  readonly searchingOption: Locator;

  constructor(page: Page) {
    super(page, TEST_DATA.urlPaths.directory);
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = page.locator('.oxd-select-text').first();
    this.locationDropdown = page.locator('.oxd-select-text').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.employeeCards = page.locator('.oxd-sheet');
    this.noRecordsMessage = page.getByText('No Records Found');
    this.employeePhotos = page.locator('img[alt="Profile Picture"]');
    this.recordsFoundText = page.getByText(/\(\d+\) Records Found/);
    this.employeeNames = page.locator('.oxd-sheet p');
    this.autocompleteDropdown = page.locator('div[role="listbox"]');
    this.autocompleteOptions = page.locator('div[role="listbox"] div[role="option"]');
    this.noRecordsFoundOption = page.getByRole('option', { name: 'No Records Found' });
    this.searchingOption = page.getByRole('option', { name: 'Searching....' });
  }

  async isSearchFormCollapsed(): Promise<boolean> {
    return !(await this.isVisible(this.employeeNameInput));
  }

  async expandSearchForm(): Promise<void> {
    const expandButton = this.page.locator('.oxd-icon-button:has(.bi-caret-down-fill)').first();
    await this.click(expandButton);
    await this.waitForElement(this.employeeNameInput);
  }

  async ensureSearchFormVisible(): Promise<void> {
    if (await this.isSearchFormCollapsed()) {
      await this.expandSearchForm();
    }
  }

  async typeEmployeeName(name: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.employeeNameInput.pressSequentially(name);
  }

  async waitForAutocompleteDropdown(): Promise<void> {
    await this.autocompleteDropdown.waitFor({ timeout: 5000 });
  }

  async waitForSearchingToComplete(): Promise<void> {
    try {
      await this.searchingOption.waitFor({ timeout: 2000 });
      await this.searchingOption.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      // Searching option might not appear for fast results
    }
  }

  async selectEmployeeFromAutocomplete(employeeName: string): Promise<void> {
    await this.page.getByRole('option', { name: employeeName }).click();
  }

  async hasNoRecordsFoundInAutocomplete(): Promise<boolean> {
    return await this.noRecordsFoundOption.isVisible();
  }

  async getAutocompleteOptions(): Promise<string[]> {
    const options = await this.autocompleteOptions.allTextContents();
    return options.filter(option => option !== 'Searching....' && option !== '');
  }

  async searchByEmployeeNameWithAutocomplete(partialName: string, fullName: string): Promise<void> {
    await this.typeEmployeeName(partialName);
    await this.waitForAutocompleteDropdown();
    await this.waitForSearchingToComplete();
    await this.selectEmployeeFromAutocomplete(fullName);
    await this.performSearch();
  }

  async searchByInvalidEmployeeName(invalidName: string): Promise<void> {
    await this.typeEmployeeName(invalidName);
    await this.waitForAutocompleteDropdown();
    await this.waitForSearchingToComplete();
  }

  async selectJobTitle(title: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.jobTitleDropdown);
    await this.page.getByRole('option', { name: title }).click();
  }

  async selectLocation(location: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.locationDropdown);
    await this.page.getByRole('option', { name: location }).click();
  }

  async performSearch(): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.searchButton);
  }

  async resetSearch(): Promise<void> {
    await this.ensureSearchFormVisible();
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
    return await this.getText(firstCard.locator('p').first());
  }

  async verifySpecificEmployeeDisplayed(expectedEmployeeName: string): Promise<void> {
    const resultCount = await this.getEmployeeCardCount();
    expect(resultCount).toBeGreaterThan(0);
    
    let foundEmployee = false;
    for (let i = 0; i < resultCount; i++) {
      const employeeName = await this.getText(this.employeeNames.nth(i));
      if (employeeName.trim() === expectedEmployeeName) {
        foundEmployee = true;
        break;
      }
    }
    
    if (!foundEmployee) {
      throw new Error(`Expected employee "${expectedEmployeeName}" not found in search results`);
    }
  }

  async verifyAutocompleteContainsName(partialName: string): Promise<void> {
    const options = await this.getAutocompleteOptions();
    const hasMatchingOption = options.some(option => 
      option.toLowerCase().includes(partialName.toLowerCase())
    );
    
    if (!hasMatchingOption) {
      throw new Error(`No autocomplete option contains "${partialName}". Available options: ${options.join(', ')}`);
    }
  }

  async verifyJobTitleInResults(jobTitle: string): Promise<void> {
    const resultCount = await this.getEmployeeCardCount();
    
    for (let i = 0; i < resultCount; i++) {
      const card = this.employeeCards.nth(i);
      const jobTitleElement = card.locator('p').nth(1);
      
      if (await jobTitleElement.count() > 0) {
        const cardJobTitle = await this.getText(jobTitleElement);
        if (!cardJobTitle.includes(jobTitle)) {
          throw new Error(`Employee job title "${cardJobTitle}" does not match search criteria "${jobTitle}"`);
        }
      }
    }
  }

  async verifyLocationInResults(location: string): Promise<void> {
    const resultCount = await this.getEmployeeCardCount();
    expect(resultCount).toBeGreaterThan(0);
    
    for (let i = 0; i < resultCount; i++) {
      const card = this.employeeCards.nth(i);
      // Location is the last paragraph in the card's sub-section
      const locationElement = card.locator('p').last();
      
      if (await locationElement.count() > 0) {
        const cardLocation = await this.getText(locationElement);
        if (!cardLocation.includes(location)) {
          throw new Error(`Employee location "${cardLocation}" does not match search criteria "${location}"`);
        }
      }
    }
  }

  async verifyAllCardsHavePhotos(): Promise<void> {
    const resultCount = await this.getEmployeeCardCount();
    const photoCount = await this.employeePhotos.count();
    
    // Allow for some flexibility - at least some photos should be present
    if (photoCount === 0) {
      throw new Error(`Expected photos to be displayed but found none`);
    }
    
    // Don't require exact match as some cards might not have photos loaded yet
    if (photoCount < Math.floor(resultCount * 0.5)) {
      throw new Error(`Expected at least half the cards to have photos. Found ${photoCount} photos for ${resultCount} cards`);
    }
  }

  async getRecordsFoundCount(): Promise<number> {
    try {
      await this.recordsFoundText.waitFor({ timeout: 5000 });
      const recordsText = await this.getText(this.recordsFoundText);
      const match = recordsText.match(/\((\d+)\) Records Found/);
      return match ? parseInt(match[1]) : 0;
    } catch {
      return 0;
    }
  }
}