// Dedicated Projects Directory View Component (/projects)
// PropPartner Real Estate Network

import { initialProjects, formatCurrency } from '../../data/projectsData.js';
import { updateSEO, seoRoutes, buildBreadcrumbSchema } from '../../utils/seoManager.js';

export function renderProjectsDirectoryView(container, onNavigateHome, onSelectProject, onRegister) {
  updateSEO({
    title: seoRoutes.projects.title,
    description: seoRoutes.projects.description,
    canonical: seoRoutes.projects.canonical,
    ogType: seoRoutes.projects.ogType,
    keywords: seoRoutes.projects.keywords,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Projects Directory', url: '/projects' }
      ])
    ]
  });

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="proj-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.jpg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-proj-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
            <button type="button" class="btn btn-gold btn-sm" id="btn-proj-cta-top">
              <i data-lucide="user-plus"></i> <span>Become an Affiliate</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-proj-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">Flagship Real Estate Developments</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="legal-main-container container">
        <!-- Hero Section -->
        <div class="contact-hero-banner glass-card" style="text-align: left; padding: 48px;">
          <span class="doc-category-badge"><i data-lucide="building-2"></i> VERIFIED DEVELOPMENTS</span>
          <h1 class="contact-main-title" style="font-size: clamp(2rem, 3.5vw, 3rem); margin: 12px 0;">
            Flagship Real Estate <span class="gradient-text-gold">Developments</span>
          </h1>
          <p class="contact-lead-text" style="margin: 0 0 24px 0; max-width: 800px; font-size: 1.1rem;">
            Explore verified luxury residential towers, private waterfront beachfront villas, and commercial grade-A hubs open for affiliate partner referrals.
          </p>

          <!-- AEO Direct Answer Callout Box -->
          <div class="aeo-answer-card glass-card">
            <div class="aeo-badge"><i data-lucide="help-circle"></i> DIRECT ANSWER</div>
            <h3 class="aeo-question">What Real Estate Projects Are Available in PropPartner?</h3>
            <p class="aeo-text">
              PropPartner represents 5 premier verified developments spanning luxury residential towers, beachfront private island villas, and commercial financial hubs: <strong>The Luminary Sky Residences</strong> (3.5% commission), <strong>Elysium Waterfront Villas</strong> (4.5% commission), <strong>Nexus Commercial Horizon</strong> (3.8% commission), <strong>Crescent Bay Luxury Suites</strong> (3.2% commission), and <strong>Marina Enclave</strong> (4.0% commission).
            </p>
          </div>
        </div>

        <!-- Projects Grid -->
        <section class="seo-content-section" style="margin-top: 48px;">
          <div class="projects-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px;">
            ${initialProjects.map(proj => `
              <div class="project-card glass-card" style="display: flex; flex-direction: column; overflow: hidden; border-radius: 18px;">
                <div class="project-img-wrap" style="position: relative; height: 220px; overflow: hidden;">
                  <img src="${proj.image}" alt="${proj.name} — ${proj.type}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" loading="lazy">
                  <span class="project-badge" style="position: absolute; top: 12px; left: 12px; font-size: 0.72rem; padding: 4px 10px; border-radius: 20px; background: rgba(6, 9, 14, 0.85); border: 1px solid var(--gold-light); color: var(--gold-light); font-weight: 700;">
                    ${proj.badge || 'Verified Flagship'}
                  </span>
                  <span class="project-comm-tag" style="position: absolute; bottom: 12px; right: 12px; font-size: 0.78rem; padding: 4px 10px; border-radius: 20px; background: rgba(0, 242, 254, 0.2); border: 1px solid #00F2FE; color: #00F2FE; font-weight: 800;">
                    ${proj.commissionRate}% Commission
                  </span>
                </div>

                <div class="project-card-body" style="padding: 24px; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
                  <div>
                    <span class="text-muted text-xs"><i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline-block;"></i> ${proj.location} • ${proj.city}</span>
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: #FFFFFF; margin: 6px 0 8px 0;">${proj.name}</h3>
                    <p class="text-muted text-xs" style="line-height: 1.5; margin-bottom: 16px;">${proj.tagline}</p>

                    <div class="contact-line-item" style="padding: 6px 0;">
                      <span class="line-label">Starting Price:</span>
                      <span class="line-val"><strong class="text-green">${formatCurrency(proj.startingPrice, 'PKR')}</strong></span>
                    </div>
                    <div class="contact-line-item" style="padding: 6px 0;">
                      <span class="line-label">Available Inventory:</span>
                      <span class="line-val"><strong>${proj.availableUnits} of ${proj.totalUnits} Units</strong></span>
                    </div>
                  </div>

                  <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button type="button" class="btn btn-gold btn-sm w-full btn-view-proj-detail" data-proj-id="${proj.id}">
                      <i data-lucide="eye"></i> <span>View Project Specs</span>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Conversion CTA Banner -->
        <div class="contact-hero-banner glass-card" style="margin-top: 60px; text-align: center;">
          <h2 class="contact-main-title" style="font-size: 2.2rem;">Ready to Promote These Developments?</h2>
          <p class="contact-lead-text" style="max-width: 600px; margin: 12px auto 24px auto;">
            Access 3D virtual models, floor plans, and unique referral links by creating your affiliate partner account.
          </p>
          <button type="button" class="btn btn-gold btn-lg" id="btn-proj-bottom-register">
            <i data-lucide="user-plus"></i> <span>JOIN AFFILIATE NETWORK</span>
          </button>
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

  container.querySelector('#proj-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#btn-proj-back-home')?.addEventListener('click', goHome);
  container.querySelector('#crumb-proj-home')?.addEventListener('click', goHome);

  const handleRegister = () => {
    if (onRegister) onRegister();
  };

  container.querySelector('#btn-proj-cta-top')?.addEventListener('click', handleRegister);
  container.querySelector('#btn-proj-bottom-register')?.addEventListener('click', handleRegister);

  container.querySelectorAll('.btn-view-proj-detail').forEach(btn => {
    btn.onclick = () => {
      const pId = btn.dataset.projId;
      if (onSelectProject) onSelectProject(pId);
    };
  });
}
