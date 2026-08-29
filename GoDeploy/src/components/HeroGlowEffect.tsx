import React, { useEffect, useRef } from 'react';

/**
 * Premium interactive cinematic mouse-following glow / energy field for the Hero section.
 * - Subtle lime glow (#84cc16 / rgba(132, 204, 22, 0.14))
 * - Subtle magenta secondary glow (#d946ef / rgba(217, 70, 239, 0.09))
 * - Smooth lerp interpolation with requestAnimationFrame
 * - Ambient floating drift when idle
 * - Subtle parallax depth
 * - GPU accelerated, mobile optimized & respects prefers-reduced-motion
 */
export const HeroGlowEffect: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse coordinates (normalized 0 to 1, default centered)
    const mouse = {
      targetX: width * 0.5,
      targetY: height * 0.4,
      currentX: width * 0.5,
      currentY: height * 0.4,
      isMoving: false,
      lastMoveTime: performance.now(),
    };

    // Secondary magenta orb coordinates with different inertia
    const secondary = {
      currentX: width * 0.5,
      currentY: height * 0.4,
    };

    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          if (cr.width > 0 && cr.height > 0) {
            width = canvas.width = cr.width;
            height = canvas.height = cr.height;
          }
        }
      });
      resizeObserver.observe(container);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if within or near bounds
      if (x >= -50 && x <= rect.width + 50 && y >= -50 && y <= rect.height + 50) {
        mouse.targetX = Math.max(0, Math.min(rect.width, x));
        mouse.targetY = Math.max(0, Math.min(rect.height, y));
        mouse.isMoving = true;
        mouse.lastMoveTime = performance.now();
      }
    };

    const handleMouseLeave = () => {
      mouse.targetX = width * 0.5;
      mouse.targetY = height * 0.45;
      mouse.isMoving = false;
    };

    const parentHero = container.closest('.hero') || container.parentElement;
    if (parentHero) {
      parentHero.addEventListener('mousemove', handleMouseMove as EventListener, { passive: true });
      parentHero.addEventListener('mouseleave', handleMouseLeave as EventListener, { passive: true });
    } else {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Main render loop
    let startTime = performance.now();

    const render = (currentTime: number) => {
      const elapsed = (currentTime - startTime) * 0.001; // seconds
      const idleTime = (currentTime - mouse.lastMoveTime) * 0.001;

      // Ambient drift when mouse hasn't moved
      const ambientFactor = Math.min(1, Math.max(0, (idleTime - 1.0) / 2.0));
      const ambientX = Math.sin(elapsed * 0.6) * (width * 0.18) * (prefersReducedMotion ? 0 : 1);
      const ambientY = Math.cos(elapsed * 0.8) * (height * 0.15) * (prefersReducedMotion ? 0 : 1);

      const targetWithAmbientX = mouse.targetX + ambientX * ambientFactor;
      const targetWithAmbientY = mouse.targetY + ambientY * ambientFactor;

      // Smooth lerp for primary glow (lime)
      const lerpSpeed1 = prefersReducedMotion ? 1 : 0.055;
      mouse.currentX += (targetWithAmbientX - mouse.currentX) * lerpSpeed1;
      mouse.currentY += (targetWithAmbientY - mouse.currentY) * lerpSpeed1;

      // Smooth lag / parallax for secondary glow (magenta)
      const secondaryTargetX = targetWithAmbientX + Math.sin(elapsed * 1.1) * (width * 0.12) * ambientFactor;
      const secondaryTargetY = targetWithAmbientY + Math.cos(elapsed * 0.9) * (height * 0.1) * ambientFactor;
      const lerpSpeed2 = prefersReducedMotion ? 1 : 0.035;
      secondary.currentX += (secondaryTargetX - secondary.currentX) * lerpSpeed2;
      secondary.currentY += (secondaryTargetY - secondary.currentY) * lerpSpeed2;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Secondary Magenta Subtle Glow (Deeper parallax layer)
      const magentaRadius = Math.max(width, height) * 0.45;
      const magentaGradient = ctx.createRadialGradient(
        secondary.currentX,
        secondary.currentY,
        0,
        secondary.currentX,
        secondary.currentY,
        magentaRadius
      );
      magentaGradient.addColorStop(0, 'rgba(217, 70, 239, 0.08)');
      magentaGradient.addColorStop(0.4, 'rgba(192, 132, 252, 0.04)');
      magentaGradient.addColorStop(1, 'rgba(217, 70, 239, 0)');

      ctx.fillStyle = magentaGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Primary Lime Glow (Interactive kinetic energy field)
      const limeRadius = Math.max(width, height) * 0.38;
      const limeGradient = ctx.createRadialGradient(
        mouse.currentX,
        mouse.currentY,
        0,
        mouse.currentX,
        mouse.currentY,
        limeRadius
      );
      limeGradient.addColorStop(0, 'rgba(163, 230, 53, 0.12)'); // Lime-400 subtle glow
      limeGradient.addColorStop(0.35, 'rgba(132, 204, 22, 0.06)');
      limeGradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.03)'); // subtle blend into indigo theme
      limeGradient.addColorStop(1, 'rgba(163, 230, 53, 0)');

      ctx.fillStyle = limeGradient;
      ctx.fillRect(0, 0, width, height);

      // 3. Subtle center core energy pulse
      const pulseRadius = Math.max(width, height) * 0.16;
      const pulseGlow = Math.sin(elapsed * 2.0) * 0.02 + 0.06;
      const coreGradient = ctx.createRadialGradient(
        mouse.currentX,
        mouse.currentY,
        0,
        mouse.currentX,
        mouse.currentY,
        pulseRadius
      );
      coreGradient.addColorStop(0, `rgba(217, 249, 157, ${pulseGlow})`);
      coreGradient.addColorStop(1, 'rgba(217, 249, 157, 0)');

      ctx.fillStyle = coreGradient;
      ctx.fillRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      if (parentHero) {
        parentHero.removeEventListener('mousemove', handleMouseMove as EventListener);
        parentHero.removeEventListener('mouseleave', handleMouseLeave as EventListener);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle Noise / Film Grain texture overlay that sits between glow and content */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
