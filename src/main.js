// Main Application Coordinator & Orchestrator - PropPartner 3D Landing & SaaS Portal

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

// Enterprise Platform & Auth Stores
import { authStore } from './store/authStore.js';
import { platformStore } from './store/platformStore.js';
import { openAuthModal } from './components/auth/AuthModal.js';
import { initAdminPortal } from './components/admin/AdminPortal.js';
import { initAffiliatePortal } from './components/affiliate/AffiliatePortal.js';
import { renderLegalView } from './components/legal/LegalView.js';
import { renderContactView } from './components/contact/ContactView.js';
import { renderAffiliateProgramView } from './components/public/AffiliateProgramView.js';
import { renderCommissionView } from './components/public/CommissionView.js';
import { renderHowItWorksView } from './components/public/HowItWorksView.js';
import { renderAboutView } from './components/public/AboutView.js';
import { renderProjectsDirectoryView } from './components/public/ProjectsDirectoryView.js';
import { renderProjectDetailView } from './components/public/ProjectDetailView.js';
import { renderResourcesHubView } from './components/public/ResourcesHubView.js';
import { renderResourceArticleView } from './components/public/ResourceArticleView.js';
import { renderNotFoundView } from './components/public/NotFoundView.js';
import { updateSEO, seoRoutes } from './utils/seoManager.js';
import { ReferralTracker } from './utils/referralTracker.js';

// Global state
let currentCurrency = 'PKR';
let activeProjects = [...initialProjects];
let currentView = 'landing'; // 'landing' | 'admin' | 'partner'

// Expose lucide globally for components
window.lucide = {
  createIcons: () => createIcons({ icons })
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons & Inbound Referral Tracking
  window.lucide.createIcons();
  ReferralTracker.init();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration note:', err);
      });
    });
  }

  // 2. Render Landing Page Sections
  renderTrustCategories();
  renderProcessTimeline();
  renderWhyJoin();
  renderPersonas();
  renderTestimonials();

  // 3. Initialize Three.js 3D Hero Scene
  const heroCanvasContainer = document.getElementById('hero-3d-canvas');
  if (heroCanvasContainer) initHero3D(heroCanvasContainer);

  // 4. Initialize 3D Network Visualization Graph
  const networkWrap = document.getElementById('network-canvas-wrap');
  const networkTooltip = document.getElementById('network-tooltip');
  if (networkWrap) initNetworkGraph(networkWrap, networkTooltip);

  // 5. Initialize 3D Commission Calculator
  const calcMount = document.getElementById('commission-calc-mount');
  const calculatorInstance = calcMount ? initCommissionCalculator(calcMount, currentCurrency) : null;

  // 6. Initialize Dashboard Preview
  const dashMount = document.getElementById('dashboard-preview-mount');
  const dashboardInstance = dashMount ? initDashboardPreview(dashMount, currentCurrency) : null;

  // 7. Initialize Featured Projects Showcase
  const projectMount = document.getElementById('projects-showcase-mount');
  const projectInstance = projectMount ? initProjectShowcase(projectMount, handleModalOpen, currentCurrency) : null;

  // 8. Initialize Marketing Toolkit
  const toolkitMount = document.getElementById('toolkit-mount');
  if (toolkitMount) initMarketingToolkit(toolkitMount, showToast);

  // 9. Initialize Registration Form
  const regForm = document.getElementById('affiliate-reg-form');
  const regSuccess = document.getElementById('reg-success-container');
  if (regForm) initRegistrationForm(regForm, regSuccess, showToast);

  // 10. Initialize FAQ Accordion
  const faqMount = document.getElementById('faq-mount');
  if (faqMount) initFAQ(faqMount);

  // 11. Initialize Admin/CMS Live Simulator Drawer
  const cmsRoot = document.getElementById('cms-drawer-root');
  if (cmsRoot) {
    initCMSDrawer(cmsRoot, (cmsData) => {
      const heroVal = document.getElementById('hero-stat-val-text');
      if (heroVal) heroVal.textContent = cmsData.heroProjectValue;
      const heroNet = document.getElementById('hero-stat-network-text');
      if (heroNet) heroNet.textContent = cmsData.heroPartnerNetwork;
      const heroComm = document.getElementById('hero-stat-comm-text');
      if (heroComm) heroComm.textContent = cmsData.heroMaxCommission;

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

      if (cmsData.currency !== currentCurrency) {
        currentCurrency = cmsData.currency;
        const picker = document.getElementById('global-currency-picker');
        if (picker) picker.value = currentCurrency;
      }

      calculatorInstance?.setCurrency(currentCurrency);
      dashboardInstance?.setCurrency(currentCurrency);
      projectInstance?.updateProjects(activeProjects);
      projectInstance?.setCurrency(currentCurrency);

      showToast('Admin CMS settings applied in real time!');
    });
  }

  // 12. Header Currency Picker
  const currPicker = document.getElementById('global-currency-picker');
  currPicker?.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    platformStore.setCurrency(currentCurrency);
    calculatorInstance?.setCurrency(currentCurrency);
    dashboardInstance?.setCurrency(currentCurrency);
    projectInstance?.setCurrency(currentCurrency);
    showToast(`Currency converted to ${currentCurrency}`);
  });

  // 13. Header Sticky Scroll
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
  });

  // 14. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  mobileToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('open');
  });
  navMenu?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('open');
    });
  });

  // 15. Header "Sign In" Button
  const navLoginBtn = document.getElementById('nav-portal-login-btn');
  navLoginBtn?.addEventListener('click', () => {
    openAuthModal('login', (user) => {
      if (user.role === 'SUPER_ADMIN') switchView('admin');
      else switchView('partner');
    });
  });

  // 16. Persistent Platform Switcher Dock
  setupPlatformModeDock();

  // 17. Legal Page Links
  document.querySelectorAll('.legal-route-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const docKey = link.getAttribute('data-legal-route') || 'terms';
      switchView('legal', { docKey });
    });
  });

  // Check URL hash / pathname for routing e.g. /projects/luminary-towers, #admin, #partner
  handleHashRouting();
  window.addEventListener('hashchange', handleHashRouting);
  window.addEventListener('popstate', handleHashRouting);

  // Re-run icons
  window.lucide.createIcons();
});

// View Switching Coordinator
export function switchView(targetView, params = {}) {
  currentView = targetView;
  const landingWrap = document.getElementById('landing-page-wrap');
  const portalRoot = document.getElementById('portal-app-root');
  const legalRoot = document.getElementById('legal-page-root');
  const contactRoot = document.getElementById('contact-page-root');
  const seoRoot = document.getElementById('seo-page-root');
  const dock = document.getElementById('platform-mode-dock');

  // Hide all view containers first
  if (landingWrap) landingWrap.style.display = 'none';
  if (portalRoot) {
    portalRoot.style.display = 'none';
    portalRoot.innerHTML = '';
  }
  if (legalRoot) {
    legalRoot.style.display = 'none';
    legalRoot.innerHTML = '';
  }
  if (contactRoot) {
    contactRoot.style.display = 'none';
    contactRoot.innerHTML = '';
  }
  if (seoRoot) {
    seoRoot.style.display = 'none';
    seoRoot.innerHTML = '';
  }

  // Update active dock buttons
  dock?.querySelectorAll('.dock-btn').forEach(btn => btn.classList.remove('active'));

  if (targetView === 'landing') {
    if (landingWrap) landingWrap.style.display = 'block';
    const landBtn = document.getElementById('dock-btn-landing');
    if (landBtn) landBtn.classList.add('active');
    updateSEO(seoRoutes.home);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'admin') {
    const user = authStore.currentUser;
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      openAuthModal('login', (authUser) => {
        if (authUser.role === 'SUPER_ADMIN' || authUser.role === 'ADMIN') {
          switchView('admin');
        } else {
          switchView('partner');
        }
      });
      return;
    }
    if (portalRoot) {
      portalRoot.style.display = 'block';
      initAdminPortal(
        portalRoot,
        () => switchView('landing'),
        () => switchView('partner')
      );
    }
    const adminBtn = document.getElementById('dock-btn-admin');
    if (adminBtn) adminBtn.classList.add('active');
    window.location.hash = '#admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'partner') {
    const user = authStore.currentUser;
    if (!user) {
      openAuthModal('login', (authUser) => {
        if (authUser.role === 'SUPER_ADMIN' || authUser.role === 'ADMIN') {
          switchView('admin');
        } else {
          switchView('partner');
        }
      });
      return;
    }
    if (portalRoot) {
      portalRoot.style.display = 'block';
      initAffiliatePortal(
        portalRoot,
        () => switchView('landing'),
        () => switchView('admin')
      );
    }
    const partBtn = document.getElementById('dock-btn-partner');
    if (partBtn) partBtn.classList.add('active');
    window.location.hash = '#partner';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'legal') {
    if (legalRoot) {
      legalRoot.style.display = 'block';
      const docKey = params.docKey || 'terms';
      renderLegalView(
        legalRoot,
        docKey,
        () => {
          window.location.hash = '';
          switchView('landing');
        },
        (nextDocKey) => {
          const docSlugMap = {
            terms: '#terms-and-conditions',
            agreement: '#affiliate-agreement',
            privacy: '#privacy-policy',
            commission: '#commission-policy',
            referral: '#referral-policy',
            disclaimer: '#disclaimer'
          };
          window.location.hash = docSlugMap[nextDocKey] || '#terms-and-conditions';
          switchView('legal', { docKey: nextDocKey });
        }
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'contact') {
    if (contactRoot) {
      contactRoot.style.display = 'block';
      renderContactView(contactRoot, () => {
        window.location.hash = '';
        switchView('landing');
      });
    }
    window.location.hash = '#contact';
    updateSEO(seoRoutes.contact);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'affiliate-program') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderAffiliateProgramView(
        seoRoot,
        () => {
          window.location.hash = '';
          switchView('landing');
        },
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    window.location.hash = '#affiliate-program';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'commission') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderCommissionView(
        seoRoot,
        () => {
          window.location.hash = '';
          switchView('landing');
        },
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    window.location.hash = '#commission';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'how-it-works') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderHowItWorksView(
        seoRoot,
        () => {
          window.location.hash = '';
          switchView('landing');
        },
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    window.location.hash = '#how-it-works';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'about') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderAboutView(
        seoRoot,
        () => {
          window.location.hash = '';
          switchView('landing');
        },
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    window.location.hash = '#about';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'projects') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderProjectsDirectoryView(
        seoRoot,
        () => {
          if (window.location.pathname === '/projects') {
            window.history.pushState({}, '', '/');
          }
          window.location.hash = '';
          switchView('landing');
        },
        (projId) => switchView('project-detail', { projectId: projId }),
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    if (window.location.pathname !== '/projects') {
      window.location.hash = '#projects';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'project-detail') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      const pId = String(params.projectId || 'luminary-towers').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
      renderProjectDetailView(
        seoRoot,
        pId,
        () => {
          if (window.location.pathname.startsWith('/projects/')) {
            window.history.pushState({}, '', '/');
          }
          window.location.hash = '';
          switchView('landing');
        },
        () => {
          if (window.location.pathname.startsWith('/projects/')) {
            window.history.pushState({}, '', '/projects');
          }
          switchView('projects');
        },
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    if (!window.location.pathname.startsWith('/projects/')) {
      window.location.hash = `#projects/${String(params.projectId || 'luminary-towers').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '')}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'resources') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderResourcesHubView(
        seoRoot,
        () => {
          if (window.location.pathname === '/resources' || window.location.pathname === '/blog') {
            window.history.pushState({}, '', '/');
          }
          window.location.hash = '';
          switchView('landing');
        },
        (artSlug) => switchView('resource-article', { slug: artSlug }),
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    if (window.location.pathname !== '/resources' && window.location.pathname !== '/blog') {
      window.location.hash = '#resources';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'resource-article') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      const slug = String(params.slug || 'what-is-a-real-estate-affiliate-program').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
      renderResourceArticleView(
        seoRoot,
        slug,
        () => {
          if (window.location.pathname.startsWith('/resources/') || window.location.pathname.startsWith('/blog/')) {
            window.history.pushState({}, '', '/');
          }
          window.location.hash = '';
          switchView('landing');
        },
        () => switchView('resources'),
        (nextSlug) => switchView('resource-article', { slug: nextSlug }),
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    if (!window.location.pathname.startsWith('/resources/') && !window.location.pathname.startsWith('/blog/')) {
      window.location.hash = `#resources/${String(params.slug || 'what-is-a-real-estate-affiliate-program').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '')}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === '404') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderNotFoundView(
        seoRoot,
        () => {
          window.location.hash = '';
          switchView('landing');
        },
        () => switchView('projects'),
        () => openAuthModal('register', (user) => {
          if (user.role === 'SUPER_ADMIN') switchView('admin');
          else switchView('partner');
        })
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (window.lucide) window.lucide.createIcons();
}

function handleHashRouting() {
  const rawHash = window.location.hash || '';
  const rawPath = window.location.pathname || '';

  // Clean path and hash: isolate pathnames and strip any query strings for route matching
  const cleanPath = rawPath.split('?')[0].replace(/\/+$/, '');
  const cleanHash = rawHash.replace(/^#/, '').split('?')[0].replace(/\/+$/, '');

  if (cleanHash === 'terms-and-conditions' || cleanHash === 'terms' || cleanPath === '/terms-and-conditions') {
    switchView('legal', { docKey: 'terms' });
  } else if (cleanHash === 'affiliate-agreement' || cleanHash === 'agreement' || cleanPath === '/affiliate-agreement') {
    switchView('legal', { docKey: 'agreement' });
  } else if (cleanHash === 'privacy-policy' || cleanHash === 'privacy' || cleanPath === '/privacy-policy') {
    switchView('legal', { docKey: 'privacy' });
  } else if (cleanHash === 'commission-policy' || cleanPath === '/commission-policy') {
    switchView('legal', { docKey: 'commission' });
  } else if (cleanHash === 'referral-policy' || cleanHash === 'referral' || cleanPath === '/referral-policy') {
    switchView('legal', { docKey: 'referral' });
  } else if (cleanHash === 'disclaimer' || cleanPath === '/disclaimer') {
    switchView('legal', { docKey: 'disclaimer' });
  } else if (cleanHash === 'contact' || cleanPath === '/contact') {
    switchView('contact');
  } else if (cleanHash === 'affiliate-program' || cleanPath === '/affiliate-program') {
    switchView('affiliate-program');
  } else if (cleanHash === 'commission' || cleanPath === '/commission') {
    switchView('commission');
  } else if (cleanHash === 'how-it-works' || cleanPath === '/how-it-works') {
    switchView('how-it-works');
  } else if (cleanHash === 'about' || cleanPath === '/about') {
    switchView('about');
  } else if (cleanHash === 'projects' || cleanPath === '/projects') {
    switchView('projects');
  } else if (cleanPath.startsWith('/projects/') || cleanHash.startsWith('projects/') || cleanHash.startsWith('project/')) {
    let projId = '';
    if (cleanPath.startsWith('/projects/')) {
      projId = cleanPath.replace(/^\/projects\//, '');
    } else if (cleanHash.startsWith('projects/')) {
      projId = cleanHash.replace(/^projects\//, '');
    } else if (cleanHash.startsWith('project/')) {
      projId = cleanHash.replace(/^project\//, '');
    }
    projId = projId.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '').trim();
    switchView('project-detail', { projectId: projId });
  } else if (cleanHash === 'resources' || cleanHash === 'blog' || cleanPath === '/resources' || cleanPath === '/blog') {
    switchView('resources');
  } else if (cleanPath.startsWith('/resources/') || cleanPath.startsWith('/blog/') || cleanHash.startsWith('resources/') || cleanHash.startsWith('blog/')) {
    let slug = '';
    if (cleanPath.startsWith('/resources/')) slug = cleanPath.replace(/^\/resources\//, '');
    else if (cleanPath.startsWith('/blog/')) slug = cleanPath.replace(/^\/blog\//, '');
    else if (cleanHash.startsWith('resources/')) slug = cleanHash.replace(/^resources\//, '');
    else if (cleanHash.startsWith('blog/')) slug = cleanHash.replace(/^blog\//, '');
    slug = slug.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '').trim();
    switchView('resource-article', { slug });
  } else if (cleanHash === '404' || cleanPath === '/404') {
    switchView('404');
  } else if (cleanHash.startsWith('reset-password')) {
    const token = new URLSearchParams(rawHash.split('?')[1] || '').get('token') || '';
    openAuthModal('reset', (user) => {
      if (user.role === 'SUPER_ADMIN') switchView('admin');
      else switchView('partner');
    }, { token });
  } else if (cleanHash === 'forgot-password') {
    openAuthModal('forgot');
  } else if (cleanHash === 'admin' || cleanHash.startsWith('admin/')) {
    switchView('admin');
  } else if (cleanHash === 'partner' || cleanHash.startsWith('partner/')) {
    switchView('partner');
  } else if (cleanHash === 'login') {
    openAuthModal('login', (user) => {
      if (user.role === 'SUPER_ADMIN') switchView('admin');
      else switchView('partner');
    });
  } else if (!cleanHash && (cleanPath === '' || cleanPath === '/' || cleanPath === '/index.html')) {
    if (currentView !== 'landing') {
      switchView('landing');
    }
  }
}

function setupPlatformModeDock() {
  const dockLanding = document.getElementById('dock-btn-landing');
  dockLanding?.addEventListener('click', () => switchView('landing'));

  const dockAdmin = document.getElementById('dock-btn-admin');
  dockAdmin?.addEventListener('click', () => switchView('admin'));

  const dockPartner = document.getElementById('dock-btn-partner');
  dockPartner?.addEventListener('click', () => switchView('partner'));

  const dockAuth = document.getElementById('dock-btn-auth');
  dockAuth?.addEventListener('click', () => {
    openAuthModal('login', (user) => {
      if (user.role === 'SUPER_ADMIN') switchView('admin');
      else switchView('partner');
    });
  });
}

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
    const user = authStore.getUser();
    const affId = user ? (user.affiliateId || 'AFF-000101') : 'AFF-000101';
    const affiliateLink = `https://proppartner.network/ref/${affId}/${data.id}`;
    modalBody.innerHTML = `
      <button type="button" class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
      <div style="text-align: center;">
        <div class="section-eyebrow"><i data-lucide="share-2"></i> AFFILIATE ASSET GENERATOR</div>
        <h2 style="font-size: 1.8rem; margin: 8px 0 12px 0;">Promote ${data.name}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">
          Share your unique tracked referral link. Inquiries via this link are locked to your affiliate profile for 180 days with duplicate collision protection.
        </p>

        <div style="background: #06090E; border: 1px solid var(--border-gold); padding: 16px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <code style="color: var(--cyan-accent); font-family: var(--font-mono); font-size: 0.85rem; word-break: break-all;">${affiliateLink}</code>
          <button type="button" class="btn btn-gold btn-sm" id="copy-modal-link-btn" style="flex-shrink: 0;">
            <i data-lucide="copy"></i>
            <span>COPY</span>
          </button>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: 12px; font-size: 0.82rem; color: var(--text-secondary); text-align: left; margin-bottom: 24px;">
          <strong style="color: #FFFFFF; display: block; margin-bottom: 4px;"><i data-lucide="shield-check" style="width:14px; height:14px; color:#10B981; display:inline-block; vertical-align:middle;"></i> Guaranteed Attribution & Direct Payouts</strong>
          Leads who click your link or register with our concierge desk are assigned directly to your Partner ID. Commission entitlements are credited to your personal ledger upon contract verification.
        </div>

        <div style="display: flex; gap: 12px; justify-content: center;">
          <button type="button" class="btn btn-secondary" id="modal-goto-portal-btn">
            <i data-lucide="layout-dashboard"></i>
            <span>OPEN PARTNER PORTAL</span>
          </button>
        </div>
      </div>
    `;
  }

  overlay.classList.add('active');
  window.lucide.createIcons();

  document.getElementById('modal-close')?.addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });

  document.getElementById('copy-modal-link-btn')?.addEventListener('click', () => {
    const user = authStore.getUser();
    const affId = user ? (user.affiliateId || 'AFF-000101') : 'AFF-000101';
    navigator.clipboard.writeText(`https://proppartner.network/ref/${affId}/${data.id}`);
    showToast('Custom project referral link copied to clipboard!');
  });

  document.getElementById('modal-quick-promote')?.addEventListener('click', () => {
    handleModalOpen('promote-project', data);
  });

  document.getElementById('modal-apply-btn')?.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  document.getElementById('modal-goto-portal-btn')?.addEventListener('click', () => {
    overlay.classList.remove('active');
    switchView('partner');
  });
}

function handleLegalModal(type) {
  const overlay = document.getElementById('app-modal-overlay');
  const modalBody = document.getElementById('app-modal-body');
  if (!overlay || !modalBody) return;

  const titles = {
    terms: 'Terms & Conditions',
    agreement: 'Official Affiliate Master Agreement',
    privacy: 'Privacy & Data Governance Policy',
    commission: 'Commission Calculation & Settlement Policy',
    referral: 'Referral Attribution & Duplicate Policy',
    disclaimer: 'Legal & Risk Disclaimer'
  };

  modalBody.innerHTML = `
    <button type="button" class="modal-close-btn" id="modal-close"><i data-lucide="x"></i></button>
    <div class="section-eyebrow"><i data-lucide="shield-check"></i> LEGAL & COMPLIANCE</div>
    <h2 style="font-size: 1.6rem; margin: 6px 0 16px 0;">${titles[type] || 'Compliance Policy'}</h2>
    <div style="font-size: 0.88rem; color: #CBD5E1; line-height: 1.7; max-height: 400px; overflow-y: auto; padding-right: 12px;">
      <p style="margin-bottom: 12px;">This document establishes the binding terms governing all affiliate partners and transactions transacted through PropPartner.</p>
      <h4 style="color: var(--gold-light); margin: 16px 0 6px 0;">1. Commission Eligibility</h4>
      <p style="margin-bottom: 12px;">Commissions are calculated based on verified net contract sales value and are payable upon buyer token clearance and developer escrow deed registration.</p>
      <h4 style="color: var(--gold-light); margin: 16px 0 6px 0;">2. Duplicate Lead Protection</h4>
      <p style="margin-bottom: 12px;">In the event of duplicate referral submissions for identical buyer contacts, administrative review will determine attribution based on chronological submission and client confirmation.</p>
      <h4 style="color: var(--gold-light); margin: 16px 0 6px 0;">3. Anti-Money Laundering & KYC</h4>
      <p>All affiliate partners must provide verifiable tax and banking details prior to wire disbursement approval.</p>
    </div>
    <div style="margin-top: 24px; text-align: right;">
      <button type="button" class="btn btn-gold btn-sm" id="legal-agree-btn"><span>I UNDERSTAND & AGREE</span></button>
    </div>
  `;

  overlay.classList.add('active');
  window.lucide.createIcons();

  document.getElementById('modal-close')?.addEventListener('click', () => overlay.classList.remove('active'));
  document.getElementById('legal-agree-btn')?.addEventListener('click', () => overlay.classList.remove('active'));
}

// -------------------------------------------------------------
// Landing Page Rendering Helpers
// -------------------------------------------------------------
function renderTrustCategories() {
  const mount = document.getElementById('trust-categories-mount');
  if (!mount) return;
  mount.innerHTML = trustCategories.map(cat => `
    <div class="trust-badge-item">
      <i data-lucide="${cat.icon}"></i>
      <span>${cat.label}</span>
    </div>
  `).join('');
}

function renderProcessTimeline() {
  const mount = document.getElementById('process-timeline-mount');
  if (!mount) return;
  mount.innerHTML = processSteps.map(step => `
    <div class="timeline-step glass-card">
      <div class="step-badge">${step.number}</div>
      <div class="step-icon-wrap">
        <i data-lucide="${step.icon}"></i>
      </div>
      <h3 class="step-title">${step.title}</h3>
      <p class="step-desc">${step.description}</p>
    </div>
  `).join('');
}

function renderWhyJoin() {
  const mount = document.getElementById('why-join-mount');
  if (!mount) return;
  mount.innerHTML = whyJoinFeatures.map(feat => `
    <div class="why-card glass-card">
      <div class="why-icon-wrap">
        <i data-lucide="${feat.icon}"></i>
      </div>
      <h3 class="why-card-title">${feat.title}</h3>
      <p class="why-card-desc">${feat.description}</p>
    </div>
  `).join('');
}

function renderPersonas() {
  const mount = document.getElementById('personas-mount');
  if (!mount) return;
  mount.innerHTML = personas.map(p => `
    <div class="persona-card glass-card">
      <div class="persona-icon-wrap">
        <i data-lucide="${p.icon}"></i>
      </div>
      <h3 class="persona-title">${p.title}</h3>
      <p class="persona-desc">${p.description}</p>
      <div class="persona-tag">
        <i data-lucide="check"></i>
        <span>${p.highlight}</span>
      </div>
    </div>
  `).join('');
}

function renderTestimonials() {
  const mount = document.getElementById('testimonials-mount');
  if (!mount) return;
  mount.innerHTML = testimonials.map(t => `
    <div class="testimonial-card glass-card">
      <div class="test-quote-icon">“</div>
      <p class="test-quote-text">${t.quote}</p>
      <div class="test-stat-pill">
        <i data-lucide="trending-up"></i>
        <span>${t.earnings}</span>
      </div>
      <div class="test-author-info">
        <img src="${t.avatar}" alt="${t.name}" class="test-avatar" loading="lazy" width="48" height="48">
        <div>
          <h4 class="test-author-name">${t.name}</h4>
          <p class="test-author-role">${t.role}</p>
          <span class="test-author-loc">${t.location}</span>
        </div>
      </div>
    </div>
  `).join('');
}
