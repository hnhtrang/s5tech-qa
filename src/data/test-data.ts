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
    validEmployeeNames: ['John', 'Alice', 'Robert'],
    invalidEmployeeNames: ['NonExistentUser', ''],
    validEmployeeIds: ['001', '123'],
    invalidEmployeeIds: ['999999', 'abc'],
    menuSearchTerms: ['admin', 'pim', 'leave', 'time'],
    invalidMenuSearch: ['zzznomatch', ''],
    longSearchTerm: 'a'.repeat(1000),
    specialCharSearch: '@#$%^&*()',
    unicodeSearch: '测试用户'
  },

  filterOptions: {
    userRoles: ['Admin', 'ESS'],
    employmentStatus: ['Full-Time Permanent', 'Part-Time Contract'],
    userStatus: ['Enabled', 'Disabled'],
    includeOptions: ['Current Employees Only', 'Past Employees Only']
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