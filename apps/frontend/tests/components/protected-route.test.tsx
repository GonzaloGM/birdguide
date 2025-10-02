import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '../../app/test-utils';
import ProtectedRoute from '../../app/components/protected-route';

// Mock useAuth
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        isLoggedIn: false,
        login: mockLogin,
        logout: mockLogout,
      });
    });

    it('should redirect to login when user is not authenticated', () => {
      const TestComponent = () => <div>Protected Content</div>;

      renderWithI18n(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should return null when user is not authenticated', () => {
      const TestComponent = () => <div>Protected Content</div>;

      const { container } = renderWithI18n(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = {
      id: 'user-123',
      auth0Id: 'auth0|user-123',
      email: 'test@example.com',
      username: 'testuser',
      preferredLocale: 'es-AR',
      preferredRegionId: null,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveAt: new Date(),
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        token: 'mock-token',
        isLoggedIn: true,
        login: mockLogin,
        logout: mockLogout,
      });
    });

    it('should render children when user is authenticated', () => {
      const TestComponent = () => <div>Protected Content</div>;

      renderWithI18n(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render multiple children when user is authenticated', () => {
      renderWithI18n(
        <ProtectedRoute>
          <div>First Child</div>
          <div>Second Child</div>
        </ProtectedRoute>
      );

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });
});
