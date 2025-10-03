import { describe, it, expect } from '@jest/globals';
import { FlashcardReviewEntity } from './flashcard-review.entity';

describe('FlashcardReviewEntity', () => {
  it('should create a flashcard review entity with required fields', () => {
    const review = new FlashcardReviewEntity();
    review.id = 1;
    review.userId = 123;
    review.speciesId = 1;
    review.result = 'correct';
    review.reviewedAt = new Date('2024-01-15T10:30:00Z');
    review.responseTime = 2500; // milliseconds
    review.difficulty = 2.5;
    review.interval = 1; // days
    review.repetitions = 1;
    review.easeFactor = 2.5;
    review.nextReviewDate = new Date('2024-01-16T10:30:00Z');

    expect(review.id).toBe(1);
    expect(review.userId).toBe(123);
    expect(review.speciesId).toBe(1);
    expect(review.result).toBe('correct');
    expect(review.reviewedAt).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(review.responseTime).toBe(2500);
    expect(review.difficulty).toBe(2.5);
    expect(review.interval).toBe(1);
    expect(review.repetitions).toBe(1);
    expect(review.easeFactor).toBe(2.5);
    expect(review.nextReviewDate).toEqual(new Date('2024-01-16T10:30:00Z'));
  });

  it('should have correct result enum values', () => {
    const review = new FlashcardReviewEntity();

    // Test that we can set valid result values
    review.result = 'correct';
    expect(review.result).toBe('correct');

    review.result = 'incorrect';
    expect(review.result).toBe('incorrect');
  });

  it('should have proper default values for optional fields', () => {
    const review = new FlashcardReviewEntity();
    review.userId = 123;
    review.speciesId = 1;
    review.result = 'correct';
    review.reviewedAt = new Date();

    // Optional fields should be undefined initially
    expect(review.responseTime).toBeUndefined();
    expect(review.difficulty).toBeUndefined();
    expect(review.interval).toBeUndefined();
    expect(review.repetitions).toBeUndefined();
    expect(review.easeFactor).toBeUndefined();
    expect(review.nextReviewDate).toBeUndefined();
  });
});
