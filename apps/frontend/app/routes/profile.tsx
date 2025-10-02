import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../contexts/language-context';
import { Button } from '../components/ui/button';
import LanguageSelector from '../components/language-selector';
import ProtectedRoute from '../components/protected-route';
import { flashcardService } from '../services/flashcard.service';

type Badge = {
  id: number;
  name: string;
  title: string;
  description: string;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const badgesData = await flashcardService.getBadges();
        setBadges(badgesData);
      } catch (error) {
        console.error('Failed to load badges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, []);

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

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('profile.badges')}
              </h3>
              {loading ? (
                <p className="text-gray-500">{t('loading')}</p>
              ) : badges.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <div className="font-medium text-yellow-800">
                        {badge.title}
                      </div>
                      <div className="text-sm text-yellow-700">
                        {badge.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No badges earned yet</p>
              )}
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
