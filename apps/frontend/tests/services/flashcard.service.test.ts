import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flashcardService } from '../../app/services/flashcard.service';

// Mock fetch
global.fetch = vi.fn();

describe('flashcardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch species for flashcard session', async () => {
    const mockSpecies = [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
      { id: 2, scientificName: 'Turdus migratorius', eBirdId: 'amerob' },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSpecies,
    } as Response);

    const result = await flashcardService.getSpeciesForSession();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/flashcards/species'
    );
    expect(result).toEqual(mockSpecies);
  });

  it('should handle fetch errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(flashcardService.getSpeciesForSession()).rejects.toThrow(
      'Network error'
    );
  });

  it('should submit a review', async () => {
    const reviewData = {
      speciesId: 1,
      result: 'correct' as const,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await flashcardService.submitReview(reviewData);
    expect(result).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/flashcards/review',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      }
    );
  });

  it('should submit a review and receive badges awarded', async () => {
    const reviewData = {
      speciesId: 1,
      result: 'correct' as const,
    };

    const mockResponse = {
      success: true,
      badgesAwarded: [
        {
          id: 1,
          name: 'first_review',
          title: 'First Review',
          description: 'Complete your first flashcard review',
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await flashcardService.submitReview(reviewData);
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/flashcards/review',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      }
    );
  });

  it('should start a session', async () => {
    const sessionData = {
      speciesIds: [1, 2, 3],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: 'session_123' }),
    } as Response);

    const result = await flashcardService.startSession(sessionData);
    expect(result).toEqual({ sessionId: 'session_123' });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/flashcards/session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      }
    );
  });

  it('should fetch progress data', async () => {
    const mockProgress = {
      totalSpecies: 10,
      masteredSpecies: 3,
      accuracy: 75,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProgress,
    } as Response);

    const result = await flashcardService.getProgress();
    expect(result).toEqual(mockProgress);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/flashcards/progress'
    );
  });

  it('should fetch badges data', async () => {
    const mockBadges = [
      {
        id: 1,
        name: 'first_review',
        title: 'First Review',
        description: 'Complete your first flashcard review',
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBadges,
    } as Response);

    const result = await flashcardService.getBadges();
    expect(result).toEqual(mockBadges);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/flashcards/badges'
    );
  });
});
