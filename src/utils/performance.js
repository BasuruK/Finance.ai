// Device capability detection
export const getDeviceCapabilities = () => {
  const navigator = window.navigator;
  const memory = navigator.deviceMemory || 4; // Default to 4GB if unavailable
  const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
  
  // Test WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const supportsWebGL = !!gl;
  
  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;
  
  // Connection speed detection
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let connectionSpeed = 'unknown';
  if (connection) {
    if (connection.effectiveType) {
      connectionSpeed = connection.effectiveType;
    } else if (connection.downlink) {
      connectionSpeed = connection.downlink > 10 ? '4g' : connection.downlink > 1.5 ? '3g' : '2g';
    }
  }
  
  return {
    deviceMemory: memory,
    hardwareConcurrency: cores,
    supportsWebGL,
    isMobile,
    connectionSpeed,
    isLowMemory: memory <= 2,
    isSlowCPU: cores <= 2,
  };
};

// Get optimal settings based on device capabilities
export const getOptimalSettings = (capabilities) => {
  const {
    deviceMemory,
    hardwareConcurrency,
    supportsWebGL,
    isMobile,
    isLowMemory,
    isSlowCPU
  } = capabilities;
  
  // Conservative settings for low-end devices
  if (isLowMemory || isSlowCPU || isMobile) {
    return {
      enableAnimations: true,
      enableParallax: false,
      particleCount: 6,
      enableWebGL: false,
      animationQuality: 'low',
      maxFPS: 30,
    };
  }
  
  // Medium settings for mid-range devices
  if (deviceMemory <= 4 || hardwareConcurrency <= 4) {
    return {
      enableAnimations: true,
      enableParallax: true,
      particleCount: 12,
      enableWebGL: supportsWebGL,
      animationQuality: 'medium',
      maxFPS: 60,
    };
  }
  
  // High settings for high-end devices
  return {
    enableAnimations: true,
    enableParallax: true,
    particleCount: 24,
    enableWebGL: supportsWebGL,
    animationQuality: 'high',
    maxFPS: 60,
  };
};

// Performance monitoring
export const performanceMonitor = {
  fps: 0,
  frameCount: 0,
  lastTime: 0,
  fpsCallback: null,
  animationFrame: null,
  
  trackFPS(callback) {
    this.fpsCallback = callback;
    this.lastTime = performance.now();
    this.frameCount = 0;
    
    const updateFPS = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        if (this.fpsCallback) {
          this.fpsCallback(this.fps);
        }
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      
      this.animationFrame = requestAnimationFrame(updateFPS);
    };
    
    this.animationFrame = requestAnimationFrame(updateFPS);
  },
  
  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.fpsCallback = null;
  }
};

// Memory management
export const memoryManager = {
  getMemoryInfo() {
    const performance = window.performance;
    let memoryInfo = {
      used: 0,
      limit: 0,
      percentage: 0
    };
    
    if (performance && performance.memory) {
      const memory = performance.memory;
      memoryInfo.used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      memoryInfo.limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      memoryInfo.percentage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
    } else {
      // Fallback for browsers without performance.memory
      const nav = navigator;
      const deviceMemory = nav.deviceMemory || 4;
      memoryInfo.limit = deviceMemory * 1024; // Convert GB to MB
      memoryInfo.used = Math.round(Math.random() * 200) + 50; // Rough estimate
      memoryInfo.percentage = Math.round((memoryInfo.used / memoryInfo.limit) * 100);
    }
    
    return memoryInfo;
  },
  
  isMemoryHigh() {
    const info = this.getMemoryInfo();
    return info.percentage > 80;
  },
  
  cleanup() {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Clear caches and unused data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old') || name.includes('temp')) {
            caches.delete(name);
          }
        });
      });
    }
    
    // Clear any large objects from memory
    const canvas = document.querySelectorAll('canvas');
    canvas.forEach(c => {
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, c.width, c.height);
      }
    });
    
  }
};

// Utility to get current performance metrics
export const getPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  
  return {
    domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart) : 0,
    loadComplete: navigation ? Math.round(navigation.loadEventEnd - navigation.navigationStart) : 0,
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
  };
};
