// Legal & Compliance Dedicated Page View Component - PropPartner

import { legalDocuments } from '../../data/legalData.js';

export function renderLegalView(container, documentKey = 'terms', onNavigateHome, onSelectDoc) {
  const doc = legalDocuments[documentKey] || legalDocuments.terms;

  container.innerHTML = `
    <div class="legal-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="legal-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.jpg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-legal-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
            <a href="#contact" class="btn btn-gold btn-sm" id="btn-legal-contact-desk">
              <i data-lucide="phone"></i> <span>Affiliate Desk</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-parent">Legal & Compliance</span>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">${doc.shortTitle}</span>
          </nav>
        </div>
      </div>

      <!-- Main Legal Content Container -->
      <main class="legal-main-container container">
        <div class="legal-grid-layout">
          <!-- Sidebar Navigation for Legal Documents -->
          <aside class="legal-sidebar glass-card">
            <div class="legal-sidebar-header">
              <i data-lucide="shield-check" class="text-gold"></i>
              <h4>Legal & Compliance</h4>
            </div>

            <nav class="legal-nav-menu">
              ${Object.keys(legalDocuments).map(key => {
                const item = legalDocuments[key];
                const isActive = item.id === doc.id;
                return `
                  <button type="button" class="legal-nav-item ${isActive ? 'active' : ''}" data-doc-key="${key}">
                    <i data-lucide="${getDocIcon(key)}"></i>
                    <span>${item.shortTitle}</span>
                    ${isActive ? '<i data-lucide="chevron-right" class="nav-active-arrow"></i>' : ''}
                  </button>
                `;
              }).join('')}
            </nav>

            <!-- Quick Affiliate Desk Box -->
            <div class="sidebar-desk-box glass-card">
              <div class="desk-box-header">
                <i data-lucide="help-circle" class="text-cyan"></i>
                <strong>Compliance Desk</strong>
              </div>
              <p class="text-muted text-xs">Questions about our policies or partnership agreements?</p>
              <a href="tel:+923228654411" class="btn btn-secondary btn-xs w-full" style="margin-top: 8px;">
                <i data-lucide="phone"></i> +92 322 865 4411
              </a>
              <a href="https://wa.me/923228654411?text=Hello%20PropPartner%2C%20I%20have%20a%20legal%20or%20compliance%20inquiry." target="_blank" rel="noopener" class="btn btn-gold btn-xs w-full" style="margin-top: 6px;">
                <i data-lucide="message-circle"></i> WhatsApp Desk
              </a>
            </div>
          </aside>

          <!-- Legal Document Main Content Article -->
          <article class="legal-article glass-card">
            <header class="doc-article-header">
              <span class="doc-category-badge"><i data-lucide="shield"></i> OFFICIAL POLICY</span>
              <h1 class="doc-main-title">${doc.title}</h1>
              <div class="doc-meta-row">
                <span><i data-lucide="calendar"></i> Last Updated: <strong>${doc.lastUpdated}</strong></span>
                <span>• Category: <strong>${doc.category}</strong></span>
              </div>
              <p class="doc-summary-lead">${doc.summary}</p>
            </header>

            <!-- Table of Contents Navigation -->
            <div class="doc-toc-box glass-card">
              <h4 class="toc-title"><i data-lucide="list"></i> Table of Contents</h4>
              <ul class="toc-list">
                ${doc.sections.map(sec => `
                  <li><a href="#${sec.id}" class="toc-link">${sec.title}</a></li>
                `).join('')}
              </ul>
            </div>

            <!-- Content Sections -->
            <div class="doc-sections-body">
              ${doc.sections.map(sec => `
                <section id="${sec.id}" class="doc-section-block">
                  <h2 class="section-heading">${sec.title}</h2>
                  <div class="section-text-content">
                    ${sec.content}
                  </div>
                </section>
              `).join('')}
            </div>

            <!-- Document Footer Sign-off -->
            <footer class="doc-article-footer">
              <div class="footer-signoff-box">
                <i data-lucide="file-check" class="text-gold"></i>
                <div>
                  <strong>PropPartner Governance & Compliance Department</strong>
                  <p class="text-muted text-xs">For legal clarifications, contract addenda, or corporate escrow inquiries, contact our legal desk at <a href="mailto:llre.uae@gmail.com">llre.uae@gmail.com</a>.</p>
                </div>
              </div>

              <!-- Quick Next / Previous Document Nav -->
              <div class="doc-pagination-row">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-legal-home-bottom">
                  <i data-lucide="home"></i> Return to Homepage
                </button>
                <a href="#contact" class="btn btn-gold btn-sm" id="btn-legal-desk-bottom">
                  <i data-lucide="phone"></i> Contact Affiliate Desk
                </a>
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

  // Attach event listeners
  const homeLogo = container.querySelector('#legal-home-logo-btn');
  const homeBtn = container.querySelector('#btn-legal-back-home');
  const homeBottom = container.querySelector('#btn-legal-home-bottom');
  const crumbHome = container.querySelector('#crumb-home');

  const goHome = (e) => {
    if (e) e.preventDefault();
    if (onNavigateHome) onNavigateHome();
  };

  if (homeLogo) homeLogo.onclick = goHome;
  if (homeBtn) homeBtn.onclick = goHome;
  if (homeBottom) homeBottom.onclick = goHome;
  if (crumbHome) crumbHome.onclick = goHome;

  // Sidebar Doc Switching
  container.querySelectorAll('.legal-nav-item').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.docKey;
      if (onSelectDoc) onSelectDoc(key);
    };
  });

  // Smooth scroll for Table of Contents
  container.querySelectorAll('.toc-link').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      const targetEl = container.querySelector(`#${targetId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  });
}

function getDocIcon(key) {
  const icons = {
    terms: 'file-text',
    agreement: 'handshake',
    privacy: 'lock',
    commission: 'badge-percent',
    referral: 'share-2',
    disclaimer: 'alert-circle'
  };
  return icons[key] || 'file-text';
}
