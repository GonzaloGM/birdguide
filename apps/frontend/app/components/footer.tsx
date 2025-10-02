import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <nav className="flex justify-around">
        <Link
          to="/practice"
          className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="text-sm font-medium">{t('footer.practice')}</span>
        </Link>
        <Link
          to="/path"
          className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="text-sm font-medium">{t('footer.path')}</span>
        </Link>
        <Link
          to="/species"
          className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="text-sm font-medium">{t('footer.species')}</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="text-sm font-medium">{t('footer.profile')}</span>
        </Link>
      </nav>
    </footer>
  );
};
