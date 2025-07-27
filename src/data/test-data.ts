export const TEST_DATA = {
  validCredentials: {
    username: 'Admin',
    password: 'admin123'
  },
  
  invalidCredentials: {
    emptyUsername: { username: '', password: 'admin123' },
    emptyPassword: { username: 'Admin', password: '' },
    emptyBoth: { username: '', password: '' },
    wrongUsername: { username: 'WrongUser', password: 'admin123' },
    wrongPassword: { username: 'Admin', password: 'wrongpass' },
    wrongBoth: { username: 'WrongUser', password: 'wrongpass' }
  },

  edgeCaseCredentials: {
    sqlInjection: { username: "' OR '1'='1", password: "' OR '1'='1" },
    xssAttempt: { username: '<script>alert("xss")</script>', password: '<script>alert("xss")</script>' },
    longUsername: { username: 'a'.repeat(1000), password: 'admin123' },
    specialChars: { username: 'User@#$%^&*()', password: 'Pass@#$%^&*()' }
  },

  searchData: {
    validEmployeeNames: ['john', 'Timothy Lewis Amiano', 'Balancha Balanchayev Admin'],
    invalidEmployeeNames: ['NonExistentUser', ''],
    validEmployeeIds: ['45', '0039', 'balancha'],
    invalidEmployeeIds: ['999999', 'abc'],
    menuSearchTerms: ['admin', 'pim', 'leave', 'time'],
    invalidMenuSearch: ['zzznomatch', ''],
    longSearchTerm: 'a'.repeat(1000),
    specialCharSearch: '@#$%^&*()',
    unicodeSearch: '测试用户'
  },

  filterOptions: {
    userRoles: ['Admin', 'ESS'],
    employmentStatus: ['Full-Time Permanent', 'Part-Time Contract', 'Full-Time Contract', 'Full-Time Probation'],
    userStatus: ['Enabled', 'Disabled'],
    includeOptions: ['Current Employees Only', 'Past Employees Only']
  },

  pimData: {
    validEmployeeNames: ['john', 'Timothy Lewis Amiano', 'Thomas Kutty Benny', 'Balancha Balanchayev Admin'],
    invalidEmployeeNames: ['NonExistentEmployee', 'InvalidUser123'],
    validEmployeeIds: ['0001', '0039', '03694567', 'balancha'],
    invalidEmployeeIds: ['9999', 'INVALID'],
    employmentStatuses: ['Full-Time Permanent', 'Part-Time Contract', 'Full-Time Contract'],
    jobTitles: ['HR Manager', 'Software Engineer', 'QA Engineer'],
    subUnits: ['Human Resources', 'Engineering', 'Administration'],
    includeOptions: ['Current Employees Only', 'Current and Past Employees', 'Past Employees Only'],
    longEmployeeName: 'a'.repeat(500),
    specialCharEmployeeName: '@#$%^&*()'
  },

  directoryData: {
    validEmployeeNames: ['Timothy Lewis Amiano', 'Thomas Kutty Benny', 'Balancha Balanchayev Admin'],
    invalidEmployeeNames: ['invalidname', 'NonExistentEmployee'],
    jobTitles: ['Chief Financial Officer', 'QA Engineer', 'HR Manager', 'Software Engineer'],
    locations: ['New York Sales Office', 'Texas R&D', 'Canadian Regional HQ', 'HQ - CA, USA'],
    autocompleteSearches: [
      { partialName: 'timothy', fullName: 'Timothy Lewis Amiano' },
      { partialName: 'thomas', fullName: 'Thomas Kutty Benny' },
      { partialName: 'balancha', fullName: 'Balancha Balanchayev Admin' }
    ]
  },

  urlPaths: {
    login: '/web/index.php/auth/login',
    dashboard: '/web/index.php/dashboard/index',
    admin: '/web/index.php/admin/viewSystemUsers',
    pim: '/web/index.php/pim/viewEmployeeList',
    directory: '/web/index.php/directory/viewDirectory'
  },

  timeouts: {
    default: 30000,
    long: 60000,
    short: 5000
  }
};