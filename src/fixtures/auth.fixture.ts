import { test as base } from './base.fixture';
import { TEST_DATA } from '../data/test-data';
import { Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, loginPage }, use) => {
    await loginPage.navigate();
    await loginPage.login(TEST_DATA.validCredentials.username, TEST_DATA.validCredentials.password);
    await loginPage.waitForLogin();
    await use(page);
  },
});

export { expect } from '@playwright/test';