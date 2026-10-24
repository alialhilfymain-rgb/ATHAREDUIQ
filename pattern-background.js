/**
 * ATHAR Educational Platform - Signature Geometric Background Engine
 * Art Direction: "The impact expands"
 * 
 * Mathematical concentric arc tessellation (from the Athar logo):
 * - Tiled and rotated 90/180 degrees into a continuous modern-Islamic geometric field.
 * - Staggered slow wave cycles (12-20s) expanding from multiple centers.
 * - Proximity interaction: arcs near pointer/touch swell and glow gold.
 * - Click/tap interaction: emits expanding ripple wave across the field.
 * - Three strict modes: Navy (#10253D), Off-White (#F5F4F0), and Impact Teal (#3E8E87).
 * - High-performance Canvas 2D, pause off-screen, reduced motion compliance.
 */

class AtharPatternBackground {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    
    // Configurable options
    this.mode = options.mode || 'navy'; // 'navy' | 'offwhite' | 'teal'
    this.interactive = options.interactive !== false;
    this.animated = options.animated !== false;
    
    // Display scaling
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;
    
    // Tile sizing (calm, elegant, generous breathing room)
    this.baseTileSize = 135; // 135px desktop for calm institutional aesthetic
    this.tileSize = this.baseTileSize;
    this.arcCountsPerCorner = 3; // 3 concentric arcs per corner
    
    // Animation timing
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.elapsed = 0;
    this.animFrameId = null;
    this.isRunning = false;
    
    // Gentle ambient wave centers (slow 22-28s stately breathing cycles)
    this.waveCenters = [
      { xRatio: 0.15, yRatio: 0.25, period: 24000, maxRadius: 1800, phaseOffset: 0 },
      { xRatio: 0.85, yRatio: 0.70, period: 30000, maxRadius: 2100, phaseOffset: 0.5 }
    ];
    
    // Active interactive click ripples
    this.ripples = [];
    
    // Pointer state (soft ambient proximity aura)
    this.pointer = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      radius: 250,
      active: false,
      decayTimeout: null
    };
    
    // Reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Refined, low-fatigue institutional color palettes
    this.palettes = {
      navy: {
        bg: '#10253D',
        baseRgba: [215, 182, 120], // Gold #D7B678
        baseAlpha: 0.075,
        hoverAlpha: 0.26,
        waveAlpha: 0.14,
        lineWidthBase: 0.85,
        lineWidthMax: 1.35
      },
      offwhite: {
        bg: '#F5F4F0',
        baseRgba: [16, 37, 61], // Navy #10253D
        baseAlpha: 0.045,
        hoverAlpha: 0.15,
        waveAlpha: 0.085,
        lineWidthBase: 0.75,
        lineWidthMax: 1.2
      },
      teal: {
        bg: '#10253D',
        baseRgba: [62, 142, 135], // Impact Teal #3E8E87
        baseAlpha: 0.09,
        hoverAlpha: 0.28,
        waveAlpha: 0.16,
        lineWidthBase: 0.85,
        lineWidthMax: 1.35
      }
    };
    
    this.init();
  }
  
  init() {
    this.resize();
    this.bindEvents();
    
    if (this.prefersReducedMotion || !this.animated) {
      this.renderStatic();
    } else {
      this.start();
    }
  }
  
  resize() {
    const parent = this.canvas.parentElement;
    this.width = parent && parent.clientWidth > 0 ? parent.clientWidth : window.innerWidth;
    this.height = parent && parent.clientHeight > 0 ? Math.max(parent.clientHeight, window.innerHeight) : window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    // Mobile responsiveness: lower density by increasing tile size
    const isMobile = this.width < 768;
    this.tileSize = isMobile ? 140 : this.baseTileSize;
    
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    
    if (!this.isRunning) {
      this.renderFrame(performance.now());
    }
  }
  
  bindEvents() {
    // Window resize
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    // Visibility change (pause offscreen to save battery)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else if (!this.prefersReducedMotion && this.animated) {
        this.start();
      }
    });
    
    // Motion preference change listener
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion) {
        this.stop();
        this.renderStatic();
      } else if (this.animated) {
        this.start();
      }
    });
    
    // Pointer move (hover interaction)
    window.addEventListener('mousemove', (e) => {
      this.pointer.targetX = e.clientX;
      this.pointer.targetY = e.clientY;
      this.pointer.active = true;
      clearTimeout(this.pointer.decayTimeout);
      this.pointer.decayTimeout = setTimeout(() => {
        this.pointer.active = false;
      }, 3000);
    }, { passive: true });
    
    // Touch move (mobile interaction)
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        this.pointer.targetX = e.touches[0].clientX;
        this.pointer.targetY = e.touches[0].clientY;
        this.pointer.active = true;
        clearTimeout(this.pointer.decayTimeout);
        this.pointer.decayTimeout = setTimeout(() => {
          this.pointer.active = false;
        }, 2500);
      }
    }, { passive: true });
    
    // Click / Tap ripple emission
    window.addEventListener('pointerdown', (e) => {
      // Don't trigger if clicking interactive buttons or links directly
      const target = e.target;
      if (target && (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select') || target.closest('textarea'))) {
        return;
      }
      this.emitRipple(e.clientX, e.clientY);
    });
  }
  
  emitRipple(x, y) {
    if (!this.interactive) return;
    this.ripples.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: Math.max(this.width, this.height) * 0.75,
      speed: 260, // gentle, smooth expansion (px per second)
      birth: performance.now(),
      alpha: 0.45 // soft, non-intrusive ripple
    });
  }
  
  setMode(mode) {
    if (this.palettes[mode]) {
      this.mode = mode;
      if (!this.isRunning) {
        this.renderFrame(performance.now());
      }
    }
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    const loop = (now) => {
      if (!this.isRunning) return;
      this.renderFrame(now);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }
  
  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
  
  renderStatic() {
    this.stop();
    this.renderFrame(0);
  }
  
  renderFrame(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.elapsed = now - this.startTime;
    
    // Smooth pointer interpolation
    if (this.pointer.active) {
      this.pointer.x += (this.pointer.targetX - this.pointer.x) * 0.16;
      this.pointer.y += (this.pointer.targetY - this.pointer.y) * 0.16;
    } else {
      this.pointer.x += (-9999 - this.pointer.x) * 0.08;
      this.pointer.y += (-9999 - this.pointer.y) * 0.08;
    }
    
    // Update click ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += rip.speed * dt;
      rip.alpha = Math.max(0, 1 - rip.radius / rip.maxRadius);
      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
    
    // Current palette
    const p = this.palettes[this.mode] || this.palettes.navy;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Grid bounds calculation
    const S = this.tileSize;
    const cols = Math.ceil(this.width / S) + 2;
    const rows = Math.ceil(this.height / S) + 2;
    const offsetX = (this.width % S) / 2 - S;
    const offsetY = (this.height % S) / 2 - S;
    
    // Pre-calculate radii fractions (concentric arcs from corners)
    // 3 concentric arcs per corner at 0.25S, 0.50S, 0.75S
    const radii = [0.25 * S, 0.50 * S, 0.75 * S];
    
    // Render the modern Islamic concentric arc tessellation
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * S;
        const y = offsetY + r * S;
        const centerX = x + S / 2;
        const centerY = y + S / 2;
        
        // --- 1. PROXIMITY INTERACTION (POINTER SWELL & GLOW) ---
        let pointerFactor = 0;
        if (this.pointer.active && this.pointer.x > -500) {
          const dx = this.pointer.x - centerX;
          const dy = this.pointer.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.pointer.radius) {
            pointerFactor = 1 - dist / this.pointer.radius;
            // Smooth ease
            pointerFactor = pointerFactor * pointerFactor * (3 - 2 * pointerFactor);
          }
        }
        
        // --- 2. GENTLE AMBIENT BREATHING WAVE (Ultra-smooth 24-30s cycle) ---
        let waveFactor = 0;
        if (!this.prefersReducedMotion && this.animated) {
          for (let w = 0; w < this.waveCenters.length; w++) {
            const wc = this.waveCenters[w];
            const wX = this.width * wc.xRatio;
            const wY = this.height * wc.yRatio;
            const dCenter = Math.hypot(centerX - wX, centerY - wY);
            
            // Normalized cycle progress [0, 1]
            const progress = ((this.elapsed / wc.period + wc.phaseOffset) % 1);
            const currentRadius = progress * wc.maxRadius;
            
            // Distance from wavefront
            const distFromWave = Math.abs(dCenter - currentRadius);
            const waveWidth = 580; // wide, calm, non-distracting ambient band
            
            if (distFromWave < waveWidth) {
              // Smooth cosine ease: seamless bell curve with zero harsh borders
              const normDist = distFromWave / waveWidth;
              const localIntensity = 0.5 * (1 + Math.cos(normDist * Math.PI)) * (1 - progress * 0.35);
              if (localIntensity > waveFactor) {
                waveFactor = localIntensity;
              }
            }
          }
        }
        
        // --- 3. CLICK/TAP RIPPLE INTERACTION (Smooth, subtle) ---
        let rippleFactor = 0;
        for (let rip of this.ripples) {
          const dRip = Math.hypot(centerX - rip.x, centerY - rip.y);
          const distDiff = Math.abs(dRip - rip.radius);
          const ripBand = 140; // wider, softer ripple band
          if (distDiff < ripBand) {
            const normRip = distDiff / ripBand;
            const rf = 0.5 * (1 + Math.cos(normRip * Math.PI)) * rip.alpha;
            if (rf > rippleFactor) rippleFactor = rf;
          }
        }
        
        // Total dynamic intensity [0, 1] - balanced and gentle
        const totalIntensity = Math.min(1.0, pointerFactor * 0.85 + waveFactor * 0.55 + rippleFactor * 0.7);
        
        // Calculate dynamic stroke color and line width (strictly hairline)
        const alpha = p.baseAlpha + totalIntensity * (p.hoverAlpha - p.baseAlpha);
        const lineWidth = p.lineWidthBase + totalIntensity * (p.lineWidthMax - p.lineWidthBase);
        
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = `rgba(${p.baseRgba[0]}, ${p.baseRgba[1]}, ${p.baseRgba[2]}, ${alpha.toFixed(3)})`;
        
        // --- 4. TILE ORIENTATION SYSTEM (90 / 180 DEGREE ROTATIONS) ---
        // Curated symmetric modern Islamic girih tessellation:
        // Checkerboard rotation with 4-fold pinwheel groups generates
        // continuous closed rosettes and interlacing ribbon channels!
        const orientation = ((c % 2) ^ (r % 2)) === 0;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Draw the concentric arcs according to orientation
        if (orientation) {
          // Arcs centered at top-left (0,0) and bottom-right (S,S)
          for (let radius of radii) {
            // Arc 1: Top-Left corner
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI / 2, false);
            this.ctx.stroke();
            
            // Arc 2: Bottom-Right corner
            this.ctx.beginPath();
            this.ctx.arc(S, S, radius, Math.PI, Math.PI * 1.5, false);
            this.ctx.stroke();
          }
        } else {
          // Arcs centered at top-right (S,0) and bottom-left (0,S)
          for (let radius of radii) {
            // Arc 1: Top-Right corner
            this.ctx.beginPath();
            this.ctx.arc(S, 0, radius, Math.PI / 2, Math.PI, false);
            this.ctx.stroke();
            
            // Arc 2: Bottom-Left corner
            this.ctx.beginPath();
            this.ctx.arc(0, S, radius, Math.PI * 1.5, Math.PI * 2, false);
            this.ctx.stroke();
          }
        }
        
        // Subtle alignment accents at select intersections
        if ((c % 2 === 0) && (r % 2 === 0)) {
          const crossSize = 2;
          const crossAlpha = p.baseAlpha * 0.75;
          this.ctx.strokeStyle = `rgba(${p.baseRgba[0]}, ${p.baseRgba[1]}, ${p.baseRgba[2]}, ${crossAlpha.toFixed(3)})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.beginPath();
          this.ctx.moveTo(-crossSize, 0);
          this.ctx.lineTo(crossSize, 0);
          this.ctx.moveTo(0, -crossSize);
          this.ctx.lineTo(0, crossSize);
          this.ctx.stroke();
        }
        
        this.ctx.restore();
      }
    }
  }
}

// Export for global browser use
window.AtharPatternBackground = AtharPatternBackground;
