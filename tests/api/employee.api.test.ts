import { test, expect } from '@playwright/test';
import { EmployeeApiClient, Employee } from '../../src/api/employee.api';
import { ApiTestData, ApiTestDataHelper } from '../../src/data/api-test-data';

test.describe('Employee API Tests', () => {
  let employeeClient: EmployeeApiClient;
  let createdEmployeeIds: string[] = []; // Track created employees for cleanup

  test.beforeEach(async () => {
    employeeClient = new EmployeeApiClient();
    await employeeClient.init();
    
    // Authenticate before each test
    const authenticated = await employeeClient.authenticate();
    expect(authenticated).toBe(true);
  });

  test.afterEach(async () => {
    // Cleanup created employees
    if (createdEmployeeIds.length > 0) {
      await employeeClient.deleteEmployees(createdEmployeeIds);
      createdEmployeeIds = [];
    }
    
    await employeeClient.dispose();
  });

  test.describe('Employee List Operations', () => {
    test('EMP_001 - Get Employee List @smoke @regression', async () => {
      const startTime = Date.now();
      const response = await employeeClient.getEmployeeList();
      const responseTime = Date.now() - startTime;

      // Verify response structure
      expect(response.status).toBe(200);
      expect(response.data.data).toBeInstanceOf(Array);
      expect(response.data.meta).toBeDefined();
      expect(response.data.meta.total).toBeGreaterThanOrEqual(0);

      // Verify response time
      expect(responseTime).toBeLessThan(ApiTestData.performance.maxResponseTime.employeeList);

      // Verify employee structure if any employees exist
      if (response.data.data.length > 0) {
        const employee = response.data.data[0];
        expect(employee.empNumber).toBeDefined();
        expect(employee.firstName).toBeDefined();
        expect(employee.lastName).toBeDefined();
      }
    });

    test('EMP_002 - Get Employee List with Pagination @functional', async () => {
      const page1Response = await employeeClient.getEmployeeList(1, 10);
      const page2Response = await employeeClient.getEmployeeList(2, 10);

      expect(page1Response.status).toBe(200);
      expect(page2Response.status).toBe(200);

      // Verify pagination works
      if (page1Response.data.meta.total > 10) {
        expect(page1Response.data.data.length).toBeLessThanOrEqual(10);
        expect(page2Response.data.data.length).toBeGreaterThan(0);
      }
    });

    test('EMP_003 - Get Employee Count @functional', async () => {
      const count = await employeeClient.getEmployeesCount();
      expect(count).toBeGreaterThanOrEqual(0);
      expect(typeof count).toBe('number');
    });
  });

  test.describe('Employee CRUD Operations', () => {
    test('EMP_004 - Create Employee @smoke @regression', async () => {
      const employeeData: Employee = {
        ...ApiTestData.employee.employeeToCreate,
        employeeId: ApiTestDataHelper.generateEmployeeId()
      };

      const startTime = Date.now();
      const response = await employeeClient.createEmployee(employeeData);
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(response.data.data).toBeDefined();
      expect(response.data.data.firstName).toBe(employeeData.firstName);
      expect(response.data.data.lastName).toBe(employeeData.lastName);
      expect(response.data.data.employeeId).toBe(employeeData.employeeId);

      // Verify response time
      expect(responseTime).toBeLessThan(ApiTestData.performance.maxResponseTime.employeeCreate);

      // Track for cleanup
      if (response.data.data.empNumber) {
        createdEmployeeIds.push(response.data.data.empNumber);
      }
    });

    test('EMP_005 - Get Employee by ID @functional', async () => {
      // First create an employee
      const employeeData: Employee = {
        ...ApiTestData.employee.validEmployee,
        employeeId: ApiTestDataHelper.generateEmployeeId()
      };
      
      const createResponse = await employeeClient.createEmployee(employeeData);
      expect(createResponse.success).toBe(true);
      
      const empNumber = createResponse.data.data.empNumber!;
      createdEmployeeIds.push(empNumber);

      // Now get the employee by ID
      const getResponse = await employeeClient.getEmployeeById(empNumber);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.data.empNumber).toBe(empNumber);
      expect(getResponse.data.data.firstName).toBe(employeeData.firstName);
    });

    test('EMP_006 - Update Employee @functional', async () => {
      // First create an employee
      const employeeData: Employee = {
        ...ApiTestData.employee.validEmployee,
        employeeId: ApiTestDataHelper.generateEmployeeId()
      };
      
      const createResponse = await employeeClient.createEmployee(employeeData);
      expect(createResponse.success).toBe(true);
      
      const empNumber = createResponse.data.data.empNumber!;
      createdEmployeeIds.push(empNumber);

      // Update the employee
      const updateData = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName'
      };

      const startTime = Date.now();
      const updateResponse = await employeeClient.updateEmployee(empNumber, updateData);
      const responseTime = Date.now() - startTime;

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.data.firstName).toBe(updateData.firstName);
      expect(updateResponse.data.data.lastName).toBe(updateData.lastName);

      // Verify response time
      expect(responseTime).toBeLessThan(ApiTestData.performance.maxResponseTime.employeeUpdate);
    });

    test('EMP_007 - Delete Employee @functional', async () => {
      // First create an employee
      const employeeData: Employee = {
        ...ApiTestData.employee.validEmployee,
        employeeId: ApiTestDataHelper.generateEmployeeId()
      };
      
      const createResponse = await employeeClient.createEmployee(employeeData);
      expect(createResponse.success).toBe(true);
      
      const empNumber = createResponse.data.data.empNumber!;

      // Delete the employee
      const startTime = Date.now();
      const deleteResponse = await employeeClient.deleteEmployee(empNumber);
      const responseTime = Date.now() - startTime;

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data.success).toBe(true);

      // Verify response time
      expect(responseTime).toBeLessThan(ApiTestData.performance.maxResponseTime.employeeDelete);

      // Verify employee is deleted
      const getResponse = await employeeClient.getEmployeeById(empNumber);
      expect(getResponse.status).toBe(404);
    });

    test('EMP_008 - Complete CRUD Lifecycle Test @integration', async () => {
      const testEmployeeData: Employee = {
        ...ApiTestDataHelper.generateRandomEmployee()
      };

      const crudResult = await employeeClient.performCRUDTest(testEmployeeData);

      expect(crudResult.createSuccess).toBe(true);
      expect(crudResult.readSuccess).toBe(true);
      expect(crudResult.updateSuccess).toBe(true);
      expect(crudResult.deleteSuccess).toBe(true);
      expect(crudResult.errors).toHaveLength(0);
    });
  });

  test.describe('Employee Search Operations', () => {
    test('SEARCH_001 - Search Employee by Name @smoke @regression', async () => {
      const searchParams = ApiTestData.search.validSearchParams.employeeName;
      
      const startTime = Date.now();
      const response = await employeeClient.searchByName(
        searchParams.firstName,
        searchParams.lastName
      );
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(response.data.data).toBeInstanceOf(Array);
      expect(response.data.meta).toBeDefined();

      // Verify response time
      expect(responseTime).toBeLessThan(ApiTestData.performance.maxResponseTime.employeeSearch);
    });

    test('SEARCH_002 - Search Employee by ID @functional', async () => {
      // First create an employee to search for
      const employeeData: Employee = {
        ...ApiTestData.employee.validEmployee,
        employeeId: ApiTestDataHelper.generateEmployeeId()
      };
      
      const createResponse = await employeeClient.createEmployee(employeeData);
      expect(createResponse.success).toBe(true);
      
      if (createResponse.data.data.empNumber) {
        createdEmployeeIds.push(createResponse.data.data.empNumber);
      }

      // Search by employee ID
      const searchResponse = await employeeClient.searchByEmployeeId(employeeData.employeeId);

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.data.data.length).toBeGreaterThan(0);
      
      const foundEmployee = searchResponse.data.data.find(emp => emp.employeeId === employeeData.employeeId);
      expect(foundEmployee).toBeDefined();
    });

    test('SEARCH_003 - Search by Job Title @functional', async () => {
      const jobTitle = ApiTestData.search.validSearchParams.jobTitle;
      
      const response = await employeeClient.searchByJobTitle(jobTitle);

      expect(response.status).toBe(200);
      expect(response.data.data).toBeInstanceOf(Array);
    });

    test('SEARCH_004 - Search Non-existent Employee @negative', async () => {
      const nonExistentId = ApiTestData.search.invalidSearchParams.nonExistentEmployee;
      
      const response = await employeeClient.searchByEmployeeId(nonExistentId);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveLength(0);
    });

    test('SEARCH_005 - Search with Special Characters @security', async () => {
      const specialChars = ApiTestData.search.invalidSearchParams.specialCharacters;
      
      const response = await employeeClient.searchByName(specialChars, specialChars);

      // Should handle gracefully without server error
      expect(response.status).toBeLessThan(500);
      expect(response.data.data).toBeInstanceOf(Array);
    });

    test('SEARCH_006 - Search with SQL Injection @security', async () => {
      const sqlInjection = ApiTestData.search.invalidSearchParams.sqlInjection;
      
      const response = await employeeClient.searchByName(sqlInjection, sqlInjection);

      // Should handle safely without server error
      expect(response.status).toBeLessThan(500);
      expect(response.data.data).toBeInstanceOf(Array);
    });

    test('SEARCH_007 - Search with Very Long Term @edge', async () => {
      const longTerm = ApiTestData.search.edgeCaseParams.veryLongTerm;
      
      const response = await employeeClient.searchByName(longTerm, longTerm);

      // Should handle gracefully
      expect(response.status).toBeLessThan(500);
    });

    test('SEARCH_008 - Empty Search Parameters @edge', async () => {
      const response = await employeeClient.searchEmployees({});

      expect(response.status).toBe(200);
      expect(response.data.data).toBeInstanceOf(Array);
    });
  });

  test.describe('Employee Validation Tests', () => {
    test('EMP_009 - Create Employee with Missing Required Fields @negative', async () => {
      const invalidEmployee = ApiTestData.employee.invalidEmployee;
      
      const response = await employeeClient.createEmployeeWithValidation(invalidEmployee);

      expect(response.success).toBe(false);
      expect(response.data.validationErrors).toBeDefined();
      expect(response.data.validationErrors!.length).toBeGreaterThan(0);
    });

    test('EMP_010 - Create Employee with Duplicate ID @negative', async () => {
      const employeeId = ApiTestDataHelper.generateEmployeeId();
      const employeeData1: Employee = {
        ...ApiTestData.employee.validEmployee,
        employeeId
      };
      const employeeData2: Employee = {
        ...ApiTestData.employee.employeeToCreate,
        employeeId // Same ID
      };

      // Create first employee
      const firstResponse = await employeeClient.createEmployee(employeeData1);
      expect(firstResponse.success).toBe(true);
      
      if (firstResponse.data.data.empNumber) {
        createdEmployeeIds.push(firstResponse.data.data.empNumber);
      }

      // Try to create second employee with same ID
      const secondResponse = await employeeClient.createEmployeeWithValidation(employeeData2);

      expect(secondResponse.success).toBe(false);
      expect(secondResponse.data.validationErrors).toContain('Employee ID already exists');
    });

    test('EMP_011 - Create Employee with Long Field Values @edge', async () => {
      const longFieldEmployee = {
        ...ApiTestData.employee.longFieldValues,
        employeeId: ApiTestDataHelper.generateEmployeeId()
      };
      
      const response = await employeeClient.createEmployee(longFieldEmployee);

      // Should either succeed with truncation or fail with validation error
      if (!response.success) {
        expect(response.status).toBeLessThan(500); // Should not cause server error
      }
    });
  });

  test.describe('Employee Performance Tests', () => {
    test('EMP_012 - Employee Metrics Retrieval @performance', async () => {
      const startTime = Date.now();
      const metrics = await employeeClient.getEmployeeMetrics();
      const responseTime = Date.now() - startTime;

      expect(metrics.totalEmployees).toBeGreaterThanOrEqual(0);
      expect(metrics.activeEmployees).toBeGreaterThanOrEqual(0);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('EMP_013 - Bulk Operations Performance @performance', async () => {
      const employeesToCreate = 5;
      const employees: Employee[] = [];

      for (let i = 0; i < employeesToCreate; i++) {
        employees.push({
          ...ApiTestDataHelper.generateRandomEmployee()
        });
      }

      const startTime = Date.now();
      const createPromises = employees.map(emp => employeeClient.createEmployee(emp));
      const responses = await Promise.all(createPromises);
      const totalTime = Date.now() - startTime;

      // Track successful creations for cleanup
      responses.forEach(response => {
        if (response.success && response.data.data.empNumber) {
          createdEmployeeIds.push(response.data.data.empNumber);
        }
      });

      const successfulCreations = responses.filter(r => r.success).length;
      expect(successfulCreations).toBeGreaterThan(0);

      // Calculate average time per creation
      const avgTimePerCreation = totalTime / employeesToCreate;
      expect(avgTimePerCreation).toBeLessThan(ApiTestData.performance.maxResponseTime.employeeCreate);
    });
  });

  test.describe('Error Handling Tests', () => {
    test('EMP_014 - Get Non-existent Employee @negative', async () => {
      const nonExistentId = '999999';
      
      const response = await employeeClient.getEmployeeById(nonExistentId);

      expect(response.status).toBe(404);
    });

    test('EMP_015 - Update Non-existent Employee @negative', async () => {
      const nonExistentId = '999999';
      const updateData = { firstName: 'Updated' };
      
      const response = await employeeClient.updateEmployee(nonExistentId, updateData);

      expect(response.status).toBe(404);
    });

    test('EMP_016 - Delete Non-existent Employee @negative', async () => {
      const nonExistentId = '999999';
      
      const response = await employeeClient.deleteEmployee(nonExistentId);

      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    });

    test('EMP_017 - Unauthenticated Request @security', async () => {
      // Create a new client without authentication
      const unauthenticatedClient = new EmployeeApiClient();
      await unauthenticatedClient.init();

      const response = await unauthenticatedClient.getEmployeeList();

      expect(response.status).toBeGreaterThanOrEqual(401);
      expect(response.status).toBeLessThanOrEqual(403);

      await unauthenticatedClient.dispose();
    });
  });

  test.describe('Employee Helper Functions', () => {
    test('EMP_018 - Check Employee Exists @functional', async () => {
      // Create an employee first
      const employeeData: Employee = {
        ...ApiTestData.employee.validEmployee,
        employeeId: ApiTestDataHelper.generateEmployeeId()
      };
      
      const createResponse = await employeeClient.createEmployee(employeeData);
      expect(createResponse.success).toBe(true);
      
      if (createResponse.data.data.empNumber) {
        createdEmployeeIds.push(createResponse.data.data.empNumber);
      }

      // Check if employee exists
      const exists = await employeeClient.employeeExists(employeeData.employeeId);
      expect(exists).toBe(true);

      // Check non-existent employee
      const nonExistent = await employeeClient.employeeExists('NON_EXISTENT_ID');
      expect(nonExistent).toBe(false);
    });

    test('EMP_019 - Bulk Delete Operations @functional', async () => {
      // Create multiple employees
      const employees: Employee[] = [
        { ...ApiTestDataHelper.generateRandomEmployee() },
        { ...ApiTestDataHelper.generateRandomEmployee() },
        { ...ApiTestDataHelper.generateRandomEmployee() }
      ];

      const createPromises = employees.map(emp => employeeClient.createEmployee(emp));
      const createResponses = await Promise.all(createPromises);

      const empNumbers = createResponses
        .filter(r => r.success)
        .map(r => r.data.data.empNumber!)
        .filter(Boolean);

      expect(empNumbers.length).toBeGreaterThan(0);

      // Bulk delete
      const bulkDeleteResponse = await employeeClient.deleteEmployees(empNumbers);

      expect(bulkDeleteResponse.data.deletedCount).toBeGreaterThan(0);
      expect(bulkDeleteResponse.data.deletedCount).toBeLessThanOrEqual(empNumbers.length);
    });
  });
}); 