import { test, expect } from '../src/fixtures/auth.fixture';
import { TEST_DATA } from '../src/data/test-data';

test.describe('Global Search Module Tests', () => {
  test.beforeEach(async ({ authenticatedPage, dashboardPage }) => {
    // Already authenticated via auth.fixture
    await dashboardPage.navigate();
  });

  test.describe('Functional Tests', () => {
    test('G001 - Menu filtering functionality', async ({ dashboardPage }) => {
      const searchTerm = 'admin';
      await dashboardPage.searchMenu(searchTerm);

      const visibleItems = await dashboardPage.getVisibleMenuItems();
      expect(visibleItems.length).toBeGreaterThan(0);
      
      const allItemsMatch = await dashboardPage.verifyAllVisibleItemsContain(searchTerm);
      expect(allItemsMatch).toBe(true);
    });

    test('G002 - No matches handling', async ({ dashboardPage }) => {
      const searchTerm = 'zzznomatch';
      await dashboardPage.searchMenu(searchTerm);

      const visibleItems = await dashboardPage.getVisibleMenuItems();
      expect(visibleItems.length).toBe(0);
    });

    test('G003 - Search clear functionality', async ({ dashboardPage }) => {
      // Search for something specific
      await dashboardPage.searchMenu('admin');
      const filteredItems = await dashboardPage.getVisibleMenuItems();
      expect(filteredItems.length).toBeGreaterThan(0);

      // Clear search - should show more items than filtered results
      await dashboardPage.clearSearch();
      const restoredItems = await dashboardPage.getVisibleMenuItems();
      expect(restoredItems.length).toBeGreaterThan(filteredItems.length);
    });

    test('G004 - Case insensitive search', async ({ dashboardPage }) => {
      // Test with lowercase
      await dashboardPage.searchMenu('admin');
      const lowercaseResults = await dashboardPage.getVisibleMenuItems();

      // Clear and test with uppercase
      await dashboardPage.clearSearch();
      await dashboardPage.searchMenu('ADMIN');
      const uppercaseResults = await dashboardPage.getVisibleMenuItems();

      // Results should be identical regardless of case
      expect(lowercaseResults.length).toBe(uppercaseResults.length);
      expect(lowercaseResults.length).toBeGreaterThan(0);
      expect(lowercaseResults).toEqual(uppercaseResults);
    });
  });

  test.describe('Edge Cases', () => {
    test('G005 - Very long input handling', async ({ dashboardPage }) => {
      const longSearchTerm = TEST_DATA.searchData.longSearchTerm;
      await dashboardPage.searchMenu(longSearchTerm);

      // Should handle long input gracefully - likely no matches
      const visibleItems = await dashboardPage.getVisibleMenuItems();
      expect(visibleItems.length).toBe(0);
    });

    test('G006 - Unicode characters support', async ({ dashboardPage }) => {
      const unicodeSearchTerm = TEST_DATA.searchData.unicodeSearch;
      await dashboardPage.searchMenu(unicodeSearchTerm);

      // Should handle unicode gracefully - likely no matches
      const visibleItems = await dashboardPage.getVisibleMenuItems();
      expect(visibleItems.length).toBe(0);
    });

    test('G007 - Empty submission behavior', async ({ dashboardPage }) => {
      // Search with empty string
      await dashboardPage.searchMenu('');
      
      // All menu items should be visible
      const visibleItems = await dashboardPage.getVisibleMenuItems();
      expect(visibleItems.length).toBeGreaterThan(5); // Should show all menu items
    });
  });
});