/**
 * FlyingScissor - Master Application Orchestrator
 * The Best Hair Cutting Saloon in Faisalabad
 */

import { BARBERSHOP_DATA } from './data.js';
import { soundscape } from './audio.js';
import { initCustomCursor } from './cursor.js';
import { initStyleStudio } from './style-studio.js';
import { BookingWizard } from './booking-wizard.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Custom Cursor & FX
  initCustomCursor();

  // 2. Initialize Soundscape & Audio Controls
  initAudioControls();

  // 3. Initialize Hairstyle Studio & Before/After Slider
  initStyleStudio();

  // 4. Initialize Multi-Step VIP Booking Engine
  const bookingWizard = new BookingWizard();

  // 5. Render Dynamic Content (Services, Barbers, Apothecary Products, Reviews)
  renderServicesGrid();
  renderBarbersGrid();
  renderApothecaryGrid();
  renderReviewsSlider();
  renderAmenities();

  // 6. Interactive 3D Tilt FX on Cards
  initCard3DTilt();

  // 7. Scroll Reveal & Navbar State
  initScrollEffects();

  // 8. Live Status Indicator & Operating Clock
  initLiveStatusBadge();

  // 9. Mobile Navigation Toggle
  initMobileNav();
});

/**
 * Navbar Audio Controls & Soundscape Equalizer
 */
function initAudioControls() {
  const muteBtn = document.getElementById('btnToggleAudio');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      soundscape.toggleSound(muteBtn);
    });
  }
}

/**
 * Render Interactive Services Menu with Category Filtering
 */
function renderServicesGrid() {
  const container = document.getElementById('servicesMenuGrid');
  const filterBtns = document.querySelectorAll('.service-filter-btn');
  if (!container) return;

  function render(category = 'all') {
    const filtered = category === 'all' 
      ? BARBERSHOP_DATA.services 
      : BARBERSHOP_DATA.services.filter(s => s.category === category || (category === 'haircraft' && s.category === 'haircraft'));

    container.innerHTML = filtered.map(s => `
      <div class="service-card interactive-tilt" data-service-id="${s.id}" data-category="${s.category}">
        <div class="service-top">
          <span class="service-badge-pill">${s.badge}</span>
          <div class="service-price-tag">
            <span class="currency">Rs. </span><span class="amount">${s.price.toLocaleString()}</span>
          </div>
        </div>
        <h3 class="service-name">${s.title}</h3>
        <p class="service-text">${s.description}</p>
        <div class="service-footer">
          <div class="service-time-est">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${s.duration}</span>
          </div>
          <button class="btn-book-service open-booking-modal" data-service-id="${s.id}">
            <span>Book Chair</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Rebind booking clicks for newly rendered cards
    container.querySelectorAll('.open-booking-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const sId = btn.dataset.serviceId;
        window.dispatchEvent(new CustomEvent('open-booking-flow', { detail: { serviceId: sId } }));
      });
    });
  }

  render('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      soundscape.playScissorSnip();
      render(btn.dataset.filter);
    });
  });
}

/**
 * Render Master Barbers Roster
 */
function renderBarbersGrid() {
  const container = document.getElementById('barbersRosterGrid');
  if (!container) return;

  container.innerHTML = BARBERSHOP_DATA.barbers.map(barber => `
    <div class="barber-card interactive-tilt" data-barber-id="${barber.id}">
      <div class="barber-img-box">
        <img src="${barber.image}" alt="${barber.name}" class="barber-portrait" loading="lazy">
        <div class="barber-overlay-gradient"></div>
        <div class="barber-rating-badge">
          <span>★</span> ${barber.rating} <span class="exp-tag">(${barber.experience})</span>
        </div>
      </div>
      <div class="barber-content">
        <span class="barber-tagline">${barber.title}</span>
        <h3 class="barber-fullname">${barber.name}</h3>
        <p class="barber-bio-p">${barber.bio}</p>
        <blockquote class="barber-quote">"${barber.quote}"</blockquote>
        
        <div class="barber-tags">
          ${barber.tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}
        </div>

        <div class="barber-card-action">
          <button class="btn-gold-outline open-booking-modal" data-barber-id="${barber.id}">
            <span>Book with ${barber.name.split(' ')[0]}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.open-booking-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const bId = btn.dataset.barberId;
      window.dispatchEvent(new CustomEvent('open-booking-flow', { detail: { barberId: bId } }));
    });
  });
}

/**
 * Render Apothecary Grooming Store
 */
function renderApothecaryGrid() {
  const container = document.getElementById('apothecaryGrid');
  if (!container) return;

  container.innerHTML = BARBERSHOP_DATA.products.map(prod => `
    <div class="product-card interactive-tilt" data-product-id="${prod.id}">
      <div class="product-img-box">
        <img src="${prod.image}" alt="${prod.name}" class="product-img" loading="lazy">
        <span class="product-badge">${prod.badge}</span>
      </div>
      <div class="product-info">
        <div class="prod-top">
          <span class="prod-rating">★ ${prod.rating}</span>
          <span class="prod-size">${prod.size}</span>
        </div>
        <h4 class="product-title">${prod.name}</h4>
        <p class="product-sub">${prod.subtitle}</p>
        <p class="product-desc">${prod.desc}</p>
        <div class="product-buy-bar">
          <div class="prod-price">Rs. ${prod.price.toLocaleString()}</div>
          <button class="btn-add-cart" data-product-name="${prod.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Add to Salon Order</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      soundscape.playScissorSnip();
      showToast(`Added ${btn.dataset.productName} to your order!`);
    });
  });
}

/**
 * Render Amenities Showcase
 */
function renderAmenities() {
  const container = document.getElementById('loungeAmenitiesGrid');
  if (!container) return;

  const icons = {
    glass: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 22h8M12 15v7M19 3H5l2 8a5 5 0 0 0 10 0l2-8z"/></svg>`,
    armchair: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3M3 11v5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zM6 19v2M18 19v2"/></svg>`,
    music: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13M9 9l12-2M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>`,
    shield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  };

  container.innerHTML = BARBERSHOP_DATA.amenities.map(a => `
    <div class="amenity-card">
      <div class="amenity-icon-box">${icons[a.icon] || icons.shield}</div>
      <h4 class="amenity-title">${a.title}</h4>
      <p class="amenity-desc">${a.desc}</p>
    </div>
  `).join('');
}

/**
 * Render Reviews Wall
 */
function renderReviewsSlider() {
  const container = document.getElementById('reviewsMasonryGrid');
  if (!container) return;

  container.innerHTML = BARBERSHOP_DATA.reviews.map(r => `
    <div class="review-card">
      <div class="review-top">
        <div class="client-avatar-badge">${r.avatar}</div>
        <div class="client-meta">
          <h4 class="client-name">${r.author}</h4>
          <span class="client-role">${r.role}</span>
        </div>
        <div class="review-stars">★★★★★</div>
      </div>
      <p class="review-quote">"${r.text}"</p>
      <div class="review-bottom">
        <span class="review-service-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${r.service}</span>
        <span class="review-time">${r.date}</span>
      </div>
    </div>
  `).join('');
}

/**
 * 3D Interactive Card Tilt Effect
 */
function initCard3DTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const tiltCards = document.querySelectorAll('.interactive-tilt');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

/**
 * Scroll Animations and Floating Elements
 */
function initScrollEffects() {
  const navbar = document.querySelector('.site-header');
  const revealElements = document.querySelectorAll('.scroll-reveal');

  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));
}

/**
 * Live Lounge Operating Status & Available Chairs
 */
function initLiveStatusBadge() {
  const statusEl = document.getElementById('liveLoungeStatus');
  if (!statusEl) return;

  const now = new Date();
  const hour = now.getHours();

  if (hour >= 10 && hour < 23) {
    statusEl.innerHTML = `<span class="live-dot pulse"></span> <span class="status-txt">Saloon Open • 3 Master Chairs Active in Faisalabad</span>`;
    statusEl.classList.add('status-open');
  } else {
    statusEl.innerHTML = `<span class="live-dot night"></span> <span class="status-txt">Saloon Closed • Booking Open for Tomorrow 10:00 AM</span>`;
    statusEl.classList.add('status-closed');
  }
}

/**
 * Mobile Navigation Drawer
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navDrawer = document.getElementById('mobileNavDrawer');
  const navLinks = navDrawer?.querySelectorAll('a');

  if (toggleBtn && navDrawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navDrawer.classList.toggle('active');
      toggleBtn.classList.toggle('active');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    navLinks?.forEach(link => {
      link.addEventListener('click', () => {
        navDrawer.classList.remove('active');
        toggleBtn.classList.remove('active');
      });
    });
  }
}

/**
 * Toast Notification Utility
 */
function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="toast-content">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${message}</span>
    </div>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
