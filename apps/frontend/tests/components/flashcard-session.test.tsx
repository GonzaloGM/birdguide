import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n } from '../../app/test-utils';
import { FlashcardSession } from '../../app/components/flashcard-session';
import i18n from 'i18next';

// Mock the flashcard service using vi.hoisted()
const mockSubmitReview = vi.hoisted(() => vi.fn());
vi.mock('../../app/services/flashcard.service', () => ({
  flashcardService: {
    submitReview: mockSubmitReview,
  },
}));

describe('FlashcardSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    // Set up the mock return value
    mockSubmitReview.mockResolvedValue({ success: true });

    renderWithI18n(<FlashcardSession species={mockSpecies} />);

    // First card
    expect(screen.getByText('Passer domesticus')).toBeInTheDocument();

    const revealButton = screen.getByRole('button', {
      name: i18n.t('flashcards.revealAnswer'),
    });
    await revealButton.click();

    const answerButton = screen.getByText(i18n.t('flashcards.iKnewIt'));
    await answerButton.click();

    // Wait for the state update to complete and show second card
    await waitFor(() => {
      expect(screen.getByText('Turdus migratorius')).toBeInTheDocument();
    });
  });

  it('should show session progress', () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
      { id: 2, scientificName: 'Turdus migratorius', eBirdId: 'amerob' },
    ];

    renderWithI18n(<FlashcardSession species={mockSpecies} />);

    // Should show progress like "1 of 2"
    expect(
      screen.getByText(
        i18n.t('flashcards.sessionProgress', { current: 1, total: 2 })
      )
    ).toBeInTheDocument();
  });

  it('should show session completion when all cards are answered', async () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
    ];

    // Set up the mock return value
    mockSubmitReview.mockResolvedValue({ success: true });

    renderWithI18n(<FlashcardSession species={mockSpecies} />);

    // Answer the only card
    const revealButton = screen.getByRole('button', {
      name: i18n.t('flashcards.revealAnswer'),
    });
    await revealButton.click();

    const answerButton = screen.getByText(i18n.t('flashcards.iKnewIt'));
    await answerButton.click();

    // Wait for the state update to complete and show completion message
    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('flashcards.sessionCompleted'))
      ).toBeInTheDocument();
    });
  });

  it('should submit review when user answers', async () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
    ];

    // Set up the mock return value
    mockSubmitReview.mockResolvedValue({ success: true });

    renderWithI18n(<FlashcardSession species={mockSpecies} />);

    // Answer the card
    const revealButton = screen.getByRole('button', {
      name: i18n.t('flashcards.revealAnswer'),
    });
    await revealButton.click();

    const answerButton = screen.getByText(i18n.t('flashcards.iKnewIt'));
    await answerButton.click();

    // Should have submitted the review
    expect(mockSubmitReview).toHaveBeenCalledWith({
      speciesId: 1,
      result: 'correct',
    });
  });
});
