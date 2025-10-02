import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithI18n } from '../../app/test-utils';
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

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render language selector dropdown', () => {
    renderWithI18n(<LanguageSelector />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByDisplayValue('es-AR')).toBeInTheDocument();
  });

  it('should have es-AR as default selected option', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    renderWithI18n(<LanguageSelector />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('es-AR');
  });

  it('should load language from localStorage on mount', () => {
    mockLocalStorage.getItem.mockReturnValue('en-US');

    renderWithI18n(<LanguageSelector />);

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('i18nextLng');
    expect(screen.getByDisplayValue('en-US')).toBeInTheDocument();
  });

  it('should save language to localStorage when changed', () => {
    mockLocalStorage.getItem.mockReturnValue('es-AR');

    renderWithI18n(<LanguageSelector />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'en-US' } });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'i18nextLng',
      'en-US'
    );
  });

  it('should change selected value when language changes', () => {
    mockLocalStorage.getItem.mockReturnValue('es-AR');

    renderWithI18n(<LanguageSelector />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'en-US' } });

    expect(select).toHaveValue('en-US');
  });

  it('should display both language options', () => {
    renderWithI18n(<LanguageSelector />);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('es-AR');
    expect(options[1]).toHaveValue('en-US');
  });

  it('should use language context to get current language', () => {
    mockLocalStorage.getItem.mockReturnValue('en-US');

    renderWithI18n(<LanguageSelector />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('en-US');
  });

  it('should call changeLanguage from context when language changes', () => {
    mockLocalStorage.getItem.mockReturnValue('es-AR');

    renderWithI18n(<LanguageSelector />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'en-US' } });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'i18nextLng',
      'en-US'
    );
  });
});
