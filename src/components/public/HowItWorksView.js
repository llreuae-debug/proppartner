// Dedicated How It Works Guide Component (/how-it-works)
// PropPartner Real Estate Network

import { updateSEO, seoRoutes, buildFAQSchema, buildBreadcrumbSchema } from '../../utils/seoManager.js';

export function renderHowItWorksView(container, onNavigateHome, onRegister) {
  const faqs = [
    {
      q: 'How does PropPartner track my real estate referrals?',
      a: 'We use dual-layer tracking: 90-day cryptographic referral cookies for web inquiries and direct CRM registrations with client consent. All leads are tied directly to your Partner ID in our auditable database.'
    },
    {
      q: 'What happens if another affiliate refers the same client?',
      a: 'Our CRM automatically detects duplicate phone numbers, emails, or names. Attribution is evaluated based on chronological submission timestamp, lead completeness, and direct client verification.'
    },
    {
      q: 'Do I have to attend property site visits in person?',
      a: 'No. Dedicated on-site developer relationship managers host prospective buyers for physical site visits, while you can monitor progress live through your partner dashboard.'
    }
  ];

  updateSEO({
    title: seoRoutes.howItWorks.title,
    description: seoRoutes.howItWorks.description,
    canonical: seoRoutes.howItWorks.canonical,
    ogType: seoRoutes.howItWorks.ogType,
    keywords: seoRoutes.howItWorks.keywords,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'How It Works', url: '/how-it-works' }
      ]),
      buildFAQSchema(faqs)
    ]
  });

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="hiw-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.svg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-hiw-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
            <button type="button" class="btn btn-gold btn-sm" id="btn-hiw-cta-top">
              <i data-lucide="user-plus"></i> <span>Become an Affiliate</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-hiw-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">How It Works</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="legal-main-container container">
        <!-- Hero Section -->
        <div class="contact-hero-banner glass-card" style="text-align: left; padding: 48px;">
          <span class="doc-category-badge"><i data-lucide="git-merge"></i> REFERRAL LIFECYCLE</span>
          <h1 class="contact-main-title" style="font-size: clamp(2rem, 3.5vw, 3rem); margin: 12px 0;">
            How the <span class="gradient-text-gold">Referral Process Works</span>
          </h1>
          <p class="contact-lead-text" style="margin: 0 0 24px 0; max-width: 800px; font-size: 1.1rem;">
            A transparent, audit-ready operational workflow connecting affiliate partners, prospective property buyers, and verified real estate developers.
          </p>

          <!-- AEO Direct Answer Callout Box -->
          <div class="aeo-answer-card glass-card">
            <div class="aeo-badge"><i data-lucide="help-circle"></i> DIRECT ANSWER</div>
            <h3 class="aeo-question">How Do Real Estate Referral Programs Work at PropPartner?</h3>
            <p class="aeo-text">
              The PropPartner referral process operates across four structured stages: Approved partners generate trackable referral links or submit consented buyer leads directly in their CRM. Dedicated developer sales teams host property site tours and execute official sale contracts. As buyer payments clear statutory escrow accounts, partners track milestone progress and receive weekly Friday wire payouts.
            </p>
          </div>
        </div>

        <!-- 4 Detailed Stages -->
        <section class="seo-content-section" style="margin-top: 48px;">
          <div class="doc-sections-body">
            <div class="contact-card glass-card">
              <div class="doc-category-badge">STAGE 1: ONBOARDING & ASSET DISCOVERY</div>
              <h2 style="font-size: 1.4rem; color: #FFFFFF; margin: 10px 0 8px 0;">1. Free Registration & Instant 3D Toolkit Access</h2>
              <p class="section-text-content">
                Apply online in under two minutes with your contact details and bank settlement information. Once approved, your Partner Dashboard provides instant access to all 5 verified flagship projects, high-resolution brochures, floor plans, and interactive 3D architectural models that can be shared across email, WhatsApp, or embedded on web portals.
              </p>
            </div>

            <div class="contact-card glass-card">
              <div class="doc-category-badge">STAGE 2: LEAD ATTRIBUTION & INGESTION</div>
              <h2 style="font-size: 1.4rem; color: #FFFFFF; margin: 10px 0 8px 0;">2. Lead Submission & Duplicate Protection</h2>
              <p class="section-text-content">
                Introduce prospective property investors using your unique cryptographic link or submit client details directly through the Lead Submission module. Our automated CRM duplicate scanner checks timestamps and contact records across all developments to protect your client relationships from attribution conflicts.
              </p>
            </div>

            <div class="contact-card glass-card">
              <div class="doc-category-badge">STAGE 3: DEVELOPER CLOSING & ESCROW CLEARANCE</div>
              <h2 style="font-size: 1.4rem; color: #FFFFFF; margin: 10px 0 8px 0;">3. Developer Sales Negotiation & Token Booking</h2>
              <p class="section-text-content">
                Licensed developer sales desks coordinate directly with the client to arrange VIP site visits, unit selection, and contract signing. You receive live pipeline updates at every touchpoint (Site Visit Completed, Booking Token Cleared, Escrow Deposit Verified).
              </p>
            </div>

            <div class="contact-card glass-card">
              <div class="doc-category-badge">STAGE 4: COMMISSION SETTLEMENT</div>
              <h2 style="font-size: 1.4rem; color: #FFFFFF; margin: 10px 0 8px 0;">4. 4-Stage Milestone Wire Disbursements</h2>
              <p class="section-text-content">
                As construction milestones clear, your milestone commission entitlements (20% on booking, 30% on escrow, 30% on structure, 20% on handover) are credited to your ledger and disbursed weekly every Friday via direct bank wire / RTGS with digital settlement vouchers.
              </p>
            </div>
          </div>
        </section>

        <!-- FAQs -->
        <section class="seo-content-section" style="margin-top: 60px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="help-circle"></i> QUESTIONS & ANSWERS</span>
            <h2 class="section-title">Referral Workflow FAQs</h2>
          </div>

          <div class="faq-accordion-wrap" style="margin-top: 28px; max-width: 860px; margin-left: auto; margin-right: auto;">
            ${faqs.map(faq => `
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

        <!-- CTA Banner -->
        <div class="contact-hero-banner glass-card" style="margin-top: 60px; text-align: center;">
          <h2 class="contact-main-title" style="font-size: 2.2rem;">Ready to Begin Submitting Property Referrals?</h2>
          <p class="contact-lead-text" style="max-width: 600px; margin: 12px auto 24px auto;">
            Join over 1,400+ active wealth managers and property consultants monetizing premium real estate developments.
          </p>
          <button type="button" class="btn btn-gold btn-lg" id="btn-hiw-bottom-register">
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

  container.querySelector('#hiw-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#btn-hiw-back-home')?.addEventListener('click', goHome);
  container.querySelector('#crumb-hiw-home')?.addEventListener('click', goHome);

  const handleRegister = () => {
    if (onRegister) onRegister();
  };

  container.querySelector('#btn-hiw-cta-top')?.addEventListener('click', handleRegister);
  container.querySelector('#btn-hiw-bottom-register')?.addEventListener('click', handleRegister);
}
