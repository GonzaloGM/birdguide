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
      loginButton: 'Ingresá',

      // Login page
      login: {
        title: 'Ingresar',
        description: 'Entrá a tu cuenta de BirdGuide',
        emailOrUsername: 'Email o Usuario',
        emailOrUsernamePlaceholder: 'Ingresá tu email o usuario',
        password: 'Contraseña',
        submit: 'Enviar',
        forgotPassword: '¿Te olvidaste tu contraseña?',
        orContinueWith: 'O ingresá con',
        google: 'Ingresá con Google',
        apple: 'Ingresá con Apple',
        errors: {
          emailOrUsernameRequired: 'El email o usuario es requerido',
          emailInvalid: 'Email inválido',
          usernameTooShort: 'El usuario debe tener al menos 3 caracteres',
          usernameTooLong: 'El usuario no puede tener más de 20 caracteres',
          usernameInvalid:
            'El usuario solo puede contener letras, números y guiones bajos',
          passwordRequired: 'La contraseña es requerida',
        },
      },

      // Signup page
      signup: {
        title: 'Registrate',
        description:
          'Creá tu cuenta de BirdGuide para comenzar a aprender sobre aves',
        email: 'Email',
        username: 'Usuario',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        submit: 'Enviar',
        orContinueWith: 'O registrate con',
        google: 'Registrarse con Google',
        apple: 'Registrarse con Apple',
        errors: {
          emailRequired: 'El email es requerido',
          emailInvalid: 'Email inválido',
          usernameRequired: 'El usuario es requerido',
          usernameTooShort: 'El usuario debe tener al menos 3 caracteres',
          usernameTooLong: 'El usuario no puede tener más de 20 caracteres',
          usernameInvalid:
            'El usuario solo puede contener letras, números y guiones bajos',
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
          usernameAlreadyExists:
            'Este usuario ya existe. Elegí otro nombre de usuario',
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
        emailOrUsername: 'Email or Username',
        emailOrUsernamePlaceholder: 'Enter your email or username',
        password: 'Password',
        submit: 'Submit',
        forgotPassword: 'Forgot your password?',
        orContinueWith: 'Or continue with',
        google: 'Log In with Google',
        apple: 'Log In with Apple',
        errors: {
          emailOrUsernameRequired: 'Email or username is required',
          emailInvalid: 'Invalid email',
          usernameTooShort: 'Username must be at least 3 characters',
          usernameTooLong: 'Username cannot be more than 20 characters',
          usernameInvalid:
            'Username can only contain letters, numbers and underscores',
          passwordRequired: 'Password is required',
        },
      },

      // Signup page
      signup: {
        title: 'Sign Up',
        description:
          'Create your BirdGuide account to start learning about birds',
        email: 'Email',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm password',
        submit: 'Submit',
        orContinueWith: 'Or continue with',
        google: 'Sign Up with Google',
        apple: 'Sign Up with Apple',
        errors: {
          emailRequired: 'Email is required',
          emailInvalid: 'Invalid email',
          usernameRequired: 'Username is required',
          usernameTooShort: 'Username must be at least 3 characters',
          usernameTooLong: 'Username cannot be more than 20 characters',
          usernameInvalid:
            'Username can only contain letters, numbers and underscores',
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
          usernameAlreadyExists:
            'This username is already taken. Please choose a different username',
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
