/**
 * The Blade & Crown - Custom Cursor & Particle Snip FX
 */

import { soundscape } from './audio.js';

export function initCustomCursor() {
  // Only enable on fine pointer devices (desktop/mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cursorContainer = document.createElement('div');
  cursorContainer.className = 'custom-cursor-container';
  cursorContainer.innerHTML = `
    <div class="cursor-dot"></div>
    <div class="cursor-shears">
      <svg class="shear-blade blade-left" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="6" cy="18" r="3"/>
        <path d="M8.5 15.5L20 4"/>
      </svg>
      <svg class="shear-blade blade-right" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="18" cy="18" r="3"/>
        <path d="M15.5 15.5L4 4"/>
      </svg>
    </div>
  `;
  document.body.appendChild(cursorContainer);

  const dot = cursorContainer.querySelector('.cursor-dot');
  const shears = cursorContainer.querySelector('.cursor-shears');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let shearsX = mouseX;
  let shearsY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  // Smooth lerp for outer shears
  function render() {
    shearsX += (mouseX - shearsX) * 0.22;
    shearsY += (mouseY - shearsY) * 0.22;
    shears.style.transform = `translate3d(${shearsX}px, ${shearsY}px, 0)`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Snip on click
  window.addEventListener('mousedown', (e) => {
    cursorContainer.classList.add('snip');
    spawnSnipParticles(e.clientX, e.clientY);
    soundscape.playScissorSnip();
  });

  window.addEventListener('mouseup', () => {
    cursorContainer.classList.remove('snip');
  });

  // Hover states on interactables
  const updateInteractiveHover = () => {
    const interactables = document.querySelectorAll('button, a, input, select, textarea, .interactive-card, .service-card, .barber-card, .style-card, .before-after-wrapper');
    interactables.forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "true";

      el.addEventListener('mouseenter', () => {
        cursorContainer.classList.add('hovering');
        soundscape.playHoverBlade();
      });
      el.addEventListener('mouseleave', () => {
        cursorContainer.classList.remove('hovering');
      });
    });
  };

  updateInteractiveHover();
  const observer = new MutationObserver(updateInteractiveHover);
  observer.observe(document.body, { childList: true, subtree: true });
}

function spawnSnipParticles(x, y) {
  const count = 7;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    particle.className = 'snip-particle';
    const angle = Math.random() * Math.PI * 2;
    const distance = 25 + Math.random() * 45;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const rot = Math.random() * 360;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--rot', `${rot}deg`);

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 700);
  }
}
