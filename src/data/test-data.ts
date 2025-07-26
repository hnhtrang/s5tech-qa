export const TestData = {
  // Valid credentials
  validCredentials: {
    username: 'Admin',
    password: 'admin123'
  },

  // Invalid credentials for negative testing
  invalidCredentials: {
    invalidUsername: {
      username: 'InvalidUser',
      password: 'admin123'
    },
    invalidPassword: {
      username: 'Admin',
      password: 'wrongpassword'
    },
    bothInvalid: {
      username: 'InvalidUser',
      password: 'wrongpassword'
    },
    emptyUsername: {
      username: '',
      password: 'admin123'
    },
    emptyPassword: {
      username: 'Admin',
      password: ''
    },
    bothEmpty: {
      username: '',
      password: ''
    }
  },

  // Edge case credentials
  edgeCaseCredentials: {
    usernameWithSpaces: {
      username: ' Admin ',
      password: 'admin123'
    },
    specialCharacters: {
      username: 'Admin@#$',
      password: 'admin123'
    },
    longUsername: {
      username: 'A'.repeat(500),
      password: 'admin123'
    },
    longPassword: {
      username: 'Admin',
      password: 'a'.repeat(500)
    },
    sqlInjection: {
      username: "admin'; DROP TABLE users; --",
      password: 'admin123'
    },
    xssAttack: {
      username: '<script>alert("XSS")</script>',
      password: 'admin123'
    },
    caseSensitive: {
      username: 'admin', // lowercase
      password: 'admin123'
    }
  },

  // Employee search data
  employeeSearchData: {
    // Valid employee names (common names that might exist)
    validEmployeeNames: [
      'John',
      'Alice',
      'Paul',
      'Linda',
      'Charlie',
      'Sarah'
    ],
    
    // Partial names for testing partial search
    partialNames: [
      'Jo',
      'Al',
      'Pa',
      'Li'
    ],

    // Invalid employee names
    invalidEmployeeNames: [
      'NonExistentEmployee',
      'XYZ123',
      'TestUser999'
    ],

    // Employee IDs (common patterns)
    employeeIds: [
      '0001',
      '0002',
      '0003',
      '1001',
      '2001'
    ],

    // Invalid employee IDs
    invalidEmployeeIds: [
      '9999',
      'INVALID',
      '00000'
    ],

    // Special characters for search testing
    specialCharacterSearches: [
      '@#$%',
      '123456',
      '!@#$%^&*()',
      '<script>alert("test")</script>',
      "'; DROP TABLE employees; --"
    ],

    // Edge cases
    edgeCases: {
      emptySearch: '',
      longSearchTerm: 'A'.repeat(500),
      spacesOnly: '   ',
      leadingTrailingSpaces: ' John ',
      mixedCase: 'jOhN dOe'
    }
  },

  // Employment status options
  employmentStatus: [
    'Full-Time Permanent',
    'Full-Time Contract',
    'Part-Time Permanent',
    'Part-Time Contract',
    'Freelance'
  ],

  // Job titles (common ones that might exist)
  jobTitles: [
    'Software Engineer',
    'QA Engineer',
    'HR Manager',
    'Sales Representative',
    'Account Executive',
    'Database Administrator'
  ],

  // Sub units
  subUnits: [
    'Engineering',
    'Quality Assurance',
    'Human Resources',
    'Sales & Marketing',
    'Finance'
  ],

  // Common supervisor names
  supervisorNames: [
    'Peter Anderson',
    'Lisa Andrews',
    'Dominic Chase',
    'Fiona Grace'
  ],

  // Include options
  includeOptions: [
    'Current Employees Only',
    'Current and Past Employees'
  ],

  // Expected error messages
  errorMessages: {
    invalidCredentials: 'Invalid credentials',
    requiredField: 'Required',
    noRecordsFound: 'No Records Found'
  },

  // URLs
  urls: {
    login: '/web/index.php/auth/login',
    dashboard: '/web/index.php/dashboard/index',
    pim: '/web/index.php/pim/viewEmployeeList'
  },

  // Timeouts
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000
  },

  // Performance expectations
  performance: {
    pageLoadTime: 3000,
    loginResponseTime: 5000,
    searchResponseTime: 3000
  }
};

