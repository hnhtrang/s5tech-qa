# OrangeHRM Test Automation Framework

## Overview
Comprehensive test automation framework for OrangeHRM application using Playwright with TypeScript, covering both UI and API testing.

## Features
- ✅ **UI Testing**: End-to-end browser automation
- ✅ **API Testing**: RESTful API validation and testing
- ✅ **Cross-browser Testing**: Chrome, Firefox, Safari, Edge
- ✅ **Mobile Testing**: Responsive design validation
- ✅ **Security Testing**: SQL injection, XSS, CSRF protection
- ✅ **Performance Testing**: Response time and load testing
- ✅ **Integration Testing**: End-to-end workflow validation
- ✅ **CI/CD Ready**: Multiple report formats and parallel execution

## Test Coverage

### UI Tests
- **Login Functionality**: Authentication, session management
- **Employee Search**: Search filters, pagination, edge cases
- **Cross-browser Compatibility**: Desktop and mobile browsers
- **Accessibility**: WCAG compliance validation

### API Tests
- **Authentication API**: Login, logout, session management, CSRF protection
- **Employee Management API**: CRUD operations, search, bulk operations
- **Security Testing**: Input validation, SQL injection, XSS prevention
- **Performance Testing**: Response times, concurrent operations
- **Integration Testing**: End-to-end workflows, data consistency

## Project Structure
```
assignment_99Tech_playwright/
├── src/
│   ├── api/                    # API clients and interfaces
│   │   ├── base-api.client.ts  # Base API client
│   │   ├── auth.api.ts         # Authentication API
│   │   └── employee.api.ts     # Employee management API
│   ├── data/                   # Test data
│   │   ├── test-data.ts        # UI test data
│   │   └── api-test-data.ts    # API test data
│   ├── pages/                  # Page Object Models
│   │   ├── base.page.ts
│   │   └── login.page.ts
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
│       ├── test-helpers.ts     # UI helpers
│       └── api-helpers.ts      # API helpers
├── tests/
│   ├── api/                    # API tests
│   │   ├── auth.api.test.ts
│   │   ├── employee.api.test.ts
│   │   └── integration.api.test.ts
│   ├── login/                  # UI login tests
│   └── search/                 # UI search tests
├── docs/                       # Documentation
│   ├── test-cases.md          # UI test cases
│   └── api-test-documentation.md # API test documentation
├── playwright.config.ts        # Playwright configuration
├── global-setup.ts            # Global test setup
└── package.json               # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd assignment_99Tech_playwright

# Install dependencies
npm install

# Install Playwright browsers
npm run setup

# Install system dependencies (optional)
npm run setup:deps
```

### Running Tests

#### UI Tests
```bash
# Run all UI tests
npm test

# Run specific test suites
npm run test:login
npm run test:search

# Run tests by browser
npm run test:chrome
npm run test:firefox
npm run test:safari
npm run test:mobile
```

#### API Tests
```bash
# Run all API tests
npm run test:api

# Run specific API test suites
npm run test:api:auth
npm run test:api:employee
npm run test:api:integration

# Run tests by category
npm run test:security
npm run test:performance
npm run test:integration
npm run test:smoke
npm run test:regression
```

#### Test Execution Options
```bash
# Visual mode (headed)
npm run test:headed

# Debug mode
npm run test:debug

# UI mode (interactive)
npm run test:ui

# Parallel execution
npm run test:parallel

# Serial execution
npm run test:serial
```

### Test Categories

Tests are organized using tags for flexible execution:

- `@smoke`: Critical functionality tests
- `@regression`: Comprehensive feature testing
- `@security`: Security vulnerability testing
- `@performance`: Performance and load testing
- `@integration`: End-to-end workflow testing
- `@functional`: Core functionality testing
- `@negative`: Error handling and edge cases
- `@edge`: Boundary condition testing

### Configuration

#### Environment Variables
```bash
# Set base URL (optional)
BASE_URL=https://opensource-demo.orangehrmlive.com

# Set test environment
NODE_ENV=development|staging|production
```

#### Browser Configuration
The framework supports multiple browsers and devices:
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: Chrome Mobile, Safari Mobile
- Custom viewport configurations

#### Parallel Execution
- Default: 4 workers on local, 1 worker on CI
- Configurable in `playwright.config.ts`

## Test Data Management

### UI Test Data
Located in `src/data/test-data.ts`:
- Valid and invalid credentials
- Employee search data
- Edge case scenarios
- Performance expectations

### API Test Data
Located in `src/data/api-test-data.ts`:
- API endpoints and payloads
- Authentication scenarios
- CRUD operation data
- Security test inputs
- Performance benchmarks

### Dynamic Data Generation
```typescript
// Generate random employee data
const employee = ApiTestDataHelper.generateRandomEmployee();

// Generate unique identifiers
const empId = ApiTestDataHelper.generateEmployeeId();
const testId = ApiHelpers.generateTestId('TEST');
```

## Reporting

### Report Types
1. **HTML Report**: Visual report with screenshots and videos
2. **JUnit XML**: CI/CD integration format
3. **JSON Report**: Machine-readable results
4. **Console Output**: Real-time execution feedback

### Viewing Reports
```bash
# Open HTML report
npm run report

# Open report on custom host/port
npm run report:open
```

### CI/CD Integration
```bash
# Generate CI-friendly reports
npm run test:ci
npm run test:api:ci

# Clean previous results
npm run clean
```

## API Testing Features

### Authentication Testing
- CSRF token management
- Session validation
- Login/logout workflows
- Multi-user session handling
- Authentication bypass prevention

### CRUD Operations Testing
- Employee creation, retrieval, update, deletion
- Data validation and consistency
- Bulk operations performance
- Error handling and recovery

### Security Testing
- SQL injection prevention
- XSS attack protection
- Input sanitization validation
- Rate limiting verification
- Unauthorized access prevention

### Performance Testing
- Response time validation
- Concurrent operation handling
- Bulk operation performance
- System stress testing
- Resource utilization monitoring

## Page Object Model

### Base Page
Common functionality for all pages:
- Navigation methods
- Element interaction helpers
- Wait strategies
- Screenshot capture
- Error handling

### Specific Pages
- `LoginPage`: Authentication interactions
- Future pages can extend `BasePage`

## API Client Architecture

### BaseApiClient
- HTTP method implementations
- Response processing
- Authentication token management
- Error handling
- Request/response logging

### AuthApiClient
- CSRF token retrieval
- Login/logout operations
- Session management
- Retry logic with exponential backoff

### EmployeeApiClient
- CRUD operations
- Search functionality
- Bulk operations
- Data validation
- Performance metrics

## Best Practices

### Test Organization
1. Use descriptive test names with IDs
2. Group related tests in describe blocks
3. Implement proper test isolation
4. Use appropriate test tags

### Data Management
1. Use dynamic test data
2. Implement proper cleanup
3. Avoid test data dependencies
4. Validate data consistency

### Error Handling
1. Test both success and failure scenarios
2. Validate error responses
3. Implement retry mechanisms
4. Handle timeouts gracefully

### Performance
1. Set realistic expectations
2. Monitor response times
3. Test under load
4. Validate system behavior

## Troubleshooting

### Common Issues
1. **Browser Installation**: Run `npm run setup`
2. **Test Timeouts**: Adjust timeout values in config
3. **Authentication Failures**: Check CSRF token handling
4. **Data Cleanup**: Ensure proper test isolation

### Debug Techniques
1. Use `--debug` flag for step-by-step execution
2. Enable screenshots and videos
3. Check browser console logs
4. Use Playwright Inspector

### Performance Issues
1. Run tests serially for debugging
2. Monitor system resources
3. Check network conditions
4. Review test execution patterns

## Contributing

### Adding New Tests
1. Follow existing naming conventions
2. Use appropriate page objects and API clients
3. Implement proper cleanup
4. Add relevant documentation

### Adding New API Endpoints
1. Extend existing API clients or create new ones
2. Add test data to `api-test-data.ts`
3. Implement comprehensive test coverage
4. Document API contract and expectations

### Code Style
1. Use TypeScript for type safety
2. Follow existing project structure
3. Implement proper error handling
4. Add JSDoc comments for public methods

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OrangeHRM Demo](https://opensource-demo.orangehrmlive.com/)
- [Test Cases Documentation](./docs/test-cases.md)
- [API Test Documentation](./docs/api-test-documentation.md)

## License

MIT License - see LICENSE file for details. 