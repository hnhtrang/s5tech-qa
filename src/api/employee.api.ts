import { AuthApiClient, LoginCredentials } from './auth.api';
import { ApiResponse } from './base-api.client';
import { ApiTestData } from '../data/api-test-data';

export interface Employee {
  empNumber?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  empStatus?: string;
  jobTitle?: string;
  subUnit?: string;
  supervisor?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  gender?: string;
}

export interface EmployeeSearchParams {
  employeeName?: {
    firstName?: string;
    lastName?: string;
  };
  employeeId?: string;
  jobTitle?: string;
  employmentStatus?: string;
  subUnit?: string;
  supervisor?: string;
  includeEmployees?: string;
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
  };
  aba?: any[];
}

export interface EmployeeResponse {
  data: Employee;
  meta: any;
}

export class EmployeeApiClient extends AuthApiClient {
  /**
   * Authenticate and prepare for employee operations
   */
  async authenticate(credentials?: LoginCredentials): Promise<boolean> {
    const creds = credentials || ApiTestData.validAuth.credentials;
    const response = await this.login(creds);
    return response.data.success;
  }

  /**
   * Get list of all employees
   */
  async getEmployeeList(page: number = 1, limit: number = 50): Promise<ApiResponse<EmployeeListResponse>> {
    try {
      const params = {
        offset: (page - 1) * limit,
        limit: limit
      };

      const response = await this.get<EmployeeListResponse>(
        ApiTestData.endpoints.employee.list,
        params
      );

      return response;
    } catch (error) {
      console.error('Error getting employee list:', error);
      return {
        status: 500,
        data: { data: [], meta: { total: 0 } },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Search employees with filters
   */
  async searchEmployees(searchParams: EmployeeSearchParams): Promise<ApiResponse<EmployeeListResponse>> {
    try {
      const response = await this.post<EmployeeListResponse>(
        ApiTestData.endpoints.employee.search,
        searchParams
      );

      return response;
    } catch (error) {
      console.error('Error searching employees:', error);
      return {
        status: 500,
        data: { data: [], meta: { total: 0 } },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(empNumber: string): Promise<ApiResponse<EmployeeResponse>> {
    try {
      const endpoint = ApiTestData.endpoints.employee.details.replace('{id}', empNumber);
      const response = await this.get<EmployeeResponse>(endpoint);

      return response;
    } catch (error) {
      console.error('Error getting employee by ID:', error);
      return {
        status: 500,
        data: { data: {} as Employee, meta: {} },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(employeeData: Employee): Promise<ApiResponse<EmployeeResponse>> {
    try {
      const response = await this.post<EmployeeResponse>(
        ApiTestData.endpoints.employee.create,
        employeeData
      );

      return response;
    } catch (error) {
      console.error('Error creating employee:', error);
      return {
        status: 500,
        data: { data: {} as Employee, meta: {} },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Update existing employee
   */
  async updateEmployee(empNumber: string, employeeData: Partial<Employee>): Promise<ApiResponse<EmployeeResponse>> {
    try {
      const endpoint = ApiTestData.endpoints.employee.update.replace('{id}', empNumber);
      const response = await this.put<EmployeeResponse>(endpoint, employeeData);

      return response;
    } catch (error) {
      console.error('Error updating employee:', error);
      return {
        status: 500,
        data: { data: {} as Employee, meta: {} },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(empNumber: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    try {
      const endpoint = ApiTestData.endpoints.employee.delete.replace('{id}', empNumber);
      const response = await this.delete(endpoint);

      return {
        status: response.status,
        data: {
          success: response.success,
          message: response.success ? 'Employee deleted successfully' : 'Failed to delete employee'
        },
        headers: response.headers,
        success: response.success
      };
    } catch (error) {
      console.error('Error deleting employee:', error);
      return {
        status: 500,
        data: {
          success: false,
          message: 'Delete request failed'
        },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Bulk delete employees
   */
  async deleteEmployees(empNumbers: string[]): Promise<ApiResponse<{ success: boolean; deletedCount: number; errors?: string[] }>> {
    const results = [];
    const errors = [];

    for (const empNumber of empNumbers) {
      try {
        const result = await this.deleteEmployee(empNumber);
        results.push(result);
        if (!result.success) {
          errors.push(`Failed to delete employee ${empNumber}: ${result.data.message}`);
        }
      } catch (error) {
        errors.push(`Error deleting employee ${empNumber}: ${error}`);
      }
    }

    const successfulDeletions = results.filter(r => r.success).length;

    return {
      status: errors.length === 0 ? 200 : 207, // 207 Multi-Status for partial success
      data: {
        success: errors.length === 0,
        deletedCount: successfulDeletions,
        errors: errors.length > 0 ? errors : undefined
      },
      headers: {},
      success: successfulDeletions > 0
    };
  }

  /**
   * Search employees by name
   */
  async searchByName(firstName?: string, lastName?: string): Promise<ApiResponse<EmployeeListResponse>> {
    const searchParams: EmployeeSearchParams = {
      employeeName: {
        firstName,
        lastName
      }
    };

    return this.searchEmployees(searchParams);
  }

  /**
   * Search employees by ID
   */
  async searchByEmployeeId(employeeId: string): Promise<ApiResponse<EmployeeListResponse>> {
    const searchParams: EmployeeSearchParams = {
      employeeId
    };

    return this.searchEmployees(searchParams);
  }

  /**
   * Search employees by job title
   */
  async searchByJobTitle(jobTitle: string): Promise<ApiResponse<EmployeeListResponse>> {
    const searchParams: EmployeeSearchParams = {
      jobTitle
    };

    return this.searchEmployees(searchParams);
  }

  /**
   * Get employees count
   */
  async getEmployeesCount(): Promise<number> {
    try {
      const response = await this.getEmployeeList(1, 1);
      return response.data.meta.total;
    } catch {
      return 0;
    }
  }

  /**
   * Check if employee exists
   */
  async employeeExists(employeeId: string): Promise<boolean> {
    try {
      const response = await this.searchByEmployeeId(employeeId);
      return response.data.data.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Create employee with validation
   */
  async createEmployeeWithValidation(employeeData: Employee): Promise<ApiResponse<EmployeeResponse & { validationErrors?: string[] }>> {
    const validationErrors = [];

    // Basic validation
    if (!employeeData.firstName || employeeData.firstName.trim() === '') {
      validationErrors.push('First name is required');
    }
    if (!employeeData.lastName || employeeData.lastName.trim() === '') {
      validationErrors.push('Last name is required');
    }
    if (!employeeData.employeeId || employeeData.employeeId.trim() === '') {
      validationErrors.push('Employee ID is required');
    }

    // Check if employee ID already exists
    if (employeeData.employeeId && await this.employeeExists(employeeData.employeeId)) {
      validationErrors.push('Employee ID already exists');
    }

    if (validationErrors.length > 0) {
      return {
        status: 400,
        data: {
          data: {} as Employee,
          meta: {},
          validationErrors
        },
        headers: {},
        success: false
      };
    }

    return this.createEmployee(employeeData);
  }

  /**
   * Get employee performance metrics
   */
  async getEmployeeMetrics(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    averageResponseTime: number;
  }> {
    const startTime = Date.now();
    const totalEmployees = await this.getEmployeesCount();
    const responseTime = Date.now() - startTime;

    return {
      totalEmployees,
      activeEmployees: totalEmployees, // Assuming all are active for this demo
      averageResponseTime: responseTime
    };
  }

  /**
   * Perform employee CRUD operations test
   */
  async performCRUDTest(testEmployeeData: Employee): Promise<{
    createSuccess: boolean;
    readSuccess: boolean;
    updateSuccess: boolean;
    deleteSuccess: boolean;
    empNumber?: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    let empNumber: string | undefined;
    let createSuccess = false;
    let readSuccess = false;
    let updateSuccess = false;
    let deleteSuccess = false;

    try {
      // Create
      const createResponse = await this.createEmployee(testEmployeeData);
      createSuccess = createResponse.success;
      if (createSuccess) {
        empNumber = createResponse.data.data.empNumber;
      } else {
        errors.push('Failed to create employee');
      }

      // Read
      if (empNumber) {
        const readResponse = await this.getEmployeeById(empNumber);
        readSuccess = readResponse.success;
        if (!readSuccess) {
          errors.push('Failed to read created employee');
        }
      }

      // Update
      if (empNumber) {
        const updateData = { ...testEmployeeData, firstName: 'Updated' };
        const updateResponse = await this.updateEmployee(empNumber, updateData);
        updateSuccess = updateResponse.success;
        if (!updateSuccess) {
          errors.push('Failed to update employee');
        }
      }

      // Delete
      if (empNumber) {
        const deleteResponse = await this.deleteEmployee(empNumber);
        deleteSuccess = deleteResponse.success;
        if (!deleteSuccess) {
          errors.push('Failed to delete employee');
        }
      }
    } catch (error) {
      errors.push(`CRUD test error: ${error}`);
    }

    return {
      createSuccess,
      readSuccess,
      updateSuccess,
      deleteSuccess,
      empNumber,
      errors
    };
  }
} 