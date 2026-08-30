// Dedicated Individual Project Detail SEO Component (/projects/:id)
// PropPartner Real Estate Network

import { initialProjects, formatCurrency } from '../../data/projectsData.js';
import { updateSEO, buildBreadcrumbSchema, buildProjectSchema, buildFAQSchema } from '../../utils/seoManager.js';

export function renderProjectDetailView(container, projectId = 'luminary-towers', onNavigateHome, onNavigateProjects, onRegister) {
  const project = initialProjects.find(p => p.id === projectId) || initialProjects[0];

  const projectFaqs = [
    {
      q: `What is the commission rate for referring buyers to ${project.name}?`,
      a: `Affiliate partners earn ${project.commissionRate}% milestone commission on verified sales of ${project.name}, disbursed in 4 verified stages upon escrow clearance.`
    },
    {
      q: `What is the starting price and unit inventory for ${project.name}?`,
      a: `Units at ${project.name} start at ${formatCurrency(project.startingPrice, 'PKR')}, with ${project.availableUnits} of ${project.totalUnits} units currently available for partner referral.`
    },
    {
      q: `When is the scheduled completion date for ${project.name}?`,
      a: `${project.name} is currently ${project.status} with target completion scheduled for ${project.completionDate}.`
    }
  ];

  updateSEO({
    title: `${project.name} | Real Estate Project | PropPartner`,
    description: `${project.tagline}. Located in ${project.location}, ${project.city}. Available for affiliate partner referrals with ${project.commissionRate}% commission.`,
    canonical: `https://proppartner.pro/projects/${project.id}`,
    ogType: 'article',
    ogImage: project.image,
    keywords: `${project.name}, ${project.type}, ${project.city} real estate, property referral ${project.name}, affiliate commission ${project.commissionRate}%`,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Projects', url: '/projects' },
        { name: project.name, url: `/projects/${project.id}` }
      ]),
      buildProjectSchema(project),
      buildFAQSchema(projectFaqs)
    ]
  });

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="pdetail-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.svg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-pdetail-back-projects">
              <i data-lucide="arrow-left"></i> <span>All Projects</span>
            </button>
            <button type="button" class="btn btn-gold btn-sm" id="btn-pdetail-cta-top">
              <i data-lucide="user-plus"></i> <span>Refer This Project</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-pdetail-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <a href="#projects" id="crumb-pdetail-projects">Projects</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">${project.name}</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="legal-main-container container">
        <!-- Project Hero Card -->
        <div class="contact-card glass-card" style="padding: 0; overflow: hidden; border-radius: 24px;">
          <div class="project-hero-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 0;">
            <!-- Main Featured Image -->
            <div style="position: relative; min-height: 380px;">
              <img src="${project.image}" alt="${project.name} — ${project.type}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
              <span class="project-badge" style="position: absolute; top: 20px; left: 20px; font-size: 0.8rem; padding: 6px 14px; border-radius: 20px; background: rgba(6, 9, 14, 0.88); border: 1px solid var(--gold-light); color: var(--gold-light); font-weight: 800;">
                ${project.badge || 'Verified Development'}
              </span>
            </div>

            <!-- Project Details Column -->
            <div style="padding: 36px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span class="doc-category-badge"><i data-lucide="building"></i> ${project.type.toUpperCase()}</span>
                <h1 style="font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; color: #FFFFFF; margin: 10px 0 6px 0;">${project.name}</h1>
                <p class="text-muted text-xs" style="font-size: 0.88rem; margin-bottom: 20px;"><i data-lucide="map-pin" style="width:14px; height:14px; display:inline-block;"></i> ${project.location}, ${project.city}</p>
                <p style="color: #CBD5E1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px;">${project.tagline}</p>

                <div class="contact-line-item">
                  <span class="line-label">Starting Price:</span>
                  <span class="line-val"><strong class="text-green" style="font-size: 1.15rem;">${formatCurrency(project.startingPrice, 'PKR')}</strong></span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Partner Commission:</span>
                  <span class="line-val"><strong class="text-cyan" style="font-size: 1.15rem;">${project.commissionRate}% Milestone Rate</strong></span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Available Inventory:</span>
                  <span class="line-val"><strong>${project.availableUnits} / ${project.totalUnits} Units</strong></span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Construction Status:</span>
                  <span class="line-val"><strong>${project.status} (${project.completionDate})</strong></span>
                </div>
              </div>

              <div style="margin-top: 28px;">
                <button type="button" class="btn btn-gold btn-lg w-full" id="btn-pdetail-action-register">
                  <i data-lucide="share-2"></i> <span>GET REFERRAL LINK FOR THIS PROJECT</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Project Highlights & AEO Summary -->
        <div class="contact-grid-2" style="margin-top: 36px;">
          <!-- Left: Key Architectural Highlights -->
          <div class="contact-card glass-card">
            <h3 class="contact-card-title"><i data-lucide="check-circle" class="text-gold"></i> Project Key Highlights</h3>
            <ul style="padding-left: 20px; display: flex; flex-direction: column; gap: 12px; margin-top: 16px; font-size: 0.92rem; color: #CBD5E1;">
              ${(project.highlights || []).map(h => `
                <li><strong>${h}</strong></li>
              `).join('')}
            </ul>

            <div style="margin-top: 24px;">
              <span class="text-muted text-xs">Target Buyer Audience:</span>
              <p style="color: #FFFFFF; font-size: 0.88rem; margin-top: 4px;"><strong>${project.targetAudience || 'High-Net-Worth Investors & Expatriates'}</strong></p>
            </div>
          </div>

          <!-- Right: AEO Fact Sheet -->
          <div class="contact-card glass-card">
            <div class="doc-category-badge"><i data-lucide="help-circle"></i> AEO DIRECT ENTITY SUMMARY</div>
            <h3 style="font-size: 1.2rem; font-weight: 800; margin: 12px 0 8px 0;">Affiliate Opportunity Overview</h3>
            <p class="section-text-content" style="font-size: 0.88rem;">
              <strong>${project.name}</strong> is an authorized flagship development in the PropPartner affiliate network. Registered affiliates receive unique 3D virtual tour embed links and marketing collateral. When a referred buyer completes contract execution and escrow deposit, the affiliate receives an approved ${project.commissionRate}% performance fee disbursed across 4 construction milestones.
            </p>
          </div>
        </div>

        <!-- Project FAQs -->
        <section class="seo-content-section" style="margin-top: 48px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="help-circle"></i> PROJECT FAQS</span>
            <h2 class="section-title">${project.name} Partner FAQs</h2>
          </div>

          <div class="faq-accordion-wrap" style="margin-top: 28px; max-width: 860px; margin-left: auto; margin-right: auto;">
            ${projectFaqs.map(faq => `
              <div class="faq-item glass-card" style="margin-bottom: 14px; padding: 22px;">
                <h3 class="faq-question" style="font-size: 1.05rem; font-weight: 700; color: #FFFFFF; display: flex; align-items: center; gap: 10px;">
                  <i data-lucide="help-circle" class="text-gold" style="width: 20px; height: 20px; flex-shrink:0;"></i>
                  ${faq.q}
                </h3>
                <p class="faq-answer" style="color: #94A3B8; font-size: 0.92rem; line-height: 1.7; margin-top: 10px; padding-left: 30px;">
                  ${faq.a}
                </p>
              </div>
            `).join('')}
          </div>
        </section>
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

  container.querySelector('#pdetail-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#crumb-pdetail-home')?.addEventListener('click', goHome);
  container.querySelector('#btn-pdetail-back-projects')?.addEventListener('click', goProjects);
  container.querySelector('#crumb-pdetail-projects')?.addEventListener('click', goProjects);

  const handleRegister = () => {
    if (onRegister) onRegister();
  };

  container.querySelector('#btn-pdetail-cta-top')?.addEventListener('click', handleRegister);
  container.querySelector('#btn-pdetail-action-register')?.addEventListener('click', handleRegister);
}
