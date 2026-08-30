// Dedicated Individual Educational Article View Component (/resources/:slug)
// PropPartner Real Estate Network

import { educationalResourceClusters } from '../../data/seoContentData.js';
import { updateSEO, buildBreadcrumbSchema, buildArticleSchema } from '../../utils/seoManager.js';

export function renderResourceArticleView(container, articleSlug = 'what-is-a-real-estate-affiliate-program', onNavigateHome, onNavigateResources, onSelectArticle, onRegister) {
  let foundArticle = null;
  let foundCluster = null;

  for (const cluster of educationalResourceClusters) {
    const art = cluster.articles.find(a => a.slug === articleSlug);
    if (art) {
      foundArticle = art;
      foundCluster = cluster;
      break;
    }
  }

  if (!foundArticle) {
    foundArticle = educationalResourceClusters[0].articles[0];
    foundCluster = educationalResourceClusters[0];
  }

  updateSEO({
    title: `${foundArticle.title} | PropPartner Knowledge Hub`,
    description: foundArticle.summary,
    canonical: `https://proppartner.pro/resources/${foundArticle.slug}`,
    ogType: 'article',
    keywords: `${foundArticle.title}, real estate affiliate marketing, property referral guide`,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Resource Center', url: '/resources' },
        { name: foundArticle.title, url: `/resources/${foundArticle.slug}` }
      ]),
      buildArticleSchema({
        title: foundArticle.title,
        description: foundArticle.summary,
        url: `/resources/${foundArticle.slug}`,
        datePublished: foundArticle.datePublished,
        author: foundArticle.author
      })
    ]
  });

  const otherArticles = foundCluster.articles.filter(a => a.slug !== foundArticle.slug);

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="art-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.jpg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-art-back-hub">
              <i data-lucide="arrow-left"></i> <span>All Guides</span>
            </button>
            <button type="button" class="btn btn-gold btn-sm" id="btn-art-cta-top">
              <i data-lucide="user-plus"></i> <span>Become an Affiliate</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-art-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <a href="#resources" id="crumb-art-resources">Resources</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">${foundArticle.title}</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="legal-main-container container">
        <div class="legal-grid-layout">
          <!-- Left Sidebar Navigation -->
          <aside class="legal-sidebar glass-card">
            <div class="legal-sidebar-header">
              <i data-lucide="folder" class="text-gold"></i>
              <h4>${foundCluster.clusterName}</h4>
            </div>

            <nav class="legal-nav-menu">
              ${foundCluster.articles.map(a => {
                const isActive = a.slug === foundArticle.slug;
                return `
                  <button type="button" class="legal-nav-item ${isActive ? 'active' : ''} btn-switch-cluster-art" data-art-slug="${a.slug}">
                    <i data-lucide="file-text"></i>
                    <span>${a.title}</span>
                  </button>
                `;
              }).join('')}
            </nav>

            <div class="sidebar-desk-box glass-card" style="margin-top: 24px;">
              <strong style="font-size: 0.85rem; color: #FFFFFF;">Have Questions?</strong>
              <p class="text-muted text-xs" style="margin-top: 4px;">Connect with our affiliate desk for custom marketing kits and guidance.</p>
              <a href="#contact" class="btn btn-gold btn-xs w-full" style="margin-top: 10px;">
                <i data-lucide="phone"></i> Contact Affiliate Desk
              </a>
            </div>
          </aside>

          <!-- Main Article Body -->
          <article class="legal-article glass-card">
            <header class="doc-article-header">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <span class="doc-category-badge"><i data-lucide="bookmark"></i> ${foundArticle.category.toUpperCase()}</span>
                <span class="text-muted text-xs"><i data-lucide="clock" style="width: 12px; height: 12px; display: inline-block;"></i> ${foundArticle.readTime}</span>
              </div>
              <h1 class="doc-main-title">${foundArticle.title}</h1>
              <div class="doc-meta-row">
                <span>By <strong>${foundArticle.author}</strong></span>
                <span>• Published: <strong>${foundArticle.datePublished}</strong></span>
              </div>
              <p class="doc-summary-lead">${foundArticle.summary}</p>
            </header>

            <!-- AEO Direct Answer Callout Box -->
            <div class="aeo-answer-card glass-card" style="margin-bottom: 32px;">
              <div class="aeo-badge"><i data-lucide="help-circle"></i> DIRECT ANSWER (KEY TAKEAWAY)</div>
              <p class="aeo-text" style="font-weight: 500;">${foundArticle.directAnswer}</p>
            </div>

            <!-- Full Article Content -->
            <div class="doc-sections-body">
              ${foundArticle.content}
            </div>

            <!-- Next in Cluster Navigation -->
            ${otherArticles.length ? `
              <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);">
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--gold-light); margin-bottom: 16px;">Related Guides in this Cluster:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
                  ${otherArticles.map(oa => `
                    <button type="button" class="btn btn-secondary btn-sm btn-switch-cluster-art" data-art-slug="${oa.slug}" style="text-align: left; padding: 12px; justify-content: flex-start;">
                      <i data-lucide="file-text"></i> <span style="font-size: 0.8rem;">${oa.title}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Footer Signoff -->
            <footer class="doc-article-footer">
              <div class="doc-pagination-row">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-art-back-bottom">
                  <i data-lucide="arrow-left"></i> Return to Knowledge Center
                </button>
                <button type="button" class="btn btn-gold btn-sm" id="btn-art-register-bottom">
                  <i data-lucide="user-plus"></i> Join PropPartner Network
                </button>
              </div>
            </footer>
          </article>
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

  const goResources = (e) => {
    if (e) e.preventDefault();
    if (onNavigateResources) onNavigateResources();
  };

  container.querySelector('#art-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#crumb-art-home')?.addEventListener('click', goHome);
  container.querySelector('#btn-art-back-hub')?.addEventListener('click', goResources);
  container.querySelector('#btn-art-back-bottom')?.addEventListener('click', goResources);
  container.querySelector('#crumb-art-resources')?.addEventListener('click', goResources);

  const handleRegister = () => {
    if (onRegister) onRegister();
  };

  container.querySelector('#btn-art-cta-top')?.addEventListener('click', handleRegister);
  container.querySelector('#btn-art-register-bottom')?.addEventListener('click', handleRegister);

  container.querySelectorAll('.btn-switch-cluster-art').forEach(btn => {
    btn.onclick = () => {
      const slug = btn.dataset.artSlug;
      if (onSelectArticle) onSelectArticle(slug);
    };
  });
}
