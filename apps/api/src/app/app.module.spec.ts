import { getDatabaseConfig } from './config/database.config';
import { getJwtConfig } from './config/jwt.config';

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
});
