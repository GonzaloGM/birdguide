import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import PracticePage from '../../app/routes/practice';
import { renderWithI18n } from '../../app/test-utils';
import i18n from '../../app/i18n';

describe('PracticePage', () => {
  it('should render the practice page title', () => {
    renderWithI18n(<PracticePage />);

    expect(screen.getByText(i18n.t('footer.practice'))).toBeInTheDocument();
  });
});
