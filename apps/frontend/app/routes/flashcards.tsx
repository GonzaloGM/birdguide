import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlashcardSession } from '../components/flashcard-session';
import { flashcardService } from '../services/flashcard.service';

type Species = {
  id: number;
  scientificName: string;
  eBirdId: string;
};

export default function FlashcardsPage() {
  const { t } = useTranslation();
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    totalSpecies: 0,
    masteredSpecies: 0,
    accuracy: 0,
  });
  useEffect(() => {
    const loadData = async () => {
      try {
        const [speciesData, progressData] = await Promise.all([
          flashcardService.getSpeciesForSession(),
          flashcardService.getProgress(),
        ]);
        setSpecies(speciesData);
        setProgress(progressData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t('flashcards.networkError')
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>{t('flashcards.loading')}</div>;
  }

  if (error) {
    return (
      <div>
        {t('flashcards.error')}: {error}
      </div>
    );
  }

  if (species.length === 0) {
    return <div>{t('flashcards.noSpecies')}</div>;
  }

  return (
    <div>
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {t('flashcards.progress')}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {progress.totalSpecies}
            </div>
            <div className="text-sm text-gray-600">
              {t('flashcards.totalSpecies')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {progress.masteredSpecies}
            </div>
            <div className="text-sm text-gray-600">
              {t('flashcards.masteredSpecies')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {progress.accuracy}%
            </div>
            <div className="text-sm text-gray-600">
              {t('flashcards.accuracy')}
            </div>
          </div>
        </div>
      </div>

      <FlashcardSession species={species} />
    </div>
  );
}
