import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { LandingPage } from '../../app/components/landing-page';
import { renderWithI18n } from '../../app/test-utils';
import { useAuth } from '../../app/contexts/auth-context';
import { useNavigate } from 'react-router';

// Mock auth context
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage Redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should redirect to /practice when user is logged in', async () => {
    // Mock user as logged in
    vi.mocked(useAuth).mockReturnValue({
      user: {
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
      },
      isLoggedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithI18n(<LandingPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/practice');
    });
  });

  it('should not redirect when user is not logged in', async () => {
    // Mock user as not logged in
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoggedIn: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithI18n(<LandingPage />);

    // Wait a bit to ensure no redirect happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
