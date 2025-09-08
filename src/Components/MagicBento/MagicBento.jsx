/*
	Installed from https://reactbits.dev/default/
*/

import { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const cardData = [
  {
    color: '#060010',
    title: 'ATW Logs Monitor',
    description: 'Track ATW logs',
    label: 'Logs',
    href: 'http://10.17.98.235:8501/',
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    color: '#060010',
    title: 'Dashboard',
    description: 'View TAR/SAR data',
    label: 'TAR/SAR',
    href: 'http://10.17.98.231:8501',
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="7" y1="9" x2="17" y2="9"/>
        <line x1="7" y1="15" x2="17" y2="15"/>
        <line x1="7" y1="12" x2="17" y2="12"/>
      </svg>
    ),
  },
  {
    color: '#060010',
    title: 'Unit Test Generation',
    description: 'Generate PLSQL Unit Tests',
    label: 'Unit Test',
    href: '/unit-tests',
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    color: '#060010',
    title: 'Documentation',
    description: 'API Documentation & Guides',
    label: 'Docs',
    href: 'https://ifsdev.atlassian.net/wiki/spaces/FINANCE/overview',
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    color: '#060010',
    title: 'Background Tracer',
    description: 'Tracing Application to PLSQL',
    label: 'Background Tracer',
    href: '/settings',
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    color: '#060010',
    title: 'Support',
    description: 'Get help and contact support',
    label: 'Support',
    href: 'mailto:support@finance-ai.com',
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
      </svg>
    ),
  },
];

