# OrangeHRM Test Automation Framework

[![Playwright](https://img.shields.io/badge/Playwright-1.54.1-brightgreen)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive Playwright-based test automation framework for testing OrangeHRM demo application. Features cross-browser testing, API testing, and load testing capabilities with Page Object Model architecture.

## 🎯 Demo

**YouTube Demo:** [Watch the complete demo](https://youtu.be/0hCFtn0vy_g)

## ✨ Features

- 🎭 **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge, Mobile Chrome/Safari
- 🏗️ **Page Object Model**: Inheritance-based structure with BasePage
- 🔧 **TypeScript**: Full type safety and enhanced developer experience
- 🌍 **Multi-Environment**: dev/staging/prod configuration support
- 🧪 **Comprehensive Testing**: UI (40 tests), API (20 tests), Load (9 tests)
- 📊 **Rich Reporting**: HTML, JSON, JUnit with screenshots and videos
- ⚡ **Parallel Execution**: Fast test execution with retry mechanisms

## 📋 Test Coverage

| Test Type | Count | Description |
|-----------|-------|-------------|
| **UI Tests** | 40 | Login, PIM/Global/Admin/Directory Search |
| **API Tests** | 20 | Authentication and PIM Search APIs |
| **Load Tests** | 9 | Authentication and Search performance |

### Detailed Test Cases
- **Login Module (11 tests)**: Valid/invalid credentials, security, session management
- **Search Modules (29 tests)**: Employee search, filters, pagination across modules
- **API Tests (20 tests)**: CSRF protection, security validation, performance
- **Load Tests (9 tests)**: Concurrent users, rapid requests, mixed scenarios

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm 8+
- Git

### Installation

```bash
# Clone the repository
git clone git@github.com:hnhtrang/s5tech-qa.git
cd s5tech-qa

# Install dependencies
npm install

# Install browsers
npx playwright install
```

## 📖 Usage

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with browser visible
npm run test:headed

# Run specific module tests
npm run test:login

# Run specific test case
npm run test:case "L001"

# Debug mode
npm run test:debug

# View test report
npm run show-report
```

### Advanced Commands

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run API tests
npx playwright test tests/api/

# Run load tests
npx playwright test tests/load-testing/

# Debug specific test
npx playwright test tests/login.spec.ts -g "L001" --project=chromium --headed --debug
```

### Environment Configuration

```bash
# Test against different environments
TEST_ENV=dev npm test      # Default
TEST_ENV=staging npm test  # Staging environment
TEST_ENV=prod npm test     # Production environment
```

## 📊 Reports & Results

After running tests, view results in:

- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`  
- **JUnit XML**: `test-results/results.xml`
- **Screenshots**: Auto-captured on failure
- **Videos**: Recorded on failure

## 🏗️ Project Structure

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

## 🛠️ Configuration

The framework supports:

- **Multi-Environment**: Dynamic baseURL, timeouts, retries per environment
- **Cross-Browser**: Standardized viewport settings across all browsers  
- **Fixture System**: Modular fixtures for page injection and authentication
- **Retry Logic**: Configurable retry mechanisms for flaky tests
- **Test Data**: Centralized in `src/data/test-data.ts`

## 🚀 CI/CD Integration

The framework supports major CI/CD platforms with:
- Parallel execution
- Comprehensive reporting
- Screenshots and videos on failure
- Detailed HTML reports for debugging
- Support cross browsers, and cross platform (Chrome, Edge, Mobile Chrome)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or support, please open an issue in the repository.