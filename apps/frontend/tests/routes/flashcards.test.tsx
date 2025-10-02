import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n } from '../../app/test-utils';
import FlashcardsPage from '../../app/routes/flashcards';
import i18n from 'i18next';

// Mock the service
vi.mock('../../app/services/flashcard.service', () => ({
  flashcardService: {
    getSpeciesForSession: vi.fn(),
    getProgress: vi.fn(),
    submitReview: vi.fn(),
  },
}));

describe('FlashcardsPage', () => {
  it('should show loading state initially', () => {
    renderWithI18n(<FlashcardsPage />);

    expect(screen.getByText(i18n.t('flashcards.loading'))).toBeInTheDocument();
  });

  it('should show flashcard session when species are loaded', async () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
    ];

    const { flashcardService } = await import(
      '../../app/services/flashcard.service'
    );
    vi.mocked(flashcardService.getSpeciesForSession).mockResolvedValue(
      mockSpecies
    );

    // Mock the progress data to prevent the error
    const mockProgress = {
      totalSpecies: 0,
      masteredSpecies: 0,
      accuracy: 0,
    };
    vi.mocked(flashcardService.getProgress).mockResolvedValue(mockProgress);

    renderWithI18n(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Passer domesticus')).toBeInTheDocument();
    });
  });

  it('should show user progress statistics', async () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
    ];

    const { flashcardService } = await import(
      '../../app/services/flashcard.service'
    );
    vi.mocked(flashcardService.getSpeciesForSession).mockResolvedValue(
      mockSpecies
    );

    // Mock the progress data
    const mockProgress = {
      totalSpecies: 0,
      masteredSpecies: 0,
      accuracy: 0,
    };
    vi.mocked(flashcardService.getProgress).mockResolvedValue(mockProgress);

    renderWithI18n(<FlashcardsPage />);

    // Wait for the data to load and progress statistics to appear
    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('flashcards.totalSpecies'))
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(i18n.t('flashcards.masteredSpecies'))
    ).toBeInTheDocument();
    expect(screen.getByText(i18n.t('flashcards.accuracy'))).toBeInTheDocument();
  });

  it('should fetch and display real progress data', async () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
    ];

    const { flashcardService } = await import(
      '../../app/services/flashcard.service'
    );
    vi.mocked(flashcardService.getSpeciesForSession).mockResolvedValue(
      mockSpecies
    );

    // Mock the progress data
    const mockProgress = {
      totalSpecies: 10,
      masteredSpecies: 3,
      accuracy: 75,
    };

    // Mock the getProgress method
    vi.mocked(flashcardService.getProgress).mockResolvedValue(mockProgress);

    renderWithI18n(<FlashcardsPage />);

    await waitFor(() => {
      // Should show the progress statistics with real data
      expect(screen.getByText('10')).toBeInTheDocument(); // totalSpecies
      expect(screen.getByText('3')).toBeInTheDocument(); // masteredSpecies
      expect(screen.getByText('75%')).toBeInTheDocument(); // accuracy
    });

    // Should also show the progress labels
    expect(
      screen.getByText(i18n.t('flashcards.totalSpecies'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('flashcards.masteredSpecies'))
    ).toBeInTheDocument();
    expect(screen.getByText(i18n.t('flashcards.accuracy'))).toBeInTheDocument();
  });
});
