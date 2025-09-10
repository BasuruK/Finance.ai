import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './UnitTestModals.css';

const UnitTestModals = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  
  // Modal states
  const [isUnitTestOpen, setIsUnitTestOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isQueueCheckModalOpen, setIsQueueCheckModalOpen] = useState(false);
  const [queueToken, setQueueToken] = useState('');
  const [currentToken, setCurrentToken] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [queueNumber, setQueueNumber] = useState(null);

  // Ensure portals only render on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Open the modal sequence when triggered from parent
  useEffect(() => {
    if (isOpen) {
      setIsModelSelectorOpen(true);
    }
  }, [isOpen]);

  // Generate a unique token for the request
  const generateToken = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `UT-${timestamp}-${random}`.toUpperCase();
  };

  // Generate a random queue number (simulating queue position)
  const generateQueueNumber = () => {
    // More realistic queue simulation based on time of day
    const hour = new Date().getHours();
    let baseRange = 5;
    
    // Peak hours have more people in queue
    if (hour >= 9 && hour <= 17) {
      baseRange = 15; // Business hours
    } else if (hour >= 18 && hour <= 22) {
      baseRange = 10; // Evening
    }
    
    // Generate a random number between 1 and baseRange
    return Math.floor(Math.random() * baseRange) + 1;
  };

  // Reset queue state when modal closes
  const handleCloseModal = () => {
    setIsUnitTestOpen(false);
    setIsInQueue(false);
    setCurrentToken(null);
    setMessage('');
    setQueueNumber(null);
  };

  // Handle closing all modals and notifying parent
  const handleCloseAll = () => {
    setIsModelSelectorOpen(false);
    setIsUnitTestOpen(false);
    setIsChoiceModalOpen(false);
    setIsQueueCheckModalOpen(false);
    setIsInQueue(false);
    setCurrentToken(null);
    setMessage('');
    setQueueToken('');
    setQueueNumber(null);
    onClose();
  };

  // Handle closing individual modals
  const handleCloseChoiceModal = () => {
    setIsChoiceModalOpen(false);
  };

  const handleCloseQueueCheckModal = () => {
    setIsQueueCheckModalOpen(false);
  };

  // Watch for all modals being closed and notify parent
  useEffect(() => {
    // Only notify parent if we were open and now all modals are closed
    if (isOpen && !isUnitTestOpen && !isModelSelectorOpen && !isChoiceModalOpen && !isQueueCheckModalOpen) {
      onClose();
    }
  }, [isUnitTestOpen, isModelSelectorOpen, isChoiceModalOpen, isQueueCheckModalOpen, isOpen, onClose]);

  // Handle sending message to queue
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const token = generateToken();
    const queuePos = generateQueueNumber();
    setCurrentToken(token);
    setQueueNumber(queuePos);
    setIsInQueue(true);
    
    // Here you would typically send the message to your backend
    // For now, we'll just simulate queuing
    // console.log(`Message queued with token: ${token}, queue position: ${queuePos}`, { message, token, queueNumber: queuePos });
    
    // Clear the message
    setMessage('');
  };

  // Keyboard handling when modal is open
  useEffect(() => {
    if (!isUnitTestOpen && !isModelSelectorOpen && !isChoiceModalOpen && !isQueueCheckModalOpen) return;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (isUnitTestOpen) handleCloseModal();
        if (isModelSelectorOpen) handleCloseAll();
        if (isChoiceModalOpen) handleCloseChoiceModal();
        if (isQueueCheckModalOpen) handleCloseQueueCheckModal();
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

  // Don't render anything if not open or not on client
  if (!isClient || (!isModelSelectorOpen && !isUnitTestOpen && !isChoiceModalOpen && !isQueueCheckModalOpen)) {
    return null;
  }

  return createPortal(
    <>
      {/* Model Selector Modal */}
      <div
        className={`model-selector-backdrop ${isModelSelectorOpen ? 'open' : ''}`}
        aria-hidden={!isModelSelectorOpen}
        role="button"
        tabIndex={isModelSelectorOpen ? 0 : -1}
        onClick={handleCloseAll}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCloseAll();
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
          onClick={handleCloseAll}
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
                <div className="queue-position-badge">
                  <span className="queue-position-label">Queue Position</span>
                  <span className="queue-position-number">#{queueNumber}</span>
                </div>
                <p><strong>Token:</strong> {currentToken}</p>
                <p>Use this token to check your results later.</p>
                <p>The model runs on CPU, so responses may take time.</p>
              </div>
              <div className="queue-status">
                <p>Processing queue position #{queueNumber}...</p>
                <p className="queue-estimate">Estimated wait time: {queueNumber * 2 - 3 > 0 ? queueNumber * 2 - 3 : 1}-{queueNumber * 2} minutes</p>
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

      {/* Choice Modal - Check Queue or Generate New Unit Test */}
      <div
        className={`choice-backdrop ${isChoiceModalOpen ? 'open' : ''}`}
        aria-hidden={!isChoiceModalOpen}
        role="button"
        tabIndex={isChoiceModalOpen ? 0 : -1}
        onClick={handleCloseChoiceModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCloseChoiceModal();
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
          onClick={handleCloseChoiceModal}
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
        onClick={handleCloseQueueCheckModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCloseQueueCheckModal();
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
          onClick={handleCloseQueueCheckModal}
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
  );
};

export default UnitTestModals;
