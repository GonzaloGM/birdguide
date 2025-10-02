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

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const data = await flashcardService.getSpeciesForSession();
        setSpecies(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t('flashcards.networkError')
        );
      } finally {
        setLoading(false);
      }
    };

    loadSpecies();
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

  return <FlashcardSession species={species} />;
}
