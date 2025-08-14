import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  useCallback,
  memo,
} from 'react';
import ShinyText from './TextAnimations/ShinyText/ShinyText';
import DarkVeil from './Backgrounds/DarkVeil/DarkVeil';
import PerformanceMonitor from './Components/PerformanceMonitor/PerformanceMonitor';

// Lazy-load the heavy MagicBento component
const MagicBento = lazy(() => import('./Components/MagicBento/MagicBento'));

// Simple loading skeleton
const BentoSkeleton = memo(() => (
  <div
    style={{
      minHeight: 500,
      width: '100%',
      maxWidth: '54em',
      display: 'grid',
      gap: '0.5em',
      padding: '0.75em',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      opacity: 0.2,
    }}
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        style={{
          aspectRatio: '4/3',
          minHeight: 200,
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          gridColumn: i === 2 ? 'span 2' : 'span 1',
          gridRow: i === 2 ? 'span 2' : 'span 1',
        }}
      />
    ))}
  </div>
));

// MagicBento component that loads seamlessly on page load
const LazyMagicBento = memo(({ toolsRef }) => {
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
        <div
          style={{
            opacity: bentoLoaded ? 1 : 0,
            transform: bentoLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255"
          />
        </div>
      </Suspense>
    </section>
  );
});

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const toolsRef = useRef(null);
  const navRef = useRef(null);

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

  const handleHome = useCallback((e) => {
    e.preventDefault();
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navRef.current?.focus({ preventScroll: true });
  }, []);

  const handleTools = useCallback((e) => {
    e.preventDefault();
    setActiveTab('tools');
    // Smooth scroll and programmatic focus for accessibility
    toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <main className="app">
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
          <nav aria-label="Primary" className="header-right" ref={navRef}>
            <div className="menu-pill">
              <button
                onClick={handleHome}
                className={`pill-item ${activeTab === 'home' ? 'is-active' : ''}`}
                aria-current={activeTab === 'home' ? 'page' : undefined}
              >
                {activeTab === 'home' && <span className="dot" />} Home
              </button>
              <button
                onClick={handleTools}
                className={`pill-item ${activeTab === 'tools' ? 'is-active' : ''}`}
                aria-current={activeTab === 'tools' ? 'page' : undefined}
              >
                {activeTab === 'tools' && <span className="dot" />} Tools
              </button>
            </div>
          </nav>
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
              <p className="tag" style={{ 
                textAlign: 'center', 
                marginTop: '2rem', 
                maxWidth: '600px', 
                marginLeft: 'auto', 
                marginRight: 'auto' 
              }}>
                Modern AI enabled services to make your Development Journey
                smoother.
              </p>
            </div>
          </div>
        </div>

        {/* Magic Bento section */}
        <LazyMagicBento toolsRef={toolsRef} />
      </section>

      {/* Performance Monitor - floating corner component */}
      <PerformanceMonitor />
    </main>
  );
}
