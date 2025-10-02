import { useTranslation } from 'react-i18next';

type Species = {
  id: number;
  scientificName: string;
  eBirdId: string;
};

type FlashcardProps = {
  species: Species;
  isRevealed?: boolean;
  onAnswer?: (result: 'correct' | 'incorrect') => void;
};

export function Flashcard({
  species,
  isRevealed = false,
  onAnswer,
}: FlashcardProps) {
  const { t } = useTranslation();

  return (
    <div>
      <img
        src={`https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${species.eBirdId}/1200`}
        alt={species.scientificName}
      />
      <div>{species.scientificName}</div>
      {isRevealed && (
        <div>
          <button onClick={() => onAnswer?.('correct')}>
            {t('flashcards.iKnewIt')}
          </button>
          <button onClick={() => onAnswer?.('incorrect')}>
            {t('flashcards.iDidntKnow')}
          </button>
        </div>
      )}
    </div>
  );
}
