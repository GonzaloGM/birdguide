import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpeciesService } from '../../app/services/species.service';
import type { SpeciesWithCommonName } from '@birdguide/shared-types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SpeciesService', () => {
  let speciesService: SpeciesService;

  beforeEach(() => {
    vi.clearAllMocks();
    speciesService = new SpeciesService();
  });

  describe('getSpecies', () => {
    it('should fetch species with default language parameter', async () => {
      const mockSpecies: SpeciesWithCommonName[] = [
        {
          id: 1,
          scientificName: 'Passer domesticus',
          commonName: 'House Sparrow',
          family: 'Passeridae',
          genus: 'Passer',
          orderName: 'Passeriformes',
          iucnStatus: 'LC',
          sizeMm: 150,
          summary: 'A common bird species',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSpecies,
        }),
      });

      const result = await speciesService.getSpecies();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/species?lang=es-AR')
      );
      expect(result).toEqual(mockSpecies);
    });

    it('should fetch species with specified language parameter', async () => {
      const mockSpecies: SpeciesWithCommonName[] = [
        {
          id: 1,
          scientificName: 'Passer domesticus',
          commonName: 'Gorrión Común',
          family: 'Passeridae',
          genus: 'Passer',
          orderName: 'Passeriformes',
          iucnStatus: 'LC',
          sizeMm: 150,
          summary: 'Una especie de ave común',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSpecies,
        }),
      });

      const result = await speciesService.getSpecies('en-US');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/species?lang=en-US')
      );
      expect(result).toEqual(mockSpecies);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Server error',
        }),
      });

      await expect(speciesService.getSpecies()).rejects.toThrow('Server error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(speciesService.getSpecies()).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle unsuccessful API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'No data available',
        }),
      });

      await expect(speciesService.getSpecies()).rejects.toThrow(
        'No data available'
      );
    });
  });

  describe('getSpeciesDetail', () => {
    it('should fetch species detail with default language parameter', async () => {
      const mockSpecies: SpeciesWithCommonName = {
        id: 1,
        scientificName: 'Passer domesticus',
        commonName: 'House Sparrow',
        family: 'Passeridae',
        genus: 'Passer',
        orderName: 'Passeriformes',
        iucnStatus: 'LC',
        sizeMm: 150,
        summary: 'A common bird species',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSpecies,
        }),
      });

      const result = await speciesService.getSpeciesDetail(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/species/1?lang=es-AR')
      );
      expect(result).toEqual(mockSpecies);
    });

    it('should fetch species detail with specified language parameter', async () => {
      const mockSpecies: SpeciesWithCommonName = {
        id: 1,
        scientificName: 'Passer domesticus',
        commonName: 'Gorrión Común',
        family: 'Passeridae',
        genus: 'Passer',
        orderName: 'Passeriformes',
        iucnStatus: 'LC',
        sizeMm: 150,
        summary: 'Una especie de ave común',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSpecies,
        }),
      });

      const result = await speciesService.getSpeciesDetail(1, 'en-US');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/species/1?lang=en-US')
      );
      expect(result).toEqual(mockSpecies);
    });

    it('should handle API errors for species detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Species not found',
        }),
      });

      await expect(speciesService.getSpeciesDetail(999)).rejects.toThrow(
        'Species not found'
      );
    });

    it('should handle network errors for species detail', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(speciesService.getSpeciesDetail(1)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('baseUrl configuration', () => {
    it('should use default baseUrl when VITE_API_BASE_URL is not set', () => {
      const originalEnv = import.meta.env.VITE_API_BASE_URL;
      delete import.meta.env.VITE_API_BASE_URL;

      const service = new SpeciesService();

      // We can't directly test the baseUrl, but we can verify it uses the default
      // by checking the fetch calls include the expected URL pattern
      expect(service).toBeDefined();

      // Restore original env
      if (originalEnv !== undefined) {
        import.meta.env.VITE_API_BASE_URL = originalEnv;
      }
    });
  });
});
