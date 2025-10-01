const getRequiredEnvVar = (name: string): string => {
  // Use Vite's import.meta.env for environment variables
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Required environment variable ${name} is not set. Please create a .env file in the apps/frontend/ directory with your Auth0 configuration.`
    );
  }

  return value;
};

export const auth0Config = {
  domain: getRequiredEnvVar('VITE_AUTH0_DOMAIN'),
  clientId: getRequiredEnvVar('VITE_AUTH0_CLIENT_ID'),
  authorizationParams: {
    redirect_uri: getRequiredEnvVar('VITE_AUTH0_REDIRECT_URI'),
  },
};
