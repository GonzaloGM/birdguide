const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

export const getAuth0Config = () => ({
  domain: getRequiredEnvVar('AUTH0_DOMAIN'),
  clientId: getRequiredEnvVar('AUTH0_CLIENT_ID'),
  clientSecret: getRequiredEnvVar('AUTH0_CLIENT_SECRET'),
  audience: getRequiredEnvVar('AUTH0_AUDIENCE'),
  managementApiAudience: getRequiredEnvVar('AUTH0_MANAGEMENT_API_AUDIENCE'),
  managementApiClientId: getRequiredEnvVar('AUTH0_MANAGEMENT_API_CLIENT_ID'),
  managementApiClientSecret: getRequiredEnvVar(
    'AUTH0_MANAGEMENT_API_CLIENT_SECRET'
  ),
});
