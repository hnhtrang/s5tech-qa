import { test, expect } from '@playwright/test';
import { getEnvironmentConfig } from '../../src/config/env.config';

const config = getEnvironmentConfig();

interface AuthResult {
  status: number;
  responseTime: number;
  success: boolean;
}

interface RapidAuthResult {
  attempt: number;
  status: number;
  responseTime: number;
  success: boolean;
}

interface MixedAuthResult {
  type: string;
  status: number;
  responseTime: number;
  expectedSuccess: boolean;
}

interface TokenResult {
  status: number;
  responseTime: number;
  hasToken: boolean;
}

test.describe('Authentication API Load Tests', () => {
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

  test('LOAD_AUTH001 - Concurrent valid authentication requests', async ({ request }) => {
    const concurrentUsers = 10;
    const promises: Promise<AuthResult>[] = [];

    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        (async (): Promise<AuthResult> => {
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
          
          return {
            status: response.status(),
            responseTime,
            success: [200, 302].includes(response.status())
          };
        })()
      );
    }

    const results = await Promise.all(promises);
    
    // Analyze results
    const successCount = results.filter(r => r.success).length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));

    console.log(`Success rate: ${successCount}/${concurrentUsers} (${(successCount/concurrentUsers*100).toFixed(1)}%)`);
    console.log(`Average response time: ${averageResponseTime.toFixed(0)}ms`);
    console.log(`Max response time: ${maxResponseTime}ms`);

    // Assertions
    expect(successCount).toBeGreaterThan(0); // At least some should succeed
    expect(averageResponseTime).toBeLessThan(5000); // Average response under 5s
    expect(maxResponseTime).toBeLessThan(10000); // Max response under 10s
  });

  test('LOAD_AUTH002 - Rapid successive authentication attempts', async ({ request }) => {
    const attempts = 5;
    const results: RapidAuthResult[] = [];

    for (let i = 0; i < attempts; i++) {
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
      
      results.push({
        attempt: i + 1,
        status: response.status(),
        responseTime,
        success: [200, 302].includes(response.status())
      });

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successCount = results.filter(r => r.success).length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log('Rapid authentication results:', results);
    console.log(`Success rate: ${successCount}/${attempts}`);
    console.log(`Average response time: ${averageResponseTime.toFixed(0)}ms`);

    expect(successCount).toBeGreaterThan(0);
    expect(averageResponseTime).toBeLessThan(3000);
  });

  test('LOAD_AUTH003 - Mixed valid and invalid authentication load', async ({ request }) => {
    const totalRequests = 8;
    const promises: Promise<MixedAuthResult>[] = [];

    for (let i = 0; i < totalRequests; i++) {
      promises.push(
        (async (): Promise<MixedAuthResult> => {
          const token = await getCSRFToken(request);
          const isValid = i % 2 === 0; // Alternate between valid and invalid
          const startTime = Date.now();
          
          const response = await request.post(`${baseURL}${authEndpoint}`, {
            form: {
              username: isValid ? config.username : 'invaliduser',
              password: isValid ? config.password : 'wrongpassword',
              _token: token
            }
          });

          const responseTime = Date.now() - startTime;
          
          return {
            type: isValid ? 'valid' : 'invalid',
            status: response.status(),
            responseTime,
            expectedSuccess: isValid
          };
        })()
      );
    }

    const results = await Promise.all(promises);
    
    const validResults = results.filter(r => r.type === 'valid');
    const invalidResults = results.filter(r => r.type === 'invalid');
    
    const validSuccesses = validResults.filter(r => [200, 302].includes(r.status)).length;
    const invalidFailures = invalidResults.filter(r => r.status === 200).length;

    console.log(`Valid auth success rate: ${validSuccesses}/${validResults.length}`);
    console.log(`Invalid auth properly rejected: ${invalidFailures}/${invalidResults.length}`);

    expect(validSuccesses).toBeGreaterThan(0);
    expect(results.every(r => r.responseTime < 5000)).toBe(true);
  });

  test('LOAD_AUTH004 - CSRF token load test', async ({ request }) => {
    const tokenRequests = 10;
    const promises: Promise<TokenResult>[] = [];

    for (let i = 0; i < tokenRequests; i++) {
      promises.push(
        (async (): Promise<TokenResult> => {
          const startTime = Date.now();
          const response = await request.get(`${baseURL}${loginEndpoint}`);
          const responseTime = Date.now() - startTime;
          
          const body = await response.text();
          const tokenMatch = body.match(/:token="([^"]+)"/);
          
          return {
            status: response.status(),
            responseTime,
            hasToken: !!tokenMatch
          };
        })()
      );
    }

    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => r.status === 200 && r.hasToken).length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log(`Token generation success rate: ${successCount}/${tokenRequests}`);
    console.log(`Average token response time: ${averageResponseTime.toFixed(0)}ms`);

    expect(successCount).toBe(tokenRequests); // All should succeed
    expect(averageResponseTime).toBeLessThan(2000);
  });
});