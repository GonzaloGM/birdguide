type Species = {
  id: number;
  scientificName: string;
  eBirdId: string;
};

type ReviewData = {
  speciesId: number;
  result: 'correct' | 'incorrect';
};

type SessionData = {
  speciesIds: number[];
};

type ReviewResponse = {
  success: boolean;
};

type SessionResponse = {
  sessionId: string;
};

type ProgressData = {
  totalSpecies: number;
  masteredSpecies: number;
  accuracy: number;
};

const API_BASE_URL = 'http://localhost:3000/api';

export const flashcardService = {
  async getSpeciesForSession(): Promise<Species[]> {
    const response = await fetch(`${API_BASE_URL}/flashcards/species`);

    if (!response.ok) {
      throw new Error('Failed to fetch species');
    }

    return response.json();
  },

  async submitReview(reviewData: ReviewData): Promise<ReviewResponse> {
    const response = await fetch(`${API_BASE_URL}/flashcards/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) {
      throw new Error('Failed to submit review');
    }
    return response.json();
  },

  async startSession(sessionData: SessionData): Promise<SessionResponse> {
    const response = await fetch(`${API_BASE_URL}/flashcards/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      throw new Error('Failed to start session');
    }
    return response.json();
  },

  async getProgress(): Promise<ProgressData> {
    const response = await fetch(`${API_BASE_URL}/flashcards/progress`);
    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }
    return response.json();
  },
};
