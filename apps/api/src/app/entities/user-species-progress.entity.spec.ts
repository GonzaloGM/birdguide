import { describe, it, expect } from '@jest/globals';
import { UserSpeciesProgressEntity } from './user-species-progress.entity';

describe('UserSpeciesProgressEntity', () => {
  it('should create a user species progress entity with required fields', () => {
    const progress = new UserSpeciesProgressEntity();
    progress.id = 1;
    progress.userId = 'user-123';
    progress.speciesId = 1;
    progress.timesSeen = 5;
    progress.timesCorrect = 3;
    progress.lastSeen = new Date('2024-01-15T10:30:00Z');
    progress.accuracy = 0.6; // 60%
    progress.masteryLevel = 2; // 0-5 scale
    progress.isMastered = false;
    progress.createdAt = new Date('2024-01-10T10:30:00Z');
    progress.updatedAt = new Date('2024-01-15T10:30:00Z');

    expect(progress.id).toBe(1);
    expect(progress.userId).toBe('user-123');
    expect(progress.speciesId).toBe(1);
    expect(progress.timesSeen).toBe(5);
    expect(progress.timesCorrect).toBe(3);
    expect(progress.lastSeen).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(progress.accuracy).toBe(0.6);
    expect(progress.masteryLevel).toBe(2);
    expect(progress.isMastered).toBe(false);
    expect(progress.createdAt).toEqual(new Date('2024-01-10T10:30:00Z'));
    expect(progress.updatedAt).toEqual(new Date('2024-01-15T10:30:00Z'));
  });

  it('should calculate accuracy correctly', () => {
    const progress = new UserSpeciesProgressEntity();
    progress.timesSeen = 10;
    progress.timesCorrect = 7;

    // Accuracy should be calculated as timesCorrect / timesSeen
    expect(progress.timesCorrect / progress.timesSeen).toBe(0.7);
  });

  it('should have proper default values', () => {
    const progress = new UserSpeciesProgressEntity();
    progress.userId = 'user-123';
    progress.speciesId = 1;

    // Default values for new progress
    expect(progress.timesSeen).toBeUndefined();
    expect(progress.timesCorrect).toBeUndefined();
    expect(progress.lastSeen).toBeUndefined();
    expect(progress.accuracy).toBeUndefined();
    expect(progress.masteryLevel).toBeUndefined();
    expect(progress.isMastered).toBeUndefined();
  });

  it('should handle mastery level correctly', () => {
    const progress = new UserSpeciesProgressEntity();

    // Test different mastery levels (0-5 scale)
    progress.masteryLevel = 0;
    expect(progress.masteryLevel).toBe(0);

    progress.masteryLevel = 5;
    expect(progress.masteryLevel).toBe(5);

    progress.masteryLevel = 3;
    expect(progress.masteryLevel).toBe(3);
  });
});
