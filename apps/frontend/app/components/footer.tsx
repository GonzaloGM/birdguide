import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/auth-context';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();

  // Don't render footer if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link
          to="/practice"
          className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="text-xs font-medium">{t('footer.practice')}</span>
        </Link>
        <Link
          to="/path"
          className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="text-xs font-medium">{t('footer.path')}</span>
        </Link>
        <Link
          to="/species"
          className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="text-xs font-medium">{t('footer.species')}</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="text-xs font-medium">{t('footer.profile')}</span>
        </Link>
      </div>
    </footer>
  );
};
