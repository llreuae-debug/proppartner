// Affiliate Portal Shell - Partner Workspace, Navigation & Mobile App Controls

import { authStore } from '../../store/authStore.js';
import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';
import { renderMobileHeader, renderMobileBottomBar, openMoreBottomSheet, triggerNativeShare } from '../common/MobileAppNav.js';

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
    const globalRefLink = `https://proppartner.network/ref/${aff.id}`;

    container.innerHTML = `
      <div class="portal-app-layout">
        <!-- Native Mobile Header (Shown on < 1024px) -->
        ${renderMobileHeader(container, getPartnerPageTitle(currentSection), null, null)}

        <!-- Partner Sidebar (Desktop / Tablet Drawer) -->
        <aside class="portal-sidebar glass-card" id="partner-sidebar">
          <div class="sidebar-brand-header">
            <a href="#" class="brand-logo brand-logo-img">
              <img src="/assets/proppartner-icon.jpg" alt="PropPartner" class="logo-img-icon" width="34" height="34">
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
              <span>Projects to Promote</span>
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
              <i data-lucide="folder-down"></i>
              <span>Marketing Library</span>
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

          <!-- Sidebar Footer Switcher -->
          <div class="sidebar-footer">
            <button type="button" class="sidebar-switch-btn" id="btn-partner-switch-landing">
              <i data-lucide="globe"></i> <span>View Landing Page</span>
            </button>
            <button type="button" class="sidebar-switch-btn text-cyan" id="btn-partner-switch-admin">
              <i data-lucide="shield-check"></i> <span>Super Admin Mode</span>
            </button>
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
                <span class="ref-pill-label">Referral Link:</span>
                <code>/ref/${aff.id}</code>
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

              <!-- User Profile Menu -->
              <div class="topbar-user-pill">
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
        authStore.logout();
        if (onNavigateLanding) onNavigateLanding();
      };
    }

    // Attach submodule internal listeners
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
      marketing: 'Marketing Kits & Collateral',
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
  const globalRefLink = `https://proppartner.network/ref/${aff.id}`;

  if (section === 'dashboard') {
    return `
      <div class="partner-dashboard-view">
        <!-- Live Referral Link Box -->
        <div class="partner-ref-hero glass-card">
          <div class="ref-hero-info">
            <div class="section-eyebrow"><i data-lucide="link-2"></i> YOUR UNIQUE PARTNER REFERRAL URL</div>
            <h3 class="ref-hero-title">Share Your Direct Referral Link</h3>
            <p class="text-muted">Introduce high-net-worth investors or buyers. Web visits and form submissions are automatically locked to your partner ID (<code>${aff.id}</code>).</p>
            <div class="ref-hero-input-row">
              <input type="text" class="form-input ref-input" value="${globalRefLink}" readonly id="partner-ref-hero-url">
              <div class="ref-hero-btn-group">
                <button type="button" class="btn btn-gold" id="btn-hero-copy-ref"><i data-lucide="copy"></i> <span>COPY</span></button>
                <button type="button" class="btn btn-secondary" id="btn-hero-native-share"><i data-lucide="share-2"></i> <span>SHARE</span></button>
              </div>
            </div>
          </div>
          <div class="ref-hero-qr">
            <div class="qr-box">
              <i data-lucide="qr-code" style="width:64px; height:64px; color:var(--gold-light);"></i>
              <span>Scan QR to Open Link</span>
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

        <!-- Featured Projects -->
        <div class="table-card glass-card" style="margin-bottom: 24px;">
          <div class="table-card-header">
            <h4><i data-lucide="building-2"></i> Projects Ready to Promote</h4>
            <button type="button" class="btn-text-link" id="btn-dash-all-proj">View All →</button>
          </div>
          <div class="partner-proj-cards-grid">
            ${platformStore.projects.slice(0, 3).map(p => `
              <div class="p-promo-card glass-card">
                <img src="${p.image}" alt="${p.name}" class="promo-card-thumb" loading="lazy">
                <div class="promo-card-body">
                  <div class="promo-rate-pill">${p.commissionRate}% Base Comm.</div>
                  <h4 class="promo-card-title">${p.name}</h4>
                  <p class="text-muted text-xs"><i data-lucide="map-pin"></i> ${p.location}, ${p.city}</p>
                  <div class="promo-price-row">
                    <span>Starting:</span>
                    <strong class="text-gold">${formatCurrencyValue(p.startingPrice, curr)}</strong>
                  </div>
                  <div class="promo-actions-row">
                    <button type="button" class="btn btn-gold btn-sm w-full btn-copy-proj-ref" data-proj="${p.id}">
                      <i data-lucide="share-2"></i> <span>Get Referral Link</span>
                    </button>
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
                  <button type="button" class="btn btn-gold btn-sm w-full btn-copy-proj-ref" data-proj="${p.id}" data-name="${p.name}">
                    <i data-lucide="share-2"></i> <span>Share Referral Link</span>
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="alert('Downloading Official Lookbook for ${p.name}');">
                    <i data-lucide="download"></i> <span>Brochure</span>
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
                  <th>Attribution</th>
                </tr>
              </thead>
              <tbody>
                ${myLeads.map(l => `
                  <tr>
                    <td><code>${l.id}</code></td>
                    <td><strong>${l.name}</strong><br><span class="text-muted">${l.phone}</span></td>
                    <td>${l.projectId}<br><span class="text-gold">${formatCurrencyValue(l.budget, curr)}</span></td>
                    <td>${l.date}</td>
                    <td><span class="status-pill status-${l.status.toLowerCase()}">${l.status}</span></td>
                    <td><span class="status-pill status-approved">${l.attributionStatus || 'Attributed'}</span></td>
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
                    <div class="text-muted text-xs"><code>${l.id}</code> • ${l.phone}</div>
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

  if (section === 'commissions') {
    return `
      <div class="partner-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">My Commission Statements & Earnings</h2>
            <p class="module-subtitle">Transparent tracking of milestone rates, verified deals, and scheduled payouts</p>
          </div>
        </div>

        <!-- Mobile Earnings Summary Cards -->
        <div class="earnings-summary-cards-grid">
          <div class="e-stat-card glass-card">
            <span>Payable Now</span>
            <strong class="text-cyan">${formatCurrencyValue(stats.payableCommission, curr)}</strong>
          </div>
          <div class="e-stat-card glass-card">
            <span>Pending Verification</span>
            <strong class="text-yellow">${formatCurrencyValue(stats.pendingCommission, curr)}</strong>
          </div>
          <div class="e-stat-card glass-card">
            <span>Total Disbursed</span>
            <strong class="text-green">${formatCurrencyValue(stats.paidCommission, curr)}</strong>
          </div>
        </div>

        <div class="table-card glass-card">
          <!-- Desktop Table -->
          <div class="table-responsive desktop-only-table">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Comm ID / Date</th>
                  <th>Project</th>
                  <th>Gross Sale</th>
                  <th>Rate</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${myComms.map(c => `
                  <tr>
                    <td><code>${c.id}</code><br><span class="text-muted">${c.createdDate}</span></td>
                    <td><strong>${c.projectName}</strong></td>
                    <td>${formatCurrencyValue(c.grossSale, curr)}</td>
                    <td><strong class="text-gold">${c.rate}%</strong></td>
                    <td><strong class="text-green" style="font-size:1.1rem;">${formatCurrencyValue(c.netPayable, curr)}</strong></td>
                    <td><span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-card-list mobile-only-cards">
            ${myComms.map(c => `
              <div class="mobile-card-item glass-card">
                <div class="m-card-top">
                  <div>
                    <strong class="m-card-title">${c.projectName}</strong>
                    <div class="text-muted text-xs"><code>${c.id}</code> • ${c.createdDate}</div>
                  </div>
                  <span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span>
                </div>
                <div class="m-card-details">
                  <div><span class="text-muted text-xs">Gross Sale:</span> ${formatCurrencyValue(c.grossSale, curr)} (${c.rate}%)</div>
                  <div><span class="text-muted text-xs">Commission:</span> <strong class="text-green">${formatCurrencyValue(c.netPayable, curr)}</strong></div>
                </div>
              </div>
            `).join('')}
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
            <h2 class="module-title">Personal Partner Journal & Ledger</h2>
            <p class="module-subtitle">Itemized double-entry transaction record showing all commission credits, wire debits, and adjustments</p>
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
                    <td><a href="#" class="btn-text-link" onclick="alert('Viewing Bank Settlement Receipt Voucher #${p.reference}'); return false;"><i data-lucide="file-text"></i> Download</a></td>
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
                  <a href="#" class="btn-text-link text-xs" onclick="alert('Viewing Bank Settlement Receipt Voucher #${p.reference}'); return false;"><i data-lucide="file-text"></i> Receipt</a>
                </div>
              </div>
            `).join('')}
          </div>
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
        </div>
      </div>
    `;
  }

  // Fallback Marketing view
  return `
    <div class="partner-module-view">
      <div class="module-header-row">
        <div>
          <h2 class="module-title">Marketing Materials & Sales Kits</h2>
          <p class="module-subtitle">Download high-res lookbooks, WhatsApp copy kits, social media carousels and price lists</p>
        </div>
      </div>

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
              <button type="button" class="btn btn-gold btn-xs w-full" onclick="alert('Downloading: ${m.title}');">
                <i data-lucide="download"></i> Download Sales Kit
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function attachPartnerSubmoduleEvents(container, aff, navigateTo) {
  // Hero copy button
  const heroCopyBtn = container.querySelector('#btn-hero-copy-ref');
  if (heroCopyBtn) {
    heroCopyBtn.onclick = () => {
      const url = `https://proppartner.network/ref/${aff.id}`;
      navigator.clipboard.writeText(url);
      alert(`Copied unique referral link:\n${url}`);
    };
  }

  // Hero native share button
  const heroShareBtn = container.querySelector('#btn-hero-native-share');
  if (heroShareBtn) {
    heroShareBtn.onclick = () => {
      triggerNativeShare(
        'PropPartner Real Estate Network',
        'Explore premier luxury residential and commercial real estate investment opportunities:',
        `https://proppartner.network/ref/${aff.id}`
      );
    };
  }

  // Project-specific referral link copy / native share
  container.querySelectorAll('.btn-copy-proj-ref').forEach(btn => {
    btn.onclick = () => {
      const projId = btn.dataset.proj;
      const projName = btn.dataset.name || projId;
      const url = `https://proppartner.network/ref/${aff.id}/${projId}`;
      triggerNativeShare(
        `Explore ${projName}`,
        `Exclusive real estate opportunity: ${projName}. Inquire or book via this verified partner link:`,
        url
      );
    };
  });

  const dashAllProj = container.querySelector('#btn-dash-all-proj') || container.querySelector('#mqa-find-proj');
  if (dashAllProj) dashAllProj.onclick = () => navigateTo('projects');

  const mqaAddLead = container.querySelector('#mqa-add-lead');
  if (mqaAddLead) mqaAddLead.onclick = () => showSubmitLeadPrompt(aff, navigateTo);

  const mqaViewLedger = container.querySelector('#mqa-view-ledger');
  if (mqaViewLedger) mqaViewLedger.onclick = () => navigateTo('ledger');

  const mqaMktKit = container.querySelector('#mqa-mkt-kit');
  if (mqaMktKit) mqaMktKit.onclick = () => navigateTo('marketing');

  const dashSubmitLead = container.querySelector('#btn-dash-submit-lead') || container.querySelector('#btn-partner-submit-lead-modal');
  if (dashSubmitLead) {
    dashSubmitLead.onclick = () => showSubmitLeadPrompt(aff, navigateTo);
  }

  const reqPayoutBtn = container.querySelector('#btn-request-payout-modal');
  if (reqPayoutBtn) {
    reqPayoutBtn.onclick = () => {
      alert(`✅ Payout Request Submitted!\nYour payable balance will be processed in Friday's batch wire transfer to ${aff.bankName || 'HBL Prestige'}.`);
    };
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

function showSubmitLeadPrompt(aff, navigateTo) {
  const name = prompt('Enter Client / Buyer Legal Name:');
  if (!name) return;
  const phone = prompt('Enter Client Phone / WhatsApp:', '+92 300 1234567');
  const email = prompt('Enter Client Email:', 'client@domain.com');
  const budget = prompt('Estimated Budget in PKR:', '35000000');

  const res = platformStore.submitLead({
    name,
    phone,
    email,
    budget: Number(budget) || 35000000,
    projectId: platformStore.projects[0].id,
    affiliateId: aff.id,
    source: 'Affiliate Partner Portal'
  });

  if (res.isDuplicate) {
    alert('⚠️ Note: This client contact was flagged as a potential duplicate and is currently under administrative review.');
  } else {
    alert('✅ Client lead submitted successfully! Our project sales desk has been assigned.');
  }
  navigateTo('leads');
}
