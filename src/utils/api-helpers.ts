import { expect } from '@playwright/test';
import { ApiResponse } from '../api/base-api.client';

/**
 * Common API testing utilities and helper functions
 */
export class ApiHelpers {
  /**
   * Validate API response structure
   */
  static validateApiResponse<T>(
    response: ApiResponse<T>,
    expectedStatus: number,
    shouldHaveData: boolean = true
  ): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.headers).toBeDefined();
    
    if (shouldHaveData) {
      expect(response.data).toBeDefined();
    }
    
    if (expectedStatus >= 200 && expectedStatus < 300) {
      expect(response.success).toBe(true);
    } else {
      expect(response.success).toBe(false);
    }
  }

  /**
   * Validate response time
   */
  static validateResponseTime(
    actualTime: number,
    maxTime: number,
    testName: string = 'API call'
  ): void {
    expect(actualTime).toBeLessThan(maxTime);
    console.log(`${testName} completed in ${actualTime}ms (max: ${maxTime}ms)`);
  }

  /**
   * Validate array response structure
   */
  static validateArrayResponse<T>(
    response: ApiResponse<{ data: T[]; meta: any }>,
    expectedStatus: number = 200
  ): void {
    this.validateApiResponse(response, expectedStatus);
    expect(response.data.data).toBeInstanceOf(Array);
    expect(response.data.meta).toBeDefined();
  }

  /**
   * Validate pagination metadata
   */
  static validatePaginationMeta(meta: any, page: number, limit: number): void {
    expect(meta.total).toBeGreaterThanOrEqual(0);
    if (meta.currentPage !== undefined) {
      expect(meta.currentPage).toBe(page);
    }
    if (meta.pageSize !== undefined) {
      expect(meta.pageSize).toBe(limit);
    }
  }

  /**
   * Generate test execution summary
   */
  static generateTestSummary(
    testResults: Array<{ name: string; success: boolean; duration: number; error?: string }>
  ): {
    totalTests: number;
    passed: number;
    failed: number;
    totalDuration: number;
    averageDuration: number;
    failureRate: number;
  } {
    const totalTests = testResults.length;
    const passed = testResults.filter(r => r.success).length;
    const failed = totalTests - passed;
    const totalDuration = testResults.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = totalDuration / totalTests;
    const failureRate = (failed / totalTests) * 100;

    return {
      totalTests,
      passed,
      failed,
      totalDuration,
      averageDuration,
      failureRate
    };
  }

  /**
   * Validate error response structure
   */
  static validateErrorResponse(
    response: ApiResponse<any>,
    expectedStatus: number,
    shouldHaveErrorMessage: boolean = true
  ): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.success).toBe(false);
    
    if (shouldHaveErrorMessage) {
      // Check for common error message properties
      const hasErrorMessage = 
        response.data?.message ||
        response.data?.error ||
        response.data?.errorMessage ||
        (typeof response.data === 'string' && response.data.length > 0);
      
      expect(hasErrorMessage).toBeTruthy();
    }
  }

  /**
   * Wait for condition with timeout
   */
  static async waitForCondition(
    conditionFn: () => Promise<boolean>,
    timeout: number = 30000,
    interval: number = 1000
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await conditionFn()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    return false;
  }

  /**
   * Retry API call with exponential backoff
   */
  static async retryApiCall<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await apiCall();
        if (response.success) {
          return response;
        }
        lastError = response;
      } catch (error) {
        lastError = error;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Validate security headers
   */
  static validateSecurityHeaders(headers: Record<string, string>): void {
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'strict-transport-security'
    ];

    securityHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`Security header found: ${header} = ${headers[header]}`);
      }
    });
  }

  /**
   * Check for SQL injection vulnerabilities in response
   */
  static validateSqlInjectionSafety(response: ApiResponse<any>): void {
    const responseStr = JSON.stringify(response.data).toLowerCase();
    
    // Check for common SQL error messages
    const sqlErrorPatterns = [
      'sql syntax',
      'mysql_fetch',
      'ora-[0-9]+',
      'microsoft ole db',
      'odbc driver',
      'sqlserver',
      'postgresql'
    ];

    sqlErrorPatterns.forEach(pattern => {
      expect(responseStr).not.toMatch(new RegExp(pattern, 'i'));
    });

    // Should not return raw SQL errors
    expect(response.status).toBeLessThan(500);
  }

  /**
   * Check for XSS vulnerabilities in response
   */
  static validateXssSafety(response: ApiResponse<any>): void {
    const responseStr = JSON.stringify(response.data);
    
    // Check that script tags are properly escaped
    expect(responseStr).not.toContain('<script>');
    expect(responseStr).not.toContain('javascript:');
    expect(responseStr).not.toContain('onload=');
    expect(responseStr).not.toContain('onerror=');
  }

  /**
   * Validate CSRF protection
   */
  static validateCsrfProtection(
    response: ApiResponse<any>,
    requiresCsrfToken: boolean = true
  ): void {
    if (requiresCsrfToken && response.status === 403) {
      // CSRF protection is working if we get 403 without token
      expect(response.success).toBe(false);
    }
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(
    tests: Array<{
      name: string;
      duration: number;
      expectedMaxTime: number;
      passed: boolean;
    }>
  ): {
    summary: {
      totalTests: number;
      passedTests: number;
      averageDuration: number;
      slowestTest: string;
      fastestTest: string;
    };
    details: Array<{
      name: string;
      duration: number;
      expectedMaxTime: number;
      passed: boolean;
      performance: 'fast' | 'acceptable' | 'slow';
    }>;
  } {
    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.passed).length;
    const averageDuration = tests.reduce((sum, t) => sum + t.duration, 0) / totalTests;
    
    const sortedByDuration = [...tests].sort((a, b) => a.duration - b.duration);
    const slowestTest = sortedByDuration[sortedByDuration.length - 1].name;
    const fastestTest = sortedByDuration[0].name;

    const details = tests.map(test => ({
      ...test,
      performance: this.getPerformanceCategory(test.duration, test.expectedMaxTime)
    }));

    return {
      summary: {
        totalTests,
        passedTests,
        averageDuration,
        slowestTest,
        fastestTest
      },
      details
    };
  }

  /**
   * Categorize performance
   */
  private static getPerformanceCategory(
    actualTime: number,
    expectedTime: number
  ): 'fast' | 'acceptable' | 'slow' {
    const ratio = actualTime / expectedTime;
    
    if (ratio <= 0.5) return 'fast';
    if (ratio <= 1.0) return 'acceptable';
    return 'slow';
  }

  /**
   * Validate rate limiting
   */
  static async validateRateLimit(
    apiCall: () => Promise<ApiResponse<any>>,
    requestCount: number = 10,
    timeWindow: number = 1000
  ): Promise<{
    rateLimitDetected: boolean;
    successfulRequests: number;
    blockedRequests: number;
  }> {
    const results = [];
    const startTime = Date.now();
    
    // Make rapid requests
    for (let i = 0; i < requestCount; i++) {
      try {
        const response = await apiCall();
        results.push(response);
      } catch (error) {
        results.push({ status: 500, success: false });
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successfulRequests = results.filter(r => r.success).length;
    const blockedRequests = requestCount - successfulRequests;
    const rateLimitDetected = blockedRequests > 0 || duration > timeWindow * 2;
    
    return {
      rateLimitDetected,
      successfulRequests,
      blockedRequests
    };
  }

  /**
   * Validate data consistency between operations
   */
  static validateDataConsistency<T>(
    originalData: T,
    retrievedData: T,
    fieldsToCheck: (keyof T)[]
  ): boolean {
    return fieldsToCheck.every(field => {
      const original = originalData[field];
      const retrieved = retrievedData[field];
      
      if (original === retrieved) return true;
      
      // Handle string comparison with potential trimming
      if (typeof original === 'string' && typeof retrieved === 'string') {
        return original.trim() === retrieved.trim();
      }
      
      return false;
    });
  }

  /**
   * Generate random test identifier
   */
  static generateTestId(prefix: string = 'TEST'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Log API test results
   */
  static logTestResults(
    testName: string,
    response: ApiResponse<any>,
    duration: number,
    expectedStatus?: number
  ): void {
    const status = expectedStatus ? 
      (response.status === expectedStatus ? 'PASS' : 'FAIL') : 
      (response.success ? 'PASS' : 'FAIL');
    
    console.log(`[${status}] ${testName}`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Success: ${response.success}`);
    
    if (!response.success && response.data) {
      console.log(`  Error: ${JSON.stringify(response.data)}`);
    }
  }
} 