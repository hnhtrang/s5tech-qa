import { test, expect } from '../src/fixtures/auth.fixture';
import { TEST_DATA } from '../src/data/test-data';

test.describe('Admin Search Module Tests', () => {
  test.beforeEach(async ({ authenticatedPage, adminPage }) => {
    // Already authenticated via auth.fixture
    await adminPage.navigate();
    await adminPage.waitForPageLoad();
  });

  test.describe('System Users Search Tests', () => {
    test('A001 - Username search functionality', async ({ adminPage }) => {
      const searchUsername = TEST_DATA.validCredentials.username;
      await adminPage.searchByUsername(searchUsername);

      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      expect(resultCount).toBeGreaterThan(0);
      
      const containsUsername = await adminPage.verifyResultsContainUsername(searchUsername);
      expect(containsUsername).toBe(true);  
    });

    test('A002 - User role search functionality', async ({ adminPage }) => {
      const searchRole = TEST_DATA.filterOptions.userRoles[0];
      await adminPage.selectUserRole(searchRole);
      await adminPage.performSearch();
      
      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      expect(resultCount).toBeGreaterThan(0);
      
      const resultsMatchRole = await adminPage.verifyResultsMatchRole(searchRole);
      expect(resultsMatchRole).toBe(true);
    });

    test('A003 - Employee name search functionality', async ({ adminPage }) => {
      await adminPage.searchByEmployeeName(TEST_DATA.searchData.validEmployeeNames[0]);

      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      
      expect(resultCount).toBeGreaterThan(0);
    });

    test('A004 - Status search functionality', async ({ adminPage }) => {
      const searchStatus = TEST_DATA.filterOptions.userStatus[0];
      await adminPage.selectStatus(searchStatus);
      await adminPage.performSearch();
      
      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      expect(resultCount).toBeGreaterThan(0);
      
      const resultsMatchStatus = await adminPage.verifyResultsMatchStatus(searchStatus);
      expect(resultsMatchStatus).toBe(true);
    });

    test('A005 - Combined search criteria functionality', async ({ adminPage }) => {
      const searchUsername = TEST_DATA.validCredentials.username;
      const searchRole = TEST_DATA.filterOptions.userRoles[0];
      const searchStatus = TEST_DATA.filterOptions.userStatus[0];
      
      await adminPage.fillUsername(searchUsername);
      await adminPage.selectUserRole(searchRole);
      await adminPage.selectStatus(searchStatus);
      await adminPage.performSearch();

      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      expect(resultCount).toBeGreaterThan(0);
      
      const containsUsername = await adminPage.verifyResultsContainUsername(searchUsername);
      const resultsMatchRole = await adminPage.verifyResultsMatchRole(searchRole);
      const resultsMatchStatus = await adminPage.verifyResultsMatchStatus(searchStatus);
      
      expect(containsUsername).toBe(true);
      expect(resultsMatchRole).toBe(true);
      expect(resultsMatchStatus).toBe(true);
    });
  });
});