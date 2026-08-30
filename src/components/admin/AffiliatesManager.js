// Affiliates Manager - Super Admin Affiliate Roster, Approvals, Tier & Referral QR Controls

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';
import { 
  generateReferralUrl, 
  renderQrToCanvas, 
  downloadBrandedQrPng, 
  downloadQrSvg, 
  printQrFlyer 
} from '../../utils/qrCodeGenerator.js';

export function renderAffiliatesManager(container, navigateTo) {
  let activeTab = 'all'; // 'all' | 'pending' | 'approved' | 'suspended'
  let searchQuery = '';
  let tierFilter = 'all';

  function render() {
    const curr = platformStore.currency;
    let filtered = platformStore.affiliates.filter(a => {
      if (activeTab === 'pending') return a.status === 'Pending';
      if (activeTab === 'approved') return a.status === 'Approved';
      if (activeTab === 'suspended') return a.status === 'Suspended';
      return true;
    });

    if (tierFilter !== 'all') {
      filtered = filtered.filter(a => a.tier.toLowerCase() === tierFilter.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (a.referralCode && a.referralCode.toLowerCase().includes(q)) ||
        (a.company && a.company.toLowerCase().includes(q))
      );
    }

    const pendingCount = platformStore.affiliates.filter(a => a.status === 'Pending').length;

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Affiliate Partner Network & Referral Registry</h2>
            <p class="module-subtitle">Manage vetted wealth advisors, unique referral codes, live scannable QR codes, and performance attributions</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-affiliates">
              <i data-lucide="download"></i> <span>Export Referral Directory CSV</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="module-filter-bar glass-card">
          <div class="filter-tabs">
            <button type="button" class="filter-tab-btn ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
              All Affiliates (${platformStore.affiliates.length})
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'pending' ? 'active' : ''}" data-tab="pending">
              Pending Applications ${pendingCount > 0 ? `<span class="badge-count">${pendingCount}</span>` : ''}
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'approved' ? 'active' : ''}" data-tab="approved">
              Approved Partners
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'suspended' ? 'active' : ''}" data-tab="suspended">
              Suspended
            </button>
          </div>

          <div class="filter-controls">
            <div class="search-input-wrap">
              <i data-lucide="search"></i>
              <input type="text" id="aff-search" placeholder="Search by name, referral code, email, ID..." value="${searchQuery}">
            </div>
            <select id="aff-tier-select" class="form-select-sm">
              <option value="all" ${tierFilter === 'all' ? 'selected' : ''}>All Tiers</option>
              <option value="Platinum" ${tierFilter === 'Platinum' ? 'selected' : ''}>Platinum Tier</option>
              <option value="Gold" ${tierFilter === 'Gold' ? 'selected' : ''}>Gold Tier</option>
              <option value="Silver" ${tierFilter === 'Silver' ? 'selected' : ''}>Silver Tier</option>
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
                  <th>Bank Account</th>
                  <th>Referrals & Clicks</th>
                  <th>Deals Closed</th>
                  <th>Total Earned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr><td colspan="8" class="text-center py-6 text-muted">No affiliate partners found matching criteria.</td></tr>
                ` : filtered.map(a => {
                  const stats = platformStore.getAffiliateReferralStats(a.id) || platformStore.getAffiliateStats(a.id);
                  const memberCode = a.referralCode || a.id;
                  const isRefActive = a.referralStatus !== 'Disabled' && a.status === 'Approved';

                  return `
                    <tr>
                      <td>
                        <div class="user-cell">
                          <img src="${a.avatar}" alt="${a.name}" class="user-avatar-sm">
                          <div>
                            <strong class="user-name">${a.name}</strong>
                            <div class="user-sub text-muted"><code>${a.id}</code> • ${a.company || a.profession}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style="display:flex; flex-direction:column; gap:3px;">
                          <div style="display:flex; align-items:center; gap:6px;">
                            <code>${memberCode}</code>
                            <span class="status-pill status-${isRefActive ? 'approved' : 'suspended'}" style="font-size:0.68rem; padding:1px 6px;">
                              ${isRefActive ? 'QR Active' : 'Paused'}
                            </span>
                          </div>
                          <span class="text-xs text-muted"><i data-lucide="qr-code"></i> ${a.qrScans || 0} scans · ${a.referralClicks || 0} clicks</span>
                        </div>
                      </td>
                      <td>
                        <div class="tier-status-cell">
                          <span class="badge-tier tier-${a.tier.toLowerCase()}">${a.tier}</span>
                          <span class="status-pill status-${a.status.toLowerCase()}">${a.status}</span>
                        </div>
                      </td>
                      <td>
                        <div class="bank-cell text-muted">
                          <strong>${a.bankName || 'Pending'}</strong>
                          <div><code>${a.accountNumber || 'N/A'}</code></div>
                        </div>
                      </td>
                      <td>
                        <strong>${stats.totalReferrals || stats.totalLeads || 0} Leads</strong>
                        <div class="text-muted text-xs">${stats.qualifiedLeads} Qualified</div>
                      </td>
                      <td>
                        <strong class="text-gold">${stats.successfulSales || stats.closedSales || 0} Deals</strong>
                        <div class="text-muted text-xs">${stats.conversionRate || '0.0%'}</div>
                      </td>
                      <td>
                        <strong class="text-green">${formatCurrencyValue(stats.totalEarnings || stats.totalCommission || 0, curr)}</strong>
                      </td>
                      <td>
                        <div class="action-btn-group">
                          <button type="button" class="btn-icon text-gold" title="Manage Referral Code & QR Code" data-action="view-qr" data-id="${a.id}">
                            <i data-lucide="qr-code"></i>
                          </button>
                          <button type="button" class="btn-icon" title="View Profile & KYC" data-action="view-profile" data-id="${a.id}">
                            <i data-lucide="eye"></i>
                          </button>
                          ${a.status === 'Pending' ? `
                            <button type="button" class="btn-icon text-green" title="Approve Affiliate" data-action="approve" data-id="${a.id}">
                              <i data-lucide="check-circle"></i>
                            </button>
                            <button type="button" class="btn-icon text-red" title="Reject Application" data-action="reject" data-id="${a.id}">
                              <i data-lucide="x-circle"></i>
                            </button>
                          ` : a.status === 'Approved' ? `
                            <button type="button" class="btn-icon text-yellow" title="Suspend Partner" data-action="suspend" data-id="${a.id}">
                              <i data-lucide="slash"></i>
                            </button>
                          ` : `
                            <button type="button" class="btn-icon text-green" title="Reactivate Partner" data-action="approve" data-id="${a.id}">
                              <i data-lucide="rotate-ccw"></i>
                            </button>
                          `}
                          <button type="button" class="btn-icon" title="View Financial Ledger" data-action="view-ledger" data-id="${a.id}">
                            <i data-lucide="book-open"></i>
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

    // Actions
    container.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      btn.onclick = () => {
        if (action === 'approve') {
          platformStore.updateAffiliateStatus(id, 'Approved', 'Approved by Admin');
          render();
        } else if (action === 'reject') {
          if (confirm('Are you sure you want to reject this affiliate application?')) {
            platformStore.updateAffiliateStatus(id, 'Rejected', 'Application rejected by Admin');
            render();
          }
        } else if (action === 'suspend') {
          if (confirm('Suspend this affiliate account? All referral link tracking will be paused.')) {
            platformStore.updateAffiliateStatus(id, 'Suspended', 'Suspended by Admin review');
            render();
          }
        } else if (action === 'view-profile') {
          showAffiliateProfileModal(id);
        } else if (action === 'view-qr') {
          showAffiliateQrManagerModal(id, () => render());
        } else if (action === 'view-ledger') {
          navigateTo('ledgers', { affiliateId: id });
        }
      };
    });

    const exportBtn = container.querySelector('#btn-export-affiliates');
    if (exportBtn) {
      exportBtn.onclick = () => {
        exportAffiliatesCSV();
      };
    }
  }

  render();
}

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

          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn ${aff.referralStatus === 'Disabled' ? 'btn-green' : 'btn-secondary'} btn-sm w-full" id="btn-admin-toggle-status">
              <i data-lucide="${aff.referralStatus === 'Disabled' ? 'play' : 'pause'}"></i>
              <span>${aff.referralStatus === 'Disabled' ? 'Reactivate Referral Code' : 'Pause Referral Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const canvas = modal.querySelector('#admin-qr-modal-canvas');
  if (canvas) {
    renderQrToCanvas(canvas, refUrl, { size: 280, includeLogo: true });
  }

  const close = () => modal.classList.remove('active');
  modal.querySelector('#modal-qr-close').onclick = close;

  modal.querySelector('#btn-admin-copy-ref').onclick = () => {
    navigator.clipboard.writeText(refUrl);
    alert(`✅ Copied referral URL for ${aff.name}:\n\n${refUrl}`);
  };

  modal.querySelector('#btn-admin-open-ref').onclick = () => {
    window.open(refUrl, '_blank');
  };

  modal.querySelector('#btn-admin-qr-png').onclick = () => {
    downloadBrandedQrPng(refUrl, aff.name, aff.id, null);
  };

  modal.querySelector('#btn-admin-qr-svg').onclick = () => {
    downloadQrSvg(refUrl, aff.id);
  };

  modal.querySelector('#btn-admin-qr-flyer').onclick = () => {
    printQrFlyer(refUrl, aff.name, aff.id, null);
  };

  modal.querySelector('#btn-admin-save-code').onclick = () => {
    const customCode = modal.querySelector('#admin-custom-code-input').value.trim();
    const res = platformStore.regenerateReferralCode(aff.id, customCode);
    if (!res.success) {
      alert(`⚠️ ${res.message}`);
    } else {
      alert(`✅ Referral Code updated to "${res.referralCode}" for ${aff.name}.`);
      close();
      if (onRefresh) onRefresh();
    }
  };

  modal.querySelector('#btn-admin-toggle-status').onclick = () => {
    const newStatus = aff.referralStatus === 'Disabled' ? 'Active' : 'Disabled';
    platformStore.toggleReferralStatus(aff.id, newStatus);
    alert(`✅ Referral Code status updated to ${newStatus}.`);
    close();
    if (onRefresh) onRefresh();
  };
}

function showAffiliateProfileModal(affiliateId) {
  const aff = platformStore.affiliates.find(a => a.id === affiliateId);
  if (!aff) return;
  const stats = platformStore.getAffiliateStats(aff.id);
  const curr = platformStore.currency;

  let modal = document.getElementById('admin-aff-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-aff-profile-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 650px;">
      <button type="button" class="auth-modal-close" id="modal-profile-close"><i data-lucide="x"></i></button>
      
      <div class="profile-modal-header">
        <img src="${aff.avatar}" alt="${aff.name}" class="profile-modal-avatar">
        <div>
          <h3>${aff.name}</h3>
          <p class="text-muted"><code>${aff.id}</code> • ${aff.profession} (${aff.company})</p>
          <div class="profile-badges-row">
            <span class="badge-tier tier-${aff.tier.toLowerCase()}">${aff.tier} Tier</span>
            <span class="status-pill status-${aff.status.toLowerCase()}">${aff.status}</span>
          </div>
        </div>
      </div>

      <div class="profile-stats-grid">
        <div class="p-stat-box">
          <span>Total Referrals</span>
          <strong>${stats.totalReferrals}</strong>
        </div>
        <div class="p-stat-box">
          <span>Qualified Leads</span>
          <strong>${stats.qualifiedLeads}</strong>
        </div>
        <div class="p-stat-box">
          <span>Closed Deals</span>
          <strong class="text-gold">${stats.successfulSales}</strong>
        </div>
        <div class="p-stat-box">
          <span>Total Earned</span>
          <strong class="text-green">${formatCurrencyValue(stats.totalEarnings, curr)}</strong>
        </div>
      </div>

      <div class="profile-details-section">
        <h4 class="section-sub-title">Banking & Settlement Information</h4>
        <div class="details-grid-2">
          <div><label class="text-muted">Bank Name:</label> <span>${aff.bankName || 'Not configured'}</span></div>
          <div><label class="text-muted">Account Number / IBAN:</label> <span><code>${aff.accountNumber || 'N/A'}</code></span></div>
          <div><label class="text-muted">Account Title:</label> <span>${aff.accountTitle || aff.name}</span></div>
          <div><label class="text-muted">Tax ID / NTN:</label> <span>${aff.taxId || 'N/A'}</span></div>
          <div><label class="text-muted">Email:</label> <span>${aff.email}</span></div>
          <div><label class="text-muted">WhatsApp:</label> <span>${aff.whatsapp}</span></div>
        </div>
      </div>

      <div class="profile-modal-actions">
        <button type="button" class="btn btn-secondary" id="btn-close-prof">Close</button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#modal-profile-close').onclick = close;
  modal.querySelector('#btn-close-prof').onclick = close;
  modal.onclick = (e) => { if (e.target === modal) close(); };
}

function exportAffiliatesCSV() {
  const headers = ['Affiliate ID', 'Name', 'Referral Code', 'Referral Status', 'QR Scans', 'Total Clicks', 'Email', 'Phone', 'Country', 'City', 'Tier', 'Status', 'Total Leads', 'Closed Deals', 'Total Commission Earned'];
  const rows = platformStore.affiliates.map(a => {
    const stats = platformStore.getAffiliateReferralStats(a.id) || platformStore.getAffiliateStats(a.id);
    return [
      a.id,
      `"${a.name}"`,
      a.referralCode || a.id,
      a.referralStatus || 'Active',
      a.qrScans || 0,
      a.referralClicks || 0,
      a.email,
      a.phone,
      a.country,
      a.city,
      a.tier,
      a.status,
      stats.totalLeads || stats.totalReferrals || 0,
      stats.closedSales || stats.successfulSales || 0,
      stats.totalCommission || stats.totalEarnings || 0
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `PropPartner_Referral_Directory_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
