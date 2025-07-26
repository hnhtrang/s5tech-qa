import { test, expect } from '@playwright/test';
import { AuthApiClient } from '../../src/api/auth.api';
import { ApiTestData } from '../../src/data/api-test-data';

test.describe('Authentication API Tests', () => {
  let authClient: AuthApiClient;

  test.beforeEach(async () => {
    authClient = new AuthApiClient();
    await authClient.init();
  });

  test.afterEach(async () => {
    await authClient.dispose();
  });

  test.describe('Login Functionality', () => {
    test('AUTH_001 - Valid Login @smoke @regression', async () => {
      const credentials = ApiTestData.validAuth.credentials;
      
      const startTime = Date.now();
      const response = await authClient.login(credentials);
      const responseTime = Date.now() - startTime;

      // Verify response structure
      expect(response.status).toBe(302); // Redirect after successful login
      expect(response.data.success).toBe(true);
      expect(response.data.redirectUrl).toContain('dashboard');
      expect(response.data.sessionId).toBeDefined();
      expect(response.data.csrfToken).toBeDefined();

      // Verify response time
      expect(responseTime).toBeLessThan(ApiTestData.performance.maxResponseTime.authentication);

      // Verify authentication state
      expect(authClient.isAuthenticated()).toBe(true);
      expect(authClient.getCurrentSessionId()).toBeDefined();
      expect(authClient.getCurrentCSRFToken()).toBeDefined();
    });

    test('AUTH_002 - Invalid Username @regression', async () => {
      const credentials = ApiTestData.invalidAuth.wrongUsername;
      
      const response = await authClient.login(credentials);

      // Verify failed login
      expect(response.data.success).toBe(false);
      expect(response.data.errorMessage).toBeTruthy();
      expect(response.data.redirectUrl).toBeUndefined();

      // Verify no authentication state
      expect(authClient.isAuthenticated()).toBe(false);
    });

    test('AUTH_003 - Invalid Password @regression', async () => {
      const credentials = ApiTestData.invalidAuth.wrongPassword;
      
      const response = await authClient.login(credentials);

      // Verify failed login
      expect(response.data.success).toBe(false);
      expect(response.data.errorMessage).toBeTruthy();
      
      // Verify no authentication state
      expect(authClient.isAuthenticated()).toBe(false);
    });

    test('AUTH_004 - Empty Credentials @regression', async () => {
      const credentials = ApiTestData.invalidAuth.emptyCredentials;
      
      const response = await authClient.login(credentials);

      // Verify failed login
      expect(response.data.success).toBe(false);
      expect(authClient.isAuthenticated()).toBe(false);
    });

    test('AUTH_005 - SQL Injection Protection @security', async () => {
      const credentials = ApiTestData.invalidAuth.sqlInjection;
      
      const response = await authClient.login(credentials);

      // Verify injection is blocked/handled safely
      expect(response.data.success).toBe(false);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500); // Should not cause server error
      
      // Verify no authentication state
      expect(authClient.isAuthenticated()).toBe(false);
    });

    test('AUTH_006 - XSS Attack Protection @security', async () => {
      const credentials = ApiTestData.invalidAuth.xssPayload;
      
      const response = await authClient.login(credentials);

      // Verify XSS is blocked/handled safely
      expect(response.data.success).toBe(false);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);

      // Verify response doesn't contain unescaped script tags
      const responseString = JSON.stringify(response.data);
      expect(responseString).not.toContain('<script>');
      
      // Verify no authentication state
      expect(authClient.isAuthenticated()).toBe(false);
    });

    test('AUTH_007 - Login Performance Test @performance', async () => {
      const credentials = ApiTestData.validAuth.credentials;
      const performanceResults = [];

      // Run multiple login attempts to measure performance
      for (let i = 0; i < 3; i++) {
        // Logout first if authenticated
        if (authClient.isAuthenticated()) {
          await authClient.logout();
        }

        const startTime = Date.now();
        const response = await authClient.login(credentials);
        const responseTime = Date.now() - startTime;

        performanceResults.push(responseTime);
        expect(response.data.success).toBe(true);
        expect(responseTime).toBeLessThan(ApiTestData.performance.maxResponseTime.authentication);
      }

      // Calculate average response time
      const avgResponseTime = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
      console.log(`Average login response time: ${avgResponseTime}ms`);
      
      expect(avgResponseTime).toBeLessThan(ApiTestData.performance.maxResponseTime.authentication);
    });

    test('AUTH_008 - Multiple Failed Login Attempts @security', async () => {
      const invalidCredentials = ApiTestData.invalidAuth.wrongPassword;
      const failedAttempts = [];

      // Try multiple failed logins
      for (let i = 0; i < 5; i++) {
        const response = await authClient.login(invalidCredentials);
        failedAttempts.push(response);
        
        expect(response.data.success).toBe(false);
        // Verify no account lockout causes server errors
        expect(response.status).toBeLessThan(500);
      }

      // After failed attempts, try valid login
      const validCredentials = ApiTestData.validAuth.credentials;
      const validResponse = await authClient.login(validCredentials);
      
      // Should still be able to login with valid credentials
      // (unless there's an account lockout policy)
      if (validResponse.status >= 400 && validResponse.status < 500) {
        console.log('Account lockout or rate limiting detected - this is expected security behavior');
      } else {
        expect(validResponse.data.success).toBe(true);
      }
    });
  });

  test.describe('CSRF Token Management', () => {
    test('AUTH_009 - CSRF Token Retrieval @security', async () => {
      const csrfToken = await authClient.getCSRFToken();
      
      expect(csrfToken).toBeDefined();
      expect(csrfToken).toMatch(/^[a-zA-Z0-9]+$/); // Basic token format validation
      expect(csrfToken!.length).toBeGreaterThan(10); // Reasonable token length
    });

    test('AUTH_010 - Login Without CSRF Token @security', async () => {
      // Try to login without getting CSRF token first
      const credentials = ApiTestData.validAuth.credentials;
      
      // Manually create a request without CSRF token
      const response = await authClient.post('/web/index.php/auth/validate', {
        username: credentials.username,
        password: credentials.password
      }, {
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      // Should fail without CSRF token
      expect(response.success).toBe(false);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('Session Management', () => {
    test('AUTH_011 - Session Info After Login @functional', async () => {
      // Login first
      const credentials = ApiTestData.validAuth.credentials;
      const loginResponse = await authClient.login(credentials);
      expect(loginResponse.data.success).toBe(true);

      // Get session info
      const sessionResponse = await authClient.getSessionInfo();
      
      expect(sessionResponse.data.authenticated).toBe(true);
      expect(sessionResponse.data.sessionId).toBeDefined();
      expect(sessionResponse.data.username).toBeDefined();
    });

    test('AUTH_012 - Session Validation @functional', async () => {
      // Login first
      const credentials = ApiTestData.validAuth.credentials;
      await authClient.login(credentials);

      // Validate session
      const isValid = await authClient.validateSession();
      expect(isValid).toBe(true);
    });

    test('AUTH_013 - Logout Functionality @functional', async () => {
      // Login first
      const credentials = ApiTestData.validAuth.credentials;
      const loginResponse = await authClient.login(credentials);
      expect(loginResponse.data.success).toBe(true);

      // Logout
      const logoutResponse = await authClient.logout();
      
      expect(logoutResponse.data.success).toBe(true);
      expect(authClient.isAuthenticated()).toBe(false);
      expect(authClient.getCurrentSessionId()).toBeNull();
      expect(authClient.getCurrentCSRFToken()).toBeNull();
    });

    test('AUTH_014 - Session After Logout @functional', async () => {
      // Login first
      const credentials = ApiTestData.validAuth.credentials;
      await authClient.login(credentials);

      // Logout
      await authClient.logout();

      // Try to get session info after logout
      const sessionResponse = await authClient.getSessionInfo();
      expect(sessionResponse.data.authenticated).toBe(false);

      // Validate session should return false
      const isValid = await authClient.validateSession();
      expect(isValid).toBe(false);
    });
  });

  test.describe('Login Retry Logic', () => {
    test('AUTH_015 - Login With Retry Success @functional', async () => {
      const credentials = ApiTestData.validAuth.credentials;
      
      const response = await authClient.loginWithRetry(credentials, 2);
      
      expect(response.data.success).toBe(true);
      expect(authClient.isAuthenticated()).toBe(true);
    });

    test('AUTH_016 - Login With Retry Failure @functional', async () => {
      const credentials = ApiTestData.invalidAuth.wrongPassword;
      
      const startTime = Date.now();
      const response = await authClient.loginWithRetry(credentials, 3);
      const totalTime = Date.now() - startTime;
      
      expect(response.data.success).toBe(false);
      expect(authClient.isAuthenticated()).toBe(false);
      
      // Should have taken time for retries
      expect(totalTime).toBeGreaterThan(2000); // At least 2 seconds for retries
    });
  });

  test.describe('Edge Cases', () => {
    test('AUTH_017 - Concurrent Login Attempts @edge', async () => {
      const credentials = ApiTestData.validAuth.credentials;
      
      // Create multiple auth clients for concurrent requests
      const clients = await Promise.all([
        (async () => { const c = new AuthApiClient(); await c.init(); return c; })(),
        (async () => { const c = new AuthApiClient(); await c.init(); return c; })(),
        (async () => { const c = new AuthApiClient(); await c.init(); return c; })()
      ]);

      // Attempt concurrent logins
      const promises = clients.map(client => client.login(credentials));
      const responses = await Promise.all(promises);

      // At least one should succeed
      const successfulLogins = responses.filter(r => r.data.success);
      expect(successfulLogins.length).toBeGreaterThan(0);

      // Clean up
      await Promise.all(clients.map(client => client.dispose()));
    });

    test('AUTH_018 - Very Long Credentials @edge', async () => {
      const longCredentials = {
        username: 'A'.repeat(1000),
        password: 'B'.repeat(1000)
      };
      
      const response = await authClient.login(longCredentials);
      
      // Should handle gracefully without server error
      expect(response.status).toBeLessThan(500);
      expect(response.data.success).toBe(false);
    });

    test('AUTH_019 - Special Characters in Credentials @edge', async () => {
      const specialCredentials = {
        username: 'test@#$%^&*()',
        password: 'pass!@#$%^&*()'
      };
      
      const response = await authClient.login(specialCredentials);
      
      // Should handle gracefully
      expect(response.status).toBeLessThan(500);
      expect(response.data.success).toBe(false);
    });
  });
}); 