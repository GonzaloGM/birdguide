import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import { vi } from 'vitest';
import i18n from '../../app/i18n';
import { Header } from '../../app/components/header';
import { LanguageProvider } from '../../app/contexts/language-context';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>{component}</LanguageProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue('es-AR');
  });

  it('should render the BirdGuide logo as a link', () => {
    renderWithI18n(<Header />);

    const logoLink = screen.getByRole('link', { name: i18n.t('appName') });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should have hover effect on the logo', () => {
    renderWithI18n(<Header />);

    const logoLink = screen.getByRole('link', { name: i18n.t('appName') });
    expect(logoLink).toHaveClass('hover:text-blue-600');
  });

  it('should have proper styling', () => {
    renderWithI18n(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass(
      'bg-white',
      'shadow-sm',
      'border-b',
      'border-gray-200'
    );
  });
});
