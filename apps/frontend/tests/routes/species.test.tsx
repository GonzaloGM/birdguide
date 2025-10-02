import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import SpeciesPage from '../../app/routes/species';
import { renderWithI18n } from '../../app/test-utils';

describe('SpeciesPage', () => {
  it('should render the species page title', () => {
    renderWithI18n(<SpeciesPage />);

    expect(screen.getByText('Species')).toBeInTheDocument();
  });
});
