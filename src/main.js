// Main Application Coordinator & Orchestrator - PropPartner
// Supports: Landing Page (Home), Super Admin ERP, Partner Portal, Public Modules & Auth

import { createIcons, icons } from 'lucide';
import { initialProjects } from './data/projectsData.js';

// Enterprise Platform & Auth Stores
import { authStore } from './store/authStore.js';
import { platformStore } from './store/platformStore.js';
import { renderLoginPage } from './components/auth/LoginPage.js';
import { initAdminPortal } from './components/admin/AdminPortal.js';
import { initAffiliatePortal } from './components/affiliate/AffiliatePortal.js';
import { openLogoutConfirmationModal } from './components/common/LogoutConfirmationModal.js';
import { ReferralTracker } from './utils/referralTracker.js';

// Public Landing Components
import { initHero3D } from './components/hero3d.js';
import { initProjectShowcase } from './components/projectShowcase.js';
import { initCommissionCalculator } from './components/calculator.js';
import { initFAQ } from './components/faqAccordion.js';
import { initRegistrationForm } from './components/registrationForm.js';
import { initDashboardPreview } from './components/dashboardPreview.js';
import { initNetworkGraph } from './components/networkGraph3d.js';
import { initMarketingToolkit } from './components/marketingToolkit.js';

// Public Dedicated Views
import { renderLegalView } from './components/legal/LegalView.js';
import { renderContactView } from './components/contact/ContactView.js';
import { renderProjectDetailView } from './components/public/ProjectDetailView.js';
import { renderProjectsDirectoryView } from './components/public/ProjectsDirectoryView.js';
import { renderCommissionView } from './components/public/CommissionView.js';
import { renderAffiliateProgramView } from './components/public/AffiliateProgramView.js';
import { renderHowItWorksView } from './components/public/HowItWorksView.js';
import { renderAboutView } from './components/public/AboutView.js';
import { renderResourcesHubView } from './components/public/ResourcesHubView.js';
import { renderResourceArticleView } from './components/public/ResourceArticleView.js';
import { renderNotFoundView } from './components/public/NotFoundView.js';

// Global state tracking
let currentView = 'landing';
let hero3DInstance = null;
let showcaseInstance = null;
let calcInstance = null;
let previewInstance = null;
let isLandingInitialized = false;

// Expose lucide globally
window.lucide = {
  createIcons: () => createIcons({ icons })
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons & Inbound Referral Tracking
  window.lucide.createIcons();
  ReferralTracker.init();

  // Register PWA Service Worker if available
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration note:', err);
      });
    });
  }

  // 2. Initialize Dock Switcher & Navigation
  initPlatformDock();

  // 3. Evaluate Authentication & Route
  evaluateRouting();

  window.addEventListener('hashchange', evaluateRouting);
  window.addEventListener('popstate', evaluateRouting);

  // Subscribe to auth and platform store changes
  authStore.subscribe(() => {
    updateHeaderAuthActions();
    evaluateRouting();
  });
});

/**
 * Platform Mode Dock Coordinator
 */
function initPlatformDock() {
  const dock = document.getElementById('platform-mode-dock');
  if (!dock) return;

  dock.style.display = 'block';

  const btnLanding = document.getElementById('dock-btn-landing');
  const btnAdmin = document.getElementById('dock-btn-admin');
  const btnPartner = document.getElementById('dock-btn-partner');
  const btnAuth = document.getElementById('dock-btn-auth');

  if (btnLanding) {
    btnLanding.onclick = () => {
      window.location.hash = '#home';
      switchView('landing');
    };
  }

  if (btnAdmin) {
    btnAdmin.onclick = () => {
      const user = authStore.getUser();
      if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
        window.location.hash = '#admin';
        switchView('admin');
      } else {
        window.location.hash = '#login';
        switchView('login');
      }
    };
  }

  if (btnPartner) {
    btnPartner.onclick = () => {
      const user = authStore.getUser();
      if (user) {
        window.location.hash = '#partner';
        switchView('partner');
      } else {
        window.location.hash = '#login';
        switchView('login');
      }
    };
  }

  if (btnAuth) {
    btnAuth.onclick = () => {
      const user = authStore.getUser();
      if (user) {
        openLogoutConfirmationModal({
          triggerElement: btnAuth,
          onConfirmed: () => {
            window.location.hash = '#login';
          }
        });
      } else {
        window.location.hash = '#login';
        switchView('login');
      }
    };
  }
}

