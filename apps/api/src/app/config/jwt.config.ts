export const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

export const getJwtConfig = () => ({
  secret: getRequiredEnvVar('JWT_SECRET'),
});
