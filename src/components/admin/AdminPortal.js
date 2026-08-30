// Admin Portal Shell - Super Admin Master Workspace Shell, Navigation & Submodule Coordinator

import { authStore } from '../../store/authStore.js';
import { platformStore } from '../../store/platformStore.js';
import { renderAdminDashboard } from './AdminDashboard.js';
import { renderAffiliatesManager } from './AffiliatesManager.js';
import { renderProjectsManager } from './ProjectsManager.js';
import { renderLeadsCRM } from './LeadsCRM.js';
import { renderSalesManager } from './SalesManager.js';
import { renderCommissionsManager } from './CommissionsManager.js';
import { renderPaymentsManager } from './PaymentsManager.js';
import { renderLedgersManager } from './LedgersManager.js';
import { renderMarketingManager } from './MarketingManager.js';
import { renderAuditLogs } from './AuditLogsViewer.js';
import { renderSettingsCenter } from './SettingsCenter.js';

export function initAdminPortal(container, onNavigateLanding, onSwitchAffiliateView) {
  let currentSection = 'dashboard';
  let sectionParams = {};

  function navigateTo(section, params = {}) {
    currentSection = section;
    sectionParams = params;
    render();
  }

  function render() {
    const user = authStore.getUser() || { name: 'Super Admin', role: 'SUPER_ADMIN' };
    const pendingAffs = platformStore.affiliates.filter(a => a.status === 'Pending').length;
    const duplicateLeads = platformStore.leads.filter(l => l.duplicateFlag).length;
    const pendingComms = platformStore.commissions.filter(c => c.status === 'Pending').length;
    const payableComms = platformStore.commissions.filter(c => c.status === 'Payable').length;

    container.innerHTML = `
      <div class="portal-app-layout">
        <!-- Sidebar Navigation -->
        <aside class="portal-sidebar glass-card" id="admin-sidebar">
          <div class="sidebar-brand-header">
            <a href="#" class="brand-logo brand-logo-img" id="sidebar-logo-link">
              <img src="/assets/proppartner-icon.jpg" alt="PropPartner" class="logo-img-icon" width="34" height="34">
              <div class="logo-text">PROP<span>PARTNER</span></div>
            </a>
            <span class="badge-role-admin">SUPER ADMIN</span>
          </div>

          <nav class="sidebar-nav-scroll">
            <div class="nav-section-title">CORE OPERATIONS</div>
            <button type="button" class="sidebar-nav-item ${currentSection === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
              <i data-lucide="layout-dashboard"></i>
              <span>Dashboard & BI</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'affiliates' ? 'active' : ''}" data-nav="affiliates">
              <i data-lucide="users"></i>
              <span>Affiliate Partners</span>
              ${pendingAffs > 0 ? `<span class="nav-counter yellow">${pendingAffs}</span>` : ''}
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'projects' ? 'active' : ''}" data-nav="projects">
              <i data-lucide="building-2"></i>
              <span>Projects & ERP</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'leads' ? 'active' : ''}" data-nav="leads">
              <i data-lucide="target"></i>
              <span>Leads CRM</span>
              ${duplicateLeads > 0 ? `<span class="nav-counter warning">${duplicateLeads}</span>` : ''}
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'sales' ? 'active' : ''}" data-nav="sales">
              <i data-lucide="award"></i>
              <span>Verified Sales</span>
            </button>

            <div class="nav-section-title">COMMISSIONS & LEDGERS</div>
            <button type="button" class="sidebar-nav-item ${currentSection === 'commissions' ? 'active' : ''}" data-nav="commissions">
              <i data-lucide="badge-percent"></i>
              <span>Commission Approvals</span>
              ${pendingComms > 0 ? `<span class="nav-counter yellow">${pendingComms}</span>` : ''}
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'payments' ? 'active' : ''}" data-nav="payments">
              <i data-lucide="wallet"></i>
              <span>Payment Center</span>
              ${payableComms > 0 ? `<span class="nav-counter cyan">${payableComms}</span>` : ''}
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'ledgers' ? 'active' : ''}" data-nav="ledgers">
              <i data-lucide="book-open"></i>
              <span>Financial Ledgers</span>
            </button>

            <div class="nav-section-title">MANAGEMENT & AUDIT</div>
            <button type="button" class="sidebar-nav-item ${currentSection === 'marketing' ? 'active' : ''}" data-nav="marketing">
              <i data-lucide="folder"></i>
              <span>Marketing Assets</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'audit' ? 'active' : ''}" data-nav="audit">
              <i data-lucide="shield-check"></i>
              <span>Audit Trail</span>
            </button>
            <button type="button" class="sidebar-nav-item ${currentSection === 'settings' ? 'active' : ''}" data-nav="settings">
              <i data-lucide="settings"></i>
              <span>Control Center</span>
            </button>
          </nav>

          <!-- Sidebar Footer with Fast View Switchers -->
          <div class="sidebar-footer">
            <button type="button" class="sidebar-switch-btn" id="btn-switch-landing">
              <i data-lucide="globe"></i> <span>View Landing Page</span>
            </button>
            <button type="button" class="sidebar-switch-btn text-gold" id="btn-switch-partner-view">
              <i data-lucide="user-check"></i> <span>Switch to Partner View</span>
            </button>
          </div>
        </aside>

        <!-- Main Body Content Area -->
        <main class="portal-main-area">
          <!-- Topbar -->
          <header class="portal-topbar glass-card">
            <div class="topbar-left">
              <button type="button" class="topbar-toggle-sidebar" id="admin-toggle-sidebar">
                <i data-lucide="menu"></i>
              </button>
              <div class="topbar-title-wrap">
                <h1 class="topbar-page-title">${getPageTitle(currentSection)}</h1>
              </div>
            </div>

            <div class="topbar-right">
              <!-- Currency Switcher -->
              <select id="admin-topbar-currency" class="form-select-sm" title="Active Ledger Currency">
                <option value="PKR" ${platformStore.currency === 'PKR' ? 'selected' : ''}>PKR (₨)</option>
                <option value="USD" ${platformStore.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                <option value="AED" ${platformStore.currency === 'AED' ? 'selected' : ''}>AED (د.إ)</option>
              </select>

              <!-- Notifications Popover Trigger -->
              <button type="button" class="topbar-icon-btn" id="btn-admin-notifs" title="System Notifications">
                <i data-lucide="bell"></i>
                ${platformStore.notifications.filter(n => !n.read).length > 0 ? `<span class="icon-badge"></span>` : ''}
              </button>

              <!-- User Profile Menu -->
              <div class="topbar-user-pill">
                <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" alt="${user.name}" class="topbar-avatar">
                <div class="topbar-user-meta">
                  <span class="user-name">${user.name}</span>
                  <span class="user-role">Super Admin</span>
                </div>
                <button type="button" class="btn-logout" id="btn-admin-logout" title="Sign Out">
                  <i data-lucide="log-out"></i>
                </button>
              </div>
            </div>
          </header>

          <!-- Module Container -->
          <div class="portal-content-body" id="admin-module-mount"></div>
        </main>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Mount active module
    const mount = container.querySelector('#admin-module-mount');
    if (mount) {
      if (currentSection === 'dashboard') {
        renderAdminDashboard(mount, navigateTo);
      } else if (currentSection === 'affiliates') {
        renderAffiliatesManager(mount, navigateTo);
      } else if (currentSection === 'projects') {
        renderProjectsManager(mount, navigateTo, sectionParams.projectId);
      } else if (currentSection === 'leads') {
        renderLeadsCRM(mount, navigateTo);
      } else if (currentSection === 'sales') {
        renderSalesManager(mount, navigateTo, sectionParams.action);
      } else if (currentSection === 'commissions') {
        renderCommissionsManager(mount, navigateTo);
      } else if (currentSection === 'payments') {
        renderPaymentsManager(mount, navigateTo, sectionParams.action);
      } else if (currentSection === 'ledgers') {
        renderLedgersManager(mount, navigateTo, sectionParams);
      } else if (currentSection === 'marketing') {
        renderMarketingManager(mount);
      } else if (currentSection === 'audit') {
        renderAuditLogs(mount);
      } else if (currentSection === 'settings') {
        renderSettingsCenter(mount, (msg) => alert(msg));
      }
    }

    // Attach sidebar navigation listeners
    container.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.onclick = () => {
        navigateTo(item.dataset.nav);
      };
    });

    const currSelect = container.querySelector('#admin-topbar-currency');
    if (currSelect) {
      currSelect.onchange = (e) => {
        platformStore.setCurrency(e.target.value);
        render();
      };
    }

    const switchLandingBtn = container.querySelector('#btn-switch-landing');
    if (switchLandingBtn) {
      switchLandingBtn.onclick = () => {
        if (onNavigateLanding) onNavigateLanding();
      };
    }

    const switchPartnerBtn = container.querySelector('#btn-switch-partner-view');
    if (switchPartnerBtn) {
      switchPartnerBtn.onclick = () => {
        authStore.loginAs('partnerPlatinum');
        if (onSwitchAffiliateView) onSwitchAffiliateView();
      };
    }

    const logoutBtn = container.querySelector('#btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        authStore.logout();
        if (onNavigateLanding) onNavigateLanding();
      };
    }

    const sidebarToggle = container.querySelector('#admin-toggle-sidebar');
    if (sidebarToggle) {
      sidebarToggle.onclick = () => {
        const sb = container.querySelector('#admin-sidebar');
        if (sb) sb.classList.toggle('open');
      };
    }
  }

  function getPageTitle(section) {
    const titles = {
      dashboard: 'Executive BI Dashboard & Operations',
      affiliates: 'Affiliate Partner Network Management',
      projects: 'Real Estate Projects & Inventory Ledger',
      leads: 'Customer Leads & Duplicate Collision CRM',
      sales: 'Verified Closed Sales & Transactions',
      commissions: 'Commission Approval & Entitlement Engine',
      payments: 'Payment Disbursement & Pending Payout Center',
      ledgers: 'Master Financial & Double-Entry Ledgers',
      marketing: 'Marketing Asset & Creative Library',
      audit: 'Immutable System & Transaction Audit Trail',
      settings: 'System Control Center & Policies'
    };
    return titles[section] || 'Super Admin Portal';
  }

  render();
}
