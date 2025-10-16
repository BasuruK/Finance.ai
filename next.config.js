/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  env: {
    // Make build-time environment variables available
    NEXT_PUBLIC_BUILD_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  headers: async () => {
    const isDev = process.env.NODE_ENV !== 'production';

    // NOTE: Next.js injects inline runtime scripts + potentially uses eval-like constructs in dev (React Refresh).
    // Strategy:
    //  - Development: allow 'unsafe-inline' & 'unsafe-eval' for DX.
    //  - Production: enforce stricter policy; keep 'unsafe-inline' temporarily until nonce refactor.
    //  - Future hardening: replace script-src with nonce hashes and remove 'unsafe-inline'.

    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'"; // TODO: replace with nonce and remove 'unsafe-inline'

    const baseDirectives = [
      "default-src 'self'",
      "img-src 'self' https: data:",
      // Allow Google Fonts stylesheets (Rubik / Inter import) and inline styles for now
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      scriptSrc,
      "connect-src 'self' https://api.openai.com",
      // Allow Google Fonts font files
      "font-src 'self' https://fonts.gstatic.com data:",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests'
    ];

    // Security headers now applied via middleware with per-request nonce CSP.
    return [];
  },
};

export default nextConfig;
