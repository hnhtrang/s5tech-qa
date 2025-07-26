import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TEST_DATA } from '../data/test-data';

export class DashboardPage extends BasePage {
  readonly searchBox: Locator;
  readonly userDropdown: Locator;
  readonly logoutButton: Locator;
  readonly sidebarMenu: Locator;
  readonly menuItems: Locator;

  constructor(page: Page) {
    super(page, TEST_DATA.urlPaths.dashboard);
    this.searchBox = page.getByPlaceholder('Search');
    this.userDropdown = page.locator('.oxd-userdropdown');
    this.logoutButton = page.getByText('Logout');
    this.sidebarMenu = page.locator('.oxd-sidepanel-body');
    this.menuItems = page.locator('.oxd-main-menu-item');
  }

  async searchMenu(searchTerm: string): Promise<void> {
    await this.fill(this.searchBox, searchTerm);
  }

  async getVisibleMenuItems(): Promise<string[]> {
    const items = await this.menuItems.allTextContents();
    return items.filter(item => item.trim() !== '');
  }

  async clickMenuItem(menuName: string): Promise<void> {
    await this.page.getByText(menuName).click();
  }

  async logout(): Promise<void> {
    await this.click(this.userDropdown);
    await this.click(this.logoutButton);
  }

  async clearSearch(): Promise<void> {
    await this.searchBox.clear();
  }

  async isMenuItemVisible(menuName: string): Promise<boolean> {
    return await this.page.getByText(menuName).isVisible();
  }
}