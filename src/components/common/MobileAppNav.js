import { authStore } from '../../store/authStore.js';
import { platformStore } from '../../store/platformStore.js';
import { openProfileSecurityModal } from './ProfileSecurityModal.js';
import { openLogoutConfirmationModal } from './LogoutConfirmationModal.js';

let deferredPrompt = null;

// Listen for PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBanner = document.getElementById('pwa-install-banner');
  if (installBanner) installBanner.style.display = 'flex';
});

export function renderMobileHeader(container, title, onToggleDrawer, onOpenNotifs) {
  const user = authStore.getUser() || { name: 'User', role: 'GUEST' };
  const isAdmin = user.role === 'SUPER_ADMIN';

  // Attach mobile avatar click listener on next tick
  setTimeout(() => {
    const mobAvatar = container.querySelector('#mobile-avatar-btn');
    if (mobAvatar) {
      mobAvatar.onclick = () => openProfileSecurityModal('password');
    }
  }, 50);

  return `
    <header class="mobile-app-header">
      <div class="mobile-header-left">
        <button type="button" class="mobile-menu-btn" id="mobile-app-drawer-btn" aria-label="Open Menu">
          <i data-lucide="menu"></i>
        </button>
        <div class="mobile-header-brand">
          <img src="/assets/proppartner-icon.svg" alt="PropPartner" class="mobile-logo-icon" width="28" height="28">
          <span class="mobile-header-title">${title || (isAdmin ? 'Admin ERP' : 'Partner Portal')}</span>
        </div>
      </div>

      <div class="mobile-header-right">
        <select id="mobile-curr-picker" class="mobile-curr-select" aria-label="Currency">
          <option value="PKR" ${platformStore.currency === 'PKR' ? 'selected' : ''}>PKR</option>
          <option value="USD" ${platformStore.currency === 'USD' ? 'selected' : ''}>USD</option>
          <option value="AED" ${platformStore.currency === 'AED' ? 'selected' : ''}>AED</option>
        </select>

        <button type="button" class="mobile-header-icon-btn" id="mobile-notif-btn" aria-label="Notifications">
          <i data-lucide="bell"></i>
          ${platformStore.notifications.filter(n => !n.read).length > 0 ? '<span class="icon-badge"></span>' : ''}
        </button>

        <img src="${user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}" alt="${user.name}" class="mobile-user-avatar" id="mobile-avatar-btn" style="cursor:pointer;" title="Click to manage password & security">
      </div>
    </header>
  `;
}

export function renderMobileBottomBar(currentSection, role = 'AFFILIATE_PARTNER') {
  const isAdmin = role === 'SUPER_ADMIN';
  const pendingComms = platformStore.commissions.filter(c => c.status === 'Pending').length;
  const duplicateLeads = platformStore.leads.filter(l => l.duplicateFlag).length;

  if (isAdmin) {
    return `
      <nav class="mobile-bottom-nav">
        <button type="button" class="bottom-nav-tab ${currentSection === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
          <i data-lucide="layout-dashboard"></i>
          <span>Dashboard</span>
        </button>
        <button type="button" class="bottom-nav-tab ${currentSection === 'leads' ? 'active' : ''}" data-nav="leads">
          <div class="icon-wrap-rel">
            <i data-lucide="target"></i>
            ${duplicateLeads > 0 ? `<span class="tab-counter warning">${duplicateLeads}</span>` : ''}
          </div>
          <span>Leads</span>
        </button>
        <button type="button" class="bottom-nav-tab ${currentSection === 'sales' ? 'active' : ''}" data-nav="sales">
          <i data-lucide="award"></i>
          <span>Sales</span>
        </button>
        <button type="button" class="bottom-nav-tab ${currentSection === 'commissions' ? 'active' : ''}" data-nav="commissions">
          <div class="icon-wrap-rel">
            <i data-lucide="badge-percent"></i>
            ${pendingComms > 0 ? `<span class="tab-counter yellow">${pendingComms}</span>` : ''}
          </div>
          <span>Commissions</span>
        </button>
        <button type="button" class="bottom-nav-tab" id="btn-open-more-sheet">
          <i data-lucide="more-horizontal"></i>
          <span>More</span>
        </button>
      </nav>
    `;
  }

  // Affiliate Partner Bottom Bar
  return `
    <nav class="mobile-bottom-nav">
      <button type="button" class="bottom-nav-tab ${currentSection === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
        <i data-lucide="layout-dashboard"></i>
        <span>Home</span>
      </button>
      <button type="button" class="bottom-nav-tab ${currentSection === 'projects' ? 'active' : ''}" data-nav="projects">
        <i data-lucide="building-2"></i>
        <span>Projects</span>
      </button>
      <button type="button" class="bottom-nav-tab ${currentSection === 'leads' ? 'active' : ''}" data-nav="leads">
        <i data-lucide="users"></i>
        <span>Leads</span>
      </button>
      <button type="button" class="bottom-nav-tab ${currentSection === 'commissions' ? 'active' : ''}" data-nav="commissions">
        <i data-lucide="badge-percent"></i>
        <span>Earnings</span>
      </button>
      <button type="button" class="bottom-nav-tab" id="btn-open-more-sheet">
        <i data-lucide="grid"></i>
        <span>More</span>
      </button>
    </nav>
  `;
}

export function openMoreBottomSheet(role, onNavigate, onSwitchView) {
  let sheet = document.getElementById('mobile-more-bottom-sheet');
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'mobile-more-bottom-sheet';
    sheet.className = 'bottom-sheet-backdrop';
    document.body.appendChild(sheet);
  }

  const isAdmin = role === 'SUPER_ADMIN';
  const user = authStore.getUser() || {};

  sheet.innerHTML = `
    <div class="bottom-sheet-content glass-card">
      <div class="bottom-sheet-drag-handle"></div>
      <div class="bottom-sheet-header">
        <div class="sheet-user-meta">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}" alt="${user.name}" class="sheet-avatar">
          <div>
            <h4 class="sheet-user-name">${user.name}</h4>
            <span class="sheet-user-role">${isAdmin ? 'Super Admin' : `${user.tier || 'Gold'} Affiliate Partner`}</span>
          </div>
        </div>
        <button type="button" class="sheet-close-btn" id="sheet-close-btn"><i data-lucide="x"></i></button>
      </div>

      <!-- PWA Install Tile -->
      <div class="sheet-pwa-install glass-card" id="sheet-pwa-install-tile">
        <div class="pwa-tile-left">
          <i data-lucide="smartphone"></i>
          <div>
            <strong>Install PropPartner App</strong>
            <p class="text-xs text-muted">Add to Home Screen for fast native mobile access</p>
          </div>
        </div>
        <button type="button" class="btn btn-gold btn-xs" id="btn-pwa-install-action">INSTALL</button>
      </div>

      <div class="bottom-sheet-grid">
        ${isAdmin ? `
          <button type="button" class="sheet-grid-item" data-sheet-nav="users">
            <div class="sheet-icon green"><i data-lucide="user-check"></i></div>
            <span>Users</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="roles">
            <div class="sheet-icon cyan"><i data-lucide="shield"></i></div>
            <span>Roles RBAC</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="security">
            <div class="sheet-icon gold"><i data-lucide="lock"></i></div>
            <span>Security</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="affiliates">
            <div class="sheet-icon gold"><i data-lucide="users"></i></div>
            <span>Affiliates</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="projects">
            <div class="sheet-icon cyan"><i data-lucide="building"></i></div>
            <span>Projects</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="payments">
            <div class="sheet-icon green"><i data-lucide="wallet"></i></div>
            <span>Payouts</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="ledgers">
            <div class="sheet-icon purple"><i data-lucide="book-open"></i></div>
            <span>Ledgers</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="seo">
            <div class="sheet-icon gold"><i data-lucide="search"></i></div>
            <span>SEO AEO</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="audit">
            <div class="sheet-icon blue"><i data-lucide="shield-check"></i></div>
            <span>Audit Trail</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="settings">
            <div class="sheet-icon gray"><i data-lucide="settings"></i></div>
            <span>Settings</span>
          </button>
        ` : `
          <button type="button" class="sheet-grid-item" data-sheet-nav="sales">
            <div class="sheet-icon gold"><i data-lucide="award"></i></div>
            <span>My Sales</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="ledger">
            <div class="sheet-icon purple"><i data-lucide="book-open"></i></div>
            <span>My Ledger</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="payments">
            <div class="sheet-icon green"><i data-lucide="wallet"></i></div>
            <span>Payouts</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="marketing">
            <div class="sheet-icon yellow"><i data-lucide="folder-down"></i></div>
            <span>Marketing Kit</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="profile">
            <div class="sheet-icon cyan"><i data-lucide="user-cog"></i></div>
            <span>Bank & Profile</span>
          </button>
          <button type="button" class="sheet-grid-item" data-sheet-nav="support">
            <div class="sheet-icon blue"><i data-lucide="message-square"></i></div>
            <span>AI Support</span>
          </button>
        `}
      </div>

      <div class="bottom-sheet-actions" style="display: flex; flex-direction: column; gap: 8px;">
        <button type="button" class="btn btn-gold w-full" id="sheet-btn-switch-role">
          <i data-lucide="shuffle"></i> <span>Switch to ${isAdmin ? 'Affiliate View' : 'Super Admin View'}</span>
        </button>
        <button type="button" class="btn btn-secondary w-full" id="sheet-btn-logout" style="border-color: rgba(239, 68, 68, 0.4); color: #FCA5A5;">
          <i data-lucide="log-out"></i> <span>Sign Out</span>
        </button>
      </div>
    </div>
  `;

  sheet.classList.add('active');
  if (window.lucide) window.lucide.createIcons();

  const close = () => sheet.classList.remove('active');
  sheet.querySelector('#sheet-close-btn').onclick = close;
  sheet.onclick = (e) => { if (e.target === sheet) close(); };

  sheet.querySelectorAll('[data-sheet-nav]').forEach(btn => {
    btn.onclick = () => {
      close();
      if (onNavigate) onNavigate(btn.dataset.sheetNav);
    };
  });

  const logoutBtn = sheet.querySelector('#sheet-btn-logout');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      close();
      openLogoutConfirmationModal({ triggerElement: logoutBtn });
    };
  }

  const switchRoleBtn = sheet.querySelector('#sheet-btn-switch-role');
  if (switchRoleBtn) {
    switchRoleBtn.onclick = () => {
      close();
      if (isAdmin) {
        authStore.loginAs('partnerPlatinum');
        if (onSwitchView) onSwitchView('partner');
      } else {
        authStore.loginAs('admin');
        if (onSwitchView) onSwitchView('admin');
      }
    };
  }

  const pwaInstallBtn = sheet.querySelector('#btn-pwa-install-action');
  if (pwaInstallBtn) {
    pwaInstallBtn.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (outcome === 'accepted') {
          alert('✅ PropPartner app installed successfully!');
        }
      } else {
        alert('To install PropPartner on iOS: Tap Share (📤) → "Add to Home Screen". On Android/Chrome: Tap Settings (⋮) → "Install app".');
      }
    };
  }
}

// Native Web Share API Trigger with Fallbacks
export function triggerNativeShare(title, text, url) {
  if (navigator.share) {
    navigator.share({
      title: title || 'PropPartner Real Estate',
      text: text || 'Explore premier luxury real estate investment opportunities with guaranteed returns.',
      url: url || window.location.href
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        copyToClipboard(url);
      }
    });
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  alert(`✅ Referral link copied to clipboard:\n${text}`);
}
