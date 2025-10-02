import { Injectable } from '@nestjs/common';

type ReviewData = {
  speciesId: number;
  result: 'correct' | 'incorrect';
};

type SessionData = {
  speciesIds: number[];
};

@Injectable()
export class FlashcardService {
  async getSpeciesForSession() {
    // For now, return mock data
    return [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
      { id: 2, scientificName: 'Turdus migratorius', eBirdId: 'amerob' },
      { id: 3, scientificName: 'Cardinalis cardinalis', eBirdId: 'norcar' },
    ];
  }

  async submitReview(reviewData: ReviewData) {
    // Mock implementation for now
    console.log('Review submitted:', reviewData);
    return { success: true };
  }

  async startSession(sessionData: SessionData) {
    // Mock implementation for now
    console.log('Session started:', sessionData);
    return { sessionId: 'session_' + Date.now() };
  }

  async getProgress() {
    // Mock implementation for now
    return {
      totalSpecies: 10,
      masteredSpecies: 3,
      accuracy: 75,
    };
  }
}
