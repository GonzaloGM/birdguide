import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import ProfilePage from '../../app/routes/profile';
import { renderWithI18n } from '../../app/test-utils';
import i18n from '../../app/i18n';

// Mock auth context
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: () => ({
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
  }),
}));

describe('ProfilePage', () => {
  it('should render the profile page title', () => {
    renderWithI18n(<ProfilePage />);

    expect(screen.getByText(i18n.t('profile.title'))).toBeInTheDocument();
  });
});
