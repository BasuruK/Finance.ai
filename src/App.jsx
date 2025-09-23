import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  memo,
  useMemo,
} from 'react';
import ShinyText from './TextAnimations/ShinyText/ShinyText';
import DarkVeil from './Backgrounds/DarkVeil/DarkVeil';
import PerformanceMonitor from './Components/PerformanceMonitor/PerformanceMonitor';
import PLSQLTestModal from './Components/PLSQLTestModal/PLSQLTestModal';

// Lazy-load the heavy MagicBento component
const MagicBento = lazy(() => import('./Components/MagicBento/MagicBento'));

// Extracted style constants (static objects reused across renders)
const SKELETON_CONTAINER_STYLE = Object.freeze({
  minHeight: 500,
  width: '100%',
  maxWidth: '54em',
  display: 'grid',
  gap: '0.5em',
  padding: '0.75em',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  opacity: 0.2,
});

const SKELETON_ITEM_BASE_STYLE = Object.freeze({
  aspectRatio: '4/3',
  minHeight: 200,
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.05)',
});

const TAGLINE_STYLE = Object.freeze({
  textAlign: 'center',
  marginTop: '2rem',
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto',
});

// Simple loading skeleton (memoized)
const BentoSkeleton = memo(() => {
  return (
    <div style={SKELETON_CONTAINER_STYLE}>
      {Array.from({ length: 6 }).map((_, i) => {
        const dynamicStyle = i === 2
          ? { gridColumn: 'span 2', gridRow: 'span 2' }
          : { gridColumn: 'span 1', gridRow: 'span 1' };
        return (
          <div
            key={i}
            style={{ ...SKELETON_ITEM_BASE_STYLE, ...dynamicStyle }}
          />
        );
      })}
    </div>
  );
});

// MagicBento component that loads seamlessly on page load
const LazyMagicBento = memo(({ toolsRef, onNavigateToPLSQL }) => {
  const [bentoLoaded, setBentoLoaded] = useState(false);

  // Start loading MagicBento after page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setBentoLoaded(true);
    }, 300); // 300ms delay for smooth page load
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="magic-bento" role="region" id="tools" ref={toolsRef}>
      <Suspense fallback={<BentoSkeleton />}>
        <div style={useMemo(() => ({
          opacity: bentoLoaded ? 1 : 0,
          transform: bentoLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        }), [bentoLoaded])}>
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={5}
            glowColor="132, 0, 255"
            onNavigateToPLSQL={onNavigateToPLSQL}
          />
        </div>
      </Suspense>
    </section>
  );
});

/**
 * Root application component for the Finance.ai page.
 *
 * Renders the full page UI (background veil, header, hero with title/tagline,
 * the lazily loaded MagicBento section, and a performance monitor). Manages
 * an internal flag to show the PLSQL test modal when requested.
 *
 * Side effects:
 * - Attempts to set history.scrollRestoration = 'manual' (safely ignored on error).
 * - Forces the window to scroll to the top on mount using two short timers and
 *   clears those timers on unmount.
 *
 * The component holds a ref for the tools section passed into LazyMagicBento and
 * provides an onNavigateToPLSQL callback that toggles the PLSQL modal.
 *
 * @returns {JSX.Element} The app's main React element tree.
 */
export default function App() {
  const toolsRef = useRef(null);
  const [showPLSQLPage, setShowPLSQLPage] = useState(false);

  // Always start at the top on reload/initial load
  useEffect(() => {
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch {
      // Silently handle scroll errors
    }
    // Scroll to top after mount; delay to override browser restore
    const t1 = setTimeout(
      () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }),
      0
    );
    const t2 = setTimeout(
      () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }),
      100
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <main className="app">
      {showPLSQLPage ? (
        <PLSQLTestModal onClose={() => setShowPLSQLPage(false)} />
      ) : (
        <>
          {/* DarkVeil Background - Full Coverage */}
          <div className="background-darkveil">
            <DarkVeil 
              hueShift={0}
              noiseIntensity={0.03}
              scanlineIntensity={0}
              speed={0.8}
              scanlineFrequency={0}
              warpAmount={2}
              resolutionScale={1.7}
            />
          </div>

      {/* Header with logo and pill menu */}
      <header className="site-header" role="banner">
        
        <div className="header-inner">
          <div className="header-left">
            <span className="logo-crop" aria-hidden="true">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/IFS_logo_2021.png/640px-IFS_logo_2021.png"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="page-title">Finance.ai</span>
          </div>
        </div>
      </header>

      <section className="hero" role="region">
        {/* Title and tagline centered */}
        <div className="hero-inner">
          <div className="hero-copy hero-centered">
            <div className="title-wrap" style={{ textAlign: 'center' }}>
              <div className="title-area">
                <div className="title-foreground">
                  <ShinyText
                    text="Finance.ai"
                    disabled={false}
                    speed={5}
                    className="custom-class"
                  />
                </div>
              </div>
              
              {/* Centered tagline */}
              <p className="tag" style={TAGLINE_STYLE}>
                Modern AI enabled services to make your Development Journey
                smoother.
              </p>
            </div>
          </div>
        </div>

        {/* Magic Bento section */}
        <LazyMagicBento toolsRef={toolsRef} onNavigateToPLSQL={() => setShowPLSQLPage(true)} />
      </section>
      {/* Performance Monitor - floating corner component */}
      <PerformanceMonitor />
        </>
      )}
    </main>
  );
}
