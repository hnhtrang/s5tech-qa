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
  readonly autocompleteDropdown: Locator;
  readonly autocompleteOptions: Locator;
  readonly searchingOption: Locator;

  constructor(page: Page) {
    super(page, TEST_DATA.urlPaths.pim);
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
    this.employeeIdInput = page.locator('.oxd-input').nth(1);
    this.employmentStatusDropdown = page.locator('.oxd-select-text').first();
    this.includeDropdown = page.locator('.oxd-select-text').nth(1);
    this.supervisorNameInput = page.getByPlaceholder('Type for hints...').nth(2);
    this.jobTitleDropdown = page.locator('.oxd-select-text').nth(2);
    this.subUnitDropdown = page.locator('.oxd-select-text').nth(3);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.resultsTable = page.locator('.oxd-table-body');
    this.noRecordsMessage = page.locator('.oxd-table-body .oxd-text--span').filter({ hasText: 'No Records Found' });
    this.recordsCount = page.locator('.oxd-text--span');
    this.autocompleteDropdown = page.locator('div[role="listbox"]');
    this.autocompleteOptions = page.locator('div[role="listbox"] div[role="option"]');
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

  async searchByEmployeeName(name: string): Promise<void> {
    await this.ensureSearchFormVisible();
    
    // Clear the field first
    await this.employeeNameInput.clear();
    
    // Type the name to trigger autocomplete
    await this.employeeNameInput.pressSequentially(name);
    
    // Wait for autocomplete dropdown to appear
    await this.waitForAutocompleteDropdown();
    await this.waitForSearchingToComplete();
    
    // Select the exact match from autocomplete dropdown
    await this.selectEmployeeFromAutocomplete(name);
    
    // Click search button
    await this.click(this.searchButton);
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

  async searchByEmployeeNameDirect(name: string): Promise<void> {
    await this.ensureSearchFormVisible();
    // Direct fill method (for backward compatibility)
    await this.fill(this.employeeNameInput, name);
    await this.click(this.searchButton);
  }

  async searchByEmployeeId(id: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.fill(this.employeeIdInput, id);
    await this.click(this.searchButton);
  }

  async selectEmploymentStatus(status: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.employmentStatusDropdown);
    await this.page.getByRole('option', { name: status }).click();
  }

  async selectInclude(option: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.includeDropdown);
    await this.page.getByRole('option', { name: option }).click();
  }

  async searchBySupervisor(name: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.fill(this.supervisorNameInput, name);
    await this.click(this.searchButton);
  }

  async selectJobTitle(title: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.jobTitleDropdown);
    await this.page.getByRole('option', { name: title }).click();
  }

  async selectSubUnit(unit: string): Promise<void> {
    await this.ensureSearchFormVisible();
    await this.click(this.subUnitDropdown);
    await this.page.getByRole('option', { name: unit }).click();
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

  async getRecordsCount(): Promise<string> {
    return await this.getText(this.recordsCount);
  }

  async verifySearchResultsContainName(searchName: string): Promise<boolean> {
    const rows = await this.resultsTable.locator('.oxd-table-card').all();
    if (rows.length === 0) return false;
    
    for (const row of rows) {
      // Based on debug output: firstName is in cell 2, lastName is in cell 3  
      const firstNameCell = await row.locator('.oxd-table-cell').nth(2).textContent();
      const lastNameCell = await row.locator('.oxd-table-cell').nth(3).textContent();
      const fullName = `${firstNameCell?.trim()} ${lastNameCell?.trim()}`.toLowerCase().trim();
      const searchNameLower = searchName.toLowerCase().trim();
      
      // Check if the full name matches or if individual parts match
      if (fullName.includes(searchNameLower) || 
          firstNameCell?.toLowerCase().includes(searchNameLower) ||
          lastNameCell?.toLowerCase().includes(searchNameLower)) {
        return true;
      }
    }
    
    return false;
  }

  async verifySearchResultsContainId(searchId: string): Promise<boolean> {
    const rows = await this.resultsTable.locator('.oxd-table-card').all();
    if (rows.length === 0) return false;
    
    for (const row of rows) {
      // ID is actually in the second cell (index 1), not the first
      const idCell = await row.locator('.oxd-table-cell').nth(1).textContent();
      const cleanId = idCell?.replace(/["\s]/g, '') || '';
      const cleanSearchId = searchId.replace(/["\s]/g, '');
      if (cleanId.includes(cleanSearchId)) {
        return true;
      }
    }
    return false;
  }

  async verifyFilterResults(filterType: 'employment' | 'jobTitle' | 'subUnit', expectedValue: string): Promise<boolean> {
    const rows = await this.resultsTable.locator('.oxd-table-card').all();
    if (rows.length === 0) return false;
    
    // Based on debug output: jobTitle=index 4, employment=index 5, subUnit=index 6
    const columnIndex = filterType === 'employment' ? 5 : filterType === 'jobTitle' ? 4 : 6;
    let hasValidData = false;
    
    for (const row of rows) {
      const cellValue = await row.locator('.oxd-table-cell').nth(columnIndex).textContent();
      const cleanCellValue = cellValue?.trim() || '';
      
      if (cleanCellValue !== '') {
        hasValidData = true;
        if (!cleanCellValue.includes(expectedValue)) {
          return false;
        }
      }
    }
    
    // If no rows have data in this column, consider it valid (empty state)
    return hasValidData;
  }

  async getAllResultData(): Promise<Array<{id: string, firstName: string, lastName: string, jobTitle: string, employmentStatus: string, subUnit: string}>> {
    const rows = await this.resultsTable.locator('.oxd-table-card').all();
    const results: Array<{id: string, firstName: string, lastName: string, jobTitle: string, employmentStatus: string, subUnit: string}> = [];
    
    for (const row of rows) {
      const cells = await row.locator('.oxd-table-cell').all();
      if (cells.length >= 7) {
        results.push({
          id: (await cells[1].textContent()) || '',         // ID is in column 1
          firstName: (await cells[2].textContent()) || '',   // First name in column 2
          lastName: (await cells[3].textContent()) || '',    // Last name in column 3
          jobTitle: (await cells[4].textContent()) || '',    // Job title in column 4
          employmentStatus: (await cells[5].textContent()) || '', // Employment status in column 5
          subUnit: (await cells[6].textContent()) || ''      // Sub unit in column 6
        });
      }
    }
    return results;
  }
}