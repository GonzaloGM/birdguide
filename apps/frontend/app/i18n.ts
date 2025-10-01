import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // Common
      loading: 'Cargando...',
      appName: 'BirdGuide',

      // Landing page
      tagline: 'Descubrí cada ave',
      signupButton: 'Registrate',
      loginButton: 'Logueate',

      // Login page
      login: {
        title: 'Ingresar',
        description: 'Ingresá a tu cuenta de BirdGuide',
        email: 'Email',
        password: 'Contraseña',
        submit: 'Enviar',
        forgotPassword: '¿Te olvidaste tu contraseña?',
        orContinueWith: 'O ingresá con',
        google: 'Ingresá con Google',
        apple: 'Ingresá con Apple',
        errors: {
          emailRequired: 'El email es requerido',
          emailInvalid: 'Email inválido',
          passwordRequired: 'La contraseña es requerida',
        },
      },

      // Signup page
      signup: {
        title: 'Registrarme',
        description:
          'Creá tu cuenta de BirdGuide para comenzar a aprender sobre aves',
        email: 'Email',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        submit: 'Enviar',
        orContinueWith: 'O registrate con',
        google: 'Registrarse con Google',
        apple: 'Registrarse con Apple',
        errors: {
          emailRequired: 'El email es requerido',
          emailInvalid: 'Email inválido',
          passwordRequired: 'La contraseña es requerida',
          confirmPasswordRequired: 'La confirmación de contraseña es requerida',
          passwordMismatch: 'Las contraseñas no coinciden',
          passwordTooWeak:
            'La contraseña es muy débil. Debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números',
          passwordTooCommon:
            'La contraseña es muy común. Elegí una contraseña más única',
          passwordContainsUserInfo:
            'La contraseña no puede contener información personal como tu nombre o email',
          userAlreadyExists:
            'Ya existe una cuenta con este email. Intentá iniciar sesión',
          signupNotAllowed:
            'El registro no está disponible en este momento. Contactanos si el problema persiste',
          invalidEmail: 'El formato del email no es válido',
          connectionDisabled:
            'El registro no está disponible, parece que estás desconectado',
          serverError:
            'Ocurrió un error en el servidor. Probá de nuevo más tarde',
        },
      },
    },
  },
  en: {
    translation: {
      // Common
      loading: 'Loading...',
      appName: 'BirdGuide',

      // Landing page
      tagline: 'Discover every bird',
      signupButton: 'Sign Up',
      loginButton: 'Log In',

      // Login page
      login: {
        title: 'Log In',
        description: 'Sign in to your BirdGuide account',
        email: 'Email',
        password: 'Password',
        submit: 'Submit',
        forgotPassword: 'Forgot your password?',
        orContinueWith: 'Or continue with',
        google: 'Log In with Google',
        apple: 'Log In with Apple',
        errors: {
          emailRequired: 'Email is required',
          emailInvalid: 'Invalid email',
          passwordRequired: 'Password is required',
        },
      },

      // Signup page
      signup: {
        title: 'Sign Up',
        description:
          'Create your BirdGuide account to start learning about birds',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        submit: 'Submit',
        orContinueWith: 'Or continue with',
        google: 'Sign Up with Google',
        apple: 'Sign Up with Apple',
        errors: {
          emailRequired: 'Email is required',
          emailInvalid: 'Invalid email',
          passwordRequired: 'Password is required',
          confirmPasswordRequired: 'Password confirmation is required',
          passwordMismatch: 'Passwords do not match',
          passwordTooWeak:
            'Password is too weak. Must be at least 8 characters with uppercase, lowercase and numbers',
          passwordTooCommon:
            'Password is too common. Choose a more unique password',
          passwordContainsUserInfo:
            'Password cannot contain personal information like your name or email',
          userAlreadyExists:
            'An account with this email already exists. Try signing in instead',
          signupNotAllowed:
            'Signup is not available at this time. Contact support if the problem persists',
          invalidEmail: 'The email format is not valid',
          connectionDisabled:
            'Signup is not available. Contact support for assistance',
          serverError: 'A server error occurred. Please try again later',
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
