// Dedicated SEO Landing Page Component: Real Estate Affiliate Program (/affiliate-program)
// PropPartner Real Estate Network

import { affiliateProgramPageData } from '../../data/seoContentData.js';
import { updateSEO, seoRoutes, buildFAQSchema, buildBreadcrumbSchema } from '../../utils/seoManager.js';

export function renderAffiliateProgramView(container, onNavigateHome, onRegister) {
  const data = affiliateProgramPageData;

  // Set SEO metadata & schemas
  updateSEO({
    title: seoRoutes.affiliateProgram.title,
    description: seoRoutes.affiliateProgram.description,
    canonical: seoRoutes.affiliateProgram.canonical,
    ogType: seoRoutes.affiliateProgram.ogType,
    keywords: seoRoutes.affiliateProgram.keywords,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Affiliate Program', url: '/affiliate-program' }
      ]),
      buildFAQSchema(data.faqs)
    ]
  });

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="seo-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.svg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-seo-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
            <button type="button" class="btn btn-gold btn-sm" id="btn-seo-cta-top">
              <i data-lucide="user-plus"></i> <span>Become an Affiliate</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-seo-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">Real Estate Affiliate Program</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="legal-main-container container">
        <!-- Hero Section -->
        <div class="contact-hero-banner glass-card" style="text-align: left; padding: 48px;">
          <span class="doc-category-badge"><i data-lucide="award"></i> OFFICIAL PARTNER PROGRAM</span>
          <h1 class="contact-main-title" style="font-size: clamp(2rem, 3.5vw, 3rem); margin: 12px 0;">
            Real Estate <span class="gradient-text-gold">Affiliate Program</span>
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

          <div class="contact-quick-actions-row" style="justify-content: flex-start; margin-top: 24px;">
            <button type="button" class="btn btn-gold btn-lg" id="btn-hero-register">
              <i data-lucide="user-plus"></i> <span>BECOME AN AFFILIATE TODAY</span>
            </button>
            <a href="#commission" class="btn btn-secondary btn-lg">
              <i data-lucide="badge-percent"></i> <span>VIEW COMMISSION RATES</span>
            </a>
          </div>
        </div>

        <!-- Who Can Join Section -->
        <section class="seo-content-section">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="users"></i> ELIGIBILITY CRITERIA</span>
            <h2 class="section-title">Who Can Join Our Affiliate Network?</h2>
            <p class="section-subtitle">Designed for commercial consultants, wealth advisors, and digital leaders looking to monetize qualified property interest.</p>
          </div>

          <div class="features-grid" style="margin-top: 28px;">
            ${data.whoCanJoin.map(item => `
              <div class="why-card glass-card">
                <div class="why-icon-wrap"><i data-lucide="${item.icon}"></i></div>
                <h3 class="why-card-title">${item.title}</h3>
                <p class="why-card-desc">${item.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Program Benefits Grid -->
        <section class="seo-content-section" style="margin-top: 60px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="check-circle-2"></i> PARTNER ADVANTAGES</span>
            <h2 class="section-title">Why Partner With PropPartner?</h2>
            <p class="section-subtitle">We equip our affiliate partners with institutional technology and transparent governance.</p>
          </div>

          <div class="features-grid" style="margin-top: 28px;">
            ${data.keyBenefits.map(item => `
              <div class="why-card glass-card">
                <div class="why-icon-wrap"><i data-lucide="${item.icon}"></i></div>
                <h3 class="why-card-title">${item.title}</h3>
                <p class="why-card-desc">${item.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Step-by-Step How It Works -->
        <section class="seo-content-section" style="margin-top: 60px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="git-merge"></i> 4-STEP PROCESS</span>
            <h2 class="section-title">How the Referral Process Works</h2>
            <p class="section-subtitle">From registration to weekly Friday commission wire disbursement.</p>
          </div>

          <div class="process-timeline" style="margin-top: 28px;">
            ${data.howItWorksSteps.map(step => `
              <div class="timeline-step glass-card">
                <div class="step-badge">${step.step}</div>
                <h3 class="step-title" style="margin-top: 16px;">${step.title}</h3>
                <p class="step-desc">${step.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Structured FAQs (AEO & Voice Search Optimized) -->
        <section class="seo-content-section" style="margin-top: 60px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="help-circle"></i> FREQUENTLY ASKED QUESTIONS</span>
            <h2 class="section-title">Real Estate Affiliate Program FAQ</h2>
            <p class="section-subtitle">Direct, factual answers to common partner questions.</p>
          </div>

          <div class="faq-accordion-wrap" style="margin-top: 28px; max-width: 860px; margin-left: auto; margin-right: auto;">
            ${data.faqs.map(faq => `
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

        <!-- Conversion CTA Banner -->
        <div class="contact-hero-banner glass-card" style="margin-top: 60px; text-align: center;">
          <h2 class="contact-main-title" style="font-size: 2.2rem;">Ready to Join the Premier Real Estate Partner Network?</h2>
          <p class="contact-lead-text" style="max-width: 600px; margin: 12px auto 24px auto;">
            Register in under 2 minutes, get instant access to 3D flagship project kits, and begin submitting qualified buyer referrals today.
          </p>
          <button type="button" class="btn btn-gold btn-lg" id="btn-footer-register">
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

  // Attach navigation events
  const goHome = (e) => {
    if (e) e.preventDefault();
    if (onNavigateHome) onNavigateHome();
  };

  container.querySelector('#seo-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#btn-seo-back-home')?.addEventListener('click', goHome);
  container.querySelector('#crumb-seo-home')?.addEventListener('click', goHome);

  const handleRegisterClick = () => {
    if (onRegister) onRegister();
  };

  container.querySelector('#btn-seo-cta-top')?.addEventListener('click', handleRegisterClick);
  container.querySelector('#btn-hero-register')?.addEventListener('click', handleRegisterClick);
  container.querySelector('#btn-footer-register')?.addEventListener('click', handleRegisterClick);
}
