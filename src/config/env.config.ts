export interface EnvironmentConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeout: number;
  retries: number;
}

const environments: Record<string, EnvironmentConfig> = {
  dev: {
    baseUrl: 'https://opensource-demo.orangehrmlive.com',
    username: 'Admin',
    password: 'admin123',
    timeout: 30000,
    retries: 2
  },
  staging: {
    baseUrl: 'https://opensource-demo.orangehrmlive.com',
    username: 'Admin',
    password: 'admin123',
    timeout: 45000,
    retries: 3
  },
  prod: {
    baseUrl: 'https://opensource-demo.orangehrmlive.com',
    username: 'Admin',
    password: 'admin123',
    timeout: 60000,
    retries: 1
  }
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.TEST_ENV || 'dev';
  const config = environments[env];
  
  if (!config) {
    throw new Error(`Environment '${env}' not found. Available environments: ${Object.keys(environments).join(', ')}`);
  }
  
  return config;
}