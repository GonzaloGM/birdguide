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

    // Mock badge awarding logic - in real implementation, this would check user's progress
    const badgesAwarded = [];

    // Award first review badge if this is the user's first review
    if (reviewData.speciesId === 1) {
      // Mock condition
      badgesAwarded.push({
        id: 1,
        name: 'first_review',
        title: 'First Review',
        description: 'Complete your first flashcard review',
      });
    }

    return {
      success: true,
      badgesAwarded,
    };
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

  async getBadges() {
    // Mock implementation for now - in real implementation, this would check user's earned badges
    return [
      {
        id: 1,
        name: 'first_review',
        title: 'First Review',
        description: 'Complete your first flashcard review',
        earned: true,
        earnedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 2,
        name: 'ten_correct',
        title: 'Quick Learner',
        description: 'Get 10 correct answers in a row',
        earned: false,
        earnedAt: null,
      },
      {
        id: 3,
        name: 'three_day_streak',
        title: 'Consistent',
        description: 'Practice for 3 days in a row',
        earned: false,
        earnedAt: null,
      },
    ];
  }
}
