import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionService } from '../../app/services/session.service';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveSession', () => {
    it('should save user data and token to localStorage', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        preferredLocale: 'es-AR',
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token = 'mock-jwt-token';

      sessionService.saveSession(user, token);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'birdguide_user',
        JSON.stringify(user)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'birdguide_token',
        token
      );
    });
  });

  describe('getSession', () => {
    it('should return user data and token from localStorage', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        preferredLocale: 'es-AR',
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        isAdmin: false,
        createdAt: '2025-10-02T02:12:17.266Z',
        updatedAt: '2025-10-02T02:12:17.266Z',
      };
      const token = 'mock-jwt-token';

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'birdguide_user') return JSON.stringify(user);
        if (key === 'birdguide_token') return token;
        return null;
      });

      const session = sessionService.getSession();

      expect(session).toEqual({ user, token });
    });

    it('should return null when no session exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const session = sessionService.getSession();

      expect(session).toBeNull();
    });

    it('should return null when user data is corrupted', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'birdguide_user') return 'invalid-json';
        if (key === 'birdguide_token') return 'valid-token';
        return null;
      });

      const session = sessionService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should remove user data and token from localStorage', () => {
      sessionService.clearSession();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'birdguide_user'
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'birdguide_token'
      );
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when valid session exists', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        preferredLocale: 'es-AR',
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token = 'mock-jwt-token';

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'birdguide_user') return JSON.stringify(user);
        if (key === 'birdguide_token') return token;
        return null;
      });

      const isLoggedIn = sessionService.isLoggedIn();

      expect(isLoggedIn).toBe(true);
    });

    it('should return false when no session exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const isLoggedIn = sessionService.isLoggedIn();

      expect(isLoggedIn).toBe(false);
    });

    it('should return false when token is missing', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        preferredLocale: 'es-AR',
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'birdguide_user') return JSON.stringify(user);
        if (key === 'birdguide_token') return null;
        return null;
      });

      const isLoggedIn = sessionService.isLoggedIn();

      expect(isLoggedIn).toBe(false);
    });
  });
});
