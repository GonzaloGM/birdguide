import { getDatabaseConfig } from './config/database.config';
import { getJwtConfig } from './config/jwt.config';
import { getAuth0Config } from './auth/auth0.config';

describe('Configuration', () => {
  beforeEach(() => {
    // Clear environment variables to test missing config
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USERNAME;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_DATABASE;
    delete process.env.JWT_SECRET;
  });

  it('should fail when DB_HOST is missing', () => {
    process.env.DB_PORT = '5432';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_DATABASE = 'birdguide';

    expect(() => getDatabaseConfig()).toThrow(
      'Required environment variable DB_HOST is not set'
    );
  });

  it('should fail when DB_PORT is missing', () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_DATABASE = 'birdguide';

    expect(() => getDatabaseConfig()).toThrow(
      'Required environment variable DB_PORT is not set'
    );
  });

  it('should fail when DB_USERNAME is missing', () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_DATABASE = 'birdguide';

    expect(() => getDatabaseConfig()).toThrow(
      'Required environment variable DB_USERNAME is not set'
    );
  });

  it('should fail when DB_PASSWORD is missing', () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_DATABASE = 'birdguide';

    expect(() => getDatabaseConfig()).toThrow(
      'Required environment variable DB_PASSWORD is not set'
    );
  });

  it('should fail when DB_DATABASE is missing', () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'password';

    expect(() => getDatabaseConfig()).toThrow(
      'Required environment variable DB_DATABASE is not set'
    );
  });

  it('should fail when JWT_SECRET is missing', () => {
    expect(() => getJwtConfig()).toThrow(
      'Required environment variable JWT_SECRET is not set'
    );
  });

  it('should succeed when all required environment variables are present', () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_DATABASE = 'birdguide';
    process.env.JWT_SECRET = 'test-secret';

    expect(() => getDatabaseConfig()).not.toThrow();
    expect(() => getJwtConfig()).not.toThrow();

    const dbConfig = getDatabaseConfig();
    const jwtConfig = getJwtConfig();

    expect(dbConfig.host).toBe('localhost');
    expect(dbConfig.port).toBe(5432);
    expect(dbConfig.username).toBe('postgres');
    expect(dbConfig.password).toBe('password');
    expect(dbConfig.database).toBe('birdguide');
    expect(jwtConfig.secret).toBe('test-secret');
  });

  describe('Auth0 Configuration', () => {
    beforeEach(() => {
      // Clear Auth0 environment variables
      delete process.env.AUTH0_DOMAIN;
      delete process.env.AUTH0_CLIENT_ID;
      delete process.env.AUTH0_CLIENT_SECRET;
      delete process.env.AUTH0_AUDIENCE;
      delete process.env.AUTH0_MANAGEMENT_API_AUDIENCE;
      delete process.env.AUTH0_MANAGEMENT_API_CLIENT_ID;
      delete process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET;
    });

    it('should fail when AUTH0_DOMAIN is missing', () => {
      expect(() => getAuth0Config()).toThrow(
        'Required environment variable AUTH0_DOMAIN is not set'
      );
    });

    it('should fail when AUTH0_CLIENT_ID is missing', () => {
      process.env.AUTH0_DOMAIN = 'test.auth0.com';
      expect(() => getAuth0Config()).toThrow(
        'Required environment variable AUTH0_CLIENT_ID is not set'
      );
    });

    it('should fail when AUTH0_CLIENT_SECRET is missing', () => {
      process.env.AUTH0_DOMAIN = 'test.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'test-client-id';
      expect(() => getAuth0Config()).toThrow(
        'Required environment variable AUTH0_CLIENT_SECRET is not set'
      );
    });

    it('should fail when AUTH0_AUDIENCE is missing', () => {
      process.env.AUTH0_DOMAIN = 'test.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'test-client-id';
      process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
      expect(() => getAuth0Config()).toThrow(
        'Required environment variable AUTH0_AUDIENCE is not set'
      );
    });

    it('should fail when AUTH0_MANAGEMENT_API_AUDIENCE is missing', () => {
      process.env.AUTH0_DOMAIN = 'test.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'test-client-id';
      process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
      process.env.AUTH0_AUDIENCE = 'test-audience';
      expect(() => getAuth0Config()).toThrow(
        'Required environment variable AUTH0_MANAGEMENT_API_AUDIENCE is not set'
      );
    });

    it('should fail when AUTH0_MANAGEMENT_API_CLIENT_ID is missing', () => {
      process.env.AUTH0_DOMAIN = 'test.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'test-client-id';
      process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
      process.env.AUTH0_AUDIENCE = 'test-audience';
      process.env.AUTH0_MANAGEMENT_API_AUDIENCE =
        'https://test.auth0.com/api/v2/';
      expect(() => getAuth0Config()).toThrow(
        'Required environment variable AUTH0_MANAGEMENT_API_CLIENT_ID is not set'
      );
    });

    it('should fail when AUTH0_MANAGEMENT_API_CLIENT_SECRET is missing', () => {
      process.env.AUTH0_DOMAIN = 'test.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'test-client-id';
      process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
      process.env.AUTH0_AUDIENCE = 'test-audience';
      process.env.AUTH0_MANAGEMENT_API_AUDIENCE =
        'https://test.auth0.com/api/v2/';
      process.env.AUTH0_MANAGEMENT_API_CLIENT_ID = 'test-management-client-id';
      expect(() => getAuth0Config()).toThrow(
        'Required environment variable AUTH0_MANAGEMENT_API_CLIENT_SECRET is not set'
      );
    });

    it('should succeed when all Auth0 environment variables are present', () => {
      process.env.AUTH0_DOMAIN = 'test.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'test-client-id';
      process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
      process.env.AUTH0_AUDIENCE = 'test-audience';
      process.env.AUTH0_MANAGEMENT_API_AUDIENCE =
        'https://test.auth0.com/api/v2/';
      process.env.AUTH0_MANAGEMENT_API_CLIENT_ID = 'test-management-client-id';
      process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET =
        'test-management-client-secret';

      expect(() => getAuth0Config()).not.toThrow();

      const config = getAuth0Config();
      expect(config.domain).toBe('test.auth0.com');
      expect(config.clientId).toBe('test-client-id');
      expect(config.clientSecret).toBe('test-client-secret');
      expect(config.audience).toBe('test-audience');
      expect(config.managementApiAudience).toBe(
        'https://test.auth0.com/api/v2/'
      );
      expect(config.managementApiClientId).toBe('test-management-client-id');
      expect(config.managementApiClientSecret).toBe(
        'test-management-client-secret'
      );
    });
  });
});
