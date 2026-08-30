// Affiliates Manager - Super Admin Affiliate Roster, Approvals & Tier Controls

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

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
        (a.company && a.company.toLowerCase().includes(q))
      );
    }

    const pendingCount = platformStore.affiliates.filter(a => a.status === 'Pending').length;

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Affiliate Partner Network</h2>
            <p class="module-subtitle">Manage vetted wealth advisors, consultants, real estate brokers and channel partners</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-affiliates">
              <i data-lucide="download"></i> <span>Export CSV</span>
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
              <input type="text" id="aff-search" placeholder="Search by name, ID, email or company..." value="${searchQuery}">
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
                  <th>Contact Info</th>
                  <th>Tier & Status</th>
                  <th>Bank Account</th>
                  <th>Referrals</th>
                  <th>Sales Closed</th>
                  <th>Total Earned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr><td colspan="8" class="text-center py-6 text-muted">No affiliate partners found matching criteria.</td></tr>
                ` : filtered.map(a => {
                  const stats = platformStore.getAffiliateStats(a.id);
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
                        <div class="contact-cell">
                          <div><i data-lucide="mail"></i> ${a.email}</div>
                          <div><i data-lucide="phone"></i> ${a.phone}</div>
                          <div class="text-muted"><i data-lucide="map-pin"></i> ${a.city}, ${a.country}</div>
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
                        <strong>${stats.totalReferrals}</strong>
                        <div class="text-muted">${stats.qualifiedLeads} Qualified</div>
                      </td>
                      <td>
                        <strong class="text-gold">${stats.successfulSales} Deals</strong>
                        <div class="text-muted">${stats.conversionRate}</div>
                      </td>
                      <td>
                        <strong class="text-green">${formatCurrencyValue(stats.totalEarnings, curr)}</strong>
                        <div class="text-muted">${formatCurrencyValue(stats.pendingCommission, curr)} pend.</div>
                      </td>
                      <td>
                        <div class="action-btn-group">
                          <button type="button" class="btn-icon" title="View Profile & Ledger" data-action="view-profile" data-id="${a.id}">
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
                          <button type="button" class="btn-icon" title="View Affiliate Ledger" data-action="view-ledger" data-id="${a.id}">
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
  const headers = ['Affiliate ID', 'Name', 'Email', 'Phone', 'Country', 'City', 'Tier', 'Status', 'Total Referrals', 'Sales', 'Total Earned'];
  const rows = platformStore.affiliates.map(a => {
    const stats = platformStore.getAffiliateStats(a.id);
    return [
      a.id,
      `"${a.name}"`,
      a.email,
      a.phone,
      a.country,
      a.city,
      a.tier,
      a.status,
      stats.totalReferrals,
      stats.successfulSales,
      stats.totalEarnings
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `PropPartner_Affiliates_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
