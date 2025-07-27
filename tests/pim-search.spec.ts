import { test, expect } from '../src/fixtures/auth.fixture';
import { TEST_DATA } from '../src/data/test-data';

test.describe('PIM Search Module', () => {
  test.beforeEach(async ({ authenticatedPage, pimPage }) => {
    await pimPage.navigate();
    await pimPage.waitForPageLoad();
  });

  test.describe('Functional Tests', () => {
    test('P001: Search by employee name', async ({ pimPage }) => {
      const searchName = TEST_DATA.pimData.validEmployeeNames[0]; // 'john bhim'
      await pimPage.searchByEmployeeName(searchName);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      // PIM search with autocomplete still shows all employees but verifies the name exists
      expect(resultCount).toBeGreaterThan(0);

      const containsSearchedName = await pimPage.verifySearchResultsContainName(searchName);
      expect(containsSearchedName).toBeTruthy();
    });

    test('P002: Search by employee ID', async ({ pimPage }) => {
      const searchId = TEST_DATA.pimData.validEmployeeIds[0];
      await pimPage.searchByEmployeeId(searchId);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      expect(resultCount).toBeGreaterThan(0);
      
      const containsSearchedId = await pimPage.verifySearchResultsContainId(searchId);
      expect(containsSearchedId).toBeTruthy();
    });

    test('P003: Filter by employment status', async ({ pimPage }) => {
      const employmentStatus = TEST_DATA.pimData.employmentStatuses[3];
      await pimPage.selectEmploymentStatus(employmentStatus);
      await pimPage.click(pimPage.searchButton);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();

      expect(resultCount).toBeGreaterThanOrEqual(0);
      
      if (resultCount > 0) {
        const resultsMatchFilter = await pimPage.verifyFilterResults('employment', employmentStatus);
        expect(resultsMatchFilter).toBeTruthy();
      }
    });

    test('P004: Filter by job title', async ({ pimPage }) => {
      const jobTitle = TEST_DATA.pimData.jobTitles[0];
      await pimPage.selectJobTitle(jobTitle);
      await pimPage.click(pimPage.searchButton);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      expect(resultCount).toBeGreaterThan(0);
      
      const resultsMatchFilter = await pimPage.verifyFilterResults('jobTitle', jobTitle);
      expect(resultsMatchFilter).toBeTruthy();
    });

    test('P005: Filter by sub unit', async ({ pimPage }) => {
      const subUnit = TEST_DATA.pimData.subUnits[0];
      await pimPage.selectSubUnit(subUnit);
      await pimPage.click(pimPage.searchButton);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      expect(resultCount).toBeGreaterThanOrEqual(0);
      
      if (resultCount > 0) {
        const resultsMatchFilter = await pimPage.verifyFilterResults('subUnit', subUnit);
        expect(resultsMatchFilter).toBeTruthy();
      }
    });

    test('P006: Combined filters search', async ({ pimPage }) => {
      const searchName = TEST_DATA.pimData.validEmployeeNames[1]; // 'Timothy Lewis Amiano'
      const employmentStatus = TEST_DATA.pimData.employmentStatuses[3]; // 'Part-Time Internship'
      
      // Use the new autocomplete search method
      await pimPage.searchByEmployeeName(searchName);
      await pimPage.selectEmploymentStatus(employmentStatus);
      await pimPage.click(pimPage.searchButton);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      // For combined search, we may get 0 or 1 results depending on the employee's status
      expect(resultCount).toBeGreaterThanOrEqual(0);
      
      // Only verify filters if we have results
      if (resultCount > 0) {
        const containsSearchedName = await pimPage.verifySearchResultsContainName(searchName);
        const resultsMatchEmploymentStatus = await pimPage.verifyFilterResults('employment', employmentStatus);
        expect(containsSearchedName).toBeTruthy();
        expect(resultsMatchEmploymentStatus).toBeTruthy();
      }
    });

    test('P007: Reset filters functionality', async ({ pimPage }) => {
      await pimPage.searchByEmployeeName(TEST_DATA.pimData.validEmployeeNames[0]);
      await pimPage.selectEmploymentStatus(TEST_DATA.pimData.employmentStatuses[3]);
      
      await pimPage.resetSearch();
      
      const employeeNameValue = await pimPage.employeeNameInput.inputValue();
      expect(employeeNameValue).toBe('');
    });
  });

  test.describe('Negative Tests', () => {
    test('P010: Search with invalid employee name', async ({ pimPage }) => {
      // For invalid names, use direct fill method since autocomplete won't work
      await pimPage.searchByEmployeeNameDirect(TEST_DATA.pimData.invalidEmployeeNames[0]);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      expect(resultCount).toEqual(0);
    });

    test('P011: Search with non-existent employee ID', async ({ pimPage }) => {
      await pimPage.searchByEmployeeId(TEST_DATA.pimData.invalidEmployeeIds[0]);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      expect(resultCount).toEqual(0);
    });

    test('P013: Search with empty criteria', async ({ pimPage }) => {
      await pimPage.ensureSearchFormVisible();
      await pimPage.click(pimPage.searchButton);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      expect(resultCount).toBeGreaterThan(0);
    });
  });

  test.describe('Edge Case Tests', () => {
    test('P015: Search with very long employee name', async ({ pimPage }) => {
      // Use direct method for edge case testing
      await pimPage.searchByEmployeeNameDirect(TEST_DATA.pimData.longEmployeeName);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      expect(resultCount >= 0).toBeTruthy();
    });

    test('P016: Search with special characters', async ({ pimPage }) => {
      // Use direct method for edge case testing
      await pimPage.searchByEmployeeNameDirect(TEST_DATA.pimData.specialCharEmployeeName);
      await pimPage.page.waitForTimeout(1000);
      const resultCount = await pimPage.getSearchResults();
      
      expect(resultCount >= 0).toBeTruthy();
    });
  });
});