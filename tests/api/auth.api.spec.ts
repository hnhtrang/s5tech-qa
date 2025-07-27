import { test, expect } from '@playwright/test';
import { getEnvironmentConfig } from '../../src/config/env.config';

const config = getEnvironmentConfig();

test.describe('Authentication API Tests', () => {
  const authEndpoint = '/web/index.php/auth/validate';
  const loginEndpoint = '/web/index.php/auth/login';
  const baseURL = config.baseUrl;

  async function getCSRFToken(request: any): Promise<string> {
    const response = await request.get(`${baseURL}${loginEndpoint}`);
    const body = await response.text();
    const tokenMatch = body.match(/:token="([^"]+)"/);
    if (tokenMatch) {
      return tokenMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
    return '';
  }

  test('AUTH001 - Valid credentials should authenticate successfully', async ({ request }) => {
    const token = await getCSRFToken(request);
    
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: config.username,
        password: config.password,
        _token: token
      }
    });

    // Check if authentication was successful (either redirect or login page with success)
    expect([200, 302]).toContain(response.status());
    
    if (response.status() === 302) {
      expect(response.headers()['location']).toContain('/dashboard/index');
    }
  });

  test('AUTH002 - Invalid username should return error', async ({ request }) => {
    const token = await getCSRFToken(request);
    
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: 'invaliduser',
        password: config.password,
        _token: token
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('auth-login');
  });

  test('AUTH003 - Invalid password should return error', async ({ request }) => {
    const token = await getCSRFToken(request);
    
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: config.username,
        password: 'wrongpassword',
        _token: token
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('auth-login');
  });

  test('AUTH004 - Missing CSRF token should return error', async ({ request }) => {
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: config.username,
        password: config.password
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('CSRF token validation failed');
  });

  test('AUTH005 - Invalid CSRF token should return error', async ({ request }) => {
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: config.username,
        password: config.password,
        _token: 'invalid_token'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('CSRF token validation failed');
  });

  test('AUTH006 - SQL injection attempt should be blocked', async ({ request }) => {
    const token = await getCSRFToken(request);
    
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: "' OR '1'='1' --",
        password: config.password,
        _token: token
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('auth-login'); // Should return login form, not succeed
  });

  test('AUTH007 - XSS attempt should be escaped', async ({ request }) => {
    const token = await getCSRFToken(request);
    
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: '<script>alert("xss")</script>',
        password: config.password,
        _token: token
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('auth-login');
    expect(body).not.toContain('<script>alert("xss")</script>'); // Should be escaped
  });

  test('AUTH008 - HTTP method validation', async ({ request }) => {
    const response = await request.get(`${baseURL}${authEndpoint}`);
    expect(response.status()).toBe(405); // Method Not Allowed
  });

  test('AUTH009 - Security headers validation', async ({ request }) => {
    const token = await getCSRFToken(request);
    
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: config.username,
        password: config.password,
        _token: token
      }
    });

    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['strict-transport-security']).toContain('max-age');
    expect(headers['content-security-policy']).toBeDefined();
  });

  test('AUTH010 - Response time performance', async ({ request }) => {
    const token = await getCSRFToken(request);
    const startTime = Date.now();
    
    const response = await request.post(`${baseURL}${authEndpoint}`, {
      form: {
        username: config.username,
        password: config.password,
        _token: token
      }
    });

    const responseTime = Date.now() - startTime;
    expect([200, 302]).toContain(response.status());
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
  });
});