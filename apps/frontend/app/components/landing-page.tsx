import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Header } from './header';
import { useAuth } from '../contexts/auth-context';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();

  // Redirect to practice page if user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/practice');
    }
  }, [isLoggedIn, navigate]);

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Tagline Section */}
        <div className="text-center mb-16">
          <p className="text-2xl text-gray-600">{t('tagline')}</p>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col gap-4 w-64">
          <button
            onClick={handleSignup}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t('signupButton')}
          </button>
          <button
            onClick={handleLogin}
            className="bg-white hover:bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-gray-600 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t('loginButton')}
          </button>
        </div>
      </div>
    </div>
  );
};
