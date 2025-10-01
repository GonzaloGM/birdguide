import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../app/i18n';
import { Header } from '../../app/components/header';

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
    </MemoryRouter>
  );
};

describe('Header', () => {
  it('should render the BirdGuide logo as a link', () => {
    renderWithI18n(<Header />);

    const logoLink = screen.getByRole('link', { name: 'BirdGuide' });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should have hover effect on the logo', () => {
    renderWithI18n(<Header />);

    const logoLink = screen.getByRole('link', { name: 'BirdGuide' });
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
