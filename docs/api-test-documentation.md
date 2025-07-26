# API Test Documentation

## Overview
This document provides comprehensive information about the API test framework designed for the OrangeHRM application. The API tests are built using Playwright's API testing capabilities with TypeScript.

## Table of Contents
1. [Test Structure](#test-structure)
2. [API Clients](#api-clients)
3. [Test Categories](#test-categories)
4. [Running Tests](#running-tests)
5. [Test Data Management](#test-data-management)
6. [Authentication Flow](#authentication-flow)
7. [Error Handling](#error-handling)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Reporting](#reporting)

## Test Structure

### Directory Layout
```
src/
├── api/
│   ├── base-api.client.ts      # Base API client with common functionality
│   ├── auth.api.ts             # Authentication API client
│   └── employee.api.ts         # Employee management API client
├── data/
│   └── api-test-data.ts        # API test data and constants
└── utils/
    └── api-helpers.ts          # API testing utility functions

tests/
└── api/
    ├── auth.api.test.ts        # Authentication API tests
    ├── employee.api.test.ts    # Employee CRUD API tests
    └── integration.api.test.ts # Integration and workflow tests
```

## API Clients

### BaseApiClient
The foundation class that provides:
- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Response processing
- Authentication token management
- Cookie handling
- Error processing

### AuthApiClient
Extends BaseApiClient to provide:
- CSRF token retrieval
- Login/logout operations
- Session management
- Authentication state validation
- Retry logic with exponential backoff

### EmployeeApiClient
Extends AuthApiClient to provide:
- Employee CRUD operations
- Search functionality
- Bulk operations
- Data validation
- Performance metrics

## Test Categories

### Functional Tests (@functional)
- Basic API functionality validation
- CRUD operations testing
- Search functionality
- Data retrieval and manipulation

### Security Tests (@security)
- Authentication and authorization
- SQL injection protection
- XSS attack prevention
- CSRF token validation
- Input sanitization
- Rate limiting validation

### Performance Tests (@performance)
- Response time validation
- Bulk operation performance
- Concurrent request handling
- Load testing scenarios

### Integration Tests (@integration)
- End-to-end workflows
- Multi-step operations
- Cross-module functionality
- Session management across operations

### Negative Tests (@negative)
- Invalid input handling
- Error response validation
- Non-existent resource handling
- Unauthorized access attempts

### Edge Cases (@edge)
- Boundary value testing
- Large data handling
- Special character processing
- Concurrent operations

## Running Tests

### Basic Commands
```bash
# Run all API tests
npm run test:api

# Run specific test files
npm run test:api:auth
npm run test:api:employee
npm run test:api:integration

# Run tests by category
npm run test:security
npm run test:performance
npm run test:integration
npm run test:smoke
npm run test:regression

# Run tests in different browsers
npm run test:chrome
npm run test:firefox
npm run test:safari

# Run tests with different configurations
npm run test:headed      # With browser UI
npm run test:debug       # Debug mode
npm run test:parallel    # Parallel execution
npm run test:serial      # Serial execution
```

### CI/CD Commands
```bash
# Run tests for CI/CD pipeline
npm run test:ci
npm run test:api:ci

# Clean up previous results
npm run clean
```

## Test Data Management

### ApiTestData Structure
```typescript
export const ApiTestData = {
  // API endpoints
  endpoints: {
    auth: { login, logout, session },
    employee: { list, search, create, update, delete, details }
  },
  
  // Authentication data
  validAuth: { credentials, loginPayload },
  invalidAuth: { wrongUsername, wrongPassword, sqlInjection, xssPayload },
  
  // Employee test data
  employee: { validEmployee, employeeToCreate, invalidEmployee },
  
  // Search parameters
  search: { validSearchParams, invalidSearchParams, edgeCaseParams },
  
  // Performance expectations
  performance: { maxResponseTime, timeouts },
  
  // Expected responses
  expectedResponses: { loginSuccess, employeeList, notFound }
};
```

### Data Generation
```typescript
// Generate random employee data
const employee = ApiTestDataHelper.generateRandomEmployee();

// Generate unique employee ID
const empId = ApiTestDataHelper.generateEmployeeId();

// Generate test identifier
const testId = ApiHelpers.generateTestId('API_TEST');
```

## Authentication Flow

### Standard Authentication
```typescript
// Create client and authenticate
const employeeClient = new EmployeeApiClient();
await employeeClient.init();
await employeeClient.authenticate();

// Perform operations
const response = await employeeClient.getEmployeeList();
```

### Manual Authentication
```typescript
// Manual login
const authClient = new AuthApiClient();
await authClient.init();
const loginResponse = await authClient.login(credentials);

// Use tokens in other clients
employeeClient.setAuthTokens({
  sessionId: authClient.getCurrentSessionId(),
  csrfToken: authClient.getCurrentCSRFToken()
});
```

### Session Management
```typescript
// Check authentication status
if (authClient.isAuthenticated()) {
  // Perform authenticated operations
}

// Validate session
const isValid = await authClient.validateSession();

// Logout
await authClient.logout();
```

## Error Handling

### Response Validation
```typescript
// Validate successful response
ApiHelpers.validateApiResponse(response, 200, true);

// Validate error response
ApiHelpers.validateErrorResponse(response, 400, true);

// Validate array response
ApiHelpers.validateArrayResponse(response, 200);
```

### Security Validation
```typescript
// Check for SQL injection safety
ApiHelpers.validateSqlInjectionSafety(response);

// Check for XSS safety
ApiHelpers.validateXssSafety(response);

// Validate CSRF protection
ApiHelpers.validateCsrfProtection(response, true);
```

### Retry Logic
```typescript
// Retry API call with exponential backoff
const result = await ApiHelpers.retryApiCall(
  () => employeeClient.getEmployeeList(),
  maxRetries = 3,
  baseDelay = 1000
);
```

## Performance Testing

### Response Time Validation
```typescript
const startTime = Date.now();
const response = await apiCall();
const duration = Date.now() - startTime;

ApiHelpers.validateResponseTime(
  duration,
  ApiTestData.performance.maxResponseTime.employeeList,
  'Employee List API'
);
```

### Performance Reporting
```typescript
const performanceReport = ApiHelpers.generatePerformanceReport([
  {
    name: 'API Call 1',
    duration: 150,
    expectedMaxTime: 200,
    passed: true
  },
  // ... more tests
]);

console.log('Performance Summary:', performanceReport.summary);
```

### Bulk Operations
```typescript
// Test bulk employee creation
const employees = Array.from({ length: 10 }, () => 
  ApiTestDataHelper.generateRandomEmployee()
);

const createPromises = employees.map(emp => 
  employeeClient.createEmployee(emp)
);

const responses = await Promise.all(createPromises);
```

## Security Testing

### Authentication Testing
```typescript
// Test invalid credentials
const response = await authClient.login(invalidCredentials);
expect(response.data.success).toBe(false);

// Test unauthorized access
const unauthClient = new EmployeeApiClient();
const unauthorizedResponse = await unauthClient.getEmployeeList();
expect(unauthorizedResponse.status).toBeGreaterThanOrEqual(401);
```

### Input Validation Testing
```typescript
const maliciousInputs = [
  "'; DROP TABLE users; --",
  '<script>alert("XSS")</script>',
  '../../etc/passwd'
];

for (const input of maliciousInputs) {
  const response = await employeeClient.searchByName(input, input);
  ApiHelpers.validateSqlInjectionSafety(response);
  ApiHelpers.validateXssSafety(response);
}
```

### Rate Limiting Testing
```typescript
const rateLimitResult = await ApiHelpers.validateRateLimit(
  () => employeeClient.getEmployeeList(),
  requestCount = 10,
  timeWindow = 1000
);

console.log('Rate limit detected:', rateLimitResult.rateLimitDetected);
```

## Reporting

### Test Results
Tests generate multiple types of reports:
- HTML Report: Visual test results with screenshots
- JUnit XML: For CI/CD integration
- JSON Report: Machine-readable results
- Console Output: Real-time test progress

### Performance Metrics
- Response time measurements
- Success/failure rates
- Concurrent operation handling
- Resource utilization

### Security Assessment
- Vulnerability detection results
- Input validation effectiveness
- Authentication bypass attempts
- Data exposure risks

## Best Practices

### Test Organization
1. Group related tests in describe blocks
2. Use descriptive test names with IDs
3. Tag tests with appropriate categories (@smoke, @regression, etc.)
4. Implement proper cleanup in afterEach hooks

### Data Management
1. Use dynamic test data generation
2. Clean up created resources after tests
3. Avoid hardcoded values where possible
4. Implement data consistency validation

### Error Handling
1. Validate both success and error scenarios
2. Check response structure and content
3. Implement proper timeout handling
4. Use retry logic for flaky operations

### Performance
1. Set realistic performance expectations
2. Monitor response times consistently
3. Test under various load conditions
4. Validate system behavior under stress

### Security
1. Test authentication and authorization thoroughly
2. Validate input sanitization
3. Check for common vulnerabilities
4. Implement proper session management testing

## Troubleshooting

### Common Issues
1. **Authentication Failures**: Check CSRF token retrieval and session management
2. **Timeout Errors**: Adjust timeout values in test configuration
3. **Data Consistency**: Ensure proper cleanup and data isolation
4. **Performance Issues**: Review system load and test execution timing

### Debug Techniques
1. Enable detailed logging in API clients
2. Use Playwright's debug mode for step-by-step execution
3. Capture request/response details for analysis
4. Implement custom validation helpers for specific scenarios

### CI/CD Considerations
1. Use stable test data and environments
2. Implement proper test isolation
3. Handle test dependencies appropriately
4. Monitor test execution times and failure patterns 