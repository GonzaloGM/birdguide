import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import { LanguageProvider } from './contexts/language-context';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>{children}</LanguageProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as renderWithI18n };
