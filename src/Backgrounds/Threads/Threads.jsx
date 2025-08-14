/*
	Installed from https://reactbits.dev/default/
	Optimized for performance with adaptive quality settings
*/

import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import { getDeviceCapabilities, getOptimalSettings } from '../../utils/performance';

import './Threads.css';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// High quality fragment shader for powerful devices
const fragmentShaderHigh = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

// Medium quality fragment shader
const fragmentShaderMedium = `
precision mediump float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 25;
const float u_line_width = 8.0;
const float u_line_blur = 8.0;

float simpleNoise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_point = 0.1 + perc * 0.3;
    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float finalAmplitude = amplitude_normal * 0.4 * amplitude * (1.0 + (mouse.y - 0.5) * 0.15);
    
    float time_scaled = time * 0.08 + (mouse.x - 0.5) * 0.8;
    float xnoise = simpleNoise(vec2(time_scaled + st.x + perc, time_scaled * 0.5)) * 2.0 - 1.0;
    
    float y = 0.5 + (perc - 0.5) * distance + xnoise * 0.3 * finalAmplitude;
    
    float line_start = smoothstep(y + width * 0.5, y, st.y);
    float line_end = smoothstep(y, y - width * 0.5, st.y);
    
    return clamp((line_start - line_end) * (1.0 - perc * 0.8), 0.0, 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p * 0.5),
            p,
            PI * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }
    
    float colorVal = 1.0 - line_strength;
    gl_FragColor = vec4(uColor * colorVal, colorVal);
}
`;

// Low quality fragment shader for weak devices
const fragmentShaderLow = `
precision lowp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

const int u_line_count = 15;
const float u_line_width = 10.0;

float simpleWave(vec2 st, float perc, float time, float amplitude, float distance) {
    float wave = sin((st.x + time * 0.5 + perc * 3.14159) * 4.0) * amplitude * 0.3;
    float y = 0.5 + (perc - 0.5) * distance + wave;
    
    float line = 1.0 - smoothstep(0.0, u_line_width * 0.01, abs(st.y - y));
    return line * (1.0 - perc * 0.6);
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float result = 0.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        result += simpleWave(uv, p, iTime, uAmplitude, uDistance);
    }
    
    result = clamp(result, 0.0, 1.0);
    gl_FragColor = vec4(uColor * result, result);
}
`;
const Threads = ({
  color = [3, 1, 10],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  ...rest
}) => {
  const containerRef = useRef(null);
  const animationFrameId = useRef();
  const lastFrameTime = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const [performanceSettings, setPerformanceSettings] = useState(null);

  // Intersection Observer for visibility detection
  const observerRef = useRef();

  useEffect(() => {
    // Get device capabilities and performance settings
    const capabilities = getDeviceCapabilities();
    const settings = getOptimalSettings(capabilities);
    setPerformanceSettings(settings);

    // Set up intersection observer for visibility detection
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Start rendering before fully visible
      }
    );

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Choose shader based on performance settings
  const getFragmentShader = useCallback(() => {
    if (!performanceSettings) return fragmentShaderHigh;
    
    switch (performanceSettings.animationQuality) {
      case 'low':
        return fragmentShaderLow;
      case 'medium':
        return fragmentShaderMedium;
      case 'high':
      default:
        return fragmentShaderHigh;
    }
  }, [performanceSettings]);

  useEffect(() => {
    if (!containerRef.current || !performanceSettings || !isVisible) return;
    
    // Don't initialize if animations are disabled
    if (!performanceSettings.enableAnimations) {
      return;
    }

    const container = containerRef.current;
    const fragmentShader = getFragmentShader();

    const renderer = new Renderer({ 
      alpha: true,
      antialias: performanceSettings.animationQuality === 'high',
      powerPreference: performanceSettings.animationQuality === 'low' ? 'low-power' : 'high-performance'
    });
    
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Set canvas size based on device pixel ratio and performance settings
    const pixelRatio = performanceSettings.animationQuality === 'low' ? 1 : 
                      Math.min(window.devicePixelRatio || 1, 2);
    
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      renderer.dpr = pixelRatio;
      program.uniforms.iResolution.value.r = clientWidth * pixelRatio;
      program.uniforms.iResolution.value.g = clientHeight * pixelRatio;
      program.uniforms.iResolution.value.b = (clientWidth * pixelRatio) / (clientHeight * pixelRatio);
    }
    
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e) {
      if (!enableMouseInteraction) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouse = [x, y];
    }
    
    function handleMouseLeave() {
      if (!enableMouseInteraction) return;
      targetMouse = [0.5, 0.5];
    }
    
    if (enableMouseInteraction) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    // Frame rate limiting based on device capabilities
    const targetFPS = performanceSettings.maxFPS || 60;
    const frameInterval = 1000 / targetFPS;

    function update(currentTime) {
      const deltaTime = currentTime - lastFrameTime.current;
      
      // Skip frames if we're running too fast
      if (deltaTime < frameInterval) {
        animationFrameId.current = requestAnimationFrame(update);
        return;
      }

      lastFrameTime.current = currentTime;

      // Update mouse position with smoother interpolation for low-end devices
      if (enableMouseInteraction) {
        const smoothing = performanceSettings.animationQuality === 'low' ? 0.08 : 0.05;
        currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      // Slower time progression for low-end devices
      const timeScale = performanceSettings.animationQuality === 'low' ? 0.0005 : 0.001;
      program.uniforms.iTime.value = currentTime * timeScale;

      renderer.render({ scene: mesh });
      animationFrameId.current = requestAnimationFrame(update);
    }
    
    animationFrameId.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      resizeObserver.disconnect();
      
      if (enableMouseInteraction && container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      if (container && container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      
      // Properly dispose of WebGL context
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
      
      // Clean up program and geometry
      if (program) {
        program.gl = null;
      }
      if (geometry) {
        geometry.gl = null;
      }
    };
  }, [color, amplitude, distance, enableMouseInteraction, performanceSettings, isVisible, getFragmentShader]);

  // Don't render anything if animations are disabled
  if (performanceSettings && !performanceSettings.enableAnimations) {
    return (
      <div 
        ref={containerRef} 
        className="threads-container threads-disabled" 
        {...rest}
        style={{
          background: `linear-gradient(90deg, rgba(${color.join(',')}, 0.1), rgba(${color.join(',')}, 0.05))`,
          ...rest.style
        }}
      />
    );
  }

  return <div ref={containerRef} className="threads-container" {...rest} />;
};

export default Threads;
