import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import { Header } from './header';
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

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loginWithPopup } = useAuth0();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrUsername) {
      newErrors.emailOrUsername = t('login.errors.emailOrUsernameRequired');
    } else if (formData.emailOrUsername.includes('@')) {
      // If it contains @, validate as email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailOrUsername)) {
        newErrors.emailOrUsername = t('login.errors.emailInvalid');
      }
    } else {
      // If it doesn't contain @, validate as username
      if (formData.emailOrUsername.length < 3) {
        newErrors.emailOrUsername = t('login.errors.usernameTooShort');
      } else if (formData.emailOrUsername.length > 20) {
        newErrors.emailOrUsername = t('login.errors.usernameTooLong');
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.emailOrUsername)) {
        newErrors.emailOrUsername = t('login.errors.usernameInvalid');
      }
    }

    if (!formData.password) {
      newErrors.password = t('login.errors.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Implement actual login logic
      console.log('Login with:', formData);
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

  const handleGoogleLogin = () => {
    loginWithPopup({
      authorizationParams: {
        connection: 'google-oauth2',
      },
    });
  };

  const handleAppleLogin = () => {
    loginWithPopup({
      authorizationParams: {
        connection: 'apple',
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{t('login.title')}</CardTitle>
            <CardDescription>{t('login.description')}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">
                  {t('login.emailOrUsername')}
                </Label>
                <Input
                  type="text"
                  id="emailOrUsername"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleInputChange}
                  placeholder={t('login.emailOrUsernamePlaceholder')}
                />
                {errors.emailOrUsername && (
                  <p className="text-sm text-destructive">
                    {errors.emailOrUsername}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login.password')}</Label>
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

              <Button type="submit" className="w-full">
                {t('login.submit')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-primary hover:text-primary/80"
              >
                {t('login.forgotPassword')}
              </a>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    {t('login.orContinueWith')}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full"
                >
                  {t('login.google')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAppleLogin}
                  className="w-full"
                >
                  {t('login.apple')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
