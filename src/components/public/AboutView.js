// Dedicated About Us View Component (/about)
// PropPartner Real Estate Network

import { aboutPageData } from '../../data/seoContentData.js';
import { updateSEO, seoRoutes, buildBreadcrumbSchema } from '../../utils/seoManager.js';

export function renderAboutView(container, onNavigateHome, onRegister) {
  const data = aboutPageData;

  updateSEO({
    title: seoRoutes.about.title,
    description: seoRoutes.about.description,
    canonical: seoRoutes.about.canonical,
    ogType: seoRoutes.about.ogType,
    keywords: seoRoutes.about.keywords,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'About PropPartner', url: '/about' }
      ])
    ]
  });

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="about-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.jpg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-about-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
            <button type="button" class="btn btn-gold btn-sm" id="btn-about-cta-top">
              <i data-lucide="user-plus"></i> <span>Join as Affiliate</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-about-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">About PropPartner</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="legal-main-container container">
        <!-- Hero Section -->
        <div class="contact-hero-banner glass-card" style="text-align: left; padding: 48px;">
          <span class="doc-category-badge"><i data-lucide="shield-check"></i> PROPPARTNER ENTITY OVERVIEW</span>
          <h1 class="contact-main-title" style="font-size: clamp(2rem, 3.5vw, 3rem); margin: 12px 0;">
            About <span class="gradient-text-gold">PropPartner</span>
          </h1>
          <p class="contact-lead-text" style="margin: 0 0 24px 0; max-width: 800px; font-size: 1.1rem;">
            ${data.subtitle}
          </p>

          <!-- AEO Direct Answer Callout Box -->
          <div class="aeo-answer-card glass-card">
            <div class="aeo-badge"><i data-lucide="help-circle"></i> DIRECT ANSWER</div>
            <h3 class="aeo-question">${data.directAnswer.question}</h3>
            <p class="aeo-text">${data.directAnswer.answer}</p>
          </div>
        </div>

        <!-- 4 Core Pillars -->
        <section class="seo-content-section" style="margin-top: 48px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="layers"></i> OUR FOUNDATION</span>
            <h2 class="section-title">The Four Pillars of PropPartner</h2>
            <p class="section-subtitle">How we combine cutting-edge 3D technology with institutional real estate governance.</p>
          </div>

          <div class="features-grid" style="margin-top: 28px;">
            ${data.pillars.map(p => `
              <div class="why-card glass-card">
                <div class="why-icon-wrap"><i data-lucide="${p.icon}"></i></div>
                <h3 class="why-card-title">${p.title}</h3>
                <p class="why-card-desc">${p.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Regional Headquarters & Physical Entity Coordinates -->
        <section class="seo-content-section" style="margin-top: 60px;">
          <div class="contact-card glass-card" style="padding: 36px;">
            <div class="doc-category-badge"><i data-lucide="map-pin"></i> PHYSICAL OPERATIONAL HEADQUARTERS</div>
            <h3 style="font-size: 1.4rem; font-weight: 800; margin: 12px 0 8px 0;">Corporate Headquarters & Affiliate Support Desk</h3>
            <p class="text-muted text-xs" style="margin-bottom: 20px;">
              Our verified physical operating facility coordinates developer relationships, technical 3D asset generation, and milestone wire disbursements.
            </p>

            <div class="contact-grid-2">
              <div>
                <div class="contact-line-item">
                  <span class="line-label">Entity Name:</span>
                  <span class="line-val"><strong>${data.headquarters.company}</strong></span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Headquarters Address:</span>
                  <span class="line-val"><strong>${data.headquarters.location}</strong></span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Operating Hours:</span>
                  <span class="line-val"><strong>${data.headquarters.hours}</strong></span>
                </div>
              </div>

              <div>
                <div class="contact-line-item">
                  <span class="line-label">Direct Helpline:</span>
                  <a href="tel:+923228654411" class="line-val"><strong>${data.headquarters.phone}</strong></a>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">WhatsApp Desk:</span>
                  <a href="https://wa.me/923228654411" target="_blank" rel="noopener" class="line-val text-green"><strong>${data.headquarters.whatsapp} (24/7 Verified)</strong></a>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Executive Inquiries:</span>
                  <a href="mailto:${data.headquarters.email}" class="line-val"><strong>${data.headquarters.email}</strong></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Banner -->
        <div class="contact-hero-banner glass-card" style="margin-top: 60px; text-align: center;">
          <h2 class="contact-main-title" style="font-size: 2.2rem;">Partner With a Trusted Real Estate Technology Network</h2>
          <p class="contact-lead-text" style="max-width: 600px; margin: 12px auto 24px auto;">
            Explore our verified flagship projects or apply for partnership access in under two minutes.
          </p>
          <div class="contact-quick-actions-row">
            <button type="button" class="btn btn-gold btn-lg" id="btn-about-bottom-register">
              <i data-lucide="user-plus"></i> <span>BECOME AN AFFILIATE</span>
            </button>
            <a href="#contact" class="btn btn-secondary btn-lg">
              <i data-lucide="phone"></i> <span>CONTACT AFFILIATE DESK</span>
            </a>
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

  container.querySelector('#about-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#btn-about-back-home')?.addEventListener('click', goHome);
  container.querySelector('#crumb-about-home')?.addEventListener('click', goHome);

  const handleRegister = () => {
    if (onRegister) onRegister();
  };

  container.querySelector('#btn-about-cta-top')?.addEventListener('click', handleRegister);
  container.querySelector('#btn-about-bottom-register')?.addEventListener('click', handleRegister);
}
