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

    renderWithI18n(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Passer domesticus')).toBeInTheDocument();
    });
  });
});
