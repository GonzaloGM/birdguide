type Species = {
  id: number;
  scientificName: string;
  eBirdId: string;
};

const API_BASE_URL = 'http://localhost:3000';

export const flashcardService = {
  async getSpeciesForSession(): Promise<Species[]> {
    const response = await fetch(`${API_BASE_URL}/api/flashcards/species`);

    if (!response.ok) {
      throw new Error('Failed to fetch species');
    }

    return response.json();
  },
};
