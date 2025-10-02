import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../contexts/language-context';
import { Button } from '../components/ui/button';
import LanguageSelector from '../components/language-selector';
import ProtectedRoute from '../components/protected-route';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('profile.title')}
          </h1>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {user?.username}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="language-selector"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('profile.language')}
              </label>
              <LanguageSelector />
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {t('profile.logout')}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
