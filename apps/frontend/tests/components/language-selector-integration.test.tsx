import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithI18n } from '../../app/test-utils';
import { LanguageProvider } from '../../app/contexts/language-context';
import LanguageSelector from '../../app/components/language-selector';

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

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LanguageSelector Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('es-AR');
  });

  it('should change language and trigger i18n language change', async () => {
    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('es-AR');

    // Change language to English
    fireEvent.change(select, { target: { value: 'en-US' } });

    await waitFor(() => {
      expect(select).toHaveValue('en-US');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'i18nextLng',
      'en-US'
    );
  });

  it('should persist language choice across component re-renders', () => {
    mockLocalStorage.getItem.mockReturnValue('en-US');

    const { rerender } = renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('en-US');

    // Re-render the component
    rerender(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    // Language should still be persisted
    expect(select).toHaveValue('en-US');
  });

  it('should default to es-AR when no saved language exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('es-AR');
  });

  it('should handle invalid saved language gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-lang');

    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('es-AR');
  });

  it('should display both language options with correct values', () => {
    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('es-AR');
    expect(options[0]).toHaveTextContent('es-AR');
    expect(options[1]).toHaveValue('en-US');
    expect(options[1]).toHaveTextContent('en-US');
  });

  it('should have proper accessibility attributes', () => {
    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('role', 'combobox');
    expect(select).toHaveClass('px-3', 'py-2', 'border', 'border-gray-300');
  });
});
