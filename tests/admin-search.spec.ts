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
      await adminPage.searchByUsername(TEST_DATA.validCredentials.username);

      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      expect(resultCount).toBeGreaterThan(0);
      
      // Verify we're not showing "No Records Found"
      const hasNoRecords = await adminPage.hasNoRecords();
      expect(hasNoRecords).toBe(false);
    });

    test('A002 - User role search functionality', async ({ adminPage }) => {
      await adminPage.selectUserRole(TEST_DATA.filterOptions.userRoles[0]); // 'Admin'
      await adminPage.performSearch();
      
      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      expect(resultCount).toBeGreaterThan(0);
      
      // Verify we're not showing "No Records Found"
      const hasNoRecords = await adminPage.hasNoRecords();
      expect(hasNoRecords).toBe(false);
    });

    test('A003 - Employee name search functionality', async ({ adminPage }) => {
      await adminPage.searchByEmployeeName(TEST_DATA.searchData.validEmployeeNames[0]); // 'John'

      await adminPage.page.waitForTimeout(1000);
      
      // Should either have results or show no records message
      const resultCount = await adminPage.getSearchResults();
      const hasNoRecords = await adminPage.hasNoRecords();
      
      // Either we have results OR we have "No Records Found" message
      expect(resultCount > 0 || hasNoRecords).toBe(true);
    });

    test('A004 - Status search functionality', async ({ adminPage }) => {
      await adminPage.selectStatus(TEST_DATA.filterOptions.userStatus[0]); // 'Enabled'
      await adminPage.performSearch();
      
      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      expect(resultCount).toBeGreaterThan(0);
      
      // Verify we're not showing "No Records Found" for enabled users
      const hasNoRecords = await adminPage.hasNoRecords();
      expect(hasNoRecords).toBe(false);
    });

    test('A005 - Combined search criteria functionality', async ({ adminPage }) => {
      // Set all search criteria before searching using test data
      await adminPage.fillUsername(TEST_DATA.validCredentials.username);
      await adminPage.selectUserRole(TEST_DATA.filterOptions.userRoles[0]); // 'Admin'
      await adminPage.selectStatus(TEST_DATA.filterOptions.userStatus[0]); // 'Enabled'
      await adminPage.performSearch();

      await adminPage.page.waitForTimeout(1000);
      
      const resultCount = await adminPage.getSearchResults();
      const hasNoRecords = await adminPage.hasNoRecords();
      
      expect(resultCount).toBe(1);
      expect(hasNoRecords).toBe(false);
    });
  });
});