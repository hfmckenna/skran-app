export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_ID: string;
      NODE_ENV: 'test' | 'development' | 'production';
      CLIENT_SECRET: string;
      TENANT_INFO: string;
      EXPECTED_SCOPES: string;
      MONGODB_URL: string;
    }
  }
}