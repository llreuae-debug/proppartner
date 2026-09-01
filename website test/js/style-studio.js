/**
 * The Blade & Crown - Style Studio & Before/After Slider Engine
 */

import { BARBERSHOP_DATA } from './data.js';
import { soundscape } from './audio.js';

export function initStyleStudio() {
  const sliderContainer = document.querySelector('.before-after-container');
  const sliderHandle = document.querySelector('.ba-handle');
  const afterLayer = document.querySelector('.ba-after-layer');
  const sliderInput = document.querySelector('.ba-range-input');

  if (sliderContainer && sliderHandle && afterLayer && sliderInput) {
    let isDragging = false;

    const setPosition = (percent) => {
      percent = Math.max(0, Math.min(100, percent));
      afterLayer.style.width = `${percent}%`;
      sliderHandle.style.left = `${percent}%`;
      sliderInput.value = percent;
    };

    sliderInput.addEventListener('input', (e) => {
      setPosition(parseFloat(e.target.value));
    });

    const handlePointerMove = (clientX) => {
      const rect = sliderContainer.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = (x / rect.width) * 100;
      setPosition(percent);
    };

    sliderContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      handlePointerMove(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      handlePointerMove(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    sliderContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        isDragging = true;
        handlePointerMove(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      handlePointerMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // Hairstyle Cards / Tabs in Studio
  const styleButtons = document.querySelectorAll('.style-tab-btn');
  const styleDetailsContainer = document.querySelector('.style-details-card');

  if (styleButtons.length && styleDetailsContainer) {
    styleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        styleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        soundscape.playScissorSnip();
        const styleId = btn.dataset.styleId;
        const style = BARBERSHOP_DATA.styles.find(s => s.id === styleId);
        if (style) {
          renderStyleDetails(style, styleDetailsContainer);
        }
      });
    });

    // Initial render
    const initialStyle = BARBERSHOP_DATA.styles[0];
    if (initialStyle) {
      renderStyleDetails(initialStyle, styleDetailsContainer);
    }
  }
}

function renderStyleDetails(style, container) {
  container.classList.add('fade-out');

  setTimeout(() => {
    container.innerHTML = `
      <div class="style-preview-header">
        <span class="style-category-tag">${style.category}</span>
        <h3 class="style-name">${style.title}</h3>
        <p class="style-desc">${style.description}</p>
      </div>

      <div class="style-specs-grid">
        <div class="spec-card">
          <span class="spec-label">Time in Chair</span>
          <span class="spec-val"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${style.cutTime}</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">Maintenance Cycle</span>
          <span class="spec-val"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> ${style.maintenance}</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">Ideal Face Shape</span>
          <span class="spec-val"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><path d="M12 9v6M9 12h6"/></svg> ${style.bestFor}</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">Recommended Alchemy</span>
          <span class="spec-val"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> ${style.stylingProduct}</span>
        </div>
      </div>

      <div class="style-cta-action">
        <button class="btn-gold book-style-btn" data-style-name="${style.title}">
          <span>Book This Cut Now</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    `;

    container.classList.remove('fade-out');

    const bookBtn = container.querySelector('.book-style-btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        const event = new CustomEvent('open-booking-flow', {
          detail: { serviceCategory: 'haircraft', styleNote: style.title }
        });
        window.dispatchEvent(event);
      });
    }
  }, 200);
}
