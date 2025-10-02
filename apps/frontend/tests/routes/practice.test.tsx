import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import PracticePage from '../../app/routes/practice';
import { renderWithI18n } from '../../app/test-utils';
import i18n from '../../app/i18n';

// Mock ProtectedRoute to render children directly
vi.mock('../../app/components/protected-route', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PracticePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the practice page title', () => {
    renderWithI18n(<PracticePage />);

    expect(screen.getByText(i18n.t('practice.title'))).toBeInTheDocument();
  });

  it('should render three practice cards', () => {
    renderWithI18n(<PracticePage />);

    expect(
      screen.getByText(i18n.t('practice.flashcards.title'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('practice.photoQuiz.title'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('practice.soundQuiz.title'))
    ).toBeInTheDocument();
  });

  it('should render card subtitles', () => {
    renderWithI18n(<PracticePage />);

    expect(
      screen.getByText(i18n.t('practice.flashcards.subtitle'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('practice.photoQuiz.subtitle'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('practice.soundQuiz.subtitle'))
    ).toBeInTheDocument();
  });

  it('should navigate to flashcards when flashcards card is clicked', () => {
    renderWithI18n(<PracticePage />);

    const flashcardsCard = screen.getByRole('button', {
      name: `${i18n.t('practice.flashcards.title')} ${i18n.t(
        'practice.flashcards.subtitle'
      )}`,
    });
    fireEvent.click(flashcardsCard);

    expect(mockNavigate).toHaveBeenCalledWith('/flashcards');
  });

  it('should not navigate when photo quiz card is clicked (disabled)', () => {
    renderWithI18n(<PracticePage />);

    const photoQuizCard = screen.getByRole('button', {
      name: `${i18n.t('practice.photoQuiz.title')} ${i18n.t(
        'practice.photoQuiz.subtitle'
      )}`,
    });
    fireEvent.click(photoQuizCard);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should not navigate when sound quiz card is clicked (disabled)', () => {
    renderWithI18n(<PracticePage />);

    const soundQuizCard = screen.getByRole('button', {
      name: `${i18n.t('practice.soundQuiz.title')} ${i18n.t(
        'practice.soundQuiz.subtitle'
      )}`,
    });
    fireEvent.click(soundQuizCard);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should disable photo quiz and sound quiz cards', () => {
    renderWithI18n(<PracticePage />);

    const photoQuizCard = screen.getByRole('button', {
      name: `${i18n.t('practice.photoQuiz.title')} ${i18n.t(
        'practice.photoQuiz.subtitle'
      )}`,
    });
    const soundQuizCard = screen.getByRole('button', {
      name: `${i18n.t('practice.soundQuiz.title')} ${i18n.t(
        'practice.soundQuiz.subtitle'
      )}`,
    });

    expect(photoQuizCard).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(soundQuizCard).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should not navigate when disabled cards are clicked', () => {
    renderWithI18n(<PracticePage />);

    const photoQuizCard = screen.getByRole('button', {
      name: `${i18n.t('practice.photoQuiz.title')} ${i18n.t(
        'practice.photoQuiz.subtitle'
      )}`,
    });
    const soundQuizCard = screen.getByRole('button', {
      name: `${i18n.t('practice.soundQuiz.title')} ${i18n.t(
        'practice.soundQuiz.subtitle'
      )}`,
    });

    fireEvent.click(photoQuizCard);
    fireEvent.click(soundQuizCard);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should be accessible with keyboard navigation', () => {
    renderWithI18n(<PracticePage />);

    const flashcardsCard = screen.getByRole('button', {
      name: `${i18n.t('practice.flashcards.title')} ${i18n.t(
        'practice.flashcards.subtitle'
      )}`,
    });

    // Test keyboard navigation
    fireEvent.keyDown(flashcardsCard, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/flashcards');

    mockNavigate.mockClear();

    fireEvent.keyDown(flashcardsCard, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith('/flashcards');
  });

  it('should have proper ARIA attributes for disabled cards', () => {
    renderWithI18n(<PracticePage />);

    const photoQuizCard = screen.getByRole('button', {
      name: `${i18n.t('practice.photoQuiz.title')} ${i18n.t(
        'practice.photoQuiz.subtitle'
      )}`,
    });
    const soundQuizCard = screen.getByRole('button', {
      name: `${i18n.t('practice.soundQuiz.title')} ${i18n.t(
        'practice.soundQuiz.subtitle'
      )}`,
    });

    expect(photoQuizCard).toHaveAttribute('aria-disabled', 'true');
    expect(soundQuizCard).toHaveAttribute('aria-disabled', 'true');
  });
});
