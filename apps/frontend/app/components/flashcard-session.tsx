import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flashcard } from './flashcard';
import { flashcardService } from '../services/flashcard.service';

type Species = {
  id: number;
  scientificName: string;
  eBirdId: string;
};

type FlashcardSessionProps = {
  species: Species[];
};

export function FlashcardSession({ species }: FlashcardSessionProps) {
  const { t } = useTranslation();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (species.length === 0) {
    return <div>{t('flashcards.noSpecies')}</div>;
  }

  const currentSpecies = species[currentCardIndex];

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleAnswer = async (result: 'correct' | 'incorrect') => {
    // Submit review to backend
    try {
      await flashcardService.submitReview({
        speciesId: currentSpecies.id,
        result,
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
    }

    // Move to next card
    if (currentCardIndex < species.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsRevealed(false);
    } else {
      // End of session
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    return <div>{t('flashcards.sessionCompleted')}</div>;
  }

  if (!currentSpecies) {
    return <div>No species in this session.</div>;
  }

  return (
    <div>
      <div>
        {t('flashcards.sessionProgress', {
          current: currentCardIndex + 1,
          total: species.length,
        })}
      </div>
      <Flashcard
        species={currentSpecies}
        isRevealed={isRevealed}
        onAnswer={handleAnswer}
      />
      {!isRevealed && (
        <button onClick={handleReveal}>{t('flashcards.revealAnswer')}</button>
      )}
    </div>
  );
}
