import { authStore } from '../../store/authStore.js';
import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';
import { renderMobileHeader, renderMobileBottomBar, openMoreBottomSheet, triggerNativeShare } from '../common/MobileAppNav.js';
import { openProfileSecurityModal } from '../common/ProfileSecurityModal.js';
import { 
  generateReferralUrl, 
  renderQrToCanvas, 
  downloadBrandedQrPng, 
  downloadQrSvg, 
  printQrFlyer, 
  validateQrEncoding 
} from '../../utils/qrCodeGenerator.js';
import { printLedgerStatement, exportLedgerCSV } from '../../utils/statementGenerator.js';
import { openLogoutConfirmationModal } from '../common/LogoutConfirmationModal.js';

export function initAffiliatePortal(container, onNavigateLanding, onSwitchAdminView) {
  let currentSection = 'dashboard';
  let sectionParams = {};

  function navigateTo(section, params = {}) {
    currentSection = section;
    sectionParams = params;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    const user = authStore.getUser() || { name: 'Tariq Mansoor', affiliateId: 'AFF-000101', tier: 'Platinum' };
    const affiliateId = user.affiliateId || 'AFF-000101';
    const aff = platformStore.affiliates.find(a => a.id === affiliateId) || platformStore.affiliates[0];
    const stats = platformStore.getAffiliateStats(aff.id);
    const curr = platformStore.currency;
    const memberRefCode = aff.referralCode || aff.id;
    const globalRefLink = generateReferralUrl(memberRefCode);

    container.innerHTML = `
      <div class="portal-app-layout">
        <!-- Native Mobile Header (Shown on < 1024px) -->
        ${renderMobileHeader(container, getPartnerPageTitle(currentSection), null, null)}

        <!-- Partner Sidebar (Desktop / Tablet Drawer) -->
        <aside class="portal-sidebar glass-card" id="partner-sidebar">
          <div class="sidebar-brand-header">
            <a href="#partner" class="brand-logo brand-logo-img">
              <img src="/assets/proppartner-icon.svg" alt="PropPartner" class="logo-img-icon" width="34" height="34">
              <div class="logo-text">PROP<span>PARTNER</span></div>
            </a>
            <span class="badge-role-partner">${aff.tier || 'Gold'} Partner</span>
          </div>

          <!-- Partner Earnings Pill in Sidebar -->
          <div class="partner-sidebar-earnings glass-card">
            <span class="p-earn-label">Payable Commission</span>
            <strong class="p-earn-val text-gold">${formatCurrencyValue(stats.payableCommission, curr)}</strong>
            <span class="p-earn-sub text-green"><i data-lucide="check-circle"></i> Ready for Payout</span>
          </div>

          <nav class="sidebar-nav-scroll">
            <div class="nav-section-title">PORTAL OVERVIEW</div>
            <button type="button" class="sidebar-nav-item ${currentSection === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
              <i data-lucide="layout-dashboard"></i>
              <span>Dashboard & KPIs</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'projects' ? 'active' : ''}" data-nav="projects">
              <i data-lucide="building-2"></i>
              <span>Projects & QR Links</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'leads' ? 'active' : ''}" data-nav="leads">
              <i data-lucide="users"></i>
              <span>My Referred Leads</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'sales' ? 'active' : ''}" data-nav="sales">
              <i data-lucide="award"></i>
              <span>My Closed Sales</span>
            </button>

            <div class="nav-section-title">FINANCIALS & SETTLEMENT</div>
            <button type="button" class="sidebar-nav-item ${currentSection === 'commissions' ? 'active' : ''}" data-nav="commissions">
              <i data-lucide="badge-percent"></i>
              <span>My Commissions</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'ledger' ? 'active' : ''}" data-nav="ledger">
              <i data-lucide="book-open"></i>
              <span>My Partner Ledger</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'payments' ? 'active' : ''}" data-nav="payments">
              <i data-lucide="wallet"></i>
              <span>Payouts & Bank Wire</span>
            </button>

            <div class="nav-section-title">SALES ENABLEMENT & SUPPORT</div>
            <button type="button" class="sidebar-nav-item ${currentSection === 'marketing' ? 'active' : ''}" data-nav="marketing">
              <i data-lucide="qr-code"></i>
              <span>Referral Center & QR</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'profile' ? 'active' : ''}" data-nav="profile">
              <i data-lucide="user-cog"></i>
              <span>Bank & Profile</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'support' ? 'active' : ''}" data-nav="support">
              <i data-lucide="message-square"></i>
              <span>Support & AI Chat</span>
            </button>
          </nav>

          <!-- Sidebar Footer -->
          <div class="sidebar-footer">
            ${authStore.isSuperAdmin() ? `
              <button type="button" class="sidebar-switch-btn text-cyan" id="btn-partner-switch-admin">
                <i data-lucide="shield-check"></i> <span>Super Admin Mode</span>
              </button>
            ` : `
              <div style="font-size: 0.72rem; color: #64748B; text-align: center; padding: 4px;">
                PropPartner Private Partner Portal
              </div>
            `}
          </div>
        </aside>

        <!-- Main Body -->
        <main class="portal-main-area">
          <!-- Desktop Topbar -->
          <header class="portal-topbar glass-card">
            <div class="topbar-left">
              <button type="button" class="topbar-toggle-sidebar" id="partner-toggle-sidebar" aria-label="Toggle Sidebar">
                <i data-lucide="menu"></i>
              </button>
              <div class="topbar-title-wrap">
                <h1 class="topbar-page-title">${getPartnerPageTitle(currentSection)}</h1>
              </div>
            </div>

            <div class="topbar-right">
              <!-- Fast Referral Link Copy Pill -->
              <div class="topbar-ref-pill">
                <span class="ref-pill-label">Referral:</span>
                <code>${memberRefCode}</code>
                <button type="button" class="btn-copy-ref-top" id="btn-top-copy-ref" title="Copy Referral Link">
                  <i data-lucide="copy"></i>
                </button>
                <button type="button" class="btn-copy-ref-top text-gold" id="btn-top-share-ref" title="Share via Mobile">
                  <i data-lucide="share-2"></i>
                </button>
              </div>

              <!-- Currency Switcher -->
              <select id="partner-topbar-currency" class="form-select-sm">
                <option value="PKR" ${platformStore.currency === 'PKR' ? 'selected' : ''}>PKR (₨)</option>
                <option value="USD" ${platformStore.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                <option value="AED" ${platformStore.currency === 'AED' ? 'selected' : ''}>AED (د.إ)</option>
              </select>

              <!-- User Profile Menu (Click to open Profile & Password Security) -->
              <div class="topbar-user-pill" id="partner-topbar-profile-trigger" style="cursor:pointer;" title="Click to manage password & security settings">
                <img src="${aff.avatar}" alt="${aff.name}" class="topbar-avatar">
                <div class="topbar-user-meta">
                  <span class="user-name">${aff.name}</span>
                  <span class="user-role">${aff.tier} Affiliate (${aff.id})</span>
                </div>
                <button type="button" class="btn-logout" id="btn-partner-logout" title="Sign Out">
                  <i data-lucide="log-out"></i>
                </button>
              </div>
            </div>
          </header>

          <!-- Module Body Content -->
          <div class="portal-content-body" id="partner-module-mount">
            ${renderPartnerModule(currentSection, aff, stats, curr, navigateTo)}
          </div>

          <!-- Sticky Mobile Bottom App Navigation Bar (Shown on < 1024px) -->
          ${renderMobileBottomBar(currentSection, 'AFFILIATE_PARTNER')}
        </main>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach listeners
    container.querySelectorAll('.sidebar-nav-item, .bottom-nav-tab[data-nav]').forEach(item => {
      item.onclick = () => {
        const sb = container.querySelector('#partner-sidebar');
        if (sb) sb.classList.remove('open');
        navigateTo(item.dataset.nav);
      };
    });

    const moreBtn = container.querySelector('#btn-open-more-sheet');
    if (moreBtn) {
      moreBtn.onclick = () => {
        openMoreBottomSheet('AFFILIATE_PARTNER', (targetSec) => navigateTo(targetSec), (view) => {
          if (view === 'landing' && onNavigateLanding) onNavigateLanding();
          if (view === 'admin' && onSwitchAdminView) onSwitchAdminView();
        });
      };
    }

    const mobileDrawerBtn = container.querySelector('#mobile-app-drawer-btn');
    if (mobileDrawerBtn) {
      mobileDrawerBtn.onclick = () => {
        const sb = container.querySelector('#partner-sidebar');
        if (sb) sb.classList.toggle('open');
      };
    }

    const topCopyBtn = container.querySelector('#btn-top-copy-ref');
    if (topCopyBtn) {
      topCopyBtn.onclick = () => {
        navigator.clipboard.writeText(globalRefLink);
        alert(`Copied unique referral link:\n${globalRefLink}`);
      };
    }

    const topShareBtn = container.querySelector('#btn-top-share-ref');
    if (topShareBtn) {
      topShareBtn.onclick = () => {
        triggerNativeShare(
          'PropPartner Real Estate Network',
          `Join me on PropPartner. Promote high-commission luxury properties with guaranteed payouts:`,
          globalRefLink
        );
      };
    }

    const currSelect = container.querySelector('#partner-topbar-currency');
    if (currSelect) {
      currSelect.onchange = (e) => {
        platformStore.setCurrency(e.target.value);
        render();
      };
    }

    const mobileCurrSelect = container.querySelector('#mobile-curr-picker');
    if (mobileCurrSelect) {
      mobileCurrSelect.onchange = (e) => {
        platformStore.setCurrency(e.target.value);
        render();
      };
    }

    const switchLandingBtn = container.querySelector('#btn-partner-switch-landing');
    if (switchLandingBtn) {
      switchLandingBtn.onclick = () => {
        if (onNavigateLanding) onNavigateLanding();
      };
    }

    const switchAdminBtn = container.querySelector('#btn-partner-switch-admin');
    if (switchAdminBtn) {
      switchAdminBtn.onclick = () => {
        authStore.loginAs('admin');
        if (onSwitchAdminView) onSwitchAdminView();
      };
    }

    const logoutBtn = container.querySelector('#btn-partner-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        openLogoutConfirmationModal({ triggerElement: logoutBtn });
      };
    }

    // Attach submodule internal listeners and render live QR code
    attachPartnerSubmoduleEvents(container, aff, navigateTo);
  }

  function getPartnerPageTitle(section) {
    const titles = {
      dashboard: 'Partner Earnings Dashboard',
      projects: 'Projects & Referral Generators',
      leads: 'My Referred Leads CRM',
      sales: 'My Closed Sales',
      commissions: 'Commission Entitlements',
      ledger: 'Partner Financial Ledger',
      payments: 'Payouts & Settlement History',
      marketing: 'Referral Center & QR Code Hub',
      profile: 'Partner Profile & Banking',
      support: 'Support & AI Concierge'
    };
    return titles[section] || 'Affiliate Partner Portal';
  }

  render();
}

function renderPartnerModule(section, aff, stats, curr, navigateTo) {
  const myLeads = platformStore.leads.filter(l => l.affiliateId === aff.id);
  const mySales = platformStore.sales.filter(s => s.affiliateId === aff.id);
  const myComms = platformStore.commissions.filter(c => c.affiliateId === aff.id);
  const myLedger = platformStore.ledger.filter(tx => tx.affiliateId === aff.id);
  const myPayments = platformStore.payments.filter(p => p.affiliateId === aff.id);
  const memberRefCode = aff.referralCode || aff.id;
  const globalRefLink = generateReferralUrl(memberRefCode);

  if (section === 'dashboard') {
    return `
      <div class="partner-dashboard-view">
        <!-- Live Referral Link & Member-Specific Scannable QR Hero -->
        <div class="partner-ref-hero glass-card">
          <div class="ref-hero-info">
            <div class="section-eyebrow"><i data-lucide="link-2"></i> YOUR UNIQUE PARTNER REFERRAL URL</div>
            <h3 class="ref-hero-title">Share Your Direct Referral Link</h3>
            <p class="text-muted">Introduce high-net-worth investors or buyers. Web visits, form submissions, and direct bookings are automatically locked to your partner ID (<code>${aff.id}</code> / <code>${memberRefCode}</code>) with a 90-day institutional escrow guarantee.</p>
            
            <div class="ref-hero-input-row">
              <input type="text" class="form-input ref-input" value="${globalRefLink}" readonly id="partner-ref-hero-url">
              <div class="ref-hero-btn-group">
                <button type="button" class="btn btn-gold" id="btn-hero-copy-ref"><i data-lucide="copy"></i> <span>COPY URL</span></button>
                <button type="button" class="btn btn-secondary" id="btn-hero-open-ref"><i data-lucide="external-link"></i> <span>OPEN</span></button>
                <button type="button" class="btn btn-secondary" id="btn-hero-native-share"><i data-lucide="share-2"></i> <span>SHARE</span></button>
                <button type="button" class="btn btn-whatsapp" id="btn-hero-wa-share"><i data-lucide="message-circle"></i> <span>WHATSAPP</span></button>
              </div>
            </div>

            <div class="ref-meta-row">
              <div class="ref-meta-pill verified"><i data-lucide="check-circle-2"></i> <span>100% Scannable QR Verified</span></div>
              <div class="ref-meta-pill"><i data-lucide="eye"></i> <span>${aff.referralClicks || 0} Total Clicks</span></div>
              <div class="ref-meta-pill"><i data-lucide="qr-code"></i> <span>${aff.qrScans || 0} QR Scans</span></div>
              <div class="ref-meta-pill"><i data-lucide="shield-check"></i> <span>90-Day Protection</span></div>
            </div>
          </div>

          <div class="ref-hero-qr-deck">
            <div class="qr-canvas-container">
              <canvas id="dash-partner-qr-canvas" class="real-qr-canvas" width="220" height="220"></canvas>
              <div class="qr-label-strip">
                <span class="qr-member-label">Partner: <strong>${aff.name}</strong></span>
                <div class="qr-code-label"><code>${memberRefCode}</code></div>
              </div>
            </div>

            <div class="qr-action-buttons-strip">
              <button type="button" class="btn btn-secondary btn-xs" id="btn-qr-download-png" title="Download High-Res PNG">
                <i data-lucide="download"></i> <span>PNG</span>
              </button>
              <button type="button" class="btn btn-secondary btn-xs" id="btn-qr-download-svg" title="Download Vector SVG">
                <i data-lucide="file-code"></i> <span>SVG</span>
              </button>
              <button type="button" class="btn btn-gold btn-xs" id="btn-qr-print-flyer" title="Print Marketing Flyer">
                <i data-lucide="printer"></i> <span>PRINT</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 8 Live Personal KPI Cards (Responsive Grid) -->
        <div class="admin-kpi-grid" style="margin-bottom: 24px;">
          <div class="kpi-card glass-card">
            <div class="kpi-header"><span class="kpi-title">TOTAL REFERRALS</span><div class="kpi-badge"><i data-lucide="users"></i></div></div>
            <div class="kpi-number">${stats.totalReferrals}</div>
            <div class="kpi-footer"><span>Total Ingested Leads</span></div>
          </div>
          <div class="kpi-card glass-card">
            <div class="kpi-header"><span class="kpi-title">QUALIFIED LEADS</span><div class="kpi-badge purple"><i data-lucide="target"></i></div></div>
            <div class="kpi-number text-purple">${stats.qualifiedLeads}</div>
            <div class="kpi-footer"><span>Active in Negotiation</span></div>
          </div>
          <div class="kpi-card glass-card">
            <div class="kpi-header"><span class="kpi-title">CLOSED SALES</span><div class="kpi-badge gold"><i data-lucide="award"></i></div></div>
            <div class="kpi-number text-gold">${stats.successfulSales}</div>
            <div class="kpi-footer gold"><span>${stats.conversionRate} Conversion</span></div>
          </div>
          <div class="kpi-card glass-card">
            <div class="kpi-header"><span class="kpi-title">PENDING COMM.</span><div class="kpi-badge yellow"><i data-lucide="clock"></i></div></div>
            <div class="kpi-number text-yellow">${formatCurrencyValue(stats.pendingCommission, curr)}</div>
            <div class="kpi-footer"><span>Under Verification</span></div>
          </div>
          <div class="kpi-card glass-card highlight-cyan">
            <div class="kpi-header"><span class="kpi-title">PAYABLE COMM.</span><div class="kpi-badge cyan"><i data-lucide="wallet"></i></div></div>
            <div class="kpi-number text-cyan">${formatCurrencyValue(stats.payableCommission, curr)}</div>
            <div class="kpi-footer cyan"><span>Ready for Wire Transfer</span></div>
          </div>
          <div class="kpi-card glass-card highlight-green">
            <div class="kpi-header"><span class="kpi-title">TOTAL PAID</span><div class="kpi-badge green"><i data-lucide="badge-check"></i></div></div>
            <div class="kpi-number text-green">${formatCurrencyValue(stats.paidCommission, curr)}</div>
            <div class="kpi-footer green"><span>Settled & Disbursed</span></div>
          </div>
        </div>

        <!-- Mobile Quick Action Strip -->
        <div class="partner-mobile-quick-actions glass-card">
          <button type="button" class="m-qa-item" id="mqa-find-proj">
            <i data-lucide="building-2"></i>
            <span>Browse Projects</span>
          </button>
          <button type="button" class="m-qa-item" id="mqa-add-lead">
            <i data-lucide="user-plus"></i>
            <span>Submit Lead</span>
          </button>
          <button type="button" class="m-qa-item" id="mqa-view-ledger">
            <i data-lucide="book-open"></i>
            <span>View Ledger</span>
          </button>
          <button type="button" class="m-qa-item" id="mqa-mkt-kit">
            <i data-lucide="folder-down"></i>
            <span>Marketing Kit</span>
          </button>
        </div>

        <!-- Featured Projects Ready to Promote -->
        <div class="table-card glass-card" style="margin-bottom: 24px;">
          <div class="table-card-header">
            <div>
              <h4><i data-lucide="building-2"></i> Projects Ready to Promote</h4>
              <span class="text-xs text-muted">Generate instant scannable QR codes and tracked links for top developments</span>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-dash-all-proj">
              <span>View All Projects</span> <i data-lucide="arrow-right"></i>
            </button>
          </div>
          <div class="partner-proj-cards-grid">
            ${platformStore.projects.slice(0, 3).map(p => `
              <div class="p-promo-card">
                <div class="promo-card-thumb-wrap">
                  <img src="${p.image}" alt="${p.name}" class="promo-card-thumb" loading="lazy">
                  <div class="promo-card-top-badges">
                    <span class="status-pill status-${p.status.toLowerCase().replace(/\s+/g, '-')}">${p.status}</span>
                    <span class="promo-rate-pill">${p.commissionRate}% Milestone Comm.</span>
                  </div>
                </div>
                <div class="promo-card-body">
                  <div>
                    <h4 class="promo-card-title" title="${p.name}">${p.name}</h4>
                    <p class="promo-card-loc"><i data-lucide="map-pin"></i> ${p.location}, ${p.city}</p>
                    <div class="promo-metrics-strip">
                      <div class="promo-metric-item">
                        <span>Starting Price</span>
                        <strong class="text-gold">${formatCurrencyValue(p.startingPrice, curr)}</strong>
                      </div>
                      <div class="promo-metric-item">
                        <span>Est. Commission</span>
                        <strong class="text-green">${formatCurrencyValue((p.startingPrice * p.commissionRate) / 100, curr)}</strong>
                      </div>
                    </div>
                  </div>
                  <div class="promo-actions-row">
                    <button type="button" class="btn btn-gold btn-sm w-full btn-open-proj-qr-modal" data-proj="${p.id}" data-name="${p.name}" data-comm="${p.commissionRate}">
                      <i data-lucide="qr-code"></i> <span>Get Link & QR</span>
                    </button>
                    <a href="/projects/${p.slug || p.id}" target="_blank" class="btn btn-secondary btn-sm" title="Preview Live Public Project Page">
                      <i data-lucide="external-link"></i>
                    </a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Leads (Responsive Table + Mobile Cards) -->
        <div class="table-card glass-card">
          <div class="table-card-header">
            <h4><i data-lucide="target"></i> Recent Referred Leads (${myLeads.length})</h4>
            <button type="button" class="btn btn-gold btn-sm" id="btn-dash-submit-lead"><i data-lucide="plus"></i> Submit Lead</button>
          </div>

          <!-- Desktop Table View -->
          <div class="table-responsive desktop-only-table">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Lead ID / Date</th>
                  <th>Prospect Name</th>
                  <th>Interested Project</th>
                  <th>Budget</th>
                  <th>Status Stage</th>
                </tr>
              </thead>
              <tbody>
                ${myLeads.slice(0, 5).map(l => `
                  <tr>
                    <td><code>${l.id}</code><br><span class="text-muted">${l.date}</span></td>
                    <td><strong>${l.name}</strong><br><span class="text-muted">${l.phone}</span></td>
                    <td>${l.projectId}</td>
                    <td><strong class="text-gold">${formatCurrencyValue(l.budget, curr)}</strong></td>
                    <td><span class="status-pill status-${l.status.toLowerCase()}">${l.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Card List View -->
          <div class="mobile-card-list mobile-only-cards">
            ${myLeads.slice(0, 5).map(l => `
              <div class="mobile-card-item glass-card">
                <div class="m-card-top">
                  <div>
                    <strong class="m-card-title">${l.name}</strong>
                    <div class="text-muted text-xs">${l.phone} • ${l.date}</div>
                  </div>
                  <span class="status-pill status-${l.status.toLowerCase()}">${l.status}</span>
                </div>
                <div class="m-card-details">
                  <div><span class="text-muted text-xs">Project:</span> <strong>${l.projectId}</strong></div>
                  <div><span class="text-muted text-xs">Budget:</span> <strong class="text-gold">${formatCurrencyValue(l.budget, curr)}</strong></div>
                </div>
                <div class="m-card-actions">
                  <a href="tel:${l.phone}" class="btn btn-secondary btn-xs"><i data-lucide="phone"></i> Call</a>
                  <a href="https://wa.me/${l.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-secondary btn-xs"><i data-lucide="message-circle"></i> WhatsApp</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'projects') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Projects Portfolio & Referral Generators</h2>
            <p class="module-subtitle">Generate project-specific referral links, share via WhatsApp, and download sales collateral</p>
          </div>
        </div>

        <div class="projects-admin-grid">
          ${platformStore.projects.map(p => `
            <div class="admin-project-card glass-card">
              <div class="proj-card-media" style="background-image: url('${p.image}');">
                <div class="proj-card-badges">
                  <span class="status-pill status-${p.status.toLowerCase()}">${p.status}</span>
                  <span class="badge-comm-rate">${p.commissionRate}% Commission</span>
                </div>
                <div class="proj-media-overlay">
                  <h3 class="proj-media-title">${p.name}</h3>
                  <p class="proj-media-loc"><i data-lucide="map-pin"></i> ${p.location}, ${p.city}</p>
                </div>
              </div>
              <div class="proj-card-body">
                <div class="proj-kpis-3">
                  <div class="p-kpi"><span>Starting Price</span><strong class="text-gold">${formatCurrencyValue(p.startingPrice, curr)}</strong></div>
                  <div class="p-kpi"><span>Est. Comm.</span><strong class="text-green">${formatCurrencyValue((p.startingPrice * p.commissionRate) / 100, curr)}</strong></div>
                  <div class="p-kpi"><span>Units Left</span><strong>${p.unitsAvailable}</strong></div>
                </div>
                <div class="proj-actions-row">
                  <button type="button" class="btn btn-gold btn-sm w-full btn-open-proj-qr-modal" data-proj="${p.id}" data-name="${p.name}" data-comm="${p.commissionRate}">
                    <i data-lucide="qr-code"></i> <span>QR & Referral Link</span>
                  </button>
                  <a href="/projects/${p.slug || p.id}" target="_blank" class="btn btn-secondary btn-sm" title="Preview Public Page">
                    <i data-lucide="external-link"></i>
                  </a>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="alert('Downloading Official Lookbook for ${p.name}');" title="Download Brochure">
                    <i data-lucide="download"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (section === 'leads') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">My Referred Prospects & CRM</h2>
            <p class="module-subtitle">Track lead progression from submission to negotiation and final deed signing</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-partner-submit-lead-modal">
              <i data-lucide="user-plus"></i> <span>Submit Client Referral</span>
            </button>
          </div>
        </div>

        <div class="table-card glass-card">
          <!-- Desktop Table -->
          <div class="table-responsive desktop-only-table">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Client Contact</th>
                  <th>Target Project & Budget</th>
                  <th>Date</th>
                  <th>Sales Stage</th>
                  <th>Commission Status</th>
                </tr>
              </thead>
              <tbody>
                ${myLeads.map(l => `
                  <tr>
                    <td><code>${l.id}</code></td>
                    <td>
                      <strong>${l.name}</strong>
                      <div class="text-muted text-xs">${l.phone} • ${l.email}</div>
                    </td>
                    <td>
                      <strong>${l.projectId}</strong>
                      <div class="text-gold text-xs">${formatCurrencyValue(l.budget, curr)}</div>
                    </td>
                    <td>${l.date}</td>
                    <td><span class="status-pill status-${l.status.toLowerCase().replace(/\s+/g, '-')}">${l.status}</span></td>
                    <td>
                      <span class="badge-comm-stat ${l.status === 'Closed Won' ? 'paid' : l.status === 'Contract Sent' ? 'pending' : 'lead'}">
                        ${l.status === 'Closed Won' ? 'Commission Payable' : l.status === 'Contract Sent' ? 'Contract Verifying' : 'Referral In Progress'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-card-list mobile-only-cards">
            ${myLeads.map(l => `
              <div class="mobile-card-item glass-card">
                <div class="m-card-top">
                  <div>
                    <strong class="m-card-title">${l.name}</strong>
                    <div class="text-muted text-xs">${l.phone}</div>
                  </div>
                  <span class="status-pill status-${l.status.toLowerCase().replace(/\s+/g, '-')}">${l.status}</span>
                </div>
                <div class="m-card-details">
                  <div><span class="text-muted text-xs">Project:</span> <strong>${l.projectId}</strong></div>
                  <div><span class="text-muted text-xs">Budget:</span> <strong class="text-gold">${formatCurrencyValue(l.budget, curr)}</strong></div>
                </div>
                <div class="m-card-actions">
                  <a href="tel:${l.phone}" class="btn btn-secondary btn-xs"><i data-lucide="phone"></i> Call Client</a>
                  <a href="https://wa.me/${l.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-secondary btn-xs"><i data-lucide="message-circle"></i> WhatsApp</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'sales') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">My Closed Real Estate Sales</h2>
            <p class="module-subtitle">Deeds signed, developer verifications, and verified commission accruals</p>
          </div>
        </div>

        <div class="table-card glass-card">
          <!-- Desktop Table -->
          <div class="table-responsive desktop-only-table">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Customer Name</th>
                  <th>Development & Unit</th>
                  <th>Sale Price</th>
                  <th>Commission Earned</th>
                  <th>Deed Status</th>
                </tr>
              </thead>
              <tbody>
                ${mySales.map(s => {
                  const commEarned = s.grossCommission || s.netCommission || (Number(s.salePrice || 0) * (Number(s.commissionRate) || 3.5)) / 100;
                  return `
                    <tr>
                      <td><code>${s.id}</code></td>
                      <td><strong>${s.customerName}</strong></td>
                      <td>${s.projectId} - Unit ${s.unitId}</td>
                      <td><strong class="text-gold">${formatCurrencyValue(s.salePrice, curr)}</strong></td>
                      <td><strong class="text-green" style="font-size:1.05rem;">${formatCurrencyValue(commEarned, curr)}</strong></td>
                      <td><span class="status-pill status-${s.status.toLowerCase()}">${s.status}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-card-list mobile-only-cards">
            ${mySales.map(s => {
              const commEarned = s.grossCommission || s.netCommission || (Number(s.salePrice || 0) * (Number(s.commissionRate) || 3.5)) / 100;
              return `
                <div class="mobile-card-item glass-card">
                  <div class="m-card-top">
                    <div>
                      <strong class="m-card-title">${s.customerName}</strong>
                      <div class="text-muted text-xs">${s.projectId} • Unit ${s.unitId}</div>
                    </div>
                    <span class="status-pill status-${s.status.toLowerCase()}">${s.status}</span>
                  </div>
                  <div class="m-card-details">
                    <div><span class="text-muted text-xs">Sale:</span> <strong class="text-gold">${formatCurrencyValue(s.salePrice, curr)}</strong></div>
                    <div><span class="text-muted text-xs">Earned:</span> <strong class="text-green">${formatCurrencyValue(commEarned, curr)}</strong></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'commissions') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Commission Records & Clearances</h2>
            <p class="module-subtitle">Track milestones from initial deposit to clearance and bank wire transfer</p>
          </div>
        </div>

        <div class="table-card glass-card">
          <!-- Desktop Table -->
          <div class="table-responsive desktop-only-table">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Comm ID</th>
                  <th>Project / Client</th>
                  <th>Base Commission</th>
                  <th>Bonus / Tier</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${myComms.map(c => {
                  const relatedSale = platformStore.sales.find(s => s.id === c.saleId);
                  const clientName = c.customerName || (relatedSale ? relatedSale.customerName : 'Verified Investor');
                  const baseComm = c.baseCommission || c.grossCommission || (relatedSale ? relatedSale.grossCommission : c.netPayable);
                  const bonus = c.bonusAmount || (c.adjustments > 0 ? c.adjustments : 0);
                  const netPay = c.netPayable || baseComm;
                  return `
                    <tr>
                      <td><code>${c.id}</code></td>
                      <td><strong>${c.projectName}</strong><br><span class="text-muted text-xs">${clientName}</span></td>
                      <td>${formatCurrencyValue(baseComm, curr)}</td>
                      <td><span class="text-gold">+${formatCurrencyValue(bonus, curr)}</span></td>
                      <td><strong class="text-green" style="font-size:1.1rem;">${formatCurrencyValue(netPay, curr)}</strong></td>
                      <td><span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-card-list mobile-only-cards">
            ${myComms.map(c => {
              const relatedSale = platformStore.sales.find(s => s.id === c.saleId);
              const clientName = c.customerName || (relatedSale ? relatedSale.customerName : 'Verified Investor');
              const netPay = c.netPayable || c.grossCommission || 0;
              return `
                <div class="mobile-card-item glass-card">
                  <div class="m-card-top">
                    <div>
                      <strong class="m-card-title">${c.projectName}</strong>
                      <div class="text-muted text-xs">${clientName}</div>
                    </div>
                    <span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span>
                  </div>
                  <div class="m-card-details">
                    <div><span class="text-muted text-xs">Net Payable:</span> <strong class="text-green">${formatCurrencyValue(netPay, curr)}</strong></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'ledger') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Double-Entry Financial Ledger</h2>
            <p class="module-subtitle">Immutable transaction statements, financial credits, deductions, and settlement history</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-partner-print-stmt">
              <i data-lucide="printer"></i> <span>Print / PDF Statement</span>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-partner-export-csv">
              <i data-lucide="download"></i> <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div class="table-card glass-card">
          <!-- Desktop Table -->
          <div class="table-responsive desktop-only-table">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Tx ID / Date</th>
                  <th>Type</th>
                  <th>Project / Details</th>
                  <th>Customer</th>
                  <th>Net Financial Impact</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${myLedger.map(tx => `
                  <tr>
                    <td><code>${tx.id}</code><br><span class="text-muted">${tx.date}</span></td>
                    <td><span class="tx-type-pill tx-${tx.type.toLowerCase()}">${tx.type}</span></td>
                    <td>${tx.projectId}<br><span class="text-muted">${tx.unitId}</span></td>
                    <td>${tx.customerName}</td>
                    <td>
                      <strong class="${tx.netCommission < 0 ? 'text-green' : tx.netCommission > 0 ? 'text-gold' : 'text-muted'}">
                        ${tx.netCommission > 0 ? '+' : ''}${formatCurrencyValue(tx.netCommission, curr)}
                      </strong>
                    </td>
                    <td><code>${tx.reference}</code></td>
                    <td><span class="status-pill status-${tx.status.toLowerCase()}">${tx.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-card-list mobile-only-cards">
            ${myLedger.map(tx => `
              <div class="mobile-card-item glass-card">
                <div class="m-card-top">
                  <div>
                    <strong class="m-card-title">${tx.customerName}</strong>
                    <div class="text-muted text-xs"><code>${tx.id}</code> • ${tx.date}</div>
                  </div>
                  <span class="tx-type-pill tx-${tx.type.toLowerCase()}">${tx.type}</span>
                </div>
                <div class="m-card-details">
                  <div><span class="text-muted text-xs">Project:</span> ${tx.projectId}</div>
                  <div>
                    <span class="text-muted text-xs">Impact:</span> 
                    <strong class="${tx.netCommission < 0 ? 'text-green' : 'text-gold'}">
                      ${tx.netCommission > 0 ? '+' : ''}${formatCurrencyValue(tx.netCommission, curr)}
                    </strong>
                  </div>
                </div>
                <div class="text-muted text-xs" style="margin-top:4px;">Ref: <code>${tx.reference}</code></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'payments') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Payout Disbursements & Settlement History</h2>
            <p class="module-subtitle">Bank transfers, RTGS receipts, and payout request console</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-request-payout-modal">
              <i data-lucide="wallet"></i> <span>Request Payout</span>
            </button>
          </div>
        </div>

        <div class="table-card glass-card">
          <!-- Desktop Table -->
          <div class="table-responsive desktop-only-table">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Method & Reference</th>
                  <th>Amount Paid</th>
                  <th>Receipt</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${myPayments.map(p => `
                  <tr>
                    <td><code>${p.id}</code></td>
                    <td>${p.date}</td>
                    <td><strong>${p.method}</strong><br><code>${p.reference}</code></td>
                    <td><strong class="text-green" style="font-size:1.1rem;">${formatCurrencyValue(p.amount, curr)}</strong></td>
                    <td><button type="button" class="btn-text-link" onclick="alert('Viewing Bank Settlement Receipt Voucher #${p.reference}');"><i data-lucide="file-text"></i> Download</button></td>
                    <td><span class="status-pill status-paid">${p.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-card-list mobile-only-cards">
            ${myPayments.map(p => `
              <div class="mobile-card-item glass-card">
                <div class="m-card-top">
                  <div>
                    <strong class="m-card-title">${p.method}</strong>
                    <div class="text-muted text-xs"><code>${p.reference}</code> • ${p.date}</div>
                  </div>
                  <span class="status-pill status-paid">${p.status}</span>
                </div>
                <div class="m-card-details">
                  <div><span class="text-muted text-xs">Amount:</span> <strong class="text-green">${formatCurrencyValue(p.amount, curr)}</strong></div>
                  <button type="button" class="btn-text-link text-xs" onclick="alert('Viewing Bank Settlement Receipt Voucher #${p.reference}');"><i data-lucide="file-text"></i> Receipt</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'marketing') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Referral Center & Dynamic QR Studio</h2>
            <p class="module-subtitle">Generate scannable QR codes for global or project-specific referrals, download high-res PNG/SVG assets, and print official flyers</p>
          </div>
        </div>

        <!-- Interactive Referral Studio Card -->
        <div class="partner-ref-hero glass-card" style="margin-bottom: 30px;">
          <div class="ref-hero-info">
            <div class="section-eyebrow"><i data-lucide="sparkles"></i> DYNAMIC QR CODE & LINK GENERATOR</div>
            <h3 class="ref-hero-title">Custom Campaign & Project Links</h3>
            <p class="text-muted">Select an individual luxury development below to generate a tailored referral link and scannable QR code specifically for that project.</p>
            
            <div class="form-group" style="margin: 12px 0 16px 0;">
              <label class="form-label text-gold"><i data-lucide="target"></i> Select Destination Link Scope:</label>
              <select id="select-marketing-qr-scope" class="form-select" style="max-width: 480px; background: rgba(0,0,0,0.6);">
                <option value="global" selected>General Partner Invitation (proppartner.pro/?ref=${memberRefCode})</option>
                ${platformStore.projects.map(p => `
                  <option value="${p.id}">${p.name} (${p.city}) — ${p.commissionRate}% Commission</option>
                `).join('')}
              </select>
            </div>

            <div class="ref-hero-input-row">
              <input type="text" class="form-input ref-input" value="${globalRefLink}" readonly id="marketing-ref-url-display">
              <div class="ref-hero-btn-group">
                <button type="button" class="btn btn-gold" id="btn-mkt-copy-url"><i data-lucide="copy"></i> <span>COPY</span></button>
                <button type="button" class="btn btn-secondary" id="btn-mkt-open-url"><i data-lucide="external-link"></i> <span>OPEN</span></button>
                <button type="button" class="btn btn-whatsapp" id="btn-mkt-wa-share"><i data-lucide="message-circle"></i> <span>WHATSAPP</span></button>
              </div>
            </div>

            <div class="ref-meta-row">
              <div class="ref-meta-pill verified"><i data-lucide="shield-check"></i> <span>100% Scannable QR Verified</span></div>
              <div class="ref-meta-pill"><i data-lucide="activity"></i> <span>Escrow Attribution Active</span></div>
              <div class="ref-meta-pill"><i data-lucide="user-check"></i> <span>Partner: ${aff.name}</span></div>
            </div>
          </div>

          <div class="ref-hero-qr-deck">
            <div class="qr-canvas-container">
              <canvas id="marketing-dynamic-qr-canvas" class="real-qr-canvas" width="220" height="220"></canvas>
              <div class="qr-label-strip">
                <span class="qr-member-label" id="mkt-qr-target-label">General Partner Link</span>
                <div class="qr-code-label"><code>${memberRefCode}</code></div>
              </div>
            </div>

            <div class="qr-action-buttons-strip">
              <button type="button" class="btn btn-secondary btn-xs" id="btn-mkt-download-png" title="Download High-Res Branded PNG">
                <i data-lucide="download"></i> <span>PNG</span>
              </button>
              <button type="button" class="btn btn-secondary btn-xs" id="btn-mkt-download-svg" title="Download Vector SVG">
                <i data-lucide="file-code"></i> <span>SVG</span>
              </button>
              <button type="button" class="btn btn-gold btn-xs" id="btn-mkt-print-flyer" title="Print Marketing Flyer">
                <i data-lucide="printer"></i> <span>PRINT</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Downloadable Marketing Assets Library -->
        <h4 style="margin: 0 0 16px 0; color: var(--gold-light); display: flex; align-items: center; gap: 8px;">
          <i data-lucide="folder-down"></i> Official Marketing Kits & Presentation Lookbooks
        </h4>

        <div class="marketing-assets-grid">
          ${platformStore.marketing.map(m => `
            <div class="mkt-asset-card glass-card">
              <div class="mkt-card-header">
                <span class="mkt-category-pill">${m.category}</span>
                <span class="text-muted text-xs">${m.format}</span>
              </div>
              <h4 class="mkt-title">${m.title}</h4>
              <p class="mkt-project-label"><i data-lucide="building"></i> ${m.projectName}</p>
              <div class="mkt-footer">
                <button type="button" class="btn btn-gold btn-xs w-full" onclick="alert('Downloading Official Lookbook: ${m.title}');">
                  <i data-lucide="download"></i> Download Sales Kit
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (section === 'support') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Partner Concierge & AI Real Estate Assistant</h2>
            <p class="module-subtitle">Ask questions 24/7 on commission rules, lookbooks, site visits, or submit support tickets</p>
          </div>
        </div>

        <div class="support-split-grid">
          <!-- AI Assistant Chatbot -->
          <div class="glass-card ai-chat-card">
            <div class="ai-chat-header">
              <div class="ai-avatar-badge"><i data-lucide="sparkles"></i></div>
              <div>
                <h4>PropPartner AI Assistant</h4>
                <p class="text-muted text-xs">Instant 24/7 answers on developments & commissions</p>
              </div>
            </div>
            <div class="ai-chat-messages" id="ai-chat-msg-mount">
              <div class="ai-bubble incoming">
                Hello ${aff.name}! I am your PropPartner AI Concierge. Ask me anything about our 5 premier developments, commission payout schedules, or marketing materials!
              </div>
            </div>
            <form class="ai-chat-input-row" id="ai-chat-form">
              <input type="text" id="ai-user-prompt" class="form-input" placeholder="e.g. What is the commission rate on Luminary Towers?">
              <button type="submit" class="btn btn-gold btn-sm"><i data-lucide="send"></i></button>
            </form>
          </div>

          <!-- Support Tickets -->
          <div class="glass-card support-tickets-card">
            <div class="split-card-header">
              <h4>My Support Tickets</h4>
              <button type="button" class="btn btn-secondary btn-xs" id="btn-create-ticket"><i data-lucide="plus"></i> New Ticket</button>
            </div>
            <div class="ticket-list">
              ${platformStore.tickets.filter(t => t.affiliateId === aff.id).map(t => `
                <div class="ticket-item">
                  <div class="ticket-top">
                    <strong>${t.subject}</strong>
                    <span class="status-pill status-${t.status.toLowerCase()}">${t.status}</span>
                  </div>
                  <p class="text-muted text-xs">${t.messages[t.messages.length - 1].text}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'profile') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">My Partner Profile & Settlement Settings</h2>
            <p class="module-subtitle">Manage payout banking credentials, contact info and tax identification</p>
          </div>
        </div>

        <div class="settings-grid-2">
          <div class="glass-card settings-card">
            <h4 class="card-sec-title"><i data-lucide="user"></i> Personal & Professional Details</h4>
            <div class="form-group">
              <label class="form-label">Full Legal Name</label>
              <input type="text" class="form-input" value="${aff.name}">
            </div>
            <div class="form-group">
              <label class="form-label">Primary Email</label>
              <input type="email" class="form-input" value="${aff.email}" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">WhatsApp Number</label>
              <input type="tel" class="form-input" value="${aff.whatsapp}">
            </div>
            <div class="form-group">
              <label class="form-label">Company / Practice</label>
              <input type="text" class="form-input" value="${aff.company}">
            </div>
          </div>

          <div class="glass-card settings-card">
            <h4 class="card-sec-title"><i data-lucide="landmark"></i> Banking & Wire Transfer Settlement Info</h4>
            <div class="form-group">
              <label class="form-label">Settlement Bank Name</label>
              <input type="text" class="form-input" value="${aff.bankName || 'Habib Bank Limited'}">
            </div>
            <div class="form-group">
              <label class="form-label">Account Number / IBAN</label>
              <input type="text" class="form-input" value="${aff.accountNumber || 'PK36HABB00012345678901'}">
            </div>
            <div class="form-group">
              <label class="form-label">Account Title</label>
              <input type="text" class="form-input" value="${aff.accountTitle || aff.name}">
            </div>
            <div class="form-group">
              <label class="form-label">Tax ID / NTN / TRN</label>
              <input type="text" class="form-input" value="${aff.taxId || 'NTN-8921094-1'}">
            </div>
            <button type="button" class="btn btn-gold btn-sm w-full" style="margin-top:10px;" onclick="alert('Banking settlement details updated successfully!');">
              <i data-lucide="save"></i> Save Banking Details
            </button>
          </div>

          <!-- Account Password & 2FA Security -->
          <div class="glass-card settings-card" style="grid-column: span 2;">
            <h4 class="card-sec-title"><i data-lucide="shield-check"></i> Account Security, Password & Active Sessions</h4>
            <p class="text-muted text-xs" style="margin-bottom:12px;">Protect your commission entitlements and banking information with enterprise credential management.</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="button" class="btn btn-gold btn-sm" id="btn-partner-open-pass-modal">
                <i data-lucide="key-round"></i> Change Password
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-partner-open-2fa-modal">
                <i data-lucide="shield-check"></i> Two-Factor Authentication (2FA)
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-partner-open-sessions-modal">
                <i data-lucide="smartphone"></i> Active Device Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `<div class="partner-module-view"><p>Select a tab from the sidebar.</p></div>`;
}

function attachPartnerSubmoduleEvents(container, aff, navigateTo) {
  const memberRefCode = aff.referralCode || aff.id;
  const globalRefLink = generateReferralUrl(memberRefCode);

  // 1. Render Dashboard QR Code
  const dashCanvas = container.querySelector('#dash-partner-qr-canvas');
  if (dashCanvas) {
    renderQrToCanvas(dashCanvas, globalRefLink, { size: 280, includeLogo: true });
  }

  // Dashboard Copy button
  const heroCopyBtn = container.querySelector('#btn-hero-copy-ref');
  if (heroCopyBtn) {
    heroCopyBtn.onclick = () => {
      navigator.clipboard.writeText(globalRefLink);
      alert(`✅ Unique Partner Referral URL copied to clipboard:\n\n${globalRefLink}`);
    };
  }

  // Dashboard Open button
  const heroOpenBtn = container.querySelector('#btn-hero-open-ref');
  if (heroOpenBtn) {
    heroOpenBtn.onclick = () => {
      window.open(globalRefLink, '_blank');
    };
  }

  // Dashboard WhatsApp button
  const heroWaBtn = container.querySelector('#btn-hero-wa-share');
  if (heroWaBtn) {
    heroWaBtn.onclick = () => {
      const msg = encodeURIComponent(`Hello! Explore luxury real estate investment opportunities through PropPartner with verified developer pricing and priority allocation:\n\n${globalRefLink}`);
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    };
  }

  // Dashboard Native Share button
  const heroShareBtn = container.querySelector('#btn-hero-native-share');
  if (heroShareBtn) {
    heroShareBtn.onclick = () => {
      triggerNativeShare(
        'PropPartner Real Estate Network',
        'Explore premier luxury residential and commercial real estate investment opportunities with guaranteed escrow protection:',
        globalRefLink
      );
    };
  }

  // Dashboard QR Download PNG
  const heroPngBtn = container.querySelector('#btn-qr-download-png');
  if (heroPngBtn) {
    heroPngBtn.onclick = () => {
      downloadBrandedQrPng(globalRefLink, aff.name, aff.id, null);
    };
  }

  // Dashboard QR Download SVG
  const heroSvgBtn = container.querySelector('#btn-qr-download-svg');
  if (heroSvgBtn) {
    heroSvgBtn.onclick = () => {
      downloadQrSvg(globalRefLink, aff.id);
    };
  }

  // Dashboard QR Print Flyer
  const heroPrintBtn = container.querySelector('#btn-qr-print-flyer');
  if (heroPrintBtn) {
    heroPrintBtn.onclick = () => {
      printQrFlyer(globalRefLink, aff.name, aff.id, null);
    };
  }

  // 2. Marketing / QR Studio Tab Controls
  const mktCanvas = container.querySelector('#marketing-dynamic-qr-canvas');
  const mktScopeSelect = container.querySelector('#select-marketing-qr-scope');
  const mktUrlDisplay = container.querySelector('#marketing-ref-url-display');
  const mktTargetLabel = container.querySelector('#mkt-qr-target-label');

  let currentMktUrl = globalRefLink;
  let currentMktProjName = null;

  function updateMarketingQr() {
    if (!mktCanvas) return;
    const scope = mktScopeSelect ? mktScopeSelect.value : 'global';

    if (scope === 'global') {
      currentMktUrl = globalRefLink;
      currentMktProjName = null;
      if (mktTargetLabel) mktTargetLabel.textContent = 'General Partner Link';
    } else {
      const proj = platformStore.projects.find(p => p.id === scope);
      currentMktUrl = generateReferralUrl(memberRefCode, scope);
      currentMktProjName = proj ? proj.name : scope;
      if (mktTargetLabel) mktTargetLabel.textContent = currentMktProjName;
    }

    if (mktUrlDisplay) mktUrlDisplay.value = currentMktUrl;
    renderQrToCanvas(mktCanvas, currentMktUrl, { size: 280, includeLogo: true });
  }

  if (mktCanvas) {
    updateMarketingQr();
    if (mktScopeSelect) mktScopeSelect.onchange = updateMarketingQr;

    const mktCopyBtn = container.querySelector('#btn-mkt-copy-url');
    if (mktCopyBtn) {
      mktCopyBtn.onclick = () => {
        navigator.clipboard.writeText(currentMktUrl);
        alert(`✅ Copied destination referral link:\n\n${currentMktUrl}`);
      };
    }

    const mktOpenBtn = container.querySelector('#btn-mkt-open-url');
    if (mktOpenBtn) {
      mktOpenBtn.onclick = () => window.open(currentMktUrl, '_blank');
    }

    const mktWaBtn = container.querySelector('#btn-mkt-wa-share');
    if (mktWaBtn) {
      mktWaBtn.onclick = () => {
        const text = currentMktProjName 
          ? `Hello! View exclusive investment details and units for ${currentMktProjName}:\n\n${currentMktUrl}`
          : `Hello! Discover luxury real estate investments on PropPartner:\n\n${currentMktUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      };
    }

    const mktPngBtn = container.querySelector('#btn-mkt-download-png');
    if (mktPngBtn) {
      mktPngBtn.onclick = () => downloadBrandedQrPng(currentMktUrl, aff.name, aff.id, currentMktProjName);
    }

    const mktSvgBtn = container.querySelector('#btn-mkt-download-svg');
    if (mktSvgBtn) {
      mktSvgBtn.onclick = () => downloadQrSvg(currentMktUrl, `${aff.id}_${currentMktProjName || 'General'}`);
    }

    const mktPrintBtn = container.querySelector('#btn-mkt-print-flyer');
    if (mktPrintBtn) {
      mktPrintBtn.onclick = () => printQrFlyer(currentMktUrl, aff.name, aff.id, currentMktProjName);
    }
  }

  // 3. Project-specific Referral Modal triggers
  container.querySelectorAll('.btn-open-proj-qr-modal').forEach(btn => {
    btn.onclick = () => {
      const projId = btn.dataset.proj;
      const proj = platformStore.projects.find(p => p.id === projId) || { id: projId, name: btn.dataset.name, commissionRate: btn.dataset.comm };
      showProjectQrModal(proj, aff);
    };
  });

  // Quick navigation buttons
  const dashAllProj = container.querySelector('#btn-dash-all-proj') || container.querySelector('#mqa-find-proj');
  if (dashAllProj) dashAllProj.onclick = () => navigateTo('projects');

  const mqaAddLead = container.querySelector('#mqa-add-lead');
  if (mqaAddLead) mqaAddLead.onclick = () => showSubmitLeadModal(aff, navigateTo);

  const mqaViewLedger = container.querySelector('#mqa-view-ledger');
  if (mqaViewLedger) mqaViewLedger.onclick = () => navigateTo('ledger');

  const mqaMktKit = container.querySelector('#mqa-mkt-kit');
  if (mqaMktKit) mqaMktKit.onclick = () => navigateTo('marketing');

  const dashSubmitLead = container.querySelector('#btn-dash-submit-lead') || container.querySelector('#btn-partner-submit-lead-modal');
  if (dashSubmitLead) {
    dashSubmitLead.onclick = () => showSubmitLeadModal(aff, navigateTo);
  }

  const reqPayoutBtn = container.querySelector('#btn-request-payout-modal');
  if (reqPayoutBtn) {
    reqPayoutBtn.onclick = () => showRequestPayoutModal(aff, stats, navigateTo);
  }

  const partnerPrintStmtBtn = container.querySelector('#btn-partner-print-stmt');
  if (partnerPrintStmtBtn) {
    partnerPrintStmtBtn.onclick = () => {
      printLedgerStatement({
        transactions: myLedger,
        scopeTitle: `Partner Financial Statement — ${aff.name}`,
        currency: curr,
        affiliateInfo: aff
      });
    };
  }

  const partnerExportCsvBtn = container.querySelector('#btn-partner-export-csv');
  if (partnerExportCsvBtn) {
    partnerExportCsvBtn.onclick = () => {
      exportLedgerCSV({
        transactions: myLedger,
        filename: `PropPartner_Statement_${aff.id}`
      });
    };
  }

  // Profile & Password Security Modal triggers
  const profileTrigger = container.querySelector('#partner-topbar-profile-trigger');
  if (profileTrigger) {
    profileTrigger.onclick = (e) => {
      if (e.target.closest('#btn-partner-logout')) return;
      openProfileSecurityModal('password', () => navigateTo('profile'));
    };
  }

  const passModalBtn = container.querySelector('#btn-partner-open-pass-modal');
  if (passModalBtn) {
    passModalBtn.onclick = () => openProfileSecurityModal('password', () => navigateTo('profile'));
  }

  const twoFAModalBtn = container.querySelector('#btn-partner-open-2fa-modal');
  if (twoFAModalBtn) {
    twoFAModalBtn.onclick = () => openProfileSecurityModal('2fa', () => navigateTo('profile'));
  }

  const sessionsModalBtn = container.querySelector('#btn-partner-open-sessions-modal');
  if (sessionsModalBtn) {
    sessionsModalBtn.onclick = () => openProfileSecurityModal('sessions', () => navigateTo('profile'));
  }

  // AI Chat Assistant handling
  const aiForm = container.querySelector('#ai-chat-form');
  if (aiForm) {
    aiForm.onsubmit = (e) => {
      e.preventDefault();
      const input = container.querySelector('#ai-user-prompt');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const mount = container.querySelector('#ai-chat-msg-mount');
      if (mount) {
        const userDiv = document.createElement('div');
        userDiv.className = 'ai-bubble outgoing';
        userDiv.textContent = text;
        mount.appendChild(userDiv);

        setTimeout(() => {
          const aiDiv = document.createElement('div');
          aiDiv.className = 'ai-bubble incoming';

          const lower = text.toLowerCase();
          if (lower.includes('luminary')) {
            aiDiv.textContent = `The Luminary Sky Residences offers a 3.5% base commission rate. Starting prices are PKR 3.85 Cr with up to 4.2% milestone bonuses on 6+ closed transactions.`;
          } else if (lower.includes('elysium') || lower.includes('villa')) {
            aiDiv.textContent = `Elysium Waterfront Villas features private beachfront properties with starting prices of PKR 6.50 Cr and top-tier commissions of 4.5% to 5.5%.`;
          } else if (lower.includes('payout') || lower.includes('when') || lower.includes('wire')) {
            aiDiv.textContent = `Affiliate commissions are disbursed weekly every Friday via RTGS / wire transfer once transaction deeds are verified by developer legal desks.`;
          } else {
            aiDiv.textContent = `Thank you for your question! All 5 developments (Luminary Towers, Elysium Villas, Nexus Horizon, Crescent Bay, Marina Enclave) are currently accepting qualified referrals. You can copy your custom referral links from the Projects tab!`;
          }

          mount.appendChild(aiDiv);
          mount.scrollTop = mount.scrollHeight;
        }, 400);
      }
    };
  }
}

function showProjectQrModal(project, aff) {
  const memberRefCode = aff.referralCode || aff.id;
  const projectRefUrl = generateReferralUrl(memberRefCode, project.id);

  let modal = document.getElementById('project-qr-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'project-qr-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 580px;">
      <button type="button" class="auth-modal-close" id="btn-close-proj-qr"><i data-lucide="x"></i></button>
      
      <div class="auth-modal-header" style="text-align: center; margin-bottom: 20px;">
        <div class="section-eyebrow"><i data-lucide="building"></i> PROJECT REFERRAL ENGINE</div>
        <h3 class="auth-modal-title" style="font-size: 1.4rem;">${project.name}</h3>
        <p class="auth-modal-subtitle">Earn <strong>${project.commissionRate}% Commission</strong> per referral transaction.</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div class="qr-canvas-container" style="max-width: 240px;">
          <canvas id="proj-modal-qr-canvas" class="real-qr-canvas" width="220" height="220"></canvas>
          <div class="qr-label-strip">
            <span>Development: <strong>${project.name}</strong></span>
            <div><code>${memberRefCode}</code></div>
          </div>
        </div>

        <div style="width: 100%;">
          <label class="form-label text-xs text-muted">Direct Project Referral URL</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" class="form-input ref-input" value="${projectRefUrl}" readonly id="proj-modal-url-input" style="font-size: 0.82rem;">
            <button type="button" class="btn btn-gold btn-sm" id="btn-proj-modal-copy"><i data-lucide="copy"></i> Copy</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-proj-modal-png">
            <i data-lucide="download"></i> PNG Card
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-proj-modal-svg">
            <i data-lucide="file-code"></i> Vector SVG
          </button>
          <button type="button" class="btn btn-gold btn-sm" id="btn-proj-modal-flyer">
            <i data-lucide="printer"></i> Print Flyer
          </button>
        </div>

        <button type="button" class="btn btn-whatsapp btn-sm w-full" id="btn-proj-modal-wa">
          <i data-lucide="message-circle"></i> Share on WhatsApp with Marketing Copy
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const canvas = modal.querySelector('#proj-modal-qr-canvas');
  if (canvas) {
    renderQrToCanvas(canvas, projectRefUrl, { size: 280, includeLogo: true });
  }

  const closeBtn = modal.querySelector('#btn-close-proj-qr');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

  const copyBtn = modal.querySelector('#btn-proj-modal-copy');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(projectRefUrl);
      alert(`✅ Copied project referral URL:\n\n${projectRefUrl}`);
    };
  }

  const pngBtn = modal.querySelector('#btn-proj-modal-png');
  if (pngBtn) pngBtn.onclick = () => downloadBrandedQrPng(projectRefUrl, aff.name, aff.id, project.name);

  const svgBtn = modal.querySelector('#btn-proj-modal-svg');
  if (svgBtn) svgBtn.onclick = () => downloadQrSvg(projectRefUrl, `${aff.id}_${project.id}`);

  const flyerBtn = modal.querySelector('#btn-proj-modal-flyer');
  if (flyerBtn) flyerBtn.onclick = () => printQrFlyer(projectRefUrl, aff.name, aff.id, project.name);

  const waBtn = modal.querySelector('#btn-proj-modal-wa');
  if (waBtn) {
    waBtn.onclick = () => {
      const msg = encodeURIComponent(`Exclusive Opportunity: Explore ${project.name} with developer pricing and priority allocation:\n\n${projectRefUrl}`);
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    };
  }
}

/**
 * Modal: Submit Client Referral
 */
function showSubmitLeadModal(aff, navigateTo) {
  let modal = document.getElementById('partner-submit-lead-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'partner-submit-lead-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 560px;">
      <button type="button" class="auth-modal-close" id="lead-modal-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="section-eyebrow"><i data-lucide="user-plus"></i> NEW CLIENT REFERRAL</div>
        <h3 class="auth-modal-title">Introduce Buyer / Investor</h3>
        <p class="auth-modal-subtitle">Directly register a client lead locked to your partner ID (<code>${aff.id}</code>)</p>
      </div>

      <form id="partner-lead-form" class="auth-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Client Legal Name</label>
            <input type="text" id="lead-name-input" class="form-input" placeholder="e.g. M. Zubair Chaudhry" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Phone / WhatsApp</label>
            <input type="text" id="lead-phone-input" class="form-input" placeholder="+92 300 1234567" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Email Address</label>
            <input type="email" id="lead-email-input" class="form-input" placeholder="client@domain.com">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Target Project Development</label>
            <select id="lead-proj-select" class="form-input">
              ${platformStore.projects.map(p => `
                <option value="${p.id}">${p.name} (${p.commissionRate}% Comm)</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Estimated Purchasing Budget (PKR)</label>
          <input type="number" id="lead-budget-input" class="form-input" placeholder="35000000" value="35000000" required>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Specific Requirements / Notes</label>
          <textarea id="lead-notes-input" class="form-input" rows="2" placeholder="e.g. Interested in ground floor commercial shop, 450 sq.ft..."></textarea>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="lead-modal-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Lock Attribution & Submit</button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#lead-modal-close').onclick = close;
  modal.querySelector('#lead-modal-cancel').onclick = close;

  modal.querySelector('#partner-lead-form').onsubmit = (e) => {
    e.preventDefault();
    const name = modal.querySelector('#lead-name-input').value.trim();
    const phone = modal.querySelector('#lead-phone-input').value.trim();
    const email = modal.querySelector('#lead-email-input').value.trim();
    const projectId = modal.querySelector('#lead-proj-select').value;
    const budget = Number(modal.querySelector('#lead-budget-input').value) || 35000000;
    const notes = modal.querySelector('#lead-notes-input').value.trim();

    const res = platformStore.submitLead({
      name,
      phone,
      email,
      projectId,
      budget,
      notes,
      affiliateId: aff.id,
      source: 'Affiliate Partner Direct Submission'
    });

    close();
    if (res.isDuplicate) {
      alert('⚠️ Note: This client contact was flagged as a potential duplicate and is currently under administrative attribution review.');
    } else {
      alert('✅ Client lead registered successfully! Locked to your affiliate code for 90 days.');
    }
    navigateTo('leads');
  };
}

/**
 * Modal: Request Commission Payout
 */
function showRequestPayoutModal(aff, stats, navigateTo) {
  let modal = document.getElementById('partner-request-payout-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'partner-request-payout-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  const currentStats = platformStore.getAffiliateStats(aff.id);
  const payableAmt = (currentStats && currentStats.payableCommission !== undefined) ? currentStats.payableCommission : (stats ? stats.payableCommission : 0);

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 520px;">
      <button type="button" class="auth-modal-close" id="payout-modal-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="section-eyebrow"><i data-lucide="wallet"></i> COMMISSION SETTLEMENT</div>
        <h3 class="auth-modal-title">Request Bank Wire Payout</h3>
        <p class="auth-modal-subtitle">Payable Balance: <strong class="text-green">${formatCurrencyValue(payableAmt)}</strong></p>
      </div>

      <form id="partner-payout-form" class="auth-form">
        <div class="form-group">
          <label class="form-label text-xs">Payout Amount (PKR)</label>
          <input type="number" id="payout-amount-input" class="form-input" value="${payableAmt > 0 ? payableAmt : 500000}" min="1000" required>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Beneficiary Bank & Account</label>
          <input type="text" class="form-input" value="${aff.bankName || 'HBL Prestige'} · ${aff.accountNumber || 'PK36HABB00012345678901'}" readonly>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Payout Instructions / Reference Note</label>
          <input type="text" id="payout-notes-input" class="form-input" placeholder="e.g. Standard weekly batch settlement">
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="payout-modal-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">
            <i data-lucide="send"></i> <span>Submit Payout Request</span>
          </button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#payout-modal-close').onclick = close;
  modal.querySelector('#payout-modal-cancel').onclick = close;

  modal.querySelector('#partner-payout-form').onsubmit = (e) => {
    e.preventDefault();
    const amount = Number(modal.querySelector('#payout-amount-input').value) || 500000;
    const notes = modal.querySelector('#payout-notes-input').value;

    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      affiliateId: aff.id,
      affiliateName: aff.name,
      amount: amount,
      method: 'RTGS / Bank Wire Transfer',
      reference: `REQ-WIRE-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      notes: notes || 'Partner portal payout request'
    };

    platformStore.payments.unshift(newPayment);
    platformStore.save();

    alert(`✅ Payout request for PKR ${amount.toLocaleString()} submitted successfully!\nProcessing via RTGS in Friday's wire batch.`);
    close();
    navigateTo('payments');
  };
}

