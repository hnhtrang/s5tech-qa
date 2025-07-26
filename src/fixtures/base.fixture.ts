import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { AdminPage } from '../pages/admin.page';
import { PIMPage } from '../pages/pim.page';
import { DirectoryPage } from '../pages/directory.page';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  adminPage: AdminPage;
  pimPage: PIMPage;
  directoryPage: DirectoryPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  pimPage: async ({ page }, use) => {
    await use(new PIMPage(page));
  },

  directoryPage: async ({ page }, use) => {
    await use(new DirectoryPage(page));
  },
});

export { expect } from '@playwright/test';