export const ApiTestData = {
  // API Endpoints
  endpoints: {
    auth: {
      login: '/web/index.php/auth/validate',
      logout: '/web/index.php/auth/logout',
      session: '/web/index.php/auth/session'
    },
    employee: {
      list: '/web/index.php/api/v2/pim/employees',
      search: '/web/index.php/api/v2/pim/employees/search',
      create: '/web/index.php/api/v2/pim/employees',
      update: '/web/index.php/api/v2/pim/employees/{id}',
      delete: '/web/index.php/api/v2/pim/employees/{id}',
      details: '/web/index.php/api/v2/pim/employees/{id}'
    },
    dashboard: {
      widgets: '/web/index.php/api/v2/dashboard/widgets',
      statistics: '/web/index.php/api/v2/dashboard/statistics'
    },
    admin: {
      users: '/web/index.php/api/v2/admin/users',
      systemUsers: '/web/index.php/api/v2/admin/system-users'
    }
  },

  // Valid authentication payloads
  validAuth: {
    credentials: {
      username: 'Admin',
      password: 'admin123'
    },
    loginPayload: {
      _token: '', // Will be populated dynamically
      username: 'Admin',
      password: 'admin123'
    }
  },

  // Invalid authentication payloads
  invalidAuth: {
    wrongUsername: {
      username: 'InvalidUser',
      password: 'admin123'
    },
    wrongPassword: {
      username: 'Admin',
      password: 'wrongpassword'
    },
    emptyCredentials: {
      username: '',
      password: ''
    },
    sqlInjection: {
      username: "admin'; DROP TABLE users; --",
      password: 'admin123'
    },
    xssPayload: {
      username: '<script>alert("XSS")</script>',
      password: 'admin123'
    }
  },

  // Employee API test data
  employee: {
    validEmployee: {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'William',
      employeeId: 'EMP001',
      empStatus: 'Enabled'
    },
    employeeToCreate: {
      firstName: 'Jane',
      lastName: 'Smith',
      middleName: 'Marie',
      employeeId: 'EMP002',
      empStatus: 'Enabled'
    },
    employeeToUpdate: {
      firstName: 'Jane',
      lastName: 'Doe',
      middleName: 'Marie',
      employeeId: 'EMP002',
      empStatus: 'Enabled'
    },
    invalidEmployee: {
      firstName: '', // Empty required field
      lastName: '',
      employeeId: ''
    },
    longFieldValues: {
      firstName: 'A'.repeat(500),
      lastName: 'B'.repeat(500),
      middleName: 'C'.repeat(500),
      employeeId: 'EMP' + 'X'.repeat(500)
    }
  },

  // Search parameters
  search: {
    validSearchParams: {
      employeeName: {
        firstName: 'John',
        lastName: 'Doe'
      },
      employeeId: 'EMP001',
      jobTitle: 'Software Engineer',
      employmentStatus: 'Full-Time Permanent',
      subUnit: 'Engineering',
      supervisor: 'Peter Anderson'
    },
    invalidSearchParams: {
      nonExistentEmployee: 'NonExistentUser999',
      invalidEmployeeId: 'INVALID123',
      specialCharacters: '@#$%^&*()',
      sqlInjection: "'; DROP TABLE employees; --",
      xssPayload: '<script>alert("XSS")</script>'
    },
    edgeCaseParams: {
      emptySearch: {},
      veryLongTerm: 'A'.repeat(1000),
      spacesOnly: '   ',
      mixedCase: 'jOhN dOe'
    }
  },

  // Expected response structures
  expectedResponses: {
    loginSuccess: {
      status: 200,
      redirectUrl: '/web/index.php/dashboard/index'
    },
    loginFailure: {
      status: 302,
      errorMessage: 'Invalid credentials'
    },
    employeeList: {
      status: 200,
      structure: {
        data: 'array',
        meta: 'object',
        aba: 'array'
      }
    },
    employeeCreate: {
      status: 200,
      structure: {
        data: 'object',
        meta: 'object'
      }
    },
    notFound: {
      status: 404,
      errorMessage: 'Record Not Found'
    },
    unauthorized: {
      status: 401,
      errorMessage: 'Unauthorized'
    },
    badRequest: {
      status: 400,
      errorMessage: 'Bad Request'
    }
  },

  // Performance expectations
  performance: {
    loginTimeout: 10000,
    searchTimeout: 5000,
    crudTimeout: 3000,
    maxResponseTime: {
      authentication: 5000,
      employeeList: 3000,
      employeeSearch: 2000,
      employeeCreate: 4000,
      employeeUpdate: 3000,
      employeeDelete: 2000
    }
  },

  // HTTP status codes
  statusCodes: {
    success: {
      ok: 200,
      created: 201,
      noContent: 204
    },
    clientError: {
      badRequest: 400,
      unauthorized: 401,
      forbidden: 403,
      notFound: 404,
      methodNotAllowed: 405,
      conflict: 409,
      unprocessableEntity: 422
    },
    serverError: {
      internalServerError: 500,
      badGateway: 502,
      serviceUnavailable: 503
    },
    redirect: {
      found: 302,
      seeOther: 303
    }
  },

  // Common headers
  headers: {
    contentType: {
      json: 'application/json',
      form: 'application/x-www-form-urlencoded',
      multipart: 'multipart/form-data'
    },
    accept: {
      json: 'application/json',
      html: 'text/html',
      any: '*/*'
    }
  },

  // Test scenarios for different API operations
  scenarios: {
    authentication: [
      {
        id: 'AUTH_001',
        name: 'Valid Login',
        payload: 'validAuth.credentials',
        expectedStatus: 200
      },
      {
        id: 'AUTH_002',
        name: 'Invalid Username',
        payload: 'invalidAuth.wrongUsername',
        expectedStatus: 302
      },
      {
        id: 'AUTH_003',
        name: 'Invalid Password',
        payload: 'invalidAuth.wrongPassword',
        expectedStatus: 302
      },
      {
        id: 'AUTH_004',
        name: 'SQL Injection Attack',
        payload: 'invalidAuth.sqlInjection',
        expectedStatus: 302
      }
    ],
    employeeCRUD: [
      {
        id: 'EMP_001',
        name: 'Create Employee',
        operation: 'POST',
        payload: 'employee.employeeToCreate',
        expectedStatus: 200
      },
      {
        id: 'EMP_002',
        name: 'Get Employee List',
        operation: 'GET',
        expectedStatus: 200
      },
      {
        id: 'EMP_003',
        name: 'Update Employee',
        operation: 'PUT',
        payload: 'employee.employeeToUpdate',
        expectedStatus: 200
      },
      {
        id: 'EMP_004',
        name: 'Delete Employee',
        operation: 'DELETE',
        expectedStatus: 200
      }
    ],
    search: [
      {
        id: 'SEARCH_001',
        name: 'Search by Employee Name',
        payload: 'search.validSearchParams.employeeName',
        expectedStatus: 200
      },
      {
        id: 'SEARCH_002',
        name: 'Search by Employee ID',
        payload: 'search.validSearchParams.employeeId',
        expectedStatus: 200
      },
      {
        id: 'SEARCH_003',
        name: 'Search Non-existent Employee',
        payload: 'search.invalidSearchParams.nonExistentEmployee',
        expectedStatus: 200
      }
    ]
  }
};

// Utility functions for API test data
export class ApiTestDataHelper {
  /**
   * Get test data by path (e.g., 'employee.validEmployee')
   */
  static getTestData(path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], ApiTestData);
  }

  /**
   * Generate random employee ID
   */
  static generateEmployeeId(): string {
    return `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  /**
   * Generate random employee data
   */
  static generateRandomEmployee() {
    const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana'];
    const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Davis', 'Wilson'];
    
    return {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      middleName: 'Test',
      employeeId: this.generateEmployeeId(),
      empStatus: 'Enabled'
    };
  }

  /**
   * Get current timestamp for unique data
   */
  static getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }
} 