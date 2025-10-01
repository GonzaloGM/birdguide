export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'your-domain.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'your-client-id',
  authorizationParams: {
    redirect_uri:
      process.env.REACT_APP_AUTH0_REDIRECT_URI ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:4200'),
  },
};
