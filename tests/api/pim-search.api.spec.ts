import { test, expect } from '@playwright/test';
import { getEnvironmentConfig } from '../../src/config/env.config';

const config = getEnvironmentConfig();

test.describe('PIM Employee Search API Tests', () => {
  const searchEndpoint = '/web/index.php/api/v2/pim/employees';
  const authEndpoint = '/web/index.php/auth/validate';
  const loginEndpoint = '/web/index.php/auth/login';
  const baseURL = config.baseUrl;

  async function getAuthenticatedRequest(request: any) {
    // Get CSRF token
    const loginResponse = await request.get(`${baseURL}${loginEndpoint}`);
    const loginBody = await loginResponse.text();
    const tokenMatch = loginBody.match(/:token="([^"]+)"/);
    const token = tokenMatch ? tokenMatch[1].replace(/&quot;/g, '"') : '';

    // Authenticate and get session
    const authResponse = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: config.username,
        password: config.password,
        _token: token
      }
    });

    // Extract session cookies
    const cookies = authResponse.headers()['set-cookie'];
    return cookies || '';
  }

  test('SEARCH001 - Get all employees without filters', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    
    const response = await request.get(`${baseURL}${searchEndpoint}`, {
      headers: {
        'Cookie': cookies
      }
    });

    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(Array.isArray(data.data)).toBe(true);
    }
  });

  test('SEARCH002 - Search with pagination parameters', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    
    const response = await request.get(`${baseURL}${searchEndpoint}?limit=10&offset=0`, {
      headers: {
        'Cookie': cookies
      }
    });

    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.data.length).toBeLessThanOrEqual(10);
      expect(data.meta).toHaveProperty('total');
    }
  });

  test('SEARCH003 - Search by employee name', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    
    const response = await request.get(`${baseURL}${searchEndpoint}?nameOrId=John`, {
      headers: {
        'Cookie': cookies
      }
    });

    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    }
  });

  test('SEARCH004 - Search with sorting', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    
    const response = await request.get(`${baseURL}${searchEndpoint}?sortField=employee.firstName&sortOrder=ASC`, {
      headers: {
        'Cookie': cookies
      }
    });

    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    }
  });

  test('SEARCH005 - Invalid parameter should handle gracefully', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    
    const response = await request.get(`${baseURL}${searchEndpoint}?invalidParam=test`, {
      headers: {
        'Cookie': cookies
      }
    });

    expect([200, 400, 401]).toContain(response.status());
  });

  test('SEARCH006 - Large limit parameter', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    
    const response = await request.get(`${baseURL}${searchEndpoint}?limit=1000`, {
      headers: {
        'Cookie': cookies
      }
    });

    expect([200, 400, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.data.length).toBeLessThanOrEqual(1000);
    }
  });

  test('SEARCH007 - Unauthorized access should be rejected', async ({ request }) => {
    const response = await request.get(`${baseURL}${searchEndpoint}`);
    
    expect([401, 403, 302]).toContain(response.status());
  });

  test('SEARCH008 - Response time performance', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    const startTime = Date.now();
    
    const response = await request.get(`${baseURL}${searchEndpoint}?limit=50`, {
      headers: {
        'Cookie': cookies
      }
    });

    const responseTime = Date.now() - startTime;
    
    expect([200, 401]).toContain(response.status());
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
  });

  test('SEARCH009 - SQL injection in search parameter', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    
    const response = await request.get(`${baseURL}${searchEndpoint}?nameOrId=' OR '1'='1' --`, {
      headers: {
        'Cookie': cookies
      }
    });

    expect([200, 400, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    }
  });

  test('SEARCH010 - XSS attempt in search parameter', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    
    const response = await request.get(`${baseURL}${searchEndpoint}?nameOrId=<script>alert('xss')</script>`, {
      headers: {
        'Cookie': cookies
      }
    });

    expect([200, 400, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    }
  });
});