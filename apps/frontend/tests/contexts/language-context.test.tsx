import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithI18n } from '../../app/test-utils';
import { LanguageProvider, useLanguage } from '../../app/contexts/language-context';

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

// Test component that uses the language context
const TestComponent = () => {
  const { language, setLanguage, changeLanguage } = useLanguage();
  
  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <button 
        data-testid="set-es" 
        onClick={() => setLanguage('es-AR')}
      >
        Set Spanish
      </button>
      <button 
        data-testid="set-en" 
        onClick={() => changeLanguage('en-US')}
      >
        Change to English
      </button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide default language when no saved language exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithI18n(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('es-AR');
  });

  it('should load saved language from localStorage on mount', () => {
    mockLocalStorage.getItem.mockReturnValue('en-US');
    
    renderWithI18n(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('en-US');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('i18nextLng');
  });

  it('should update language when setLanguage is called', () => {
    mockLocalStorage.getItem.mockReturnValue('es-AR');
    
    renderWithI18n(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const setEsButton = screen.getByTestId('set-es');
    fireEvent.click(setEsButton);

    expect(screen.getByTestId('current-language')).toHaveTextContent('es-AR');
  });

  it('should change language and save to localStorage when changeLanguage is called', () => {
    mockLocalStorage.getItem.mockReturnValue('es-AR');
    
    renderWithI18n(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const changeEnButton = screen.getByTestId('set-en');
    fireEvent.click(changeEnButton);

    expect(screen.getByTestId('current-language')).toHaveTextContent('en-US');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'en-US');
  });

  it('should throw error when useLanguage is used outside of LanguageProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useLanguage must be used within a LanguageProvider');
    
    consoleSpy.mockRestore();
  });

  it('should handle invalid language values gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-lang');
    
    renderWithI18n(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Should default to es-AR when invalid language is provided
    expect(screen.getByTestId('current-language')).toHaveTextContent('es-AR');
  });

  it('should maintain language state across multiple context consumers', () => {
    mockLocalStorage.getItem.mockReturnValue('en-US');
    
    const AnotherTestComponent = () => {
      const { language } = useLanguage();
      return <div data-testid="another-language">{language}</div>;
    };

    renderWithI18n(
      <LanguageProvider>
        <TestComponent />
        <AnotherTestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('en-US');
    expect(screen.getByTestId('another-language')).toHaveTextContent('en-US');
  });
});
