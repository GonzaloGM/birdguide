import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import PathPage from '../../app/routes/path';
import { renderWithI18n } from '../../app/test-utils';
import i18n from '../../app/i18n';

describe('PathPage', () => {
  it('should render the path page title', () => {
    renderWithI18n(<PathPage />);

    expect(screen.getByText(i18n.t('footer.path'))).toBeInTheDocument();
  });
});
