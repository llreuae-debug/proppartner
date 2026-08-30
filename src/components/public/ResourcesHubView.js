// Dedicated Educational Resources & Knowledge Hub View Component (/resources)
// PropPartner Real Estate Network

import { educationalResourceClusters } from '../../data/seoContentData.js';
import { updateSEO, seoRoutes, buildBreadcrumbSchema } from '../../utils/seoManager.js';

export function renderResourcesHubView(container, onNavigateHome, onSelectArticle, onRegister) {
  updateSEO({
    title: seoRoutes.resources.title,
    description: seoRoutes.resources.description,
    canonical: seoRoutes.resources.canonical,
    ogType: seoRoutes.resources.ogType,
    keywords: seoRoutes.resources.keywords,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Resource Center', url: '/resources' }
      ])
    ]
  });

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="res-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.svg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-res-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
            <button type="button" class="btn btn-gold btn-sm" id="btn-res-cta-top">
              <i data-lucide="user-plus"></i> <span>Join as Affiliate</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-res-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">Affiliate Knowledge Hub & Playbooks</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="legal-main-container container">
        <!-- Hero Section -->
        <div class="contact-hero-banner glass-card" style="text-align: left; padding: 48px;">
          <span class="doc-category-badge"><i data-lucide="book-open"></i> EDUCATIONAL PLAYBOOKS</span>
          <h1 class="contact-main-title" style="font-size: clamp(2rem, 3.5vw, 3rem); margin: 12px 0;">
            Real Estate Affiliate <span class="gradient-text-gold">Knowledge Center</span>
          </h1>
          <p class="contact-lead-text" style="margin: 0 0 24px 0; max-width: 800px; font-size: 1.1rem;">
            In-depth strategic guides, referral marketing frameworks, lead qualification playbooks, and commission settlement guides for property consultants and partners.
          </p>

          <!-- AEO Direct Answer Callout Box -->
          <div class="aeo-answer-card glass-card">
            <div class="aeo-badge"><i data-lucide="help-circle"></i> DIRECT ANSWER</div>
            <h3 class="aeo-question">What Can I Learn in the PropPartner Resource Center?</h3>
            <p class="aeo-text">
              The PropPartner Resource Center provides 10 comprehensive, peer-reviewed educational guides spanning three core topical clusters: Real Estate Affiliate Program Fundamentals, Referral Lead Generation & Sourcing Tactics, and Milestone Commission Calculations & Tax Compliance.
            </p>
          </div>
        </div>

        <!-- Topical Clusters Loop -->
        <div class="resource-clusters-wrap" style="display: flex; flex-direction: column; gap: 48px; margin-top: 48px;">
          ${educationalResourceClusters.map(cluster => `
            <section class="seo-content-section">
              <div class="section-header-left" style="margin-bottom: 20px;">
                <span class="section-eyebrow"><i data-lucide="folder"></i> TOPICAL CLUSTER</span>
                <h2 style="font-size: 1.6rem; font-weight: 800; color: #FFFFFF; margin: 6px 0 4px 0;">${cluster.clusterName}</h2>
                <p class="text-muted text-xs" style="font-size: 0.9rem;">${cluster.clusterDescription}</p>
              </div>

              <div class="articles-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${cluster.articles.map(art => `
                  <article class="article-card glass-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; border-radius: 16px;">
                    <div>
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span class="doc-category-badge" style="margin: 0; font-size: 0.65rem;">${art.category}</span>
                        <span class="text-muted text-xs"><i data-lucide="clock" style="width: 12px; height: 12px; display: inline-block;"></i> ${art.readTime}</span>
                      </div>
                      <h3 style="font-size: 1.15rem; font-weight: 800; color: #FFFFFF; margin-bottom: 8px; line-height: 1.4;">${art.title}</h3>
                      <p class="text-muted text-xs" style="line-height: 1.6; margin-bottom: 16px;">${art.summary}</p>
                    </div>

                    <button type="button" class="btn btn-secondary btn-sm w-full btn-read-article" data-article-slug="${art.slug}">
                      <span>Read Complete Guide</span> <i data-lucide="arrow-right"></i>
                    </button>
                  </article>
                `).join('')}
              </div>
            </section>
          `).join('')}
        </div>

        <!-- CTA Banner -->
        <div class="contact-hero-banner glass-card" style="margin-top: 60px; text-align: center;">
          <h2 class="contact-main-title" style="font-size: 2.2rem;">Ready to Put These Strategies Into Action?</h2>
          <p class="contact-lead-text" style="max-width: 600px; margin: 12px auto 24px auto;">
            Apply for your free affiliate partner account and access all 3D marketing kits and tracking tools immediately.
          </p>
          <button type="button" class="btn btn-gold btn-lg" id="btn-res-bottom-register">
            <i data-lucide="user-plus"></i> <span>CREATE FREE AFFILIATE ACCOUNT</span>
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

  container.querySelector('#res-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#btn-res-back-home')?.addEventListener('click', goHome);
  container.querySelector('#crumb-res-home')?.addEventListener('click', goHome);

  const handleRegister = () => {
    if (onRegister) onRegister();
  };

  container.querySelector('#btn-res-cta-top')?.addEventListener('click', handleRegister);
  container.querySelector('#btn-res-bottom-register')?.addEventListener('click', handleRegister);

  container.querySelectorAll('.btn-read-article').forEach(btn => {
    btn.onclick = () => {
      const slug = btn.dataset.articleSlug;
      if (onSelectArticle) onSelectArticle(slug);
    };
  });
}
