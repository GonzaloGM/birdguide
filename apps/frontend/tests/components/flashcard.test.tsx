import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n } from '../../app/test-utils';
import { Flashcard } from '../../app/components/flashcard';
import i18n from 'i18next';

describe('Flashcard', () => {
  it('should display species scientific name', () => {
    const mockSpecies = {
      id: 1,
      scientificName: 'Passer domesticus',
      eBirdId: 'houspa',
    };

    renderWithI18n(<Flashcard species={mockSpecies} />);

    expect(screen.getByText('Passer domesticus')).toBeInTheDocument();
  });

  it('should display species image', () => {
    const mockSpecies = {
      id: 1,
      scientificName: 'Passer domesticus',
      eBirdId: 'houspa',
    };

    renderWithI18n(<Flashcard species={mockSpecies} />);

    expect(screen.getByAltText('Passer domesticus')).toBeInTheDocument();
  });

  it('should show answer buttons when revealed', () => {
    const mockSpecies = {
      id: 1,
      scientificName: 'Passer domesticus',
      eBirdId: 'houspa',
    };

    renderWithI18n(<Flashcard species={mockSpecies} isRevealed={true} />);

    expect(screen.getByText(i18n.t('flashcards.iKnewIt'))).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('flashcards.iDidntKnow'))
    ).toBeInTheDocument();
  });

  it('should call onAnswer when buttons are clicked', () => {
    const mockSpecies = {
      id: 1,
      scientificName: 'Passer domesticus',
      eBirdId: 'houspa',
    };
    const mockOnAnswer = vi.fn();

    renderWithI18n(
      <Flashcard
        species={mockSpecies}
        isRevealed={true}
        onAnswer={mockOnAnswer}
      />
    );

    screen.getByText(i18n.t('flashcards.iKnewIt')).click();
    expect(mockOnAnswer).toHaveBeenCalledWith('correct');

    screen.getByText(i18n.t('flashcards.iDidntKnow')).click();
    expect(mockOnAnswer).toHaveBeenCalledWith('incorrect');
  });
});
