import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import ProfilePage from '../../app/routes/profile';
import { renderWithI18n } from '../../app/test-utils';

describe('ProfilePage', () => {
  it('should render the profile page title', () => {
    renderWithI18n(<ProfilePage />);

    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
