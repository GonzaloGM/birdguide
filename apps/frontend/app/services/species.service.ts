import type { SpeciesWithCommonName } from '@birdguide/shared-types';

export class SpeciesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  }

  async getSpecies(lang: string = 'es-AR'): Promise<SpeciesWithCommonName[]> {
    try {
      const response = await fetch(`${this.baseUrl}/species?lang=${lang}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch species');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch species');
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while fetching species');
    }
  }

  async getSpeciesDetail(id: number, lang: string = 'es-AR'): Promise<SpeciesWithCommonName> {
    try {
      const response = await fetch(`${this.baseUrl}/species/${id}?lang=${lang}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch species detail');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch species detail');
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while fetching species detail');
    }
  }
}