// Helper to detect the Unit Test card (so we can open a modal instead of navigating)
const isUnitTestCard = (card) => {
  if (!card) return false;
  const title = (card.title || '').toLowerCase();
  const label = (card.label || '').toLowerCase();
  const href = (card.href || '').toLowerCase();
  return (
    title.includes('unit test') ||
    label.includes('unit test') ||
    href === '/unit-tests'
  );
};

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const handleCardNavigation = (card) => {
  if (!card.href) return;
  
  if (card.external) {
    // Handle external links (email, phone, external websites)
    if (card.href.startsWith('mailto:') || card.href.startsWith('tel:')) {
      window.location.href = card.href;
    } else {
      window.open(card.href, '_blank', 'noopener,noreferrer');
    }
  } else {
    // Handle internal navigation
    // For now, just log the navigation intent - you can replace this with your router
    // eslint-disable-next-line no-console
    console.log(`Navigating to: ${card.href}`);
    
    // Example navigation approaches you can use:
    // 1. React Router: navigate(card.href);
    // 2. Next.js: router.push(card.href);
    // 3. Browser history: window.history.pushState({}, '', card.href);
    
    // Temporary demo - you can remove this
    window.alert(`Would navigate to: ${card.href}\n\nReplace this with your preferred routing solution.`);
  }
};

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseMove = (e) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const handleClick = (e) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      {...restProps}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll('.card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
        cards.forEach((card) => {
          card.style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardElement = card;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(
          cardElement,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        );
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll('.card').forEach((card) => {
        card.style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid = ({ children, gridRef }) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const gridRef = useRef(null);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;
  const [isUnitTestOpen, setIsUnitTestOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isQueueCheckModalOpen, setIsQueueCheckModalOpen] = useState(false);
  const [queueToken, setQueueToken] = useState('');
  const [currentToken, setCurrentToken] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Ensure portals only render on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate a unique token for the request
  const generateToken = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `UT-${timestamp}-${random}`.toUpperCase();
  };

  // Reset queue state when modal closes
  const handleCloseModal = () => {
    setIsUnitTestOpen(false);
    setIsInQueue(false);
    setCurrentToken(null);
    setMessage('');
  };

  // Handle sending message to queue
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const token = generateToken();
    setCurrentToken(token);
    setIsInQueue(true);
    
    // Here you would typically send the message to your backend
    // For now, we'll just simulate queuing
    // console.log(`Message queued with token: ${token}`, { message, token });
    
    // Clear the message
    setMessage('');
  };

  // Keyboard handling when modal is open
  useEffect(() => {
    if (!isUnitTestOpen && !isModelSelectorOpen && !isChoiceModalOpen && !isQueueCheckModalOpen) return;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (isUnitTestOpen) handleCloseModal();
        if (isModelSelectorOpen) setIsModelSelectorOpen(false);
        if (isChoiceModalOpen) setIsChoiceModalOpen(false);
        if (isQueueCheckModalOpen) setIsQueueCheckModalOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [isUnitTestOpen, isModelSelectorOpen, isChoiceModalOpen, isQueueCheckModalOpen]);

  // Prevent background scroll and add blur when modal is open
  useEffect(() => {
    const appElement = document.querySelector('.app');
    
    if (isUnitTestOpen || isModelSelectorOpen || isChoiceModalOpen || isQueueCheckModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Add blur class to entire app
      if (appElement) {
        appElement.classList.add('modal-blur');
      }
      return () => {
        document.body.style.overflow = prev;
        // Remove blur class from entire app
        if (appElement) {
          appElement.classList.remove('modal-blur');
        }
      };
    } else {
      // Remove blur class when no modals are open
      const appElement = document.querySelector('.app');
      if (appElement) {
        appElement.classList.remove('modal-blur');
      }
    }
    return undefined;
  }, [isUnitTestOpen, isModelSelectorOpen, isChoiceModalOpen, isQueueCheckModalOpen]);

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {cardData.map((card, index) => {
          const baseClassName = `card ${textAutoHide ? 'card--text-autohide' : ''} ${enableBorderGlow ? 'card--border-glow' : ''}`;
          const cardProps = {
            className: baseClassName,
            style: {
              backgroundColor: card.color,
              '--glow-color': glowColor,
            },
          };

          if (enableStars) {
            return (
              <ParticleCard
                key={index}
                {...cardProps}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
                style={{
                  ...cardProps.style,
                  cursor: card.href ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (isUnitTestCard(card)) {
                    setIsModelSelectorOpen(true);
                  } else {
                    handleCardNavigation(card);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isUnitTestCard(card)) {
                      setIsModelSelectorOpen(true);
                    } else {
                      handleCardNavigation(card);
                    }
                  }
                }}
                aria-label={`${card.title} - ${card.description}`}
              >
                <div className="card__header">
                  <div className="card__label">{card.label}</div>
                  <div className="card__icon">
                    {card.icon}
                  </div>
                </div>
                <div className="card__content">
                  <h2 className="card__title">{card.title}</h2>
                  <p className="card__description">{card.description}</p>
                </div>
              </ParticleCard>
            );
          }

          return (
            <div
              key={index}
              {...cardProps}
              style={{
                ...cardProps.style,
                cursor: card.href ? 'pointer' : 'default',
              }}
              role="button"
              tabIndex={0}
              aria-label={`${card.title} - ${card.description}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (isUnitTestCard(card)) {
                    setIsUnitTestOpen(true);
                  } else {
                    handleCardNavigation(card);
                  }
                }
              }}
              ref={(el) => {
                if (!el) return;

                const handleMouseMove = (e) => {
                  if (shouldDisableAnimations) return;

                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;

                  if (enableTilt) {
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;
                    gsap.to(el, {
                      rotateX,
                      rotateY,
                      duration: 0.1,
                      ease: 'power2.out',
                      transformPerspective: 1000,
                    });
                  }

                  if (enableMagnetism) {
                    const magnetX = (x - centerX) * 0.05;
                    const magnetY = (y - centerY) * 0.05;
                    gsap.to(el, {
                      x: magnetX,
                      y: magnetY,
                      duration: 0.3,
                      ease: 'power2.out',
                    });
                  }
                };

                const handleMouseLeave = () => {
                  if (shouldDisableAnimations) return;

                  if (enableTilt) {
                    gsap.to(el, {
                      rotateX: 0,
                      rotateY: 0,
                      duration: 0.3,
                      ease: 'power2.out',
                    });
                  }

                  if (enableMagnetism) {
                    gsap.to(el, {
                      x: 0,
                      y: 0,
                      duration: 0.3,
                      ease: 'power2.out',
                    });
                  }
                };

                const handleClick = (e) => {
                  // Handle Unit Test modal or navigation first
                  if (isUnitTestCard(card)) {
                    setIsModelSelectorOpen(true);
                  } else {
                    handleCardNavigation(card);
                  }
                  
                  if (!clickEffect || shouldDisableAnimations) return;

                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                  );

                  const ripple = document.createElement('div');
                  ripple.style.cssText = `
                    position: absolute;
                    width: ${maxDistance * 2}px;
                    height: ${maxDistance * 2}px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                    left: ${x - maxDistance}px;
                    top: ${y - maxDistance}px;
                    pointer-events: none;
                    z-index: 1000;
                  `;

                  el.appendChild(ripple);

                  gsap.fromTo(
                    ripple,
                    {
                      scale: 0,
                      opacity: 1,
                    },
                    {
                      scale: 1,
                      opacity: 0,
                      duration: 0.8,
                      ease: 'power2.out',
                      onComplete: () => ripple.remove(),
                    }
                  );
                };

                el.addEventListener('mousemove', handleMouseMove);
                el.addEventListener('mouseleave', handleMouseLeave);
                el.addEventListener('click', handleClick);
              }}
            >
              <div className="card__header">
                <div className="card__label">{card.label}</div>
                <div className="card__icon">
                  {card.icon}
                </div>
              </div>
              <div className="card__content">
                <h2 className="card__title">{card.title}</h2>
                <p className="card__description">{card.description}</p>
              </div>
            </div>
          );
        })}
      </BentoCardGrid>

      {/* Model Selector Modal - Rendered outside app container using Portal */}
      {isClient && (isModelSelectorOpen || isUnitTestOpen) && createPortal(
        <>
          {/* Model Selector Modal */}
          <div
            className={`model-selector-backdrop ${isModelSelectorOpen ? 'open' : ''}`}
            aria-hidden={!isModelSelectorOpen}
            role="button"
            tabIndex={isModelSelectorOpen ? 0 : -1}
            onClick={() => setIsModelSelectorOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsModelSelectorOpen(false);
              }
            }}
          />
          <div
            className={`model-selector-modal ${isModelSelectorOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-selector-modal-title"
          >
            <button
              type="button"
              className="model-selector-close"
              aria-label="Close"
              onClick={() => setIsModelSelectorOpen(false)}
            >
              ×
            </button>
            <h3 id="model-selector-modal-title" className="model-selector-title">Choose Model</h3>
            <div className="model-selector-body">
              <div className="model-option-wrapper">
                <button
                  className="model-option openai-option"
                  onClick={() => {
                    setIsModelSelectorOpen(false);
                    window.location.href = '/openai-model'; // Placeholder link
                  }}
                >
                  <div className="model-option-content">
                    <h4>Use OpenAI Finetuned Model</h4>
                    <p>Fast Responses</p>
                  </div>
                </button>
              </div>
              <div className="model-option-wrapper">
                <button
                  className="model-option qwen-option"
                  onClick={() => {
                    setIsModelSelectorOpen(false);
                    setIsChoiceModalOpen(true);
                  }}
                >
                  <div className="model-option-content">
                    <h4>Use Inhouse Finetuned Qwen3 Model</h4>
                    <p>Slow but thinking model</p>
                    <div className="eco-indicator">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                        <line x1="16" y1="8" x2="2" y2="22" />
                        <line x1="17.5" y1="15" x2="9" y2="15" />
                      </svg>
                      <span><b>Saves CO₂</b></span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Unit Test Generation Modal */}
          <div
            className={`unit-test-backdrop ${isUnitTestOpen ? 'open' : ''}`}
            aria-hidden={!isUnitTestOpen}
            role="button"
            tabIndex={isUnitTestOpen ? 0 : -1}
            onClick={handleCloseModal}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCloseModal();
              }
            }}
          />
          <div
            ref={modalRef}
            className={`unit-test-modal ${isUnitTestOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unit-test-modal-title"
          >
            <button
              type="button"
              className="unit-test-close"
              aria-label="Close"
              onClick={handleCloseModal}
              ref={closeBtnRef}
            >
              ×
            </button>
            <h3 id="unit-test-modal-title" className="unit-test-title">Unit Test Generation</h3>
            <div className="unit-test-body">
              {isInQueue ? (
                <div className="queue-system">
                  <div className="queue-info">
                    <h4>Your request has been queued!</h4>
                    <p><strong>Token:</strong> {currentToken}</p>
                    <p>Use this token to check your results later.</p>
                    <p>The model runs on CPU, so responses may take time.</p>
                  </div>
                  <div className="waiting-person">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="person-icon"
                    >
                      <circle cx="12" cy="8" r="3" />
                      <path d="M12 14v7" />
                      <path d="M9 17h6" />
                      <path d="M9 21h6" />
                    </svg>
                  </div>
                  <div className="queue-status">
                    <p>Processing your request...</p>
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="queue-explanation">
                  <div className="explanation-content">
                    <h4>How it works:</h4>
                    <ul>
                      <li>Enter your unit test requirements below</li>
                      <li>Your request will be placed in a queue</li>
                      <li>You&apos;ll receive a unique token for tracking</li>
                      <li>The model runs on CPU, so responses are slower but more thoughtful</li>
                      <li>Use your token to view completed results</li>
                    </ul>
                  </div>
                  {/* Chat-like input bubble */}
                  <div className="chat-input-container">
                    <textarea
                      className="chat-input"
                      aria-label="Unit test requirements"
                      placeholder="Describe your unit test requirements..."
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="chat-send" 
                      aria-label="Send request"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M22 2L11 13" />
                        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Additional Modals */}
      {isClient && createPortal(
        <>
          {/* Choice Modal - Check Queue or Generate New Unit Test */}
          <div
            className={`choice-backdrop ${isChoiceModalOpen ? 'open' : ''}`}
            aria-hidden={!isChoiceModalOpen}
            role="button"
            tabIndex={isChoiceModalOpen ? 0 : -1}
            onClick={() => setIsChoiceModalOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsChoiceModalOpen(false);
              }
            }}
          />
          <div
            className={`choice-modal ${isChoiceModalOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="choice-modal-title"
          >
            <button
              type="button"
              className="choice-close"
              aria-label="Close"
              onClick={() => setIsChoiceModalOpen(false)}
            >
              ×
            </button>
            <h3 id="choice-modal-title" className="choice-title">What would you like to do?</h3>
            <div className="choice-body">
              <button
                className="choice-option check-queue-option"
                onClick={() => {
                  setIsChoiceModalOpen(false);
                  setIsQueueCheckModalOpen(true);
                }}
              >
                <div className="choice-option-content">
                  <h4>Check the Queue</h4>
                  <p>View status of your previous requests</p>
                </div>
              </button>
              <button
                className="choice-option generate-new-option"
                onClick={() => {
                  setIsChoiceModalOpen(false);
                  setIsUnitTestOpen(true);
                }}
              >
                <div className="choice-option-content">
                  <h4>Generate a New Unit Test</h4>
                  <p>Create a new unit test request</p>
                </div>
              </button>
            </div>
          </div>

          {/* Queue Check Modal */}
          <div
            className={`queue-check-backdrop ${isQueueCheckModalOpen ? 'open' : ''}`}
            aria-hidden={!isQueueCheckModalOpen}
            role="button"
            tabIndex={isQueueCheckModalOpen ? 0 : -1}
            onClick={() => setIsQueueCheckModalOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsQueueCheckModalOpen(false);
              }
            }}
          />
          <div
            className={`queue-check-modal ${isQueueCheckModalOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="queue-check-modal-title"
          >
            <button
              type="button"
              className="queue-check-close"
              aria-label="Close"
              onClick={() => setIsQueueCheckModalOpen(false)}
            >
              ×
            </button>
            <h3 id="queue-check-modal-title" className="queue-check-title">Check Queue Status</h3>
            <div className="queue-check-body">
              <div className="token-input-section">
                <label htmlFor="token-input">Enter your Token ID:</label>
                <input
                  id="token-input"
                  type="text"
                  className="token-input"
                  placeholder="e.g., UT-1234567890-ABC123"
                  value={queueToken}
                  onChange={(e) => setQueueToken(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="check-queue-btn"
                onClick={() => {
                  if (queueToken.trim()) {
                    // Here you would typically check the queue status
                    // console.log(`Checking status for token: ${queueToken}`);
                    // For now, we'll just show a placeholder message
                  }
                }}
                disabled={!queueToken.trim()}
              >
                Check Queue Status
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default MagicBento;
