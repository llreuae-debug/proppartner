// Main Application Coordinator & Orchestrator

import { createIcons, icons } from 'lucide';
import { trustCategories, processSteps, whyJoinFeatures, personas, testimonials, heroStats } from './data/affiliateData.js';
import { initialProjects, formatCurrency, formatCompactCurrency } from './data/projectsData.js';
import { initHero3D } from './components/hero3d.js';
import { initNetworkGraph } from './components/networkGraph3d.js';
import { initCommissionCalculator } from './components/calculator.js';
import { initDashboardPreview } from './components/dashboardPreview.js';
import { initProjectShowcase } from './components/projectShowcase.js';
import { initMarketingToolkit } from './components/marketingToolkit.js';
import { initRegistrationForm } from './components/registrationForm.js';
import { initFAQ } from './components/faqAccordion.js';
import { initCMSDrawer } from './components/cmsDrawer.js';

// Global state
let currentCurrency = 'PKR';
let activeProjects = [...initialProjects];

// Expose lucide globally for components
window.lucide = {
  createIcons: () => createIcons({ icons })
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  window.lucide.createIcons();

  // 2. Render Trust Categories
  renderTrustCategories();

  // 3. Render 6-Step Process Timeline
  renderProcessTimeline();

  // 4. Render Why Join Features
  renderWhyJoin();

  // 5. Render Who Can Join Personas
  renderPersonas();

  // 6. Render Testimonials
  renderTestimonials();

  // 7. Initialize Three.js 3D Hero Scene
  const heroCanvasContainer = document.getElementById('hero-3d-canvas');
  initHero3D(heroCanvasContainer);

  // 8. Initialize 3D Network Visualization Graph
  const networkWrap = document.getElementById('network-canvas-wrap');
  const networkTooltip = document.getElementById('network-tooltip');
  initNetworkGraph(networkWrap, networkTooltip);

  // 9. Initialize 3D Commission Calculator
  const calcMount = document.getElementById('commission-calc-mount');
  const calculatorInstance = initCommissionCalculator(calcMount, currentCurrency);

  // 10. Initialize Dashboard Preview
  const dashMount = document.getElementById('dashboard-preview-mount');
  const dashboardInstance = initDashboardPreview(dashMount, currentCurrency);

  // 11. Initialize Featured Projects Showcase
  const projectMount = document.getElementById('projects-showcase-mount');
  const projectInstance = initProjectShowcase(projectMount, handleModalOpen, currentCurrency);

  // 12. Initialize Marketing Toolkit
  const toolkitMount = document.getElementById('toolkit-mount');
  initMarketingToolkit(toolkitMount, showToast);

  // 13. Initialize Registration Form
  const regForm = document.getElementById('affiliate-reg-form');
  const regSuccess = document.getElementById('reg-success-container');
  initRegistrationForm(regForm, regSuccess, showToast);

  // 14. Initialize FAQ Accordion
  const faqMount = document.getElementById('faq-mount');
  initFAQ(faqMount);

  // 15. Initialize Admin/CMS Live Simulator Drawer
  const cmsRoot = document.getElementById('cms-drawer-root');
  initCMSDrawer(cmsRoot, (cmsData) => {
    // Live update hero stats
    document.getElementById('hero-stat-val-text').textContent = cmsData.heroProjectValue;
    document.getElementById('hero-stat-network-text').textContent = cmsData.heroPartnerNetwork;
    document.getElementById('hero-stat-comm-text').textContent = cmsData.heroMaxCommission;

    // Update Luminary project price/rate
    const luminary = activeProjects.find(p => p.id === 'luminary-towers');
    if (luminary) {
      luminary.startingPrice = cmsData.luminaryPrice;
      luminary.commissionRate = cmsData.luminaryRate;
    }
    const elysium = activeProjects.find(p => p.id === 'elysium-waterfront');
    if (elysium) {
      elysium.startingPrice = cmsData.elysiumPrice;
      elysium.commissionRate = cmsData.elysiumRate;
    }

    // Update global currency if changed
    if (cmsData.currency !== currentCurrency) {
      currentCurrency = cmsData.currency;
      document.getElementById('global-currency-picker').value = currentCurrency;
    }

    // Refresh instances
    calculatorInstance?.setCurrency(currentCurrency);
    dashboardInstance?.setCurrency(currentCurrency);
    projectInstance?.updateProjects(activeProjects);
    projectInstance?.setCurrency(currentCurrency);

    showToast('Admin CMS settings applied in real time!');
  });

  // 16. Header Currency Picker
  const currPicker = document.getElementById('global-currency-picker');
  currPicker?.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    calculatorInstance?.setCurrency(currentCurrency);
    dashboardInstance?.setCurrency(currentCurrency);
    projectInstance?.setCurrency(currentCurrency);
    showToast(`Currency converted to ${currentCurrency}`);
  });

  // 17. Header Sticky Scroll Spy
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 18. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  mobileToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });

  // 19. Legal Modal Links
  document.querySelectorAll('.legal-modal-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const type = link.getAttribute('data-legal');
      handleLegalModal(type);
    });
  });

  // Re-run icons
  window.lucide.createIcons();
});

// Toast notification helper
function showToast(message, type = 'success') {
  const toast = document.getElementById('app-toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Modal Manager
function handleModalOpen(modalType, data) {
  const overlay = document.getElementById('app-modal-overlay');
  const modalBody = document.getElementById('app-modal-body');
  if (!overlay || !modalBody) return;

  if (modalType === 'project-detail') {
    const estComm = (data.startingPrice * data.commissionRate) / 100;
    modalBody.innerHTML = `
      <button type="button" class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
      <div class="project-modal-layout">
        <div class="modal-img-wrap" style="height: 260px; overflow: hidden; border-radius: 16px; margin-bottom: 20px;">
          <img src="${data.image}" alt="${data.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="section-eyebrow"><i data-lucide="building-2"></i> ${data.type}</div>
        <h2 style="font-size: 1.8rem; margin: 4px 0 10px 0;">${data.name}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">${data.tagline}</p>

        <div class="project-financials-grid" style="margin-bottom: 24px;">
          <div class="fin-box">
            <span class="fin-lbl">Starting Price</span>
            <strong class="fin-val">${formatCurrency(data.startingPrice, currentCurrency)}</strong>
          </div>
          <div class="fin-box">
            <span class="fin-lbl">Commission Rate</span>
            <strong class="fin-val gold">${data.commissionRate}%</strong>
          </div>
          <div class="fin-box">
            <span class="fin-lbl">Est. Payout per unit</span>
            <strong class="fin-val cyan">${formatCurrency(estComm, currentCurrency)}</strong>
          </div>
          <div class="fin-box">
            <span class="fin-lbl">Status & Timeline</span>
            <strong class="fin-val">${data.status} (${data.completionDate})</strong>
          </div>
        </div>

        <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--gold-light);">Key Development Highlights</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
          ${data.highlights.map(h => `
            <li style="font-size: 0.9rem; color: #E2E8F0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="check" style="color: var(--gold-light); width: 16px; height: 16px;"></i>
              ${h}
            </li>
          `).join('')}
        </ul>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <button type="button" class="btn btn-gold" id="modal-quick-promote" data-id="${data.id}">
            <i data-lucide="link"></i>
            <span>GET CUSTOM PROMOTION LINK</span>
          </button>
          <a href="#register" class="btn btn-secondary" id="modal-apply-btn">
            <span>REGISTER AS PARTNER</span>
          </a>
        </div>
      </div>
    `;
  } else if (modalType === 'promote-project') {
    const affiliateLink = `https://proppartner.network/ref/partner-demo?project=${data.id}`;
    modalBody.innerHTML = `
      <button type="button" class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
      <div style="text-align: center;">
        <div class="section-eyebrow"><i data-lucide="share-2"></i> AFFILIATE ASSET GENERATOR</div>
        <h2 style="font-size: 1.8rem; margin: 8px 0 12px 0;">Promote ${data.name}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">
          Share your unique tracked referral link. Inquiries via this link are locked to your affiliate profile for 90 days.
        </p>

        <div style="background: #06090E; border: 1px solid var(--border-gold); padding: 16px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <code style="color: var(--cyan-accent); font-family: var(--font-mono); font-size: 0.85rem; word-break: break-all;">${affiliateLink}</code>
          <button type="button" class="btn btn-gold btn-sm" id="copy-modal-link-btn" style="flex-shrink: 0;">
            <i data-lucide="copy"></i>
            <span>COPY</span>
          </button>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: 12px; font-size: 0.82rem; color: var(--text-secondary); text-align: left; margin-bottom: 24px;">
          <strong style="color: #FFFFFF; display: block; margin-bottom: 4px;"><i data-lucide="shield-check" style="width:14px; height:14px; color:#10B981; display:inline-block; vertical-align:middle;"></i> Guaranteed Attribution</strong>
          Leads who click your link or register with our concierge desk are assigned directly to your Partner ID. You will receive an instant email notification when a site tour is booked.
        </div>

        <a href="#register" class="btn btn-secondary w-full" id="modal-onboard-cta">
          <span>NEW PARTNER? SUBMIT APPLICATION</span>
        </a>
      </div>
    `;

    modalBody.querySelector('#copy-modal-link-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(affiliateLink).then(() => {
        showToast('Referral link copied to clipboard!');
      });
    });
  }

  if (window.lucide) window.lucide.createIcons();
  overlay.classList.add('open');

  // Close handlers
  modalBody.querySelector('#modal-close')?.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  modalBody.querySelector('#modal-quick-promote')?.addEventListener('click', () => {
    handleModalOpen('promote-project', data);
  });
  modalBody.querySelector('#modal-apply-btn')?.addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  modalBody.querySelector('#modal-onboard-cta')?.addEventListener('click', () => {
    overlay.classList.remove('open');
  });
}

function handleLegalModal(type) {
  const titles = {
    terms: "Affiliate Terms & Conditions",
    agreement: "Official Partner Network Agreement",
    privacy: "Privacy & Data Protection Policy",
    commission: "Commission Structure & Payout Policy",
    referral: "Referral Attribution & Cookie Policy",
    disclaimer: "Legal Disclaimer & Regulatory Notice"
  };

  const dummyProject = {
    id: "legal-doc",
    name: titles[type] || "Legal Policy",
    tagline: "Official Compliance & Governance Documentation (2026 Edition)",
    type: "Legal Policy",
    startingPrice: 0,
    commissionRate: 0,
    status: "Active",
    completionDate: "2026",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    highlights: [
      "Commissions are payable only upon completed qualifying transactions and clearance of required buyer deposits.",
      "90-day multi-channel CRM lead attribution lock on registered client introductions.",
      "Full transparency with zero undisclosed admin deductions or hidden fees.",
      "Strict compliance with local real estate advertising and anti-money laundering regulations."
    ]
  };

  handleModalOpen('project-detail', dummyProject);
}

// Sub-renderers
function renderTrustCategories() {
  const grid = document.getElementById('trust-categories-grid');
  if (!grid) return;

  grid.innerHTML = trustCategories.map(cat => `
    <div class="trust-persona-card glass-card">
      <div class="persona-icon"><i data-lucide="${cat.icon}"></i></div>
      <div class="persona-info">
        <h4>${cat.title}</h4>
        <p>${cat.description}</p>
      </div>
    </div>
  `).join('');
}

function renderProcessTimeline() {
  const grid = document.getElementById('timeline-steps-grid');
  if (!grid) return;

  grid.innerHTML = processSteps.map(step => `
    <div class="timeline-step-card glass-card tilt-target-3d">
      <div>
        <div class="step-card-top">
          <span class="step-num-badge">${step.step}</span>
          <div class="step-icon-wrap"><i data-lucide="${step.icon}"></i></div>
        </div>
        <h3 class="step-title">${step.title}</h3>
        <span class="step-subtitle">${step.subtitle}</span>
        <p class="step-desc">${step.description}</p>
      </div>
      <div class="step-pill-highlight">
        <i data-lucide="check-circle" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle;"></i>
        ${step.highlight}
      </div>
    </div>
  `).join('');
}

function renderWhyJoin() {
  const grid = document.getElementById('why-join-grid');
  if (!grid) return;

  grid.innerHTML = whyJoinFeatures.map(feat => `
    <div class="why-card glass-card tilt-target-3d">
      <div class="why-top-row">
        <span class="why-num">${feat.number}</span>
        <div class="why-icon"><i data-lucide="${feat.icon}"></i></div>
      </div>
      <h3 class="why-title">${feat.title}</h3>
      <p class="why-desc">${feat.description}</p>
    </div>
  `).join('');
}

function renderPersonas() {
  const grid = document.getElementById('personas-grid-mount');
  if (!grid) return;

  grid.innerHTML = personas.map(p => `
    <div class="persona-profile-card glass-card tilt-target-3d">
      <div class="p-card-top">
        <div class="p-card-icon"><i data-lucide="${p.icon}"></i></div>
        <h3 class="p-card-role">${p.role}</h3>
      </div>
      <div class="p-card-headline">${p.headline}</div>
      <p class="p-card-desc">${p.description}</p>
      <div class="p-card-earning-pill">
        <span>Earning Target:</span>
        <strong>${p.earningsPotential}</strong>
      </div>
      <div class="p-card-strategy">
        <strong>Playbook:</strong> <span>${p.strategy}</span>
      </div>
    </div>
  `).join('');
}

function renderTestimonials() {
  const grid = document.getElementById('stories-grid-mount');
  if (!grid) return;

  grid.innerHTML = testimonials.map(item => `
    <div class="story-card glass-card tilt-target-3d">
      <div>
        <div class="story-tag-pill">
          <i data-lucide="award" style="width: 14px; height: 14px;"></i>
          ${item.tag}
        </div>
        <p class="story-quote">"${item.quote}"</p>
      </div>
      <div class="story-footer">
        <img src="${item.avatar}" alt="${item.name}" class="story-avatar" loading="lazy">
        <div class="story-user-meta">
          <h4>${item.name}</h4>
          <span>${item.role} • ${item.city}</span>
          <div class="story-comm-pill">
            <i data-lucide="check-check" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; color: #10B981;"></i>
            ${item.referrals} Closed Sales • ${item.commissionEarned} Paid
          </div>
        </div>
      </div>
    </div>
  `).join('');
}
