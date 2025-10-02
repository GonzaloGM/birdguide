import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaFunction,
  type LinksFunction,
} from 'react-router';
import { Auth0Provider } from '@auth0/auth0-react';
import { I18nextProvider } from 'react-i18next';

import i18n from './i18n';
import { auth0Config } from './auth0-config';
import { AuthProvider } from './contexts/auth-context';
import { Footer } from './components/footer';
import '../styles.css';

export const meta: MetaFunction = () => [
  {
    title: 'BirdGuide - Descubrí cada ave',
  },
];

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head suppressHydrationWarning={true}>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={true}>
        <Auth0Provider {...auth0Config}>
          <I18nextProvider i18n={i18n}>
            <AuthProvider>
              <Outlet />
              <Footer />
            </AuthProvider>
            <ScrollRestoration />
            <Scripts />
          </I18nextProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
