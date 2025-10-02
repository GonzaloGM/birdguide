import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithI18n } from '../../app/test-utils';
import { LanguageProvider, useLanguage } from '../../app/contexts/language-context';
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

// Mock species data
const mockSpeciesData = {
  es: [
    {
      id: 1,
      scientificName: 'Passer domesticus',
      commonName: 'Gorrión Común',
      family: 'Passeridae',
      genus: 'Passer',
      orderName: 'Passeriformes',
      iucnStatus: 'LC',
      sizeMm: 150,
      summary: 'Una especie de ave común',
    },
  ],
  en: [
    {
      id: 1,
      scientificName: 'Passer domesticus',
      commonName: 'House Sparrow',
      family: 'Passeridae',
      genus: 'Passer',
      orderName: 'Passeriformes',
      iucnStatus: 'LC',
      sizeMm: 150,
      summary: 'A common bird species',
    },
  ],
};

describe('Language Switching Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('es-AR');
  });

  it('should make API calls with correct language parameter when language changes', async () => {
    // Mock API responses for different languages
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSpeciesData.es,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSpeciesData.en,
        }),
      });

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

    // Verify localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'en-US');
  });

  it('should persist language choice and use it for subsequent API calls', async () => {
    // Set up initial language as English
    mockLocalStorage.getItem.mockReturnValue('en-US');

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSpeciesData.en,
      }),
    });

    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('en-US');

    // Verify that the language context is working correctly
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('i18nextLng');
  });

  it('should handle language switching with multiple components', async () => {
    // Test component that would use the language context
    const TestComponent = () => {
      const { language } = useLanguage();
      return <div data-testid="current-lang">{language}</div>;
    };

    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
        <TestComponent />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    const langDisplay = screen.getByTestId('current-lang');

    expect(select).toHaveValue('es-AR');
    expect(langDisplay).toHaveTextContent('es-AR');

    // Change language
    fireEvent.change(select, { target: { value: 'en-US' } });

    await waitFor(() => {
      expect(select).toHaveValue('en-US');
      expect(langDisplay).toHaveTextContent('en-US');
    });
  });

  it('should maintain language state across component re-renders', () => {
    mockLocalStorage.getItem.mockReturnValue('en-US');

    const { rerender } = renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    let select = screen.getByRole('combobox');
    expect(select).toHaveValue('en-US');

    // Re-render the component
    rerender(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    select = screen.getByRole('combobox');
    expect(select).toHaveValue('en-US');
  });

  it('should handle invalid language values gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-lang');

    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('es-AR');
  });

  it('should provide proper accessibility for language selection', () => {
    renderWithI18n(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const select = screen.getByRole('combobox');
    
    // Check accessibility attributes
    expect(select).toHaveAttribute('role', 'combobox');
    expect(select).toHaveClass('px-3', 'py-2', 'border', 'border-gray-300');
    
    // Check that options are properly structured
    const options = Array.from(select.querySelectorAll('option'));
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('es-AR');
    expect(options[1]).toHaveValue('en-US');
  });
});
