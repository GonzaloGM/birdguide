import { createRoutesStub } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../app/i18n';
import App from '../../app/app';

test('renders BirdGuide landing page', async () => {
  const ReactRouterStub = createRoutesStub([
    {
      path: '/',
      Component: App,
    },
  ]);

  render(
    <I18nextProvider i18n={i18n}>
      <ReactRouterStub />
    </I18nextProvider>
  );

  await waitFor(() => screen.findByText('BirdGuide'));
  expect(screen.getByText(i18n.t('tagline'))).toBeInTheDocument();
  expect(screen.getByText(i18n.t('signupButton'))).toBeInTheDocument();
  expect(screen.getByText(i18n.t('loginButton'))).toBeInTheDocument();
});
