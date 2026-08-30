// Custom 404 Page View Component (/404)
// PropPartner Real Estate Network

import { updateSEO, seoRoutes } from '../../utils/seoManager.js';

export function renderNotFoundView(container, onNavigateHome, onNavigateProjects, onRegister) {
  updateSEO({
    title: seoRoutes.notFound.title,
    description: seoRoutes.notFound.description,
    canonical: seoRoutes.notFound.canonical,
    noindex: true
  });

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="nf-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.svg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-nf-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Content Container -->
      <main class="legal-main-container container" style="display: flex; align-items: center; justify-content: center; min-height: 60vh;">
        <div class="contact-hero-banner glass-card" style="max-width: 680px; text-align: center; padding: 48px 36px;">
          <div class="doc-category-badge" style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); color: #EF4444;">
            <i data-lucide="alert-triangle"></i> ERROR 404
          </div>
          <h1 class="contact-main-title" style="font-size: 2.6rem; margin: 16px 0 8px 0;">Page Not Found</h1>
          <p class="contact-lead-text" style="margin-bottom: 28px;">
            The requested page or URL destination may have moved or is no longer available. You can navigate back to the homepage or explore our verified real estate developments below.
          </p>

          <div class="contact-quick-actions-row">
            <a href="#hero" class="btn btn-gold btn-lg" id="btn-nf-home-cta">
              <i data-lucide="home"></i> <span>BACK TO HOMEPAGE</span>
            </a>
            <a href="#projects" class="btn btn-secondary btn-lg" id="btn-nf-proj-cta">
              <i data-lucide="building"></i> <span>EXPLORE PROJECTS</span>
            </a>
            <button type="button" class="btn btn-secondary btn-lg" id="btn-nf-reg-cta">
              <i data-lucide="user-plus"></i> <span>BECOME AN AFFILIATE</span>
            </button>
          </div>
        </div>
      </main>

      <!-- Legal Page Footer -->
      <footer class="legal-page-footer">
        <div class="container footer-bottom-bar">
          <span>© 2026 PropPartner Real Estate Affiliate Network. All rights reserved.</span>
          <div class="footer-legal-inline">
            <a href="#terms-and-conditions" class="btn-text-link">Terms</a> •
            <a href="#affiliate-agreement" class="btn-text-link">Agreement</a> •
            <a href="#privacy-policy" class="btn-text-link">Privacy</a> •
            <a href="#commission-policy" class="btn-text-link">Commissions</a> •
            <a href="#referral-policy" class="btn-text-link">Referrals</a> •
            <a href="#disclaimer" class="btn-text-link">Disclaimer</a>
          </div>
        </div>
      </footer>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const goHome = (e) => {
    if (e) e.preventDefault();
    if (onNavigateHome) onNavigateHome();
  };

  const goProjects = (e) => {
    if (e) e.preventDefault();
    if (onNavigateProjects) onNavigateProjects();
  };

  container.querySelector('#nf-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#btn-nf-back-home')?.addEventListener('click', goHome);
  container.querySelector('#btn-nf-home-cta')?.addEventListener('click', goHome);
  container.querySelector('#btn-nf-proj-cta')?.addEventListener('click', goProjects);

  container.querySelector('#btn-nf-reg-cta')?.addEventListener('click', () => {
    if (onRegister) onRegister();
  });
}