// Test scenarios configurations
export const TestScenarios = {
  login: {
    functional: [
      {
        id: 'LC_001',
        name: 'Valid Login',
        credentials: TestData.validCredentials,
        expectedResult: 'success'
      }
    ],
    negative: [
      {
        id: 'LC_006',
        name: 'Invalid Username',
        credentials: TestData.invalidCredentials.invalidUsername,
        expectedResult: 'error',
        expectedMessage: TestData.errorMessages.invalidCredentials
      },
      {
        id: 'LC_007',
        name: 'Invalid Password',
        credentials: TestData.invalidCredentials.invalidPassword,
        expectedResult: 'error',
        expectedMessage: TestData.errorMessages.invalidCredentials
      },
      {
        id: 'LC_008',
        name: 'Both Invalid Credentials',
        credentials: TestData.invalidCredentials.bothInvalid,
        expectedResult: 'error',
        expectedMessage: TestData.errorMessages.invalidCredentials
      },
      {
        id: 'LC_009',
        name: 'Empty Username',
        credentials: TestData.invalidCredentials.emptyUsername,
        expectedResult: 'validation_error',
        expectedMessage: TestData.errorMessages.requiredField
      },
      {
        id: 'LC_010',
        name: 'Empty Password',
        credentials: TestData.invalidCredentials.emptyPassword,
        expectedResult: 'validation_error',
        expectedMessage: TestData.errorMessages.requiredField
      }
    ],
    edgeCases: [
      {
        id: 'LC_012',
        name: 'SQL Injection',
        credentials: TestData.edgeCaseCredentials.sqlInjection,
        expectedResult: 'error',
        expectedMessage: TestData.errorMessages.invalidCredentials
      },
      {
        id: 'LC_013',
        name: 'XSS Attack',
        credentials: TestData.edgeCaseCredentials.xssAttack,
        expectedResult: 'error',
        expectedMessage: TestData.errorMessages.invalidCredentials
      },
      {
        id: 'LC_014',
        name: 'Username with Spaces',
        credentials: TestData.edgeCaseCredentials.usernameWithSpaces,
        expectedResult: 'error'
      }
    ]
  },
  
  search: {
    functional: [
      {
        id: 'SC_001',
        name: 'Search Employee by Name',
        searchType: 'employeeName',
        searchValue: TestData.employeeSearchData.validEmployeeNames[0],
        expectedResult: 'results_or_no_records'
      },
      {
        id: 'SC_002',
        name: 'Search with Employee ID',
        searchType: 'employeeId',
        searchValue: TestData.employeeSearchData.employeeIds[0],
        expectedResult: 'results_or_no_records'
      }
    ],
    negative: [
      {
        id: 'SC_008',
        name: 'Search Non-existent Employee',
        searchType: 'employeeName',
        searchValue: TestData.employeeSearchData.invalidEmployeeNames[0],
        expectedResult: 'no_records',
        expectedMessage: TestData.errorMessages.noRecordsFound
      },
      {
        id: 'SC_012',
        name: 'Search with SQL Injection',
        searchType: 'employeeName',
        searchValue: TestData.employeeSearchData.specialCharacterSearches[4],
        expectedResult: 'safe_handling'
      }
    ],
    edgeCases: [
      {
        id: 'SC_013',
        name: 'Very Long Search Term',
        searchType: 'employeeName',
        searchValue: TestData.employeeSearchData.edgeCases.longSearchTerm,
        expectedResult: 'validation_or_safe_handling'
      },
      {
        id: 'SC_015',
        name: 'Search with Leading/Trailing Spaces',
        searchType: 'employeeName',
        searchValue: TestData.employeeSearchData.edgeCases.leadingTrailingSpaces,
        expectedResult: 'results_or_no_records'
      }
    ]
  }
}; 