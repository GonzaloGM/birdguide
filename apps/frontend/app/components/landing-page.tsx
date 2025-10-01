import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      {/* Logo and Tagline Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">BirdGuide</h1>
        <p className="text-2xl text-gray-600">{t('tagline')}</p>
      </div>

      {/* Buttons Section */}
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={handleSignup}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {t('signupButton')}
        </button>
        <button
          onClick={handleLogin}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {t('loginButton')}
        </button>
      </div>
    </div>
  );
};
