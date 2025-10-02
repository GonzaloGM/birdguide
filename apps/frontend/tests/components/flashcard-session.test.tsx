import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithI18n } from '../../app/test-utils';
import { FlashcardSession } from '../../app/components/flashcard-session';
import i18n from 'i18next';

describe('FlashcardSession', () => {
  it('should show a bird species for the user to identify', () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
    ];

    renderWithI18n(<FlashcardSession species={mockSpecies} />);

    expect(screen.getByText('Passer domesticus')).toBeInTheDocument();
  });

  it('should allow user to reveal the answer', () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
    ];

    renderWithI18n(<FlashcardSession species={mockSpecies} />);

    const revealButton = screen.getByRole('button', {
      name: i18n.t('flashcards.revealAnswer'),
    });
    expect(revealButton).toBeInTheDocument();
  });

  it('should show answer options after user reveals the answer', async () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
    ];

    renderWithI18n(<FlashcardSession species={mockSpecies} />);

    const revealButton = screen.getByRole('button', {
      name: i18n.t('flashcards.revealAnswer'),
    });
    await revealButton.click();

    expect(screen.getByText(i18n.t('flashcards.iKnewIt'))).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('flashcards.iDidntKnow'))
    ).toBeInTheDocument();
  });

  it('should move to next card after user answers', async () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
      { id: 2, scientificName: 'Turdus migratorius', eBirdId: 'amerob' },
    ];

    renderWithI18n(<FlashcardSession species={mockSpecies} />);

    // First card
    expect(screen.getByText('Passer domesticus')).toBeInTheDocument();

    const revealButton = screen.getByRole('button', {
      name: i18n.t('flashcards.revealAnswer'),
    });
    await revealButton.click();

    const answerButton = screen.getByText(i18n.t('flashcards.iKnewIt'));
    await answerButton.click();

    // Should show second card
    expect(screen.getByText('Turdus migratorius')).toBeInTheDocument();
  });
});