/**
 * Updates Floating Dock active state and label
 */
function updateDockState(view) {
  const dock = document.getElementById('platform-mode-dock');
  if (!dock) return;

  const btnLanding = document.getElementById('dock-btn-landing');
  const btnAdmin = document.getElementById('dock-btn-admin');
  const btnPartner = document.getElementById('dock-btn-partner');
  const btnAuth = document.getElementById('dock-btn-auth');

  [btnLanding, btnAdmin, btnPartner, btnAuth].forEach(b => b?.classList.remove('active'));

  if (view === 'landing') btnLanding?.classList.add('active');
  else if (view === 'admin') btnAdmin?.classList.add('active');
  else if (view === 'partner') btnPartner?.classList.add('active');
  else if (view === 'login') btnAuth?.classList.add('active');

  const user = authStore.getUser();
  if (btnAuth) {
    if (user) {
      btnAuth.innerHTML = `<i data-lucide="log-out"></i> <span>Sign Out</span>`;
      btnAuth.classList.add('text-danger');
    } else {
      btnAuth.innerHTML = `<i data-lucide="log-in"></i> <span>Sign In</span>`;
      btnAuth.classList.remove('text-danger');
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Updates Header Auth buttons in Landing Page navigation bar
 */
export function updateHeaderAuthActions() {
  const actionsContainer = document.querySelector('.site-header .header-actions');
  if (!actionsContainer) return;

  const user = authStore.getUser();
  const existingButtons = actionsContainer.querySelectorAll('.auth-nav-btn');
  existingButtons.forEach(b => b.remove());

  const loginBtn = document.getElementById('nav-portal-login-btn');
  const joinBtn = document.getElementById('nav-join-btn');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (joinBtn) joinBtn.style.display = 'none';

    // Create user portal button
    const portalBtn = document.createElement('a');
    portalBtn.className = 'btn btn-secondary btn-sm auth-nav-btn';
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      portalBtn.href = '#admin';
      portalBtn.style.borderColor = '#D4AF37';
      portalBtn.style.color = '#D4AF37';
      portalBtn.innerHTML = `<i data-lucide="shield-check"></i> <span>SUPER ADMIN ERP</span>`;
    } else {
      portalBtn.href = '#partner';
      portalBtn.style.borderColor = '#00F2FE';
      portalBtn.style.color = '#00F2FE';
      portalBtn.innerHTML = `<i data-lucide="user-check"></i> <span>PARTNER PORTAL</span>`;
    }

    // Create sign out button
    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'btn btn-sm auth-nav-btn';
    logoutBtn.id = 'nav-header-logout-btn';
    logoutBtn.style.background = 'rgba(239, 68, 68, 0.12)';
    logoutBtn.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    logoutBtn.style.color = '#EF4444';
    logoutBtn.innerHTML = `<i data-lucide="log-out"></i> <span>SIGN OUT</span>`;
    logoutBtn.onclick = () => {
      openLogoutConfirmationModal({ triggerElement: logoutBtn });
    };

    actionsContainer.insertBefore(logoutBtn, actionsContainer.querySelector('#mobile-toggle-btn') || actionsContainer.lastElementChild);
    actionsContainer.insertBefore(portalBtn, logoutBtn);
  } else {
    if (loginBtn) {
      loginBtn.style.display = 'inline-flex';
      loginBtn.onclick = () => {
        window.location.hash = '#login';
        switchView('login');
      };
    }
    if (joinBtn) joinBtn.style.display = 'inline-flex';
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Initializes Public Landing Page components once
 */
function initLandingPage() {
  if (isLandingInitialized) return;
  isLandingInitialized = true;

  // 1. 3D Hero
  const heroCanvas = document.getElementById('hero-3d-canvas');
  if (heroCanvas) {
    hero3DInstance = initHero3D(heroCanvas);
  }

  // 2. Featured Projects Showcase with 3D Tilt
  const showcaseMount = document.getElementById('projects-container');
  if (showcaseMount) {
    showcaseInstance = initProjectShowcase(showcaseMount, (action, data) => {
      if (action === 'project-detail' && data?.slug) {
        window.location.hash = `#projects/${data.slug}`;
      } else if (action === 'promote-project') {
        const user = authStore.getUser();
        if (user) {
          window.location.hash = '#partner';
        } else {
          window.location.hash = '#login';
        }
      }
    }, platformStore.currency);
  }

  // 3. Commission Calculator
  const calcMount = document.getElementById('calc-container');
  if (calcMount) {
    calcInstance = initCommissionCalculator(calcMount, platformStore.currency);
  }

  // 4. Network Graph
  const networkMount = document.getElementById('network-graph-canvas');
  if (networkMount) {
    initNetworkGraph(networkMount, document.getElementById('network-tooltip'));
  }

  // 5. Dashboard Preview
  const previewMount = document.getElementById('dashboard-preview-container');
  if (previewMount) {
    previewInstance = initDashboardPreview(previewMount, platformStore.currency);
  }

  // 6. Marketing Toolkit
  const toolkitMount = document.getElementById('marketing-toolkit-container');
  if (toolkitMount) {
    initMarketingToolkit(toolkitMount);
  }

  // 7. FAQ Accordion
  const faqMount = document.getElementById('faq-accordion-container');
  if (faqMount) {
    initFAQ(faqMount);
  }

  // 8. Affiliate Registration Form
  const regForm = document.getElementById('affiliate-registration-form');
  const regSuccess = document.getElementById('registration-success-card');
  if (regForm) {
    initRegistrationForm(regForm, regSuccess);
  }

  // 9. Global Currency Picker
  const currPicker = document.getElementById('global-currency-picker');
  if (currPicker) {
    currPicker.value = platformStore.currency;
    currPicker.addEventListener('change', (e) => {
      platformStore.setCurrency(e.target.value);
      if (showcaseInstance) showcaseInstance.setCurrency(e.target.value);
    });
  }

  // 10. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  updateHeaderAuthActions();
}

/**
 * Evaluates current URL and state to route smoothly
 */
export function evaluateRouting() {
  const rawHash = window.location.hash || '';
  const rawPath = window.location.pathname || '';

  const cleanHash = rawHash.replace(/^#/, '').split('?')[0].replace(/\/+$/, '').trim();
  const cleanPath = rawPath.split('?')[0].replace(/\/+$/, '').trim();

  // Root or Home hash -> Landing page
  if (!cleanHash || cleanHash === 'home' || cleanHash === 'hero' || cleanHash === 'projects-section') {
    switchView('landing');
    return;
  }

  // Login / Auth view
  if (cleanHash === 'login' || cleanHash === 'auth') {
    switchView('login');
    return;
  }

  // Admin ERP route
  if (cleanHash === 'admin' || cleanHash.startsWith('admin/')) {
    const user = authStore.getUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      window.location.hash = '#login';
      switchView('login');
    } else {
      switchView('admin');
    }
    return;
  }

  // Partner Portal route
  if (cleanHash === 'partner' || cleanHash.startsWith('partner/')) {
    const user = authStore.getUser();
    if (!user) {
      window.location.hash = '#login';
      switchView('login');
    } else {
      switchView('partner');
    }
    return;
  }

  // Legal documentation routes
  if (['terms', 'terms-and-conditions', 'agreement', 'affiliate-agreement', 'privacy', 'privacy-policy', 'commission-policy', 'referral-policy', 'disclaimer'].includes(cleanHash)) {
    let docKey = 'terms';
    if (cleanHash.includes('agreement')) docKey = 'agreement';
    else if (cleanHash.includes('privacy')) docKey = 'privacy';
    else if (cleanHash.includes('commission')) docKey = 'commission';
    else if (cleanHash.includes('referral')) docKey = 'referral';
    else if (cleanHash.includes('disclaimer')) docKey = 'disclaimer';
    switchView('legal', { docKey });
    return;
  }

  // Public Subpage routes
  if (cleanHash === 'contact') {
    switchView('contact');
    return;
  }
  if (cleanHash === 'affiliate-program') {
    switchView('affiliate-program');
    return;
  }
  if (cleanHash === 'commission') {
    switchView('commission');
    return;
  }
  if (cleanHash === 'how-it-works') {
    switchView('how-it-works');
    return;
  }
  if (cleanHash === 'about') {
    switchView('about');
    return;
  }
  if (cleanHash === 'projects') {
    switchView('projects');
    return;
  }
  if (cleanHash.startsWith('projects/') || cleanHash.startsWith('project/')) {
    const projId = cleanHash.replace(/^(projects|project)\//, '').trim();
    switchView('project-detail', { projectId: projId });
    return;
  }
  if (cleanHash === 'resources' || cleanHash === 'blog') {
    switchView('resources');
    return;
  }
  if (cleanHash.startsWith('resources/') || cleanHash.startsWith('blog/')) {
    const slug = cleanHash.replace(/^(resources|blog)\//, '').trim();
    switchView('resource-article', { slug });
    return;
  }

  // Default fallback: Landing page
  switchView('landing');
}

/**
 * Universal View Switcher & Coordinator
 */
export function switchView(targetView, params = {}) {
  currentView = targetView;

  const landingWrap = document.getElementById('landing-page-wrap');
  const portalRoot = document.getElementById('portal-app-root');
  const legalRoot = document.getElementById('legal-page-root');
  const contactRoot = document.getElementById('contact-page-root');
  const seoRoot = document.getElementById('seo-page-root');

  // Hide all containers
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

  updateDockState(targetView);

  // 1. Landing Page (Home)
  if (targetView === 'landing') {
    if (landingWrap) landingWrap.style.display = 'block';
    initLandingPage();
    updateHeaderAuthActions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // 2. Login Page
  if (targetView === 'login') {
    if (portalRoot) {
      portalRoot.style.display = 'block';
      renderLoginPage(portalRoot, (authenticatedUser) => {
        if (authenticatedUser.role === 'SUPER_ADMIN' || authenticatedUser.role === 'ADMIN') {
          window.location.hash = '#admin';
          switchView('admin');
        } else {
          window.location.hash = '#partner';
          switchView('partner');
        }
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // 3. Super Admin ERP
  if (targetView === 'admin') {
    const user = authStore.getUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      window.location.hash = '#login';
      switchView('login');
      return;
    }
    if (portalRoot) {
      portalRoot.style.display = 'block';
      initAdminPortal(
        portalRoot,
        null,
        () => {
          window.location.hash = '#partner';
          switchView('partner');
        }
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // 4. Partner Portal
  if (targetView === 'partner') {
    const user = authStore.getUser();
    if (!user) {
      window.location.hash = '#login';
      switchView('login');
      return;
    }
    if (portalRoot) {
      portalRoot.style.display = 'block';
      initAffiliatePortal(
        portalRoot,
        null,
        () => {
          if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
            window.location.hash = '#admin';
            switchView('admin');
          }
        }
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // 5. Legal View
  if (targetView === 'legal') {
    if (legalRoot) {
      legalRoot.style.display = 'block';
      renderLegalView(legalRoot, params.docKey || 'terms', () => {
        window.location.hash = '#home';
        switchView('landing');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // 6. Contact View
  if (targetView === 'contact') {
    if (contactRoot) {
      contactRoot.style.display = 'block';
      renderContactView(contactRoot, () => {
        window.location.hash = '#home';
        switchView('landing');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // 7. Public Modules
  if (targetView === 'projects') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderProjectsDirectoryView(seoRoot, () => {
        window.location.hash = '#home';
        switchView('landing');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (targetView === 'project-detail') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderProjectDetailView(seoRoot, params.projectId, () => {
        window.location.hash = '#projects';
        switchView('projects');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (targetView === 'about') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderAboutView(seoRoot, () => {
        window.location.hash = '#home';
        switchView('landing');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (targetView === 'how-it-works') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderHowItWorksView(seoRoot, () => {
        window.location.hash = '#home';
        switchView('landing');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (targetView === 'commission') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderCommissionView(seoRoot, () => {
        window.location.hash = '#home';
        switchView('landing');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (targetView === 'affiliate-program') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderAffiliateProgramView(seoRoot, () => {
        window.location.hash = '#home';
        switchView('landing');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (targetView === 'resources') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderResourcesHubView(seoRoot, () => {
        window.location.hash = '#home';
        switchView('landing');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (targetView === 'resource-article') {
    if (seoRoot) {
      seoRoot.style.display = 'block';
      renderResourceArticleView(seoRoot, params.slug, () => {
        window.location.hash = '#resources';
        switchView('resources');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Fallback 404
  if (seoRoot) {
    seoRoot.style.display = 'block';
    renderNotFoundView(seoRoot, () => {
      window.location.hash = '#home';
      switchView('landing');
    });
  }
}
