import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // You can add global setup logic here such as:
  // - Database seeding
  // - Server startup
  // - Global authentication state
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Verify the application is accessible
  try {
    await page.goto(config.projects[0].use.baseURL || 'https://opensource-demo.orangehrmlive.com');
    console.log('✅ Application is accessible');
  } catch (error) {
    console.error('❌ Application is not accessible:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed');
}

export default globalSetup; 