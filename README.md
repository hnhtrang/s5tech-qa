# OrangeHRM Test Automation Framework

A comprehensive Playwright-based test automation framework for OrangeHRM demo application, featuring cross-browser testing, API testing, and load testing capabilities.

## Framework Structure

```
assignment_99Tech_playwright/
├── src/                          # Framework core
│   ├── pages/                    # Page Object Model
│   │   ├── base.page.ts         # Base page with common methods
│   │   ├── login.page.ts        # Login page interactions
│   │   ├── dashboard.page.ts    # Dashboard page interactions
│   │   ├── admin.page.ts        # Admin module interactions
│   │   ├── pim.page.ts          # PIM module interactions
│   │   └── directory.page.ts    # Directory module interactions
│   ├── fixtures/                 # Test fixtures
│   │   ├── base.fixture.ts      # Page object fixtures
│   │   └── auth.fixture.ts      # Authentication fixtures
│   ├── data/                     # Test data management
│   │   └── test-data.ts         # Centralized test data
│   ├── config/                   # Environment configuration
│   │   └── env.config.ts        # Multi-environment support
│   └── utils/                    # Test utilities
│       └── test-helpers.ts      # Helper functions
├── tests/                        # Test specifications
│   ├── login.spec.ts            # Login module tests (L001-L011)
│   ├── *-search.spec.ts         # Search module tests
│   ├── api/                     # API tests
│   │   ├── auth.api.spec.ts     # Authentication API tests
│   │   └── pim-search.api.spec.ts # PIM Search API tests
│   └── load-testing/            # Load tests
│       ├── auth-load.spec.ts    # Authentication load tests
│       └── search-load.spec.ts  # Search API load tests
├── ui-test-cases.csv            # Test cases in spreadsheet format
└── playwright.config.ts         # Playwright configuration
```

## Framework Rationale

- **Page Object Model**: Inheritance-based structure with BasePage for maintainable, reusable code
- **TypeScript**: Type safety and enhanced developer experience
- **Multi-Browser Support**: Chrome, Firefox, Safari, Edge, Mobile Chrome/Safari
- **Environment Configuration**: Dynamic baseURL, timeouts, retries per environment
- **Fixture System**: Modular fixtures for page injection and authentication
- **Comprehensive Testing**: UI, API, and load testing in a single framework

## Test Coverage

### UI Tests (40 test cases)
- **Login Module (11 tests)**: Valid login, case sensitivity, forgot password, session persistence, empty/invalid credentials, security (SQL injection, XSS), boundary testing
- **Search Modules (29 tests)**:
  - **PIM Search (12 tests)**: Employee search, filters, pagination, validation
  - **Global Search (7 tests)**: Sidebar navigation search functionality
  - **Admin Search (5 tests)**: System user search and management
  - **Directory Search (5 tests)**: Employee directory search with location/job filters

### API Tests (20 test cases)
- **Authentication API (10 tests)**: CSRF protection, security validation, performance testing
- **PIM Employee Search API (10 tests)**: Search functionality, pagination, parameter validation, security testing

### Load Tests (9 test cases)
- **Authentication Load (4 tests)**: Concurrent authentication, rapid requests, mixed scenarios, CSRF token generation
- **Search Load (5 tests)**: Concurrent searches, parameter variations, pagination performance, authentication overhead

## Steps to Execute Demo Scripts

### Prerequisites
```bash
node -v  # Requires Node.js 16+
npm -v   # Requires npm 8+
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd assignment_99Tech_playwright

# Install dependencies
npm install

# Install browsers
npx playwright install
```

### Essential Commands

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run login tests only
npm run test:login

# Run specific test case (example: L001)
npm run test:case "L001"

# Run tests in debug mode
npm run test:debug

# Show test report
npm run show-report
```

### Alternative Direct Commands
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run API tests
npx playwright test tests/api/

# Run load tests
npx playwright test tests/load-testing/

# Run single test case with browser visible
npx playwright test tests/login.spec.ts -g "L001" --project=chromium --headed

# Run tests in debug mode
npx playwright test --debug
```

### Environment Configuration
```bash
# Test against different environments
TEST_ENV=dev npm test      # Default
TEST_ENV=staging npm test  # Staging environment
TEST_ENV=prod npm test     # Production environment
```

### Reports & Results
- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure

## Quick Demo

Run the main demo covering login and search functionality:
```bash
# Login functionality demo
npm run test:login

# Search functionality demo  
npx playwright test tests/pim-search.spec.ts --headed

# API testing demo
npx playwright test tests/api/ --reporter=list

# Load testing demo
npx playwright test tests/load-testing/ --reporter=list
```

## CI/CD Integration

The framework supports major CI/CD platforms with parallel execution and comprehensive reporting. Test results include screenshots, videos, and detailed HTML reports for debugging failed tests.

## Test Data & Configuration

- **Credentials**: Configurable via environment variables
- **Test Data**: Centralized in `src/data/test-data.ts`
- **Cross-browser**: Standardized viewport settings across all browsers
- **Retry Logic**: Configurable retry mechanisms for flaky tests