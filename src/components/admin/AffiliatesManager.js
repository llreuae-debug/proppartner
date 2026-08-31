// Affiliates Manager - Super Admin Partner Lifecycle, Provisioning, KYC, QR Engine & RBAC

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';
import { authStore } from '../../store/authStore.js';
import { 
  generateReferralUrl, 
  renderQrToCanvas, 
  downloadBrandedQrPng, 
  downloadQrSvg, 
  printQrFlyer 
} from '../../utils/qrCodeGenerator.js';
import { printLedgerStatement, exportLedgerCSV } from '../../utils/statementGenerator.js';

export function renderAffiliatesManager(container, navigateTo) {
  let activeTab = 'all'; // 'all' | 'pending' | 'approved' | 'suspended' | 'deactivated' | 'archived'
  let searchQuery = '';
  let tierFilter = 'all';
  let sortBy = 'recent'; // 'recent' | 'name' | 'leads' | 'sales' | 'earnings' | 'status'

  function render() {
    const curr = platformStore.currency;
    let filtered = platformStore.affiliates.filter(a => {
      if (activeTab === 'pending') return a.status === 'Pending';
      if (activeTab === 'approved') return a.status === 'Approved' || a.status === 'Active';
      if (activeTab === 'suspended') return a.status === 'Suspended';
      if (activeTab === 'deactivated') return a.status === 'Deactivated';
      if (activeTab === 'archived') return a.status === 'Archived';
      return true;
    });

    if (tierFilter !== 'all') {
      filtered = filtered.filter(a => (a.tier || '').toLowerCase() === tierFilter.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.phone && a.phone.toLowerCase().includes(q)) ||
        (a.referralCode && a.referralCode.toLowerCase().includes(q)) ||
        (a.company && a.company.toLowerCase().includes(q))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'leads') {
        const aL = platformStore.leads.filter(l => l.affiliateId === a.id).length;
        const bL = platformStore.leads.filter(l => l.affiliateId === b.id).length;
        return bL - aL;
      }
      if (sortBy === 'sales') {
        const aS = platformStore.sales.filter(s => s.affiliateId === a.id).length;
        const bS = platformStore.sales.filter(s => s.affiliateId === b.id).length;
        return bS - aS;
      }
      if (sortBy === 'earnings') {
        const aE = platformStore.commissions.filter(c => c.affiliateId === a.id).reduce((acc, c) => acc + (c.netPayable || c.commissionAmount || 0), 0);
        const bE = platformStore.commissions.filter(c => c.affiliateId === b.id).reduce((acc, c) => acc + (c.netPayable || c.commissionAmount || 0), 0);
        return bE - aE;
      }
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return (b.id || '').localeCompare(a.id || '');
    });

    const pendingCount = platformStore.affiliates.filter(a => a.status === 'Pending').length;
    const suspendedCount = platformStore.affiliates.filter(a => a.status === 'Suspended').length;

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Affiliate Partner Network & Referral Registry</h2>
            <p class="module-subtitle">Super Admin control center for partner onboarding, KYC status, unique referral identities & live scannable QR engines</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-add-new-partner">
              <i data-lucide="user-plus"></i> <span>Add New Partner</span>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-affiliates">
              <i data-lucide="download"></i> <span>Export Registry CSV</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="module-filter-bar glass-card">
          <div class="filter-tabs">
            <button type="button" class="filter-tab-btn ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
              All Partners (${platformStore.affiliates.length})
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'approved' ? 'active' : ''}" data-tab="approved">
              Active / Approved
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'pending' ? 'active' : ''}" data-tab="pending">
              Pending ${pendingCount > 0 ? `<span class="badge-count">${pendingCount}</span>` : ''}
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'suspended' ? 'active' : ''}" data-tab="suspended">
              Suspended ${suspendedCount > 0 ? `<span class="badge-count text-yellow">${suspendedCount}</span>` : ''}
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'deactivated' ? 'active' : ''}" data-tab="deactivated">
              Deactivated
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'archived' ? 'active' : ''}" data-tab="archived">
              Archived
            </button>
          </div>

          <div class="filter-controls">
            <div class="search-input-wrap">
              <i data-lucide="search"></i>
              <input type="text" id="aff-search" placeholder="Search by name, email, phone, ID, referral code..." value="${searchQuery}">
            </div>
            <select id="aff-tier-select" class="form-select-sm">
              <option value="all" ${tierFilter === 'all' ? 'selected' : ''}>All Tiers</option>
              <option value="Platinum" ${tierFilter === 'Platinum' ? 'selected' : ''}>Platinum Tier</option>
              <option value="Gold" ${tierFilter === 'Gold' ? 'selected' : ''}>Gold Tier</option>
              <option value="Silver" ${tierFilter === 'Silver' ? 'selected' : ''}>Silver Tier</option>
            </select>
            <select id="aff-sort-select" class="form-select-sm">
              <option value="recent" ${sortBy === 'recent' ? 'selected' : ''}>Sort: Recent</option>
              <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Sort: Name (A-Z)</option>
              <option value="leads" ${sortBy === 'leads' ? 'selected' : ''}>Sort: Most Leads</option>
              <option value="sales" ${sortBy === 'sales' ? 'selected' : ''}>Sort: Closed Sales</option>
              <option value="earnings" ${sortBy === 'earnings' ? 'selected' : ''}>Sort: Highest Earnings</option>
              <option value="status" ${sortBy === 'status' ? 'selected' : ''}>Sort: Status</option>
            </select>
          </div>
        </div>

        <!-- Affiliates Table -->
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Referral Code & QR</th>
                  <th>Tier & Status</th>
                  <th>Commission Rate</th>
                  <th>Leads & Clicks</th>
                  <th>Deals Closed</th>
                  <th>Total Commission</th>
                  <th style="text-align: right;">Admin Controls</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr><td colspan="8" class="text-center py-6 text-muted">No partners found matching criteria.</td></tr>
                ` : filtered.map(a => {
                  const stats = platformStore.getAffiliateReferralStats(a.id) || platformStore.getAffiliateStats(a.id);
                  const memberCode = a.referralCode || a.id;
                  const isApproved = a.status === 'Approved' || a.status === 'Active';
                  const isRefActive = a.referralStatus !== 'Disabled' && isApproved;
                  const totalComms = platformStore.commissions
                    .filter(c => c.affiliateId === a.id)
                    .reduce((acc, c) => acc + (c.netPayable || c.commissionAmount || 0), 0);

                  return `
                    <tr>
                      <td>
                        <div class="user-cell">
                          <img src="${a.avatar}" alt="${a.name}" class="user-avatar-sm" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.name)}';">
                          <div>
                            <strong class="user-name">${a.name}</strong>
                            <div class="user-sub text-muted"><code>${a.id}</code> • ${a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style="display:flex; flex-direction:column; gap:3px;">
                          <div style="display:flex; align-items:center; gap:6px;">
                            <code class="text-gold">${memberCode}</code>
                            <span class="status-pill status-${isRefActive ? 'approved' : 'suspended'}" style="font-size:0.65rem; padding:1px 6px;">
                              ${isRefActive ? 'QR Active' : 'Paused'}
                            </span>
                          </div>
                          <span class="text-xs text-muted"><i data-lucide="qr-code"></i> ${a.qrScans || 0} scans · ${a.referralClicks || 0} clicks</span>
                        </div>
                      </td>
                      <td>
                        <div class="tier-status-cell">
                          <span class="badge-tier tier-${(a.tier || 'platinum').toLowerCase()}">${a.tier || 'Platinum'}</span>
                          <span class="status-pill status-${(a.status || 'approved').toLowerCase()}">${a.status}</span>
                        </div>
                      </td>
                      <td>
                        <strong class="text-gold">${a.commissionRate || 3.5}%</strong>
                        <div class="text-muted text-xs">Milestone Base</div>
                      </td>
                      <td>
                        <strong>${stats.totalReferrals || stats.totalLeads || 0} Leads</strong>
                        <div class="text-muted text-xs">${stats.qualifiedLeads || 0} Qualified</div>
                      </td>
                      <td>
                        <strong class="text-gold">${stats.successfulSales || stats.closedSales || 0} Closed</strong>
                        <div class="text-muted text-xs">${stats.conversionRate || '0.0%'} Conv.</div>
                      </td>
                      <td>
                        <strong class="text-green">${formatCurrencyValue(totalComms, curr)}</strong>
                      </td>
                      <td style="text-align: right;">
                        <div class="action-btn-group" style="justify-content: flex-end;">
                          <button type="button" class="btn-icon" title="View Full Partner Profile & KYC" data-action="view-profile" data-id="${a.id}">
                            <i data-lucide="eye"></i>
                          </button>
                          <button type="button" class="btn-icon" title="Edit Partner Settings & Access" data-action="edit-partner" data-id="${a.id}">
                            <i data-lucide="edit-3"></i>
                          </button>
                          <button type="button" class="btn-icon text-gold" title="Manage QR Code & Referral URL" data-action="view-qr" data-id="${a.id}">
                            <i data-lucide="qr-code"></i>
                          </button>
                          <button type="button" class="btn-icon" title="Reset Password / Security" data-action="reset-pass" data-id="${a.id}">
                            <i data-lucide="key"></i>
                          </button>
                          <button type="button" class="btn-icon" title="Financial Ledger" data-action="view-ledger" data-id="${a.id}">
                            <i data-lucide="book-open"></i>
                          </button>
                          ${a.status === 'Pending' ? `
                            <button type="button" class="btn-icon text-green" title="Approve Application" data-action="approve" data-id="${a.id}">
                              <i data-lucide="check-circle"></i>
                            </button>
                            <button type="button" class="btn-icon text-red" title="Reject Application" data-action="reject" data-id="${a.id}">
                              <i data-lucide="x-circle"></i>
                            </button>
                          ` : isApproved ? `
                            <button type="button" class="btn-icon text-yellow" title="Suspend Account" data-action="suspend" data-id="${a.id}">
                              <i data-lucide="slash"></i>
                            </button>
                          ` : `
                            <button type="button" class="btn-icon text-green" title="Activate Account" data-action="approve" data-id="${a.id}">
                              <i data-lucide="rotate-ccw"></i>
                            </button>
                          `}
                          <button type="button" class="btn-icon text-red" title="Archive / Delete Partner" data-action="delete-partner" data-id="${a.id}">
                            <i data-lucide="trash-2"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    container.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.tab;
        render();
      };
    });

    const searchInput = container.querySelector('#aff-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        render();
      };
    }

    const tierSelect = container.querySelector('#aff-tier-select');
    if (tierSelect) {
      tierSelect.onchange = (e) => {
        tierFilter = e.target.value;
        render();
      };
    }

    const sortSelect = container.querySelector('#aff-sort-select');
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        sortBy = e.target.value;
        render();
      };
    }

    // Add Partner Modal Trigger
    const addBtn = container.querySelector('#btn-add-new-partner');
    if (addBtn) {
      addBtn.onclick = () => showAddPartnerModal(() => render());
    }

    // Export CSV
    const exportBtn = container.querySelector('#btn-export-affiliates');
    if (exportBtn) {
      exportBtn.onclick = () => exportAffiliatesCSV();
    }

    // Table Actions
    container.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      btn.onclick = () => {
        if (action === 'approve') {
          platformStore.updateAffiliateStatus(id, 'Approved', 'Approved by Super Admin');
          authStore.setUserAccountStatus(id, 'ACTIVE', 'Approved by Super Admin');
          render();
        } else if (action === 'reject') {
          if (confirm('Are you sure you want to reject this partner application?')) {
            platformStore.updateAffiliateStatus(id, 'Rejected', 'Application rejected by Super Admin');
            authStore.setUserAccountStatus(id, 'DISABLED', 'Application rejected');
            render();
          }
        } else if (action === 'suspend') {
          if (confirm('Suspend this partner account? Referral link tracking will be paused and login disabled.')) {
            platformStore.updateAffiliateStatus(id, 'Suspended', 'Suspended by Super Admin');
            authStore.setUserAccountStatus(id, 'SUSPENDED', 'Suspended by Super Admin');
            render();
          }
        } else if (action === 'view-profile') {
          showAffiliateProfileModal(id, navigateTo);
        } else if (action === 'edit-partner') {
          showEditPartnerModal(id, () => render());
        } else if (action === 'view-qr') {
          showAffiliateQrManagerModal(id, () => render());
        } else if (action === 'reset-pass') {
          showResetPasswordModal(id, () => render());
        } else if (action === 'view-ledger') {
          navigateTo('ledgers', { affiliateId: id });
        } else if (action === 'delete-partner') {
          handleDeletePartner(id, () => render());
        }
      };
    });
  }

  render();
}

/**
 * Super Admin Modal: Manually Create a New Partner Account
 */
function showAddPartnerModal(onRefresh) {
  let modal = document.getElementById('admin-add-partner-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-add-partner-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  // Pre-generate recommended partner ID
  const existingNums = platformStore.affiliates
    .filter(a => a.id && a.id.startsWith('AFF-'))
    .map(a => parseInt(a.id.replace('AFF-', ''), 10))
    .filter(n => !isNaN(n));
  const nextIdNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 103;
  const suggestedId = `AFF-${String(nextIdNum).padStart(6, '0')}`;

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 640px;">
      <button type="button" class="auth-modal-close" id="add-partner-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="section-eyebrow"><i data-lucide="user-plus"></i> SUPER ADMIN PARTNER PROVISIONING</div>
        <h3 class="auth-modal-title">Create Official Partner Account</h3>
        <p class="auth-modal-subtitle">Provision unique referral identity, scannable QR card & authentication credentials</p>
      </div>

      <form id="admin-create-partner-form" class="auth-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Full Legal Name <span class="text-gold">*</span></label>
            <input type="text" id="adm-part-name" class="form-input" placeholder="e.g. Tariq Mansoor" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Email Address (Login Identity) <span class="text-gold">*</span></label>
            <input type="email" id="adm-part-email" class="form-input" placeholder="e.g. tariq@apexwealth.com" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Phone Number / WhatsApp</label>
            <input type="tel" id="adm-part-phone" class="form-input" placeholder="+971 50 123 4567">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Firm / Wealth Advisory Firm</label>
            <input type="text" id="adm-part-company" class="form-input" placeholder="Apex Wealth Advisors">
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Partner ID & Referral Code</label>
            <input type="text" id="adm-part-id" class="form-input" value="${suggestedId}" required>
            <span class="text-xs text-muted">Auto-assigned unique referral identity</span>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Commission Rate (%)</label>
            <input type="number" step="0.1" id="adm-part-comm" class="form-input" value="3.5" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Partner Tier</label>
            <select id="adm-part-tier" class="form-input">
              <option value="Platinum" selected>Platinum Tier</option>
              <option value="Gold">Gold Tier</option>
              <option value="Silver">Silver Tier</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Account Status</label>
            <select id="adm-part-status" class="form-input">
              <option value="Approved" selected>Active / Approved</option>
              <option value="Pending">Pending Application</option>
              <option value="Suspended">Suspended</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Initial Password (Optional / Auto-generated if empty)</label>
            <input type="password" id="adm-part-pass" class="form-input" placeholder="Leave blank for secure temporary password">
          </div>
          <div class="form-group" style="display: flex; align-items: flex-end; padding-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #CBD5E1; cursor: pointer;">
              <input type="checkbox" id="adm-part-force-change" checked>
              <span>Force password change on first login</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Administrative Notes / Accreditation</label>
          <textarea id="adm-part-notes" class="form-input" rows="2" placeholder="Vetted wealth advisor with luxury family office client portfolio..."></textarea>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="adm-add-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-gold" id="adm-add-submit-btn">
            <i data-lucide="check-circle-2"></i> <span>PROVISION PARTNER ACCOUNT</span>
          </button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#add-partner-close').onclick = close;
  modal.querySelector('#adm-add-cancel-btn').onclick = close;

  modal.querySelector('#admin-create-partner-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = modal.querySelector('#adm-part-name').value;
    const email = modal.querySelector('#adm-part-email').value;
    const phone = modal.querySelector('#adm-part-phone').value;
    const company = modal.querySelector('#adm-part-company').value;
    const partnerId = modal.querySelector('#adm-part-id').value.trim().toUpperCase();
    const comm = modal.querySelector('#adm-part-comm').value;
    const tier = modal.querySelector('#adm-part-tier').value;
    const status = modal.querySelector('#adm-part-status').value;
    const pass = modal.querySelector('#adm-part-pass').value;
    const forceChange = modal.querySelector('#adm-part-force-change').checked;
    const notes = modal.querySelector('#adm-part-notes').value;

    const res = await authStore.adminCreatePartner({
      name,
      email,
      phone,
      company,
      tier,
      status,
      commissionRate: comm,
      password: pass,
      mustChangePassword: forceChange,
      notes
    });

    if (!res.success) {
      alert(`⚠️ Error: ${res.message}`);
      return;
    }

    platformStore.addAffiliate({
      id: res.partnerId,
      referralCode: res.referralCode,
      name,
      email,
      phone,
      company,
      tier,
      status,
      commissionRate: comm,
      notes
    });

    alert(`✅ Partner ${name} (${res.partnerId}) provisioned successfully!\nTemporary Password: ${res.temporaryPassword}\nReferral URL: https://proppartner.pro/?ref=${res.referralCode}`);
    close();
    onRefresh();
  };
}

/**
 * Super Admin Modal: Edit Partner Details
 */
function showEditPartnerModal(affiliateId, onRefresh) {
  const aff = platformStore.affiliates.find(a => a.id === affiliateId);
  if (!aff) return;

  let modal = document.getElementById('admin-edit-partner-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-edit-partner-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 600px;">
      <button type="button" class="auth-modal-close" id="edit-partner-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="section-eyebrow"><i data-lucide="edit-3"></i> SUPER ADMIN PARTNER SETTINGS</div>
        <h3 class="auth-modal-title">Edit Partner: ${aff.name}</h3>
        <p class="auth-modal-subtitle">Partner ID: <code>${aff.id}</code> · Referral Code: <code>${aff.referralCode || aff.id}</code></p>
      </div>

      <form id="admin-edit-partner-form" class="auth-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Full Legal Name</label>
            <input type="text" id="edit-part-name" class="form-input" value="${aff.name}" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Email Address</label>
            <input type="email" id="edit-part-email" class="form-input" value="${aff.email || ''}" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Phone Number / WhatsApp</label>
            <input type="tel" id="edit-part-phone" class="form-input" value="${aff.phone || ''}">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Firm / Company</label>
            <input type="text" id="edit-part-company" class="form-input" value="${aff.company || ''}">
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Partner Tier</label>
            <select id="edit-part-tier" class="form-input">
              <option value="Platinum" ${aff.tier === 'Platinum' ? 'selected' : ''}>Platinum Tier</option>
              <option value="Gold" ${aff.tier === 'Gold' ? 'selected' : ''}>Gold Tier</option>
              <option value="Silver" ${aff.tier === 'Silver' ? 'selected' : ''}>Silver Tier</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Account Status</label>
            <select id="edit-part-status" class="form-input">
              <option value="Approved" ${aff.status === 'Approved' || aff.status === 'Active' ? 'selected' : ''}>Active / Approved</option>
              <option value="Pending" ${aff.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Suspended" ${aff.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
              <option value="Deactivated" ${aff.status === 'Deactivated' ? 'selected' : ''}>Deactivated</option>
              <option value="Archived" ${aff.status === 'Archived' ? 'selected' : ''}>Archived</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Base Commission Rate (%)</label>
            <input type="number" step="0.1" id="edit-part-comm" class="form-input" value="${aff.commissionRate || 3.5}" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Bank Institution</label>
            <input type="text" id="edit-part-bank" class="form-input" value="${aff.bankName || 'Standard Chartered / HBL'}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Account Number / IBAN</label>
          <input type="text" id="edit-part-iban" class="form-input" value="${aff.accountNumber || ''}">
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Administrative Notes</label>
          <textarea id="edit-part-notes" class="form-input" rows="2">${aff.notes || ''}</textarea>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="edit-part-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#edit-partner-close').onclick = close;
  modal.querySelector('#edit-part-cancel').onclick = close;

  modal.querySelector('#admin-edit-partner-form').onsubmit = (e) => {
    e.preventDefault();
    const name = modal.querySelector('#edit-part-name').value;
    const email = modal.querySelector('#edit-part-email').value;
    const phone = modal.querySelector('#edit-part-phone').value;
    const company = modal.querySelector('#edit-part-company').value;
    const tier = modal.querySelector('#edit-part-tier').value;
    const status = modal.querySelector('#edit-part-status').value;
    const comm = modal.querySelector('#edit-part-comm').value;
    const bankName = modal.querySelector('#edit-part-bank').value;
    const accountNumber = modal.querySelector('#edit-part-iban').value;
    const notes = modal.querySelector('#edit-part-notes').value;

    const res = platformStore.updateAffiliate(affiliateId, {
      name,
      email,
      phone,
      company,
      tier,
      status,
      commissionRate: comm,
      bankName,
      accountNumber,
      notes
    });

    if (!res.success) {
      alert(`⚠️ ${res.message}`);
      return;
    }

    authStore.adminUpdatePartner(affiliateId, {
      name,
      email,
      phone,
      tier,
      status
    });

    alert('✅ Partner settings updated successfully!');
    close();
    onRefresh();
  };
}

/**
 * Super Admin Modal: Reset Password & Force Password Change
 */
function showResetPasswordModal(affiliateId, onRefresh) {
  const aff = platformStore.affiliates.find(a => a.id === affiliateId);
  if (!aff) return;

  let modal = document.getElementById('admin-reset-pass-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-reset-pass-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 520px;">
      <button type="button" class="auth-modal-close" id="reset-pass-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="badge-count gold"><i data-lucide="key"></i></div>
        <h3 class="auth-modal-title">Reset Partner Password</h3>
        <p class="auth-modal-subtitle">Generate a secure temporary password for <strong>${aff.name}</strong> (${aff.email})</p>
      </div>

      <form id="admin-reset-pass-form" class="auth-form">
        <div class="form-group">
          <label class="form-label text-xs">New Temporary Password (Leave blank to auto-generate)</label>
          <input type="text" id="adm-new-pass" class="form-input" placeholder="e.g. PropSecure2026!">
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #CBD5E1; cursor: pointer;">
            <input type="checkbox" id="adm-force-change-check" checked>
            <span>Require partner to change password immediately upon next sign in</span>
          </label>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="reset-pass-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">
            <i data-lucide="shield-check"></i> <span>Reset & Invalidate Sessions</span>
          </button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#reset-pass-close').onclick = close;
  modal.querySelector('#reset-pass-cancel').onclick = close;

  modal.querySelector('#admin-reset-pass-form').onsubmit = async (e) => {
    e.preventDefault();
    const newPass = modal.querySelector('#adm-new-pass').value;
    const forceChange = modal.querySelector('#adm-force-change-check').checked;

    const res = await authStore.adminResetPassword(aff.id, newPass, forceChange);
    if (!res.success) {
      alert(`⚠️ ${res.message}`);
      return;
    }

    alert(`✅ Password reset successfully for ${aff.name}!\n\nTemporary Password: ${res.temporaryPassword}\n\nAll active device sessions have been terminated. Partner must sign in with this temporary password.`);
    close();
    onRefresh();
  };
}

/**
 * Super Admin: Safe Archive / Deletion Handler
 */
function handleDeletePartner(affiliateId, onRefresh) {
  const aff = platformStore.affiliates.find(a => a.id === affiliateId);
  if (!aff) return;

  if (confirm(`Are you sure you want to remove or archive partner ${aff.name} (${aff.id})?`)) {
    const res = platformStore.deleteAffiliate(affiliateId);
    if (res.archived) {
      alert(`ℹ️ Notice:\n${res.message}`);
    } else {
      authStore.adminDeletePartner(affiliateId);
      alert('✅ Partner account deleted.');
    }
    onRefresh();
  }
}

/**
 * Super Admin: Full Detailed Partner Profile Modal
 */
function showAffiliateProfileModal(affiliateId, navigateTo) {
  const data = platformStore.getAffiliateProfileFull(affiliateId);
  if (!data) return;

  const { affiliate: aff, leads, sales, commissions, ledger, auditLogs, stats } = data;
  const curr = platformStore.currency;
  const memberCode = aff.referralCode || aff.id;
  const refUrl = generateReferralUrl(memberCode);

  let modal = document.getElementById('admin-aff-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-aff-profile-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  let activeProfileTab = 'overview';

  function renderProfile() {
    modal.innerHTML = `
      <div class="auth-modal-dialog glass-card" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
        <button type="button" class="auth-modal-close" id="profile-modal-close"><i data-lucide="x"></i></button>
        
        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px; margin-bottom: 16px;">
          <img src="${aff.avatar}" alt="${aff.name}" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #D4AF37; object-fit: cover;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="margin: 0; font-size: 1.3rem; color: #FFFFFF;">${aff.name}</h3>
              <span class="badge-tier tier-${(aff.tier || 'platinum').toLowerCase()}">${aff.tier}</span>
              <span class="status-pill status-${(aff.status || 'approved').toLowerCase()}">${aff.status}</span>
            </div>
            <p style="margin: 3px 0 0 0; font-size: 0.8rem; color: #94A3B8;">
              Partner ID: <code>${aff.id}</code> • Referral Code: <code>${memberCode}</code> • ${aff.email} • ${aff.phone || 'No phone'}
            </p>
          </div>
        </div>

        <!-- Metric Strip -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px;">
          <div class="p-stat-box" style="padding: 10px;">
            <span style="font-size:0.7rem;">Total Referrals</span>
            <strong style="font-size:1.1rem;">${stats.totalLeads} Leads</strong>
          </div>
          <div class="p-stat-box" style="padding: 10px;">
            <span style="font-size:0.7rem;">Closed Sales</span>
            <strong style="font-size:1.1rem;" class="text-gold">${stats.closedSales} Deals</strong>
          </div>
          <div class="p-stat-box" style="padding: 10px;">
            <span style="font-size:0.7rem;">Total Earned</span>
            <strong style="font-size:1.1rem;" class="text-green">${formatCurrencyValue(stats.totalCommissionsEarned, curr)}</strong>
          </div>
          <div class="p-stat-box" style="padding: 10px;">
            <span style="font-size:0.7rem;">Payable Escrow</span>
            <strong style="font-size:1.1rem;" class="text-cyan">${formatCurrencyValue(stats.payableCommissions, curr)}</strong>
          </div>
        </div>

        <!-- Subtabs -->
        <div class="filter-tabs" style="margin-bottom: 16px;">
          <button type="button" class="filter-tab-btn ${activeProfileTab === 'overview' ? 'active' : ''}" id="tab-prof-overview">Account & Bank</button>
          <button type="button" class="filter-tab-btn ${activeProfileTab === 'leads' ? 'active' : ''}" id="tab-prof-leads">Referred Leads (${leads.length})</button>
          <button type="button" class="filter-tab-btn ${activeProfileTab === 'ledger' ? 'active' : ''}" id="tab-prof-ledger">Financial Ledger (${ledger.length})</button>
          <button type="button" class="filter-tab-btn ${activeProfileTab === 'audit' ? 'active' : ''}" id="tab-prof-audit">Audit History (${auditLogs.length})</button>
        </div>

        <!-- Content Area -->
        ${activeProfileTab === 'overview' ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div class="glass-card" style="padding: 14px; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
              <h4 style="font-size: 0.85rem; color: #D4AF37; margin: 0 0 10px 0;">Accreditation Details</h4>
              <div style="font-size: 0.8rem; display: flex; flex-direction: column; gap: 6px; color: #CBD5E1;">
                <div><span class="text-muted">Firm / Advisory:</span> <strong>${aff.company || 'Private Wealth'}</strong></div>
                <div><span class="text-muted">Commission Rate:</span> <strong>${aff.commissionRate}% Milestone Base</strong></div>
                <div><span class="text-muted">Registered Date:</span> <strong>${aff.createdDate || '2026-01-01'}</strong></div>
                <div><span class="text-muted">Direct Referral URL:</span> <code style="font-size:0.75rem; word-break:break-all;">${refUrl}</code></div>
              </div>
            </div>

            <div class="glass-card" style="padding: 14px; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
              <h4 style="font-size: 0.85rem; color: #D4AF37; margin: 0 0 10px 0;">Designated Settlement Bank</h4>
              <div style="font-size: 0.8rem; display: flex; flex-direction: column; gap: 6px; color: #CBD5E1;">
                <div><span class="text-muted">Bank Name:</span> <strong>${aff.bankName || 'Standard Chartered Bank'}</strong></div>
                <div><span class="text-muted">IBAN / Account #:</span> <code>${aff.accountNumber || 'PK36SCBL0000001123456701'}</code></div>
                <div><span class="text-muted">Beneficiary:</span> <strong>${aff.name}</strong></div>
                <div><span class="text-muted">Disbursement Status:</span> <span class="text-green">Verified for RTGS Wire</span></div>
              </div>
            </div>
          </div>
        ` : ''}

        ${activeProfileTab === 'leads' ? `
          <div class="table-responsive" style="max-height: 240px; overflow-y: auto; margin-bottom: 20px;">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Prospect</th>
                  <th>Project</th>
                  <th>Budget</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                ${leads.length === 0 ? `
                  <tr><td colspan="5" class="text-center py-4 text-muted">No leads submitted yet.</td></tr>
                ` : leads.map(l => `
                  <tr>
                    <td><code>${l.id}</code></td>
                    <td><strong>${l.name}</strong><br><span class="text-muted text-xs">${l.phone}</span></td>
                    <td>${l.projectId}</td>
                    <td><strong class="text-gold">${formatCurrencyValue(l.budget, curr)}</strong></td>
                    <td><span class="status-pill status-${l.status.toLowerCase().replace(/\s+/g, '-')}">${l.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${activeProfileTab === 'ledger' ? `
          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 10px;">
            <button type="button" class="btn btn-secondary btn-xs" id="btn-modal-print-statement">
              <i data-lucide="printer"></i> <span>Print Official Statement</span>
            </button>
          </div>
          <div class="table-responsive" style="max-height: 240px; overflow-y: auto; margin-bottom: 20px;">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Deal Details</th>
                  <th>Impact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${ledger.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-4 text-muted">No ledger transactions recorded.</td></tr>
                ` : ledger.map(t => `
                  <tr>
                    <td><code>${t.id}</code></td>
                    <td>${t.date}</td>
                    <td>${t.type}</td>
                    <td>${t.projectId} (${t.unitId || 'Direct'})</td>
                    <td><strong class="${t.netCommission >= 0 ? 'text-green' : 'text-red'}">${t.netCommission >= 0 ? '+' : ''}${formatCurrencyValue(t.netCommission, curr)}</strong></td>
                    <td><span class="status-pill status-${t.status.toLowerCase()}">${t.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${activeProfileTab === 'audit' ? `
          <div class="table-responsive" style="max-height: 240px; overflow-y: auto; margin-bottom: 20px;">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.length === 0 ? `
                  <tr><td colspan="4" class="text-center py-4 text-muted">No audit events recorded for this partner.</td></tr>
                ` : auditLogs.map(a => `
                  <tr>
                    <td><code>${a.id}</code></td>
                    <td>${a.timestamp}</td>
                    <td><strong>${a.action}</strong></td>
                    <td>${a.details || a.newValue}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="profile-close-bottom">Close</button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const close = () => modal.classList.remove('active');
    modal.querySelector('#profile-modal-close').onclick = close;
    modal.querySelector('#profile-close-bottom').onclick = close;

    const tabOverview = modal.querySelector('#tab-prof-overview');
    if (tabOverview) tabOverview.onclick = () => { activeProfileTab = 'overview'; renderProfile(); };

    const tabLeads = modal.querySelector('#tab-prof-leads');
    if (tabLeads) tabLeads.onclick = () => { activeProfileTab = 'leads'; renderProfile(); };

    const tabLedger = modal.querySelector('#tab-prof-ledger');
    if (tabLedger) tabLedger.onclick = () => { activeProfileTab = 'ledger'; renderProfile(); };

    const tabAudit = modal.querySelector('#tab-prof-audit');
    if (tabAudit) tabAudit.onclick = () => { activeProfileTab = 'audit'; renderProfile(); };

    const printBtn = modal.querySelector('#btn-modal-print-statement');
    if (printBtn) {
      printBtn.onclick = () => {
        printLedgerStatement({
          transactions: ledger,
          scopeTitle: `Partner Financial Statement — ${aff.name}`,
          currency: curr,
          affiliateInfo: aff
        });
      };
    }
  }

  renderProfile();
}

/**
 * Super Admin: QR & Referral Link Modal
 */
function showAffiliateQrManagerModal(affiliateId, onRefresh) {
  const aff = platformStore.affiliates.find(a => a.id === affiliateId);
  if (!aff) return;

  const stats = platformStore.getAffiliateReferralStats(aff.id);
  const curr = platformStore.currency;
  const memberRefCode = aff.referralCode || aff.id;
  const refUrl = generateReferralUrl(memberRefCode);

  let modal = document.getElementById('admin-aff-qr-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-aff-qr-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 680px;">
      <button type="button" class="auth-modal-close" id="modal-qr-close"><i data-lucide="x"></i></button>
      
      <div class="auth-modal-header" style="text-align: center; margin-bottom: 16px;">
        <div class="section-eyebrow"><i data-lucide="qr-code"></i> SUPER ADMIN REFERRAL & QR CONTROL</div>
        <h3 class="auth-modal-title" style="font-size: 1.4rem;">${aff.name}</h3>
        <p class="auth-modal-subtitle">Partner ID: <code>${aff.id}</code> · Tier: <strong>${aff.tier}</strong> · Status: <strong>${aff.status}</strong></p>
      </div>

      <div style="display: grid; grid-template-columns: 240px 1fr; gap: 24px; align-items: start; margin-bottom: 20px;">
        <!-- Left: Live QR Code Canvas -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <div class="qr-canvas-container" style="width: 100%;">
            <canvas id="admin-qr-modal-canvas" class="real-qr-canvas" width="220" height="220"></canvas>
            <div class="qr-label-strip">
              <span>Referral Identity</span>
              <div><code>${memberRefCode}</code></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 100%;">
            <button type="button" class="btn btn-secondary btn-xs" id="btn-admin-qr-png" title="Download High-Res PNG">
              <i data-lucide="download"></i> PNG
            </button>
            <button type="button" class="btn btn-secondary btn-xs" id="btn-admin-qr-svg" title="Download Vector SVG">
              <i data-lucide="file-code"></i> SVG
            </button>
            <button type="button" class="btn btn-gold btn-xs" id="btn-admin-qr-flyer" title="Print Official Flyer">
              <i data-lucide="printer"></i> Flyer
            </button>
          </div>
        </div>

        <!-- Right: Referral URL & Management Controls -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label text-xs">Active Referral URL (Canonical)</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input ref-input" value="${refUrl}" readonly id="admin-ref-url-input" style="font-size: 0.82rem; padding: 8px 12px !important;">
              <button type="button" class="btn btn-gold btn-sm" id="btn-admin-copy-ref"><i data-lucide="copy"></i></button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-admin-open-ref"><i data-lucide="external-link"></i></button>
            </div>
          </div>

          <!-- Code Regeneration Tool -->
          <div class="glass-card" style="padding: 12px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;">
            <label class="form-label text-xs text-gold"><i data-lucide="refresh-cw"></i> Regenerate / Customize Referral Code</label>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <input type="text" class="form-input" id="admin-custom-code-input" placeholder="e.g. VIP${aff.id.replace('AFF-', '')}" value="${aff.referralCode || ''}" style="font-size: 0.82rem; text-transform: uppercase;">
              <button type="button" class="btn btn-gold btn-sm" id="btn-admin-save-code">
                <span>Save Code</span>
              </button>
            </div>
            <span class="text-xs text-muted" style="display:block; margin-top:4px;">Unique code validation and audit logging are automatically enforced.</span>
          </div>

          <!-- Performance Metric Strip -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div class="p-stat-box" style="padding: 8px 10px;">
              <span style="font-size:0.7rem;">Total Clicks</span>
              <strong style="font-size:1rem;">${stats.totalClicks}</strong>
            </div>
            <div class="p-stat-box" style="padding: 8px 10px;">
              <span style="font-size:0.7rem;">QR Scans</span>
              <strong style="font-size:1rem;" class="text-gold">${stats.qrScans}</strong>
            </div>
            <div class="p-stat-box" style="padding: 8px 10px;">
              <span style="font-size:0.7rem;">Conversion</span>
              <strong style="font-size:1rem;" class="text-green">${stats.conversionRate}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const canvas = modal.querySelector('#admin-qr-modal-canvas');
  if (canvas) renderQrToCanvas(canvas, refUrl, 220);

  const close = () => modal.classList.remove('active');
  modal.querySelector('#modal-qr-close').onclick = close;

  modal.querySelector('#btn-admin-copy-ref').onclick = () => {
    navigator.clipboard.writeText(refUrl);
    alert('✅ Referral URL copied to clipboard!');
  };

  modal.querySelector('#btn-admin-open-ref').onclick = () => {
    window.open(refUrl, '_blank');
  };

  modal.querySelector('#btn-admin-qr-png').onclick = () => {
    downloadBrandedQrPng(refUrl, aff.name, aff.id, `${aff.id}_QR.png`);
  };

  modal.querySelector('#btn-admin-qr-svg').onclick = () => {
    downloadQrSvg(refUrl, `${aff.id}_QR.svg`);
  };

  modal.querySelector('#btn-admin-qr-flyer').onclick = () => {
    printQrFlyer(refUrl, aff.name, aff.id, null);
  };

  modal.querySelector('#btn-admin-save-code').onclick = () => {
    const custom = modal.querySelector('#admin-custom-code-input').value;
    const res = platformStore.regenerateReferralCode(aff.id, custom);
    if (res.success) {
      alert(`✅ Referral Code updated to: ${res.referralCode}`);
      close();
      onRefresh();
    } else {
      alert(`⚠️ ${res.message}`);
    }
  };
}

/**
 * Export Affiliates to CSV
 */
function exportAffiliatesCSV() {
  const headers = [
    'Partner ID', 'Full Name', 'Email', 'Phone', 'Company', 'Tier', 'Status', 
    'Referral Code', 'Commission Rate', 'Total Clicks', 'QR Scans', 'Total Leads', 'Closed Sales'
  ];

  const rows = platformStore.affiliates.map(a => {
    const stats = platformStore.getAffiliateReferralStats(a.id) || platformStore.getAffiliateStats(a.id);
    return [
      a.id,
      `"${a.name}"`,
      `"${a.email || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.company || ''}"`,
      a.tier,
      a.status,
      a.referralCode || a.id,
      `${a.commissionRate || 3.5}%`,
      a.referralClicks || 0,
      a.qrScans || 0,
      stats.totalReferrals || stats.totalLeads || 0,
      stats.successfulSales || stats.closedSales || 0
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `PropPartner_Affiliate_Directory_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
