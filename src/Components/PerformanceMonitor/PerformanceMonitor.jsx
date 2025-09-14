import { useState, useEffect } from 'react';
import { getDeviceCapabilities, getOptimalSettings, performanceMonitor, memoryManager } from '../../utils/performance';

const PerformanceMonitor = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [settings, setSettings] = useState(null);
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [fps, setFps] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Check if performance monitor should be disabled
  const isProductionEnvironment = () => {
    // Check if NEXT_PUBLIC_APP_IN_PRODUCTION is set to true in Azure
    if (process.env.NEXT_PUBLIC_APP_IN_PRODUCTION === 'true') {
      return true;
    }
    
    return false;
  };

  // Early return if performance monitor should be disabled
  if (isProductionEnvironment()) {
    return null;
  }

  useEffect(() => {
    // Get device capabilities and optimal settings
    const capabilities = getDeviceCapabilities();
    const optimalSettings = getOptimalSettings(capabilities);
    
    setDeviceInfo(capabilities);
    setSettings(optimalSettings);

    // Monitor memory usage
    const updateMemoryInfo = () => {
      const info = memoryManager.getMemoryInfo();
      setMemoryInfo(info);
    };

    updateMemoryInfo();
    const memoryInterval = setInterval(updateMemoryInfo, 5000);

    // Monitor FPS
    performanceMonitor.trackFPS((currentFps) => {
      setFps(currentFps);
    });

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const cleanupMemory = () => {
    memoryManager.cleanup();
    // Force update memory info
    setTimeout(() => {
      const info = memoryManager.getMemoryInfo();
      setMemoryInfo(info);
    }, 1000);
  };

  if (!deviceInfo || !settings) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleVisibility}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '8px',
          background: 'rgba(132,0,255,0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
        title="Toggle Performance Monitor"
      >
        📊
      </button>

      {/* Performance panel */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: '50px',
            right: '10px',
            width: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid rgba(132,0,255,0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            fontSize: '12px',
            zIndex: 9998,
            fontFamily: 'monospace',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#8400ff' }}>Performance Monitor</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>FPS:</strong> {fps}
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(fps / 60 * 100, 100)}%`,
                  height: '100%',
                  background: fps >= 50 ? '#00ff00' : fps >= 30 ? '#ffff00' : '#ff0000',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {memoryInfo && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Memory Usage:</strong> {memoryInfo.used}MB / {memoryInfo.limit}MB
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(memoryInfo.used / memoryInfo.limit) * 100}%`,
                    height: '100%',
                    background: memoryInfo.used / memoryInfo.limit > 0.8 ? '#ff0000' : 
                              memoryInfo.used / memoryInfo.limit > 0.6 ? '#ffff00' : '#00ff00',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <strong>Device Info:</strong>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              • Memory: {deviceInfo.deviceMemory}GB {deviceInfo.isLowMemory && '(Low)'}
              <br />
              • CPU Cores: {deviceInfo.hardwareConcurrency} {deviceInfo.isSlowCPU && '(Slow)'}
              <br />
              • WebGL: {deviceInfo.supportsWebGL ? '✓' : '✗'}
              <br />
              • Mobile: {deviceInfo.isMobile ? '✓' : '✗'}
              <br />
              • Connection: {deviceInfo.connectionSpeed}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Optimizations Applied:</strong>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              • Animations: {settings.enableAnimations ? '✓' : '✗'}
              <br />
              • Parallax: {settings.enableParallax ? '✓' : '✗'}
              <br />
              • Particles: {settings.particleCount}
              <br />
              • WebGL: {settings.enableWebGL ? '✓' : '✗'}
              <br />
              • Quality: {settings.animationQuality}
            </div>
          </div>

          <button
            onClick={cleanupMemory}
            style={{
              width: '100%',
              padding: '6px',
              background: 'rgba(132,0,255,0.6)',
              color: 'white',
              border: '1px solid rgba(132,0,255,0.8)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            🧹 Clean Memory
          </button>

          {memoryManager.isMemoryHigh() && (
            <div
              style={{
                marginTop: '8px',
                padding: '6px',
                background: 'rgba(255,0,0,0.2)',
                border: '1px solid rgba(255,0,0,0.4)',
                borderRadius: '4px',
                color: '#ffaaaa',
                fontSize: '11px',
              }}
            >
              ⚠️ High memory usage detected!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;
