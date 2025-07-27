import { test, expect } from '@playwright/test';
import { getEnvironmentConfig } from '../../src/config/env.config';

const config = getEnvironmentConfig();

interface SearchResult {
  status: number;
  responseTime: number;
  success: boolean;
}

interface QueryResult {
  query: string;
  status: number;
  responseTime: number;
  success: boolean;
}

interface RapidSearchResult {
  iteration: number;
  status: number;
  responseTime: number;
  success: boolean;
}

interface PaginationResult {
  pageSize: number;
  status: number;
  responseTime: number;
  dataCount: number;
  success: boolean;
}

interface OverheadResult {
  iteration: number;
  authTime: number;
  searchTime: number;
  totalTime: number;
  status: number;
  success: boolean;
}

test.describe('PIM Employee Search API Load Tests', () => {
  const searchEndpoint = '/web/index.php/api/v2/pim/employees';
  const authEndpoint = '/web/index.php/auth/validate';
  const loginEndpoint = '/web/index.php/auth/login';
  const baseURL = config.baseUrl;

  async function getAuthenticatedRequest(request: any): Promise<string> {
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

  test('LOAD_SEARCH001 - Concurrent search requests', async ({ request }) => {
    const concurrentUsers = 8;
    const cookies = await getAuthenticatedRequest(request);
    const promises: Promise<SearchResult>[] = [];

    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        (async (): Promise<SearchResult> => {
          const startTime = Date.now();
          
          const response = await request.get(`${baseURL}${searchEndpoint}?limit=50`, {
            headers: {
              'Cookie': cookies
            }
          });

          const responseTime = Date.now() - startTime;
          
          return {
            status: response.status(),
            responseTime,
            success: response.status() === 200
          };
        })()
      );
    }

    const results = await Promise.all(promises);
    
    // Analyze results
    const successCount = results.filter(r => r.success).length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));

    console.log(`Search success rate: ${successCount}/${concurrentUsers} (${(successCount/concurrentUsers*100).toFixed(1)}%)`);
    console.log(`Average response time: ${averageResponseTime.toFixed(0)}ms`);
    console.log(`Max response time: ${maxResponseTime}ms`);

    // Assertions - Focus on performance metrics
    expect(averageResponseTime).toBeLessThan(4000); // Average response under 4s
    expect(maxResponseTime).toBeLessThan(8000); // Max response under 8s
    expect(results.length).toBe(concurrentUsers); // All requests completed
  });

  test('LOAD_SEARCH002 - Different search parameters load test', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    const searchQueries = [
      '?limit=10&offset=0',
      '?limit=50&offset=0',
      '?nameOrId=John',
      '?sortField=employee.firstName&sortOrder=ASC',
      '?includeEmployees=onlyCurrent',
      '?limit=25&sortField=employee.lastName&sortOrder=DESC'
    ];

    const promises: Promise<QueryResult>[] = searchQueries.map(query => 
      (async (): Promise<QueryResult> => {
        const startTime = Date.now();
        
        const response = await request.get(`${baseURL}${searchEndpoint}${query}`, {
          headers: {
            'Cookie': cookies
          }
        });

        const responseTime = Date.now() - startTime;
        
        return {
          query,
          status: response.status(),
          responseTime,
          success: response.status() === 200
        };
      })()
    );

    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => r.success).length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log('Search query results:');
    results.forEach(r => {
      console.log(`${r.query}: ${r.status} (${r.responseTime}ms)`);
    });
    console.log(`Overall success rate: ${successCount}/${searchQueries.length}`);
    console.log(`Average response time: ${averageResponseTime.toFixed(0)}ms`);

    expect(averageResponseTime).toBeLessThan(3000);
    expect(results.length).toBe(searchQueries.length); // All queries completed
  });

  test('LOAD_SEARCH003 - Rapid successive search requests', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    const iterations = 5;
    const results: RapidSearchResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      const response = await request.get(`${baseURL}${searchEndpoint}?limit=20&offset=${i * 20}`, {
        headers: {
          'Cookie': cookies
        }
      });

      const responseTime = Date.now() - startTime;
      
      results.push({
        iteration: i + 1,
        status: response.status(),
        responseTime,
        success: response.status() === 200
      });

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const successCount = results.filter(r => r.success).length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log('Rapid search results:', results);
    console.log(`Success rate: ${successCount}/${iterations}`);
    console.log(`Average response time: ${averageResponseTime.toFixed(0)}ms`);

    expect(averageResponseTime).toBeLessThan(2500);
    expect(results.length).toBe(iterations); // All iterations completed
  });

  test('LOAD_SEARCH004 - Large dataset pagination load test', async ({ request }) => {
    const cookies = await getAuthenticatedRequest(request);
    const pageSizes = [10, 25, 50, 100];
    const promises: Promise<PaginationResult>[] = [];

    pageSizes.forEach(pageSize => {
      promises.push(
        (async (): Promise<PaginationResult> => {
          const startTime = Date.now();
          
          const response = await request.get(`${baseURL}${searchEndpoint}?limit=${pageSize}&offset=0`, {
            headers: {
              'Cookie': cookies
            }
          });

          const responseTime = Date.now() - startTime;
          let dataCount = 0;
          
          if (response.status() === 200) {
            const data = await response.json();
            dataCount = data.data?.length || 0;
          }
          
          return {
            pageSize,
            status: response.status(),
            responseTime,
            dataCount,
            success: response.status() === 200
          };
        })()
      );
    });

    const results = await Promise.all(promises);
    
    console.log('Pagination load test results:');
    results.forEach(r => {
      console.log(`Page size ${r.pageSize}: ${r.status} (${r.responseTime}ms, ${r.dataCount} records)`);
    });

    const successCount = results.filter(r => r.success).length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    expect(averageResponseTime).toBeLessThan(3000);
    expect(results.length).toBe(pageSizes.length); // All page sizes tested
    
    // Verify larger page sizes don't dramatically increase response time
    const smallPageResult = results.find(r => r.pageSize === 10);
    const largePageResult = results.find(r => r.pageSize === 100);
    
    if (smallPageResult?.success && largePageResult?.success) {
      const timeIncrease = largePageResult.responseTime / smallPageResult.responseTime;
      expect(timeIncrease).toBeLessThan(3); // Large page shouldn't be 3x slower
    }
  });

  test('LOAD_SEARCH005 - Search with authentication overhead', async ({ request }) => {
    const searchRequests = 3;
    const results: OverheadResult[] = [];

    for (let i = 0; i < searchRequests; i++) {
      const totalStartTime = Date.now();
      
      // Include authentication time in each iteration
      const cookies = await getAuthenticatedRequest(request);
      const authTime = Date.now() - totalStartTime;
      
      const searchStartTime = Date.now();
      const response = await request.get(`${baseURL}${searchEndpoint}?limit=30`, {
        headers: {
          'Cookie': cookies
        }
      });
      const searchTime = Date.now() - searchStartTime;
      const totalTime = Date.now() - totalStartTime;
      
      results.push({
        iteration: i + 1,
        authTime,
        searchTime,
        totalTime,
        status: response.status(),
        success: response.status() === 200
      });
    }

    const successCount = results.filter(r => r.success).length;
    const avgAuthTime = results.reduce((sum, r) => sum + r.authTime, 0) / results.length;
    const avgSearchTime = results.reduce((sum, r) => sum + r.searchTime, 0) / results.length;
    const avgTotalTime = results.reduce((sum, r) => sum + r.totalTime, 0) / results.length;

    console.log('Authentication + Search overhead:');
    console.log(`Average auth time: ${avgAuthTime.toFixed(0)}ms`);
    console.log(`Average search time: ${avgSearchTime.toFixed(0)}ms`);
    console.log(`Average total time: ${avgTotalTime.toFixed(0)}ms`);
    console.log(`Success rate: ${successCount}/${searchRequests}`);

    expect(avgTotalTime).toBeLessThan(6000); // Total flow under 6s
    expect(avgSearchTime).toBeLessThan(3000); // Search itself under 3s
    expect(results.length).toBe(searchRequests); // All requests completed
  });
});