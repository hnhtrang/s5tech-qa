import { APIRequestContext, request } from '@playwright/test';

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: Record<string, string>;
  success: boolean;
}

export interface AuthTokens {
  accessToken?: string;
  sessionId?: string;
  csrfToken?: string;
}

export class BaseApiClient {
  protected apiContext: APIRequestContext;
  protected baseURL: string;
  protected authTokens: AuthTokens = {};
  protected defaultHeaders: Record<string, string>;

  constructor(baseURL: string = 'https://opensource-demo.orangehrmlive.com') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Playwright-API-Tests'
    };
  }

  /**
   * Initialize API context
   */
  async init(): Promise<void> {
    this.apiContext = await request.newContext({
      baseURL: this.baseURL,
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: this.defaultHeaders
    });
  }

  /**
   * Set authentication tokens
   */
  setAuthTokens(tokens: AuthTokens): void {
    this.authTokens = { ...this.authTokens, ...tokens };
    
    // Update default headers with auth tokens
    if (this.authTokens.accessToken) {
      this.defaultHeaders['Authorization'] = `Bearer ${this.authTokens.accessToken}`;
    }
    if (this.authTokens.sessionId) {
      this.defaultHeaders['Cookie'] = `PHPSESSID=${this.authTokens.sessionId}`;
    }
    if (this.authTokens.csrfToken) {
      this.defaultHeaders['X-CSRF-Token'] = this.authTokens.csrfToken;
    }
  }

  /**
   * Clear authentication tokens
   */
  clearAuthTokens(): void {
    this.authTokens = {};
    delete this.defaultHeaders['Authorization'];
    delete this.defaultHeaders['Cookie'];
    delete this.defaultHeaders['X-CSRF-Token'];
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await this.apiContext.get(url.toString(), {
      headers: this.defaultHeaders
    });

    return this.processResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const response = await this.apiContext.post(endpoint, {
      data: data,
      headers: { ...this.defaultHeaders, ...headers }
    });

    return this.processResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const response = await this.apiContext.put(endpoint, {
      data: data,
      headers: { ...this.defaultHeaders, ...headers }
    });

    return this.processResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const response = await this.apiContext.delete(endpoint, {
      headers: { ...this.defaultHeaders, ...headers }
    });

    return this.processResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const response = await this.apiContext.patch(endpoint, {
      data: data,
      headers: { ...this.defaultHeaders, ...headers }
    });

    return this.processResponse<T>(response);
  }

  /**
   * Process API response
   */
  private async processResponse<T>(response: any): Promise<ApiResponse<T>> {
    const status = response.status();
    const headers = response.headers();
    let data: T;

    try {
      const responseText = await response.text();
      data = responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      // Handle non-JSON responses
      data = await response.text() as T;
    }

    return {
      status,
      data,
      headers,
      success: status >= 200 && status < 300
    };
  }

  /**
   * Extract cookies from response headers
   */
  extractCookies(headers: Record<string, string>): Record<string, string> {
    const cookies: Record<string, string> = {};
    const setCookieHeader = headers['set-cookie'];
    
    if (setCookieHeader) {
      const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      cookieStrings.forEach(cookieString => {
        const [nameValue] = cookieString.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
          cookies[name.trim()] = value.trim();
        }
      });
    }

    return cookies;
  }

  /**
   * Extract CSRF token from HTML response
   */
  extractCSRFToken(htmlContent: string): string | null {
    const csrfMatch = htmlContent.match(/name="_token"\s+value="([^"]+)"/);
    return csrfMatch ? csrfMatch[1] : null;
  }

  /**
   * Dispose API context
   */
  async dispose(): Promise<void> {
    if (this.apiContext) {
      await this.apiContext.dispose();
    }
  }

  /**
   * Get current auth status
   */
  isAuthenticated(): boolean {
    return !!(this.authTokens.accessToken || this.authTokens.sessionId);
  }

  /**
   * Log API call for debugging
   */
  protected logApiCall(method: string, endpoint: string, data?: any): void {
    console.log(`[API] ${method.toUpperCase()} ${endpoint}`, data ? { data } : '');
  }
} 