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
});
