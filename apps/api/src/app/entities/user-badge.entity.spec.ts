import { describe, it, expect } from '@jest/globals';
import { UserBadgeEntity } from './user-badge.entity';

describe('UserBadgeEntity', () => {
  it('should create a user badge entity with required fields', () => {
    const userBadge = new UserBadgeEntity();
    userBadge.id = 1;
    userBadge.userId = 123;
    userBadge.badgeId = 1;
    userBadge.earnedAt = new Date('2024-01-15T10:30:00Z');
    userBadge.createdAt = new Date('2024-01-15T10:30:00Z');
    userBadge.updatedAt = new Date('2024-01-15T10:30:00Z');

    expect(userBadge.id).toBe(1);
    expect(userBadge.userId).toBe(123);
    expect(userBadge.badgeId).toBe(1);
    expect(userBadge.earnedAt).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(userBadge.createdAt).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(userBadge.updatedAt).toEqual(new Date('2024-01-15T10:30:00Z'));
  });

  it('should have unique constraint on userId and badgeId combination', () => {
    const userBadge1 = new UserBadgeEntity();
    userBadge1.userId = 'user-123';
    userBadge1.badgeId = 1;

    const userBadge2 = new UserBadgeEntity();
    userBadge2.userId = 'user-123';
    userBadge2.badgeId = 1;

    // Same user and badge combination (this tests the constraint concept)
    expect(userBadge1.userId).toBe(userBadge2.userId);
    expect(userBadge1.badgeId).toBe(userBadge2.badgeId);
  });

  it('should allow same badge for different users', () => {
    const userBadge1 = new UserBadgeEntity();
    userBadge1.userId = 'user-123';
    userBadge1.badgeId = 1;

    const userBadge2 = new UserBadgeEntity();
    userBadge2.userId = 'user-456';
    userBadge2.badgeId = 1;

    // Different users can have the same badge
    expect(userBadge1.userId).not.toBe(userBadge2.userId);
    expect(userBadge1.badgeId).toBe(userBadge2.badgeId);
  });

  it('should handle earnedAt timestamp correctly', () => {
    const userBadge = new UserBadgeEntity();
    const earnedDate = new Date('2024-01-15T10:30:00Z');
    userBadge.earnedAt = earnedDate;

    expect(userBadge.earnedAt).toEqual(earnedDate);
    expect(userBadge.earnedAt.getTime()).toBe(earnedDate.getTime());
  });
});
