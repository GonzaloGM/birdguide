import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // Landing page
      tagline: 'Descubrí cada ave',
      signupButton: 'Registrate',
      loginButton: 'Logueate',

      // Login page
      login: {
        title: 'Ingresar',
        email: 'Email',
        password: 'Contraseña',
        submit: 'Enviar',
        forgotPassword: '¿Olvidaste tu contraseña?',
        orContinueWith: 'O continúa con',
        google: 'Ingresar con Google',
        apple: 'Ingresar con Apple',
        errors: {
          emailRequired: 'El email es requerido',
          emailInvalid: 'Email inválido',
          passwordRequired: 'La contraseña es requerida',
        },
      },

      // Signup page
      signup: {
        title: 'Registrarme',
        email: 'Email',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        submit: 'Enviar',
        orContinueWith: 'O continúa con',
        google: 'Registrarse con Google',
        apple: 'Registrarse con Apple',
        errors: {
          emailRequired: 'El email es requerido',
          emailInvalid: 'Email inválido',
          passwordRequired: 'La contraseña es requerida',
          confirmPasswordRequired: 'La confirmación de contraseña es requerida',
          passwordMismatch: 'Las contraseñas no coinciden',
        },
      },
    },
  },
  en: {
    translation: {
      // Landing page
      tagline: 'Discover every bird',
      signupButton: 'Sign Up',
      loginButton: 'Log In',

      // Login page
      login: {
        title: 'Log In',
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
