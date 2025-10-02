import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithI18n } from '../../app/test-utils';
import PracticePage from '../../app/routes/practice';
import PathPage from '../../app/routes/path';
import SpeciesPage from '../../app/routes/species';
import ProfilePage from '../../app/routes/profile';

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

describe('Protected Routes', () => {
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

    describe('Practice Page', () => {
      it('should redirect to login when user is not authenticated', () => {
        renderWithI18n(<PracticePage />);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    describe('Path Page', () => {
      it('should redirect to login when user is not authenticated', () => {
        renderWithI18n(<PathPage />);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    describe('Species Page', () => {
      it('should redirect to login when user is not authenticated', () => {
        renderWithI18n(<SpeciesPage />);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    describe('Profile Page', () => {
      it('should redirect to login when user is not authenticated', () => {
        renderWithI18n(<ProfilePage />);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
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

    describe('Practice Page', () => {
      it('should render the practice page when user is authenticated', () => {
        renderWithI18n(<PracticePage />);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('Practicar')).toBeInTheDocument();
      });
    });

    describe('Path Page', () => {
      it('should render the path page when user is authenticated', () => {
        renderWithI18n(<PathPage />);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('Senderos')).toBeInTheDocument();
      });
    });

    describe('Species Page', () => {
      it('should render the species page when user is authenticated', async () => {
        // Mock fetch to return empty species list
        global.fetch = vi.fn().mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });

        renderWithI18n(<SpeciesPage />);

        expect(mockNavigate).not.toHaveBeenCalled();

        // Wait for loading to complete and check for the title
        await waitFor(() => {
          expect(screen.getByText('Especies de Aves')).toBeInTheDocument();
        });
      });
    });

    describe('Profile Page', () => {
      it('should render the profile page when user is authenticated', () => {
        renderWithI18n(<ProfilePage />);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('Perfil')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });
  });
});
