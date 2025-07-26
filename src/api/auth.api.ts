import { BaseApiClient, ApiResponse } from './base-api.client';
import { ApiTestData } from '../data/api-test-data';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  redirectUrl?: string;
  sessionId?: string;
  csrfToken?: string;
errorMessage?: string;
}

export interface SessionInfo {
  authenticated: boolean;
  userId?: string;
  username?: string;
  role?: string;
  sessionId?: string;
}

export class AuthApiClient extends BaseApiClient {
  private csrfToken: string | null = null;
  private sessionId: string | null = null;

  /**
   * Get CSRF token from login page
   */
  async getCSRFToken(): Promise<string | null> {
    try {
      const response = await this.get<string>('/web/index.php/auth/login');
      
      if (response.success && typeof response.data === 'string') {
        this.csrfToken = this.extractCSRFToken(response.data);
        
        // Also extract any session cookies
        const cookies = this.extractCookies(response.headers);
        if (cookies.PHPSESSID) {
          this.sessionId = cookies.PHPSESSID;
          this.setAuthTokens({ sessionId: this.sessionId });
        }
        
        return this.csrfToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      return null;
    }
  }

  /**
   * Perform login operation
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    // Get CSRF token first
    const csrfToken = await this.getCSRFToken();
    
    if (!csrfToken) {
      return {
        status: 500,
        data: {
          success: false,
          errorMessage: 'Failed to get CSRF token'
        },
        headers: {},
        success: false
      };
    }

    // Prepare login payload
    const loginPayload = {
      _token: csrfToken,
      username: credentials.username,
      password: credentials.password
    };

    try {
      const response = await this.post<any>(
        ApiTestData.endpoints.auth.login,
        loginPayload,
        {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      );

      // Check for successful login (usually a redirect)
      const isLoginSuccessful = response.status === 302 || 
                               (response.status === 200 && 
                                (response.headers.location?.includes('dashboard') ||
                                 (typeof response.data === 'string' && response.data.includes('dashboard'))));

      const loginResponse: LoginResponse = {
        success: isLoginSuccessful,
        redirectUrl: response.headers.location || (isLoginSuccessful ? '/web/index.php/dashboard/index' : undefined),
        sessionId: this.sessionId || undefined,
        csrfToken: csrfToken,
        errorMessage: isLoginSuccessful ? undefined : 'Invalid credentials'
      };

      // Update auth tokens if login successful
      if (isLoginSuccessful) {
        const cookies = this.extractCookies(response.headers);
        if (cookies.PHPSESSID) {
          this.sessionId = cookies.PHPSESSID;
          this.setAuthTokens({ 
            sessionId: this.sessionId,
            csrfToken: csrfToken 
          });
        }
      }

      return {
        status: response.status,
        data: loginResponse,
        headers: response.headers,
        success: isLoginSuccessful
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        status: 500,
        data: {
          success: false,
          errorMessage: 'Login request failed'
        },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Logout operation
   */
  async logout(): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    try {
      const response = await this.post(ApiTestData.endpoints.auth.logout);
      
      // Clear authentication tokens
      this.clearAuthTokens();
      this.sessionId = null;
      this.csrfToken = null;

      return {
        status: response.status,
        data: {
          success: response.success,
          message: response.success ? 'Logged out successfully' : 'Logout failed'
        },
        headers: response.headers,
        success: response.success
      };

    } catch (error) {
      console.error('Logout error:', error);
      return {
        status: 500,
        data: {
          success: false,
          message: 'Logout request failed'
        },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Check current session status
   */
  async getSessionInfo(): Promise<ApiResponse<SessionInfo>> {
    try {
      // Try to access a protected endpoint to check session
      const response = await this.get('/web/index.php/dashboard/index');
      
      const isAuthenticated = response.status === 200;
      
      const sessionInfo: SessionInfo = {
        authenticated: isAuthenticated,
        sessionId: this.sessionId || undefined,
        username: isAuthenticated ? 'Admin' : undefined, // This could be extracted from response
        role: isAuthenticated ? 'Administrator' : undefined
      };

      return {
        status: response.status,
        data: sessionInfo,
        headers: response.headers,
        success: response.success
      };

    } catch (error) {
      console.error('Session check error:', error);
      return {
        status: 500,
        data: {
          authenticated: false
        },
        headers: {},
        success: false
      };
    }
  }

  /**
   * Validate session with specific endpoint
   */
  async validateSession(): Promise<boolean> {
    try {
      const sessionInfo = await this.getSessionInfo();
      return sessionInfo.data.authenticated;
    } catch {
      return false;
    }
  }

  /**
   * Login with automatic retry on failure
   */
  async loginWithRetry(credentials: LoginCredentials, maxRetries: number = 3): Promise<ApiResponse<LoginResponse>> {
    let lastResponse: ApiResponse<LoginResponse>;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      this.logApiCall('POST', 'login', { attempt, credentials: { username: credentials.username, password: '***' } });
      
      lastResponse = await this.login(credentials);
      
      if (lastResponse.success) {
        return lastResponse;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    return lastResponse!;
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get current CSRF token
   */
  getCurrentCSRFToken(): string | null {
    return this.csrfToken;
  }

  /**
   * Check if currently authenticated
   */
  override isAuthenticated(): boolean {
    return !!(this.sessionId && this.csrfToken);
  }
} 