import { NextResponse } from 'next/server';

// Use Web Crypto (Edge/runtime compatible) instead of Node 'crypto' module
function generateNonce(bytes = 16) {
  const arr = new Uint8Array(bytes);
  // globalThis.crypto is available in Next middleware (edge runtime)
  globalThis.crypto.getRandomValues(arr);
  // Convert to base64
  let binary = '';
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return Buffer.from(binary, 'binary').toString('base64');
}

// Middleware to inject a per-request nonce and CSP header.
export function middleware(req) {
  const nonce = generateNonce();

  // Clone the incoming request headers and add the nonce
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);

  // Create response with modified request headers
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set nonce in response header for consistency
  res.headers.set('x-nonce', nonce);

  const isDev = process.env.NODE_ENV !== 'production';

  // Build CSP directives
  const directives = [
    "default-src 'self'",
    "img-src 'self' https: data:",
    // Allow Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Production: use nonce, Development: allow inline + eval for fast refresh
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : `script-src 'self' 'nonce-${nonce}'`,
    // Development: allow WebSocket and localhost for HMR/SSE, Production: restrict to HTTPS API
    isDev
      ? "connect-src 'self' https://api.openai.com ws: wss: http://localhost:* ws://localhost:* wss://localhost:* http://127.0.0.1:* ws://127.0.0.1:* wss://127.0.0.1:*"
      : "connect-src 'self' https://api.openai.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "frame-ancestors 'none'"
  ];

  // Only add upgrade-insecure-requests in production
  if (!isDev) {
    directives.push('upgrade-insecure-requests');
  }

  const csp = directives.join('; ');
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-DNS-Prefetch-Control', 'off');

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
