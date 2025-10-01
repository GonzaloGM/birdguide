export const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

export const getDatabaseConfig = () => ({
  host: getRequiredEnvVar('DB_HOST'),
  port: parseInt(getRequiredEnvVar('DB_PORT'), 10),
  username: getRequiredEnvVar('DB_USERNAME'),
  password: getRequiredEnvVar('DB_PASSWORD'),
  database: getRequiredEnvVar('DB_DATABASE'),
});
