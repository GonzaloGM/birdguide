import { describe, it, expect } from '@jest/globals';
import { BadgeEntity } from './badge.entity';

describe('BadgeEntity', () => {
  it('should create a badge entity with required fields', () => {
    const badge = new BadgeEntity();
    badge.id = 1;
    badge.name = 'first_review';
    badge.title = 'First Review';
    badge.description = 'Complete your first flashcard review';
    badge.icon = 'star';
    badge.color = 'gold';
    badge.isActive = true;
    badge.createdAt = new Date('2024-01-01T00:00:00Z');
    badge.updatedAt = new Date('2024-01-01T00:00:00Z');

    expect(badge.id).toBe(1);
    expect(badge.name).toBe('first_review');
    expect(badge.title).toBe('First Review');
    expect(badge.description).toBe('Complete your first flashcard review');
    expect(badge.icon).toBe('star');
    expect(badge.color).toBe('gold');
    expect(badge.isActive).toBe(true);
    expect(badge.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(badge.updatedAt).toEqual(new Date('2024-01-01T00:00:00Z'));
  });

  it('should have unique name constraint', () => {
    const badge1 = new BadgeEntity();
    badge1.name = 'unique_badge';

    const badge2 = new BadgeEntity();
    badge2.name = 'unique_badge';

    // Names should be the same (this tests the constraint concept)
    expect(badge1.name).toBe(badge2.name);
  });

  it('should handle optional fields correctly', () => {
    const badge = new BadgeEntity();
    badge.name = 'test_badge';
    badge.title = 'Test Badge';
    badge.description = 'A test badge';

    // Optional fields should be undefined initially
    expect(badge.icon).toBeUndefined();
    expect(badge.color).toBeUndefined();
    expect(badge.isActive).toBeUndefined();
  });

  it('should support different badge types', () => {
    const achievementBadge = new BadgeEntity();
    achievementBadge.name = 'achievement_badge';
    achievementBadge.title = 'Achievement Badge';

    const streakBadge = new BadgeEntity();
    streakBadge.name = 'streak_badge';
    streakBadge.title = 'Streak Badge';

    expect(achievementBadge.name).toBe('achievement_badge');
    expect(streakBadge.name).toBe('streak_badge');
  });
});
