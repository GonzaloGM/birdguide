export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || 'your-domain.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || 'your-client-id',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'your-client-secret',
  audience: process.env.AUTH0_AUDIENCE || 'your-api-identifier',
  managementApiAudience: process.env.AUTH0_MANAGEMENT_API_AUDIENCE || `https://${process.env.AUTH0_DOMAIN || 'your-domain.auth0.com'}/api/v2/`,
  managementApiClientId: process.env.AUTH0_MANAGEMENT_API_CLIENT_ID || 'your-management-client-id',
  managementApiClientSecret: process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET || 'your-management-client-secret',
};
