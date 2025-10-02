import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flashcard } from './flashcard';

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

  if (species.length === 0) {
    return <div>{t('flashcards.noSpecies')}</div>;
  }

  const currentSpecies = species[currentCardIndex];

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleAnswer = (result: 'correct' | 'incorrect') => {
    // Move to next card
    if (currentCardIndex < species.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsRevealed(false);
    }
  };

  return (
    <div>
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
