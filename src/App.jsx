import React, { useMemo } from 'react'
import LetterGlitch from './Backgrounds/LetterGlitch/LetterGlitch';
import ShinyText from './TextAnimations/ShinyText/ShinyText';
import MagicBento from './Components/MagicBento/MagicBento';
import Threads from './Backgrounds/Threads/Threads';

  

function SplitText({ text, className = '' }) {
  const chars = useMemo(() => Array.from(text), [text])
  return (
    <span className={`split-text ${className}`} aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className="char"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  )
}


export default function App() {
  return (
    <main className="app">
      {/* Edge-blur + vignette overlay to keep focus centered */}
      <div className="focus-frame" aria-hidden />
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
          <nav aria-label="Primary" className="header-right">
            
            <div className="menu-pill" role="navigation">
              <a href="#" className="pill-item is-active"><span className="dot" /> Home</a>
              <a href="#" className="pill-item">Tools</a>
            </div>
          </nav>
        </div>
      </header>
      <section className="hero" role="region">
        {/* Title row */}
        <div className="hero-inner">
          <div className="hero-copy hero-centered">
            <div className="title-wrap" style={{ textAlign: 'center' }}>
              <div className="title-area">
                <div className="title-foreground">
                  <ShinyText text="Finance.ai" disabled={false} speed={5} className='custom-class' />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-bleed Threads band below the title; scrolls with page */}
        <div className="hero-threads" aria-hidden="true">
          <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
        </div>

        {/* Copy + glitch row */}
        <div className="hero-inner">
          <div className="hero-copy hero-centered">
            <div className="hero-row">
              <p className="tag">
                Modern AI enabled services to make your Development Journey smoother.
              </p>
              <div className="glitch-box" aria-hidden>
                <LetterGlitch glitchSpeed={50} centerVignette={false} outerVignette={false} smooth={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Magic Bento section */}
        <section className="magic-bento" role="region">
          <MagicBento textAutoHide={true} enableStars={true} enableSpotlight={true} enableBorderGlow={true}
                      enableTilt={true} enableMagnetism={true} clickEffect={true} spotlightRadius={300} particleCount={12}
                      glowColor="132, 0, 255" />
        </section>
  </section>
    </main>
    
  )
}
