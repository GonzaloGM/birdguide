import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import { Header } from './header';
import { registrationService } from '../services/registration.service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loginWithPopup } = useAuth0();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t('signup.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('signup.errors.emailInvalid');
    }

    if (!formData.username) {
      newErrors.username = t('signup.errors.usernameRequired');
    } else if (formData.username.length < 3) {
      newErrors.username = t('signup.errors.usernameTooShort');
    } else if (formData.username.length > 20) {
      newErrors.username = t('signup.errors.usernameTooLong');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = t('signup.errors.usernameInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('signup.errors.passwordRequired');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.errors.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.errors.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await registrationService.register(formData);

      if (result.success) {
        // Registration successful - redirect to home or dashboard
        navigate('/');
      } else {
        // Show error message - use i18n for specific error types
        let errorMessage = result.error.message;

        switch (result.error.code) {
          case 'PASSWORD_TOO_WEAK':
            errorMessage = t('signup.errors.passwordTooWeak');
            break;
          case 'PASSWORD_TOO_COMMON':
            errorMessage = t('signup.errors.passwordTooCommon');
            break;
          case 'PASSWORD_CONTAINS_USER_INFO':
            errorMessage = t('signup.errors.passwordContainsUserInfo');
            break;
          case 'USER_ALREADY_EXISTS':
            errorMessage = t('signup.errors.userAlreadyExists');
            break;
          case 'SIGNUP_NOT_ALLOWED':
            errorMessage = t('signup.errors.signupNotAllowed');
            break;
          case 'INVALID_EMAIL':
            errorMessage = t('signup.errors.invalidEmail');
            break;
          case 'CONNECTION_DISABLED':
            errorMessage = t('signup.errors.connectionDisabled');
            break;
          case 'SERVER_ERROR':
            errorMessage = t('signup.errors.serverError');
            break;
          case 'EMAIL_EXISTS':
            errorMessage = t('signup.errors.userAlreadyExists');
            break;
          case 'USERNAME_EXISTS':
            errorMessage = t('signup.errors.usernameAlreadyExists');
            break;
          default:
            // Keep the original error message for unknown errors
            break;
        }

        setErrors({ general: errorMessage });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleGoogleSignup = () => {
    loginWithPopup({
      authorizationParams: {
        connection: 'google-oauth2',
        screen_hint: 'signup',
      },
    });
  };

  const handleAppleSignup = () => {
    loginWithPopup({
      authorizationParams: {
        connection: 'apple',
        screen_hint: 'signup',
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{t('signup.title')}</CardTitle>
            <CardDescription>{t('signup.description')}</CardDescription>
          </CardHeader>

          <CardContent>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t('signup.email')}</Label>
                <Input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t('signup.username')}</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('signup.password')}</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('signup.confirmPassword')}
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t('loading') : t('signup.submit')}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    {t('signup.orContinueWith')}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignup}
                  className="w-full"
                >
                  {t('signup.google')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAppleSignup}
                  className="w-full"
                >
                  {t('signup.apple')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
