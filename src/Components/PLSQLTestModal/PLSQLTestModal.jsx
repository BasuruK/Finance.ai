/**
 * PL/SQL Unit Test Generator Component
 * 
 * A comprehensive React component for generating PL/SQL unit tests using AI.
 * Features include:
 * - AI-powered test generation via OpenAI GPT-4o-mini
 * - Multi-theme support (light, dark, system)
 * - Saved tests history with ChatGPT-style interface
 * - Toast notification system with stacking support
 * - Progress tracking and token management
 * - Rainbow easter egg with confetti animation
 * - Comprehensive accessibility support
 * - Mobile-responsive design
 * 
 * @version 1.0.0
 * @author IFS Finance.ai Team
 */

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PLSQLTestGenerator from '../../services/plsqlTestGenerator';
import './PLSQLTestModal.css';

// SVG Icon Components
const CopyIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
  </svg>
);

const DownloadIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const HomeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const SavedIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
  </svg>
);

const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const CodeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
  </svg>
);

const MagicIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.5,5.6L5,7L6.4,4.5L5,2L7.5,3.4L10,2L8.6,4.5L10,7L7.5,5.6M19.5,15.4L22,14L20.6,16.5L22,19L19.5,17.6L17,19L18.4,16.5L17,14L19.5,15.4M22,2L20.6,4.5L22,7L19.5,5.6L17,7L18.4,4.5L17,2L19.5,3.4L22,2M13.34,12.78L15.78,10.34L13.66,8.22L11.22,10.66L13.34,12.78M14.37,7.29L16.71,9.63C17.1,10.02 17.1,10.65 16.71,11.04L5.04,22.71C4.65,23.1 4.02,23.1 3.63,22.71L1.29,20.37C0.9,19.98 0.9,19.35 1.29,18.96L12.96,7.29C13.35,6.9 13.98,6.9 14.37,7.29Z"/>
  </svg>
);

const WarningIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const TestIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2v2h1v16c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V4h1V2H7zm2 2h6v16H9V4zm1 2v12h4V6h-4z"/>
  </svg>
);

const SaveIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </svg>
);

const BranchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6,2A3,3 0 0,1 9,5C9,6.28 8.19,7.38 7.06,7.81C7.15,8.27 7.39,8.83 8,9.63C9,10.92 11,12.83 12,14.17C13,12.83 15,10.92 16,9.63C16.61,8.83 16.85,8.27 16.94,7.81C15.81,7.38 15,6.28 15,5A3,3 0 0,1 18,2A3,3 0 0,1 21,5C21,6.32 20.14,7.45 18.95,7.85C18.87,8.37 18.64,9.05 18,9.83C17,11.17 15,13.08 14,14.38C13.39,15.17 13.15,15.73 13.06,16.19C14.19,16.62 15,17.72 15,19A3,3 0 0,1 12,22A3,3 0 0,1 9,19C9,17.72 9.81,16.62 10.94,16.19C10.85,15.73 10.61,15.17 10,14.38C9,13.08 7,11.17 6,9.83C5.36,9.05 5.13,8.37 5.05,7.85C3.86,7.45 3,6.32 3,5A3,3 0 0,1 6,2M6,4A1,1 0 0,0 5,5A1,1 0 0,0 6,6A1,1 0 0,0 7,5A1,1 0 0,0 6,4M18,4A1,1 0 0,0 17,5A1,1 0 0,0 18,6A1,1 0 0,0 19,5A1,1 0 0,0 18,4M12,17A1,1 0 0,0 11,18A1,1 0 0,0 12,19A1,1 0 0,0 13,18A1,1 0 0,0 12,17Z"/>
  </svg>
);

const SunIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/>
  </svg>
);

const MoonIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z"/>
  </svg>
);

const ComputerIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H11V20H8V22H16V20H13V18H20Z"/>
  </svg>
);

const InfoIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
  </svg>
);

const ChevronLeftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
);

const ChevronRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
);

const FeedbackIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1-4.5h-2V6h2v5z"/>
  </svg>
);

/**
 * PL/SQL Unit Test Generator Modal Component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Callback function to close the modal
 * @returns {JSX.Element} The PL/SQL Test Generator modal component
 */
const PLSQLTestModal = ({ onClose }) => {
  const [inputCode, setInputCode] = useState('');
  const [generatedTests, setGeneratedTests] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [savedTests, setSavedTests] = useState(() => {
    // Load saved tests from localStorage
    const savedData = localStorage.getItem('plsql-test-saved');
    return savedData ? JSON.parse(savedData) : [];
  });
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Progress tracking state
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  
  // Toast notification state - supports up to 3 stacked toasts
  const [toasts, setToasts] = useState([]);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  
  const [theme, setTheme] = useState(() => {
    // Get saved theme or default to system preference
    const savedTheme = localStorage.getItem('plsql-theme');
    if (savedTheme) return savedTheme;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  // Easter egg state
  const [clickCount, setClickCount] = useState(0);
  const [isRainbowMode, setIsRainbowMode] = useState(false);
  const clickTimerRef = useRef(null);
  
  const modalRef = useRef(null);
  const testGenerator = useRef(new PLSQLTestGenerator());

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme'); // Use system preference
    }
    localStorage.setItem('plsql-theme', theme);
  }, [theme]);

  // Easter egg effect
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (isRainbowMode) {
      root.classList.add('rainbow-mode');
      body.style.overflow = 'hidden'; // Prevent scrolling and hide edges
      
      // Create confetti elements
      const createConfetti = () => {
        for (let i = 0; i < 100; i++) { // Doubled from 50 to 100
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = (Math.random() * 120 - 10) + '%'; // Spawn from -10% to 110%
          confetti.style.top = '-20px'; // Start above screen
          confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
          confetti.style.width = Math.random() * 8 + 4 + 'px';
          confetti.style.height = Math.random() * 8 + 4 + 'px';
          confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
          confetti.style.animationDelay = Math.random() * 2 + 's';
          confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
          confetti.style.position = 'fixed';
          confetti.style.pointerEvents = 'none';
          confetti.style.zIndex = '9997';
          
          document.body.appendChild(confetti);
          
          // Remove confetti after animation
          setTimeout(() => {
            if (confetti.parentNode) {
              confetti.parentNode.removeChild(confetti);
            }
          }, 5000);
        }
      };
      
      // Create initial confetti burst
      createConfetti();
      
      // Create more confetti every 500ms
      const confettiInterval = setInterval(createConfetti, 500);
      
      // Clean up interval when rainbow mode ends
      setTimeout(() => {
        clearInterval(confettiInterval);
        body.style.overflow = ''; // Restore scrolling
      }, 10000);
      
    } else {
      root.classList.remove('rainbow-mode');
      body.style.overflow = ''; // Restore scrolling
      
      // Remove any remaining confetti
      const confettiElements = document.querySelectorAll('.confetti');
      confettiElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }
    
    return () => {
      root.classList.remove('rainbow-mode');
      body.style.overflow = ''; // Restore scrolling
      // Clean up confetti on component unmount
      const confettiElements = document.querySelectorAll('.confetti');
      confettiElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [isRainbowMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      if (theme === 'system') {
        // Re-apply system preference
        const root = document.documentElement;
        root.removeAttribute('data-theme');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    // Easter egg logic
    setClickCount(prev => prev + 1);
    
    // Clear existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    // Set new timer to reset click count after 2 seconds
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
    
    // Activate rainbow mode if clicked 20+ times quickly
    if (clickCount >= 19) {
      setIsRainbowMode(true);
      setClickCount(0);
      
      // Disable rainbow mode after 10 seconds
      setTimeout(() => {
        setIsRainbowMode(false);
      }, 10000);
      
      return; // Don't change theme when activating rainbow mode
    }
    
    // Normal theme toggle logic
    const themes = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <SunIcon size={16} />;
      case 'dark': return <MoonIcon size={16} />;
      default: return <ComputerIcon size={16} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      default: return 'System';
    }
  };

  // Update character and line count
  useEffect(() => {
    const lines = inputCode.split('\n').length;
    setCharCount(inputCode.length);
    setLineCount(lines);
  }, [inputCode]);

  // Focus management
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Ctrl+Enter to generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating && inputCode.trim()) {
          handleGenerateTests();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, inputCode, onClose]);

  // Handle feedback toast when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && feedbackClicked) {
        // User has returned to the tab after clicking feedback
        showToastNotification('Thank you for your valuable feedback!', 'feedback');
        setFeedbackClicked(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [feedbackClicked]);

  const handleGenerateTests = async () => {
    setError('');
    setSuccess('');
    setGeneratedTests('');

    // Validate input
    const validation = testGenerator.current.validatePLSQLCode(inputCode);
    if (!validation.valid) {
      showToastNotification(validation.error, 'error');
      return;
    }

    setIsGenerating(true);
    setShowProgress(true);
    setProgress(0);
    setProgressStep('Preparing request...');
    
    const requestToken = testGenerator.current.generateToken();
    setToken(requestToken);

    try {
      // Progress updates during generation
      setProgress(15);
      setProgressStep('Validating PLSQL code...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(25);
      setProgressStep('Parsing code structure...');
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setProgress(35);
      setProgressStep('Sending to AI service...');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProgress(45);
      setProgressStep('Connecting to OpenAI...');
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setProgress(55);
      setProgressStep('Generating unit tests...');

      // Start intermediate progress updates during the API call (10 seconds total)
      const progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          const increment = Math.floor(Math.random() * 2) + 1; // 1-2% increments
          const newProgress = Math.min(prevProgress + increment, 78);
          if (newProgress >= 60 && newProgress < 65) {
            setProgressStep('Analyzing test scenarios...');
          } else if (newProgress >= 65 && newProgress < 70) {
            setProgressStep('Building test cases...');
          } else if (newProgress >= 70 && newProgress < 75) {
            setProgressStep('Optimizing test coverage...');
          } else if (newProgress >= 75) {
            setProgressStep('Finalizing tests...');
          }
          return newProgress;
        });
      }, 500); // Update every 500ms for 10 seconds

      const result = await testGenerator.current.generateTests(inputCode);

      // Clear the interval once API call is complete
      clearInterval(progressInterval);

      setProgress(85);
      setProgressStep('Processing results...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(95);
      setProgressStep('Formatting output...');
      
      await new Promise(resolve => setTimeout(resolve, 400));

      if (result.success) {
        setProgress(100);
        setProgressStep('Tests generated successfully!');
        setGeneratedTests(result.tests);
        showToastNotification('Tests generated successfully!', 'success');
        
        // Hide progress after a short delay
        setTimeout(() => {
          setShowProgress(false);
        }, 1500);
      } else {
        showToastNotification(result.error || 'Failed to generate tests', 'error');
        setShowProgress(false);
      }
    } catch (err) {
      showToastNotification(`Error generating tests: ${err.message}`, 'error');
      setShowProgress(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTests = async () => {
    try {
      await navigator.clipboard.writeText(generatedTests);
      showToastNotification('Tests copied to clipboard!', 'success');
    } catch (err) {
      showToastNotification('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownloadTests = () => {
    const blob = new Blob([generatedTests], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plsql_unit_tests_${token || 'generated'}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToastNotification('Tests downloaded successfully!', 'success');
  };

  const handleClearInput = () => {
    setInputCode('');
    setError('');
    setSuccess('');
  };

  const handleSaveTests = () => {
    if (!generatedTests || !inputCode) {
      showToastNotification('No tests to save', 'error');
      return;
    }

    const savedItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      inputCode: inputCode.trim(),
      generatedTests: generatedTests,
      preview: inputCode.substring(0, 100) + (inputCode.length > 100 ? '...' : ''),
      title: extractTitleFromCode(inputCode) || `Test ${new Date().toLocaleDateString()}`
    };

    const updatedSaved = [savedItem, ...savedTests].slice(0, 50); // Keep only last 50 items
    setSavedTests(updatedSaved);
    localStorage.setItem('plsql-test-saved', JSON.stringify(updatedSaved));
    showToastNotification('Tests saved locally in browser cache! Note: This is not permanently saved in the cloud.', 'success', 7000);
  };

  const extractTitleFromCode = (code) => {
    // Extract function/procedure name from PL/SQL code
    const lines = code.split('\n');
    for (const line of lines) {
      const trimmed = line.trim().toUpperCase();
      if (trimmed.startsWith('FUNCTION') || trimmed.startsWith('PROCEDURE')) {
        const match = trimmed.match(/(FUNCTION|PROCEDURE)\s+([A-Z_][A-Z0-9_]*)/);
        if (match) return match[2];
      }
      if (trimmed.startsWith('CREATE OR REPLACE')) {
        const match = trimmed.match(/CREATE\s+OR\s+REPLACE\s+(FUNCTION|PROCEDURE)\s+([A-Z_][A-Z0-9_]*)/);
        if (match) return match[2];
      }
    }
    return null;
  };

  const loadFromSaved = (item) => {
    setInputCode(item.inputCode);
    setGeneratedTests(item.generatedTests);
    setError('');
    showToastNotification('Loaded from saved tests!', 'success');
  };

  const deleteFromSaved = (itemId) => {
    const confirmDelete = window.confirm('Do you want to delete this saved test? This action cannot be undone.');
    if (confirmDelete) {
      const updatedSaved = savedTests.filter(item => item.id !== itemId);
      setSavedTests(updatedSaved);
      localStorage.setItem('plsql-test-saved', JSON.stringify(updatedSaved));
      showToastNotification('Item deleted from saved tests!', 'success');
    }
  };

  const clearSaved = () => {
    setSavedTests([]);
    localStorage.removeItem('plsql-test-saved');
    showToastNotification('Saved tests cleared!', 'success');
  };

  const copyFromSaved = async (item) => {
    try {
      await navigator.clipboard.writeText(item.generatedTests);
      showToastNotification('Unit tests copied to clipboard!', 'success');
    } catch (err) {
      showToastNotification('Failed to copy tests to clipboard', 'error');
    }
  };

  const filteredSaved = savedTests.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.inputCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyCodeToClipboard = async (code, codeId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(codeId);
      setTimeout(() => setCopiedCodeId(null), 2000);
      showToastNotification('Code copied to clipboard!', 'success');
    } catch (err) {
      showToastNotification('Failed to copy code to clipboard', 'error');
    }
  };

  // Unified toast notification function - supports up to 3 stacked toasts
  const showToastNotification = (message, type = 'feedback', duration = 10000) => {
    const newToast = {
      id: Date.now() + Math.random(), // Unique ID
      message,
      type,
      timestamp: Date.now()
    };
    
    setToasts(prevToasts => {
      // Add new toast at the end and keep only the last 3
      const updatedToasts = [...prevToasts, newToast].slice(-3);
      
      // Auto-remove this specific toast after duration
      setTimeout(() => {
        setToasts(currentToasts => 
          currentToasts.filter(toast => toast.id !== newToast.id)
        );
      }, duration);
      
      return updatedToasts;
    });
  };

  const handleFeedback = () => {
    // Track that feedback button was clicked
    setFeedbackClicked(true);
    // Open feedback form in a new window/tab
    window.open('https://forms.office.com/e/nGfSmSkLmy', '_blank');
  };

  return (
    <div 
      className="plsql-app-container"
      ref={modalRef}
      tabIndex={-1}
      role="main"
      aria-labelledby="plsql-app-title"
    >
      {/* Toast Notifications Stack */}
      <div className="plsql-toast-container">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className={`plsql-toast plsql-toast-${toast.type}`}
          >
            <div className="plsql-toast-content">
              <span className="plsql-toast-message">{toast.message}</span>
              <button 
                className="plsql-toast-close"
                onClick={() => setToasts(prevToasts => prevToasts.filter(t => t.id !== toast.id))}
                aria-label="Close notification"
              >
                <CloseIcon size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
        {/* Header with IFS Branding */}
        <header className="plsql-app-header">
          <div className="plsql-header-content">
            <div className="plsql-logo-section">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/59/IFS_logo_2021.png" 
                alt="IFS Logo" 
                className="plsql-ifs-logo"
              />
              <div className="plsql-app-title">
                <h1 id="plsql-app-title">PLSQL Unit Test Generator</h1>
                <p className="plsql-app-subtitle">Powered by AI • ChatGPT Enterprise</p>
              </div>
            </div>
            <div className="plsql-header-actions">
              <button 
                className="plsql-theme-btn" 
                onClick={toggleTheme}
                title={`Switch to ${getThemeLabel()} theme`}
              >
                {getThemeIcon()}
              </button>
              <button 
                className="plsql-settings-btn" 
                onClick={onClose}
                title="Back to Home"
              >
                <HomeIcon size={16} /> Home
              </button>
            </div>
          </div>
        </header>

        <main className="plsql-main-content">
          {/* Saved Tests Sidebar Backdrop */}
          {isSavedOpen && (
            <div 
              className="plsql-history-backdrop"
              onClick={() => setIsSavedOpen(false)}
            />
          )}
          
          {/* Saved Tests Sidebar */}
          <div className={`plsql-history-sidebar ${isSavedOpen ? 'open' : ''}`}>
            <div className="plsql-history-header">
              <h3><SavedIcon size={16} /> Saved Tests</h3>
              <div className="plsql-history-actions">
                <button 
                  className="plsql-btn-icon"
                  onClick={() => setIsSavedOpen(!isSavedOpen)}
                  title="Toggle Saved Tests"
                >
                  {isSavedOpen ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
                </button>
              </div>
            </div>
            
            {isSavedOpen && (
              <>
                <div className="plsql-history-search">
                  <div className="plsql-search-box">
                    <SearchIcon size={16} />
                    <input
                      type="text"
                      placeholder="Search saved tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="plsql-search-input"
                    />
                    {searchQuery && (
                      <button 
                        className="plsql-search-clear"
                        onClick={() => setSearchQuery('')}
                      >
                        <CloseIcon size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="plsql-history-info-banner">
                  <InfoIcon size={14} />
                  <span>Data stored in browser cache - not permanent</span>
                </div>

                <div className="plsql-history-content">
                  {filteredSaved.length === 0 ? (
                    <div className="plsql-history-empty">
                      {searchQuery ? 'No matching tests found' : 'No saved tests yet'}
                    </div>
                  ) : (
                    <>
                      <div className="plsql-history-controls">
                        <span className="plsql-history-count">
                          {filteredSaved.length} test{filteredSaved.length !== 1 ? 's' : ''}
                        </span>
                        {savedTests.length > 0 && (
                          <button 
                            className="plsql-btn-danger-small"
                            onClick={clearSaved}
                            title="Clear all saved tests"
                          >
                            <TrashIcon size={14} />
                          </button>
                        )}
                      </div>
                      
                      <div className="plsql-history-list">
                        {filteredSaved.map((item) => (
                          <div key={item.id} className="plsql-history-item">
                            <div className="plsql-history-item-header">
                              <h4 className="plsql-history-item-title" title={item.title}>
                                {item.title}
                              </h4>
                              <div className="plsql-history-item-actions">
                                <button 
                                  className="plsql-btn-icon plsql-btn-copy"
                                  onClick={() => copyFromSaved(item)}
                                  title="Copy unit tests"
                                >
                                  <CopyIcon size={14} />
                                </button>
                                <button 
                                  className="plsql-btn-icon"
                                  onClick={() => loadFromSaved(item)}
                                  title="Load this test"
                                >
                                  <DownloadIcon size={14} />
                                </button>
                                <button 
                                  className="plsql-btn-icon plsql-btn-danger"
                                  onClick={() => deleteFromSaved(item.id)}
                                  title="Delete this test"
                                >
                                  <TrashIcon size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="plsql-history-item-preview" title={item.preview}>
                              {item.preview}
                            </div>
                            <div className="plsql-history-item-date">
                              {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="plsql-container">
            {/* Input Section */}
            <div className="plsql-input-section">
              <div className="plsql-section-header">
                <h2><CodeIcon size={18} /> Your PLSQL Code</h2>
                <div className="plsql-input-actions">
                  <button 
                    className="plsql-btn-secondary" 
                    onClick={handleClearInput}
                    disabled={isGenerating}
                    title="Clear input"
                  >
                    <TrashIcon size={14} /> Clear
                  </button>
                </div>
              </div>
              
              <div className="plsql-input-container">
                <label htmlFor="plsql-code" className="plsql-sr-only">PLSQL Code Input</label>
                <textarea 
                  id="plsql-code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Paste your PLSQL code here... (Ctrl+Enter to generate)"
                  aria-label="Enter your PLSQL code here"
                  rows="12"
                  spellCheck="false"
                  disabled={isGenerating}
                  className="plsql-textarea"
                />
                <div className="plsql-input-stats">
                  <span>{charCount} characters</span>
                  <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
                </div>
              </div>
              
              <button 
                onClick={handleGenerateTests}
                disabled={isGenerating || !inputCode.trim()}
                type="button"
                className="plsql-btn-primary plsql-generate-btn"
                aria-describedby="generate-help"
              >
                <MagicIcon size={18} />
                <span className="plsql-btn-text">
                  {isGenerating ? 'Generating Tests...' : 'Generate Unit Tests'}
                </span>
              </button>
              <div id="generate-help" className="plsql-sr-only">
                Click to generate unit tests for your PLSQL code
              </div>
              
              {/* Progress Loader */}
              {showProgress && (
                <div className={`plsql-progress-container ${showProgress ? 'show' : ''}`}>
                  <div className="plsql-progress-header">
                    <span className="plsql-progress-label">Generating Unit Tests</span>
                    <span className="plsql-progress-percentage">{progress}%</span>
                  </div>
                  <div className="plsql-progress-bar">
                    <div 
                      className="plsql-progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="plsql-progress-steps">
                    <div className="plsql-progress-step">
                      <div className="plsql-progress-step-icon"></div>
                      <span>{progressStep}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="plsql-results-section">
              <div className="plsql-section-header">
                <h2><TestIcon size={18} /> Generated Unit Tests</h2>
                {generatedTests && (
                  <div className="plsql-result-actions">
                    <button 
                      className="plsql-btn-secondary" 
                      onClick={handleSaveTests}
                      title="Save to local browser history (not cloud storage)"
                    >
                      <SaveIcon size={14} /> Save
                    </button>
                    <button 
                      className="plsql-btn-secondary" 
                      onClick={handleCopyTests}
                      title="Copy to clipboard"
                    >
                      <CopyIcon size={14} /> Copy
                    </button>
                    <button 
                      className="plsql-btn-secondary" 
                      onClick={handleDownloadTests}
                      title="Download as file"
                    >
                      <DownloadIcon size={14} /> Download
                    </button>
                  </div>
                )}
              </div>
              
              <div className="plsql-result-container" role="region" aria-label="Generated test results">
                {generatedTests ? (
                  <div className="plsql-result-markdown">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({node, inline, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : 'sql';
                          const codeString = String(children).replace(/\n$/, '');
                          const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                          
                          // Only use syntax highlighter and copy button for multi-line code blocks (triple backticks)
                          // Check if this is a code block (not inline) and has significant content
                          const isCodeBlock = !inline && (codeString.includes('\n') || codeString.length > 50 || className);
                          
                          if (isCodeBlock) {
                            return (
                              <div className="plsql-code-block-container">
                                <div className="plsql-code-header">
                                  <span className="plsql-code-language">
                                    {language.toUpperCase()}
                                  </span>
                                  <button
                                    className={`plsql-copy-btn ${copiedCodeId === codeId ? 'copied' : ''}`}
                                    onClick={() => copyCodeToClipboard(codeString, codeId)}
                                    title="Copy code"
                                  >
                                    {copiedCodeId === codeId ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                                    {copiedCodeId === codeId ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  language={language === 'plsql' || language === 'sql' ? 'sql' : language}
                                  style={vscDarkPlus}
                                  customStyle={{
                                    margin: 0,
                                    borderRadius: '0 0 8px 8px',
                                    fontSize: '0.9rem'
                                  }}
                                  {...props}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            );
                          } else {
                            // For inline code or short code snippets, use simple inline formatting
                            return (
                              <code className="plsql-inline-code" {...props}>
                                {children}
                              </code>
                            );
                          }
                        },
                        h1: ({children}) => <h1 className="plsql-md-h1">{children}</h1>,
                        h2: ({children}) => <h2 className="plsql-md-h2">{children}</h2>,
                        h3: ({children}) => <h3 className="plsql-md-h3">{children}</h3>,
                        p: ({children}) => <p className="plsql-md-p">{children}</p>,
                        ul: ({children}) => <ul className="plsql-md-ul">{children}</ul>,
                        ol: ({children}) => <ol className="plsql-md-ol">{children}</ol>,
                        li: ({children}) => <li className="plsql-md-li">{children}</li>,
                        blockquote: ({children}) => <blockquote className="plsql-md-blockquote">{children}</blockquote>,
                        table: ({children}) => <table className="plsql-md-table">{children}</table>,
                        thead: ({children}) => <thead className="plsql-md-thead">{children}</thead>,
                        tbody: ({children}) => <tbody className="plsql-md-tbody">{children}</tbody>,
                        tr: ({children}) => <tr className="plsql-md-tr">{children}</tr>,
                        th: ({children}) => <th className="plsql-md-th">{children}</th>,
                        td: ({children}) => <td className="plsql-md-td">{children}</td>,
                      }}
                    >
                      {generatedTests}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="plsql-empty-state">
                    <BranchIcon size={16} />
                    <h3>Ready to Generate Tests</h3>
                    <p>Enter your PLSQL code above and click "Generate Unit Tests" to get started.</p>
                  </div>
                )}
                
                {/* Request Token after all content */}
                {generatedTests && token && (
                  <div className="plsql-test-token">
                    <span>Request ID: {token}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Floating Saved Tests Toggle Button */}
          <button 
            className={`plsql-floating-history-btn ${isSavedOpen ? 'open' : ''}`}
            onClick={() => setIsSavedOpen(!isSavedOpen)}
            title="Open Saved Tests"
          >
            <SavedIcon size={18} />
            <span className="plsql-floating-btn-text">
              Saved ({savedTests.length})
            </span>
          </button>

          {/* Floating Feedback Button */}
          <button 
            className="plsql-floating-feedback-btn"
            onClick={handleFeedback}
            title="Send Feedback"
          >
            <FeedbackIcon size={18} />
            <span className="plsql-floating-btn-text">
              Feedback
            </span>
          </button>

          {/* AI Disclaimer Footer */}
          <div className="plsql-disclaimer-footer">
            <p><WarningIcon size={14} /> AIs can make mistakes. Please review generated code before use.</p>
          </div>
        </main>

        {/* R&D Finance Footer */}
        <div className="plsql-rnd-footer">
          <p>Implemented by R&D Finance</p>
        </div>
      </div>
  );
};

export default PLSQLTestModal;
