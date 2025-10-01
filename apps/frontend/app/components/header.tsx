import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
          >
            {t('appName')}
          </Link>
        </div>
      </div>
    </header>
  );
};
