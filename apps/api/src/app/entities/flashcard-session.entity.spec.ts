import { describe, it, expect } from '@jest/globals';
import { FlashcardSessionEntity } from './flashcard-session.entity';

describe('FlashcardSessionEntity', () => {
  it('should create a flashcard session entity with required fields', () => {
    const session = new FlashcardSessionEntity();
    session.id = 1;
    session.userId = 123;
    session.speciesIds = [1, 2, 3];
    session.startedAt = new Date('2024-01-15T10:30:00Z');
    session.completedAt = new Date('2024-01-15T10:45:00Z');
    session.totalCards = 3;
    session.correctAnswers = 2;
    session.incorrectAnswers = 1;
    session.accuracy = 0.67; // 2/3
    session.duration = 900; // 15 minutes in seconds
    session.createdAt = new Date('2024-01-15T10:30:00Z');
    session.updatedAt = new Date('2024-01-15T10:45:00Z');

    expect(session.id).toBe(1);
    expect(session.userId).toBe(123);
    expect(session.speciesIds).toEqual([1, 2, 3]);
    expect(session.startedAt).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(session.completedAt).toEqual(new Date('2024-01-15T10:45:00Z'));
    expect(session.totalCards).toBe(3);
    expect(session.correctAnswers).toBe(2);
    expect(session.incorrectAnswers).toBe(1);
    expect(session.accuracy).toBe(0.67);
    expect(session.duration).toBe(900);
    expect(session.createdAt).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(session.updatedAt).toEqual(new Date('2024-01-15T10:45:00Z'));
  });

  it('should handle optional fields correctly', () => {
    const session = new FlashcardSessionEntity();
    session.userId = 123;
    session.speciesIds = [1, 2];

    // Optional fields should be undefined initially
    expect(session.completedAt).toBeUndefined();
    expect(session.totalCards).toBeUndefined();
    expect(session.correctAnswers).toBeUndefined();
    expect(session.incorrectAnswers).toBeUndefined();
    expect(session.accuracy).toBeUndefined();
    expect(session.duration).toBeUndefined();
  });

  it('should handle different session states', () => {
    // Active session (not completed)
    const activeSession = new FlashcardSessionEntity();
    activeSession.userId = 'user-123';
    activeSession.speciesIds = [1, 2, 3];
    activeSession.startedAt = new Date();
    // completedAt is undefined for active sessions

    expect(activeSession.completedAt).toBeUndefined();

    // Completed session
    const completedSession = new FlashcardSessionEntity();
    completedSession.userId = 'user-123';
    completedSession.speciesIds = [1, 2, 3];
    completedSession.startedAt = new Date();
    completedSession.completedAt = new Date();

    expect(completedSession.completedAt).toBeDefined();
  });

  it('should handle species IDs array correctly', () => {
    const session = new FlashcardSessionEntity();
    const speciesIds = [1, 5, 10, 15];
    session.speciesIds = speciesIds;

    expect(session.speciesIds).toEqual(speciesIds);
    expect(session.speciesIds.length).toBe(4);
    expect(session.speciesIds[0]).toBe(1);
    expect(session.speciesIds[3]).toBe(15);
  });
});
