# OrangeHRM Test Cases Documentation

## Overview
This document contains comprehensive test cases for the Login and Search functionalities of the OrangeHRM demo application (https://opensource-demo.orangehrmlive.com/).

## Test Environment
- **Application URL**: https://opensource-demo.orangehrmlive.com/
- **Default Credentials**: Admin / admin123
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Devices**: Desktop, Mobile (Android, iOS)

## 1. LOGIN FUNCTIONALITY TEST CASES

### 1.1 Functional Test Cases

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| LC_001 | Valid Login | 1. Navigate to login page<br>2. Enter valid username: "Admin"<br>3. Enter valid password: "admin123"<br>4. Click Login button | User successfully logs in and redirects to dashboard | High |
| LC_002 | Login Page Elements | 1. Navigate to login page<br>2. Verify all elements are present | Username field, Password field, Login button, OrangeHRM logo, Forgot Password link visible | High |
| LC_003 | Case Sensitivity - Username | 1. Enter username: "admin" (lowercase)<br>2. Enter valid password<br>3. Click Login | Login should fail with error message | Medium |
| LC_004 | Password Visibility Toggle | 1. Enter password<br>2. Click eye icon to toggle visibility<br>3. Verify password is visible/hidden | Password visibility toggles correctly | Low |
| LC_005 | Remember Me Functionality | 1. Check "Remember Me" checkbox<br>2. Login with valid credentials<br>3. Close browser and reopen<br>4. Navigate to application | User remains logged in (if implemented) | Medium |

### 1.2 Negative Test Cases

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| LC_006 | Invalid Username | 1. Enter invalid username: "InvalidUser"<br>2. Enter valid password<br>3. Click Login | Error message: "Invalid credentials" displayed | High |
| LC_007 | Invalid Password | 1. Enter valid username<br>2. Enter invalid password: "wrongpass"<br>3. Click Login | Error message: "Invalid credentials" displayed | High |
| LC_008 | Both Invalid Credentials | 1. Enter invalid username<br>2. Enter invalid password<br>3. Click Login | Error message: "Invalid credentials" displayed | High |
| LC_009 | Empty Username | 1. Leave username field empty<br>2. Enter valid password<br>3. Click Login | Error message: "Username cannot be empty" or "Required" | High |
| LC_010 | Empty Password | 1. Enter valid username<br>2. Leave password field empty<br>3. Click Login | Error message: "Password cannot be empty" or "Required" | High |
| LC_011 | Both Fields Empty | 1. Leave both fields empty<br>2. Click Login | Error messages for both required fields | High |
| LC_012 | SQL Injection | 1. Enter: "admin'; DROP TABLE users; --"<br>2. Enter any password<br>3. Click Login | Application should handle safely, show invalid credentials | High |
| LC_013 | XSS Attack | 1. Enter: "&lt;script&gt;alert('XSS')&lt;/script&gt;"<br>2. Enter any password<br>3. Click Login | No script execution, proper error handling | High |

### 1.3 Edge Cases

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| LC_014 | Username with Spaces | 1. Enter: " Admin " (with leading/trailing spaces)<br>2. Enter valid password<br>3. Click Login | Should handle spaces appropriately | Medium |
| LC_015 | Special Characters in Username | 1. Enter username with special chars: "Admin@#$"<br>2. Enter valid password<br>3. Click Login | Proper validation and error handling | Medium |
| LC_016 | Very Long Username | 1. Enter 500+ character username<br>2. Enter valid password<br>3. Click Login | Proper field validation, no system crash | Medium |
| LC_017 | Very Long Password | 1. Enter valid username<br>2. Enter 500+ character password<br>3. Click Login | Proper field validation, no system crash | Medium |
| LC_018 | Multiple Failed Attempts | 1. Make 5+ failed login attempts<br>2. Try valid credentials | Account lockout or CAPTCHA (if implemented) | Medium |
| LC_019 | Session Timeout | 1. Login successfully<br>2. Leave idle for extended period<br>3. Try to perform action | Session expires, redirect to login | Medium |
| LC_020 | Browser Back Button After Login | 1. Login successfully<br>2. Click browser back button | Should not return to login page | Low |

## 2. SEARCH FUNCTIONALITY TEST CASES

### 2.1 Functional Test Cases

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| SC_001 | Search Employee by Name | 1. Login successfully<br>2. Navigate to PIM module<br>3. Enter employee name in search<br>4. Click Search | Relevant employees displayed in results | High |
| SC_002 | Search with Employee ID | 1. Navigate to search functionality<br>2. Enter valid Employee ID<br>3. Click Search | Specific employee record displayed | High |
| SC_003 | Search with Partial Name | 1. Enter partial employee name<br>2. Click Search | All matching employees displayed | Medium |
| SC_004 | Search Filters - Employment Status | 1. Select employment status filter<br>2. Click Search | Only employees with selected status shown | Medium |
| SC_005 | Search Filters - Job Title | 1. Select job title from dropdown<br>2. Click Search | Only employees with selected job title shown | Medium |
| SC_006 | Search Reset Functionality | 1. Enter search criteria<br>2. Click Reset button | All fields cleared, full list displayed | Low |
| SC_007 | Search Results Pagination | 1. Perform search with many results<br>2. Navigate through pages | Pagination works correctly | Medium |

### 2.2 Negative Test Cases

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| SC_008 | Search Non-existent Employee | 1. Enter name that doesn't exist<br>2. Click Search | "No Records Found" message displayed | High |
| SC_009 | Search with Special Characters | 1. Enter special characters: "@#$%"<br>2. Click Search | Proper handling, no system error | Medium |
| SC_010 | Search with Numeric Values | 1. Enter only numbers in name field<br>2. Click Search | Appropriate validation or results | Medium |
| SC_011 | Search with Empty Criteria | 1. Leave all search fields empty<br>2. Click Search | All records displayed or validation message | Low |
| SC_012 | Search with SQL Injection | 1. Enter: "'; DROP TABLE employees; --"<br>2. Click Search | No database impact, safe handling | High |

### 2.3 Edge Cases

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| SC_013 | Very Long Search Term | 1. Enter 500+ character search term<br>2. Click Search | Proper field validation | Medium |
| SC_014 | Search Case Sensitivity | 1. Enter "john" vs "JOHN" vs "John"<br>2. Compare results | Consistent results regardless of case | Medium |
| SC_015 | Search with Leading/Trailing Spaces | 1. Enter " John " (with spaces)<br>2. Click Search | Spaces handled appropriately | Low |
| SC_016 | Multiple Consecutive Searches | 1. Perform 10+ searches rapidly<br>2. Verify results | No performance degradation | Low |
| SC_017 | Search During Network Issues | 1. Simulate slow network<br>2. Perform search<br>3. Verify behavior | Appropriate loading indicators/timeouts | Medium |

## 3. CROSS-BROWSER COMPATIBILITY

### 3.1 Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | Mobile Chrome | Mobile Safari |
|---------|--------|---------|---------|------|---------------|---------------|
| Login Functionality | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search Functionality | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| UI Responsiveness | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 4. PERFORMANCE TEST CASES

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| PC_001 | Login Page Load Time | Page loads within 3 seconds | Medium |
| PC_002 | Login Response Time | Login completes within 5 seconds | Medium |
| PC_003 | Search Response Time | Search results within 3 seconds | Medium |
| PC_004 | Concurrent User Login | System handles 50+ concurrent logins | Low |

## 5. ACCESSIBILITY TEST CASES

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| AC_001 | Keyboard Navigation | All elements accessible via keyboard | Medium |
| AC_002 | Screen Reader Support | Proper labels and ARIA attributes | Medium |
| AC_003 | Color Contrast | Meets WCAG guidelines | Low |
| AC_004 | Focus Indicators | Clear focus indicators on all elements | Low |

## Test Execution Notes

1. **Environment Setup**: Ensure test environment is reset before each test suite
2. **Data Dependencies**: Use fresh test data for each test execution
3. **Browser Cleanup**: Clear cache and cookies between test runs
4. **Screenshots**: Capture screenshots for failed tests
5. **Reporting**: Generate detailed test reports with execution time and results

## Risk Assessment

- **High Risk**: Login security vulnerabilities, data exposure
- **Medium Risk**: Search performance issues, browser compatibility
- **Low Risk**: UI cosmetic issues, minor usability problems 