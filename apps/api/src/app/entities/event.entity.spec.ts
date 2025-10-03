import { describe, it, expect } from '@jest/globals';
import { EventEntity } from './event.entity';

describe('EventEntity', () => {
  it('should create an event entity with required fields', () => {
    const event = new EventEntity();
    event.id = 1;
    event.userId = 'user-123';
    event.eventType = 'flashcard_review';
    event.data = { speciesId: 1, result: 'correct' };
    event.timestamp = new Date('2024-01-15T10:30:00Z');
    event.createdAt = new Date('2024-01-15T10:30:00Z');

    expect(event.id).toBe(1);
    expect(event.userId).toBe('user-123');
    expect(event.eventType).toBe('flashcard_review');
    expect(event.data).toEqual({ speciesId: 1, result: 'correct' });
    expect(event.timestamp).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(event.createdAt).toEqual(new Date('2024-01-15T10:30:00Z'));
  });

  it('should handle different event types', () => {
    const reviewEvent = new EventEntity();
    reviewEvent.eventType = 'flashcard_review';
    expect(reviewEvent.eventType).toBe('flashcard_review');

    const sessionEvent = new EventEntity();
    sessionEvent.eventType = 'session_started';
    expect(sessionEvent.eventType).toBe('session_started');

    const badgeEvent = new EventEntity();
    badgeEvent.eventType = 'badge_earned';
    expect(badgeEvent.eventType).toBe('badge_earned');
  });

  it('should handle JSON data correctly', () => {
    const event = new EventEntity();
    const complexData = {
      speciesId: 1,
      result: 'correct',
      responseTime: 2500,
      sessionId: 'session-123',
      metadata: {
        difficulty: 2.5,
        streak: 3,
      },
    };
    event.data = complexData;

    expect(event.data).toEqual(complexData);
    expect(event.data.speciesId).toBe(1);
    expect(event.data.metadata.streak).toBe(3);
  });

  it('should handle optional fields', () => {
    const event = new EventEntity();
    event.userId = 'user-123';
    event.eventType = 'test_event';

    // Optional fields should be undefined initially
    expect(event.data).toBeUndefined();
    expect(event.timestamp).toBeUndefined();
  });
});
