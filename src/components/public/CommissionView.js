// Dedicated Public Commission Guide Component (/commission)
// PropPartner Real Estate Network

import { updateSEO, seoRoutes, buildFAQSchema, buildBreadcrumbSchema } from '../../utils/seoManager.js';

export function renderCommissionView(container, onNavigateHome, onRegister) {
  const faqs = [
    {
      q: 'How is real estate affiliate commission calculated?',
      a: 'Commission is calculated as an approved percentage (ranging from 3.0% to 5.5%) of the net contract sales value of the property purchased by your referred buyer.'
    },
    {
      q: 'When do commission payments become eligible and payable?',
      a: 'Commission becomes eligible upon buyer token clearance, moves to approved status upon developer escrow deposit verification, and becomes payable weekly every Friday via bank wire.'
    },
    {
      q: 'Are calculator figures guaranteed earnings?',
      a: 'No. All simulation calculations are mathematical illustrations only. Actual commission entitlement requires a verified, closed real estate purchase conforming to project terms.'
    },
    {
      q: 'What happens if a buyer cancels during the cooling-off period?',
      a: 'If a buyer cancels within the developer statutory cooling-off period and receives a refund, un-disbursed milestone payments for that sale are adjusted in the portal ledger.'
    }
  ];

  updateSEO({
    title: seoRoutes.commission.title,
    description: seoRoutes.commission.description,
    canonical: seoRoutes.commission.canonical,
    ogType: seoRoutes.commission.ogType,
    keywords: seoRoutes.commission.keywords,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Commission Policy', url: '/commission' }
      ]),
      buildFAQSchema(faqs)
    ]
  });

  container.innerHTML = `
    <div class="legal-page-layout seo-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="comm-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.svg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-comm-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
            <button type="button" class="btn btn-gold btn-sm" id="btn-comm-cta-top">
              <i data-lucide="user-plus"></i> <span>Become an Affiliate</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-comm-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">Affiliate Commission & Settlement Guide</span>
          </nav>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="legal-main-container container">
        <!-- Hero Section -->
        <div class="contact-hero-banner glass-card" style="text-align: left; padding: 48px;">
          <span class="doc-category-badge"><i data-lucide="badge-percent"></i> COMMISSION TRANSPARENCY</span>
          <h1 class="contact-main-title" style="font-size: clamp(2rem, 3.5vw, 3rem); margin: 12px 0;">
            Real Estate <span class="gradient-text-gold">Commission & Milestones</span>
          </h1>
          <p class="contact-lead-text" style="margin: 0 0 24px 0; max-width: 800px; font-size: 1.1rem;">
            Transparent commission tiers (3.0% – 5.5%), structured 4-stage milestone payouts, Friday bank wire settlements, and auditable ledger governance.
          </p>

          <!-- AEO Direct Answer Callout Box -->
          <div class="aeo-answer-card glass-card">
            <div class="aeo-badge"><i data-lucide="help-circle"></i> DIRECT ANSWER</div>
            <h3 class="aeo-question">How Does Property Referral Commission Work at PropPartner?</h3>
            <p class="aeo-text">
              PropPartner calculates referral commissions as a percentage (3.0% to 5.5%) of the net contract value of verified property sales. Payouts are distributed across 4 distinct project milestones (Booking, Escrow Down Payment, Structural Progress, Handover) to align developer cash flows and ensure guaranteed weekly Friday wire transfers directly to your bank account.
            </p>
          </div>
        </div>

        <!-- Mandatory Compliance Alert Banner -->
        <div class="sec-info-banner warning" style="margin-top: 32px;">
          <i data-lucide="alert-triangle"></i>
          <div>
            <strong>Mandatory Non-Guarantee Compliance Notice:</strong>
            <p class="text-xs text-muted" style="margin-top: 4px;">
              Affiliate commissions are performance-based referral fees and do not constitute fixed salaries or guaranteed income. Eligibility and payouts require a verified, qualifying closed property transaction conforming to project escrow terms and the <a href="#affiliate-agreement" style="color:var(--gold-light); text-decoration:underline;">Affiliate Agreement</a>.
            </p>
          </div>
        </div>

        <!-- Commission Rate Tiers -->
        <section class="seo-content-section" style="margin-top: 48px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="layers"></i> PARTNER TIERS</span>
            <h2 class="section-title">Transparent Commission Rate Structure</h2>
            <p class="section-subtitle">Earn higher performance tiers as your verified referral sales volume grows.</p>
          </div>

          <div class="tier-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 28px;">
            <div class="why-card glass-card">
              <div class="doc-category-badge">SILVER PARTNER</div>
              <h3 style="font-size: 1.8rem; font-weight: 800; color: #FFFFFF; margin: 12px 0 6px 0;">3.0% – 3.5%</h3>
              <p class="text-muted text-xs">Standard starting tier for new verified affiliates and independent consultants.</p>
              <ul style="margin-top: 16px; padding-left: 18px; font-size: 0.85rem; color: #94A3B8; display: flex; flex-direction: column; gap: 8px;">
                <li>Access to all 5 flagship developments</li>
                <li>Standard 3D marketing kits</li>
                <li>Weekly Friday wire settlements</li>
              </ul>
            </div>

            <div class="why-card glass-card" style="border-color: rgba(212, 175, 55, 0.4); background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.08) 0%, rgba(8, 11, 18, 0.95) 100%);">
              <div class="doc-category-badge" style="background: rgba(212, 175, 55, 0.2);">GOLD PARTNER</div>
              <h3 style="font-size: 1.8rem; font-weight: 800; color: var(--gold-light); margin: 12px 0 6px 0;">3.5% – 4.2%</h3>
              <p class="text-muted text-xs">Awarded after 2 verified closed property sales within 6 months.</p>
              <ul style="margin-top: 16px; padding-left: 18px; font-size: 0.85rem; color: #94A3B8; display: flex; flex-direction: column; gap: 8px;">
                <li>Enhanced commission percentage</li>
                <li>Priority developer sales liaison</li>
                <li>Dedicated CRM duplicate audit channel</li>
              </ul>
            </div>

            <div class="why-card glass-card">
              <div class="doc-category-badge">PLATINUM PARTNER</div>
              <h3 style="font-size: 1.8rem; font-weight: 800; color: #00F2FE; margin: 12px 0 6px 0;">4.5% – 5.5%</h3>
              <p class="text-muted text-xs">Institutional tier for high-performing brokerages and wealth advisory teams.</p>
              <ul style="margin-top: 16px; padding-left: 18px; font-size: 0.85rem; color: #94A3B8; display: flex; flex-direction: column; gap: 8px;">
                <li>Maximum commission rates</li>
                <li>Custom corporate escrow addenda</li>
                <li>Exclusive pre-launch inventory access</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 4-Stage Milestone Schedule -->
        <section class="seo-content-section" style="margin-top: 60px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="git-commit"></i> MILESTONE PHASING</span>
            <h2 class="section-title">4-Stage Milestone Disbursement Schedule</h2>
            <p class="section-subtitle">Commission payouts are released in alignment with verified construction and escrow milestones.</p>
          </div>

          <div class="legal-table-wrap" style="margin-top: 28px;">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Milestone Stage</th>
                  <th>Disbursement %</th>
                  <th>Operational Trigger</th>
                  <th>Verification Requirement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Stage 1: Booking & Token</strong></td>
                  <td><span class="text-gold">20% of Total</span></td>
                  <td>Buyer places booking token</td>
                  <td>Clearance of token in developer bank account</td>
                </tr>
                <tr>
                  <td><strong>Stage 2: Escrow Down Payment</strong></td>
                  <td><span class="text-gold">30% of Total</span></td>
                  <td>Buyer deposits mandatory down payment</td>
                  <td>Statutory escrow deed verification</td>
                </tr>
                <tr>
                  <td><strong>Stage 3: Structural Milestone</strong></td>
                  <td><span class="text-gold">30% of Total</span></td>
                  <td>Construction reaches key structural slab</td>
                  <td>Independent structural engineer audit</td>
                </tr>
                <tr>
                  <td><strong>Stage 4: Handover & Deed</strong></td>
                  <td><span class="text-gold">20% of Total</span></td>
                  <td>Final completion and key handover</td>
                  <td>Official land registration deed issue</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Illustrative Calculation Example -->
        <section class="seo-content-section" style="margin-top: 60px;">
          <div class="contact-card glass-card" style="padding: 32px;">
            <div class="doc-category-badge"><i data-lucide="calculator"></i> ILLUSTRATIVE SIMULATION</div>
            <h3 style="font-size: 1.4rem; font-weight: 800; margin: 12px 0 8px 0;">Sample Referral Calculation: Luminary Sky Residences</h3>
            <p class="text-muted text-xs" style="margin-bottom: 20px;">
              The following simulation demonstrates how a 3.5% commission is calculated and phased on a 2-Bedroom Luxury Suite.
            </p>

            <div class="contact-grid-2">
              <div>
                <div class="contact-line-item">
                  <span class="line-label">Property Unit:</span>
                  <span class="line-val"><strong>Luminary Penthouse Suite (Floor 38)</strong></span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Contract Sale Price:</span>
                  <span class="line-val"><strong>PKR 45,000,000</strong></span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Affiliate Commission (3.5%):</span>
                  <span class="line-val"><strong class="text-green" style="font-size: 1.15rem;">PKR 1,575,000</strong></span>
                </div>
              </div>

              <div>
                <div class="contact-line-item">
                  <span class="line-label">Stage 1 Payout (20%):</span>
                  <span class="line-val"><strong>PKR 315,000</strong> (On Token Booking)</span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Stage 2 Payout (30%):</span>
                  <span class="line-val"><strong>PKR 472,500</strong> (On Escrow Down Payment)</span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Stage 3 Payout (30%):</span>
                  <span class="line-val"><strong>PKR 472,500</strong> (On Structural Milestone)</span>
                </div>
                <div class="contact-line-item">
                  <span class="line-label">Stage 4 Payout (20%):</span>
                  <span class="line-val"><strong>PKR 315,000</strong> (On Final Handover Deed)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- FAQs -->
        <section class="seo-content-section" style="margin-top: 60px;">
          <div class="section-header-centered">
            <span class="section-eyebrow"><i data-lucide="help-circle"></i> COMMON QUESTIONS</span>
            <h2 class="section-title">Commission Policy FAQs</h2>
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

        <!-- CTA Box -->
        <div class="contact-hero-banner glass-card" style="margin-top: 60px; text-align: center;">
          <h2 class="contact-main-title" style="font-size: 2.2rem;">Start Earning Real Estate Referral Commissions</h2>
          <p class="contact-lead-text" style="max-width: 600px; margin: 12px auto 24px auto;">
            Join our approved affiliate partner network and track all earnings through your transparent partner dashboard.
          </p>
          <button type="button" class="btn btn-gold btn-lg" id="btn-comm-bottom-register">
            <i data-lucide="user-plus"></i> <span>REGISTER AS AN AFFILIATE</span>
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

  container.querySelector('#comm-home-logo-btn')?.addEventListener('click', goHome);
  container.querySelector('#btn-comm-back-home')?.addEventListener('click', goHome);
  container.querySelector('#crumb-comm-home')?.addEventListener('click', goHome);

  const handleRegister = () => {
    if (onRegister) onRegister();
  };

  container.querySelector('#btn-comm-cta-top')?.addEventListener('click', handleRegister);
  container.querySelector('#btn-comm-bottom-register')?.addEventListener('click', handleRegister);
}
