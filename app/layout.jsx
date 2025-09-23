export const metadata = {
  title: 'Finance.ai - AI-Powered Financial Services',
  description:
    'Modern AI-enabled services to make your Development Journey smoother',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Finance.ai - AI-Powered Financial Services',
    description:
      'Modern AI-enabled services to make your Development Journey smoother',
    url: 'https://finance-ai.com',
  },
};

import '../src/styles.css';
import { headers } from 'next/headers';

/**
 * Root layout component for the application; reads request headers and renders the HTML shell.
 *
 * This async server component fetches request headers to extract an optional `x-nonce` value
 * (available as `nonce`) for use with CSP-protected inline scripts, then returns the top-level
 * HTML structure including head links for fonts and the page body.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Rendered inside the document <body>.
 * @returns {JSX.Element} The root HTML document structure for the app.
 */
export default async function RootLayout({ children }) {
  const hdrs = await headers();
  const nonce = hdrs.get('x-nonce') || undefined;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Rubik:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Inline scripts should include nonce={nonce}. Example:
            <script nonce={nonce} dangerouslySetInnerHTML={{ __html: "console.log('boot');" }} /> */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
