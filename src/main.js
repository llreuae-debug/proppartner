// Main Application Coordinator & Orchestrator - PropPartner Private Authenticated ERP & Partner Portal

import { createIcons, icons } from 'lucide';
import { initialProjects } from './data/projectsData.js';

// Enterprise Platform & Auth Stores
import { authStore } from './store/authStore.js';
import { platformStore } from './store/platformStore.js';
import { renderLoginPage } from './components/auth/LoginPage.js';
import { initAdminPortal } from './components/admin/AdminPortal.js';
import { initAffiliatePortal } from './components/affiliate/AffiliatePortal.js';
import { ReferralTracker } from './utils/referralTracker.js';

// Global state
let currentView = 'login'; // 'login' | 'admin' | 'partner'

// Expose lucide globally for components
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

  // 2. Hide any public landing elements by default (Enforcing Private Authenticated Application)
  const landingWrap = document.getElementById('landing-page-wrap');
  if (landingWrap) landingWrap.style.display = 'none';

  const dock = document.getElementById('platform-mode-dock');
  if (dock) dock.style.display = 'none';

  // 3. Evaluate Authentication & Route
  evaluateRouting();

  window.addEventListener('hashchange', evaluateRouting);
  window.addEventListener('popstate', evaluateRouting);

  // Subscribe to auth store changes
  authStore.subscribe(() => {
    evaluateRouting();
  });
});

/**
 * Evaluates session authentication state and directs user to their authorized portal or private login
 */
export function evaluateRouting() {
  const portalRoot = document.getElementById('portal-app-root');
  if (!portalRoot) return;

  portalRoot.style.display = 'block';

  // Check if session is authenticated
  const user = authStore.getUser();

  if (!user) {
    // Unauthenticated: Always render Private Login Gateway
    currentView = 'login';
    renderLoginPage(portalRoot, (authenticatedUser) => {
      if (authenticatedUser.role === 'SUPER_ADMIN' || authenticatedUser.role === 'ADMIN') {
        window.location.hash = '#admin';
        switchView('admin');
      } else {
        window.location.hash = '#partner';
        switchView('partner');
      }
    });
    return;
  }

  // Authenticated: Route according to role or authorized hash
  const hash = window.location.hash || '';

  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    if (hash === '#partner') {
      switchView('partner');
    } else {
      switchView('admin');
    }
  } else {
    // Partner role: Strictly isolated to Partner Portal
    switchView('partner');
  }
}

/**
 * Switch View Coordinator
 */
export function switchView(targetView, params = {}) {
  currentView = targetView;
  const portalRoot = document.getElementById('portal-app-root');
  if (!portalRoot) return;

  portalRoot.innerHTML = '';
  portalRoot.style.display = 'block';

  const user = authStore.getUser();

  if (!user) {
    evaluateRouting();
    return;
  }

  if (targetView === 'admin') {
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      // Forbidden: Partner cannot access Admin ERP
      switchView('partner');
      return;
    }
    window.location.hash = '#admin';
    initAdminPortal(
      portalRoot,
      null,
      () => switchView('partner')
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (targetView === 'partner') {
    window.location.hash = '#partner';
    initAffiliatePortal(
      portalRoot,
      null,
      () => {
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
          switchView('admin');
        }
      }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
