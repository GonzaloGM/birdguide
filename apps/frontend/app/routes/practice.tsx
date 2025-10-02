import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ProtectedRoute from '../components/protected-route';

export default function PracticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCardClick = (route: string, disabled: boolean = false) => {
    if (!disabled) {
      navigate(route);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            {t('practice.title')}
          </h1>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Flashcards Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick('/flashcards')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick('/flashcards');
                }
              }}
              className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow duration-200 border-2 border-transparent hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('practice.flashcards.title')}
              </h2>
              <p className="text-gray-500 text-sm">
                {t('practice.flashcards.subtitle')}
              </p>
            </div>

            {/* Photo Quiz Card - Disabled */}
            <div
              role="button"
              tabIndex={-1}
              onClick={() => handleCardClick('/photo-quiz', true)}
              className="bg-white rounded-lg shadow-lg p-8 opacity-50 cursor-not-allowed border-2 border-transparent"
              aria-disabled="true"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('practice.photoQuiz.title')}
              </h2>
              <p className="text-gray-500 text-sm">
                {t('practice.photoQuiz.subtitle')}
              </p>
            </div>

            {/* Sound Quiz Card - Disabled */}
            <div
              role="button"
              tabIndex={-1}
              onClick={() => handleCardClick('/sound-quiz', true)}
              className="bg-white rounded-lg shadow-lg p-8 opacity-50 cursor-not-allowed border-2 border-transparent"
              aria-disabled="true"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('practice.soundQuiz.title')}
              </h2>
              <p className="text-gray-500 text-sm">
                {t('practice.soundQuiz.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
