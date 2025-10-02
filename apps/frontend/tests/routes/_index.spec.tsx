import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithI18n } from '../../app/test-utils';
import IndexPage from '../../app/routes/_index';
import i18n from '../../app/i18n';

// Mock auth context
import { vi } from 'vitest';
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

test('renders BirdGuide landing page', async () => {
  renderWithI18n(<IndexPage />);

  await waitFor(() => screen.findByText(i18n.t('appName')));
  expect(screen.getByText(i18n.t('tagline'))).toBeInTheDocument();
  expect(screen.getByText(i18n.t('signupButton'))).toBeInTheDocument();
  expect(screen.getByText(i18n.t('loginButton'))).toBeInTheDocument();
});
