// Commissions Manager - Super Admin Commission Approval Engine & Payout Processing

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

export function renderCommissionsManager(container, navigateTo) {
  let activeTab = 'all'; // 'all' | 'pending' | 'approved' | 'payable' | 'paid'

  function render() {
    const curr = platformStore.currency;
    let filtered = platformStore.commissions.filter(c => {
      if (activeTab === 'pending') return ['Pending', 'Under Review'].includes(c.status);
      if (activeTab === 'approved') return c.status === 'Approved';
      if (activeTab === 'payable') return c.status === 'Payable';
      if (activeTab === 'paid') return c.status === 'Paid';
      return true;
    });

    const pendingCount = platformStore.commissions.filter(c => ['Pending', 'Under Review'].includes(c.status)).length;
    const payableCount = platformStore.commissions.filter(c => c.status === 'Payable').length;

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Commission Approval & Entitlement Engine</h2>
            <p class="module-subtitle">Verify qualifying transaction milestones, approve payout eligibility, and disburse partner earnings</p>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="module-filter-bar glass-card">
          <div class="filter-tabs">
            <button type="button" class="filter-tab-btn ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
              All Commissions (${platformStore.commissions.length})
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'pending' ? 'active' : ''}" data-tab="pending">
              Pending Review ${pendingCount > 0 ? `<span class="badge-count yellow">${pendingCount}</span>` : ''}
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'approved' ? 'active' : ''}" data-tab="approved">
              Approved
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'payable' ? 'active' : ''}" data-tab="payable">
              Ready for Payout ${payableCount > 0 ? `<span class="badge-count cyan">${payableCount}</span>` : ''}
            </button>
            <button type="button" class="filter-tab-btn ${activeTab === 'paid' ? 'active' : ''}" data-tab="paid">
              Disbursed (Paid)
            </button>
          </div>
        </div>

        <!-- Commission Records Table -->
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Comm ID / Date</th>
                  <th>Affiliate Partner</th>
                  <th>Project & Sale Value</th>
                  <th>Rate</th>
                  <th>Gross Commission</th>
                  <th>Adjustments</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr><td colspan="9" class="text-center py-6 text-muted">No commission records found.</td></tr>
                ` : filtered.map(c => `
                  <tr>
                    <td>
                      <code>${c.id}</code>
                      <div class="text-muted">${c.createdDate}</div>
                    </td>
                    <td>
                      <strong>${c.affiliateName}</strong>
                      <div class="text-muted"><code>${c.affiliateId}</code></div>
                    </td>
                    <td>
                      <strong>${c.projectName}</strong>
                      <div class="text-muted">Gross: ${formatCurrencyValue(c.grossSale, curr)}</div>
                    </td>
                    <td><strong class="text-gold">${c.rate}%</strong></td>
                    <td>${formatCurrencyValue(c.grossCommission, curr)}</td>
                    <td class="${c.adjustments < 0 ? 'text-red' : 'text-muted'}">
                      ${c.adjustments !== 0 ? formatCurrencyValue(c.adjustments, curr) : '₨ 0'}
                    </td>
                    <td>
                      <strong class="text-gold" style="font-size: 1.05rem;">${formatCurrencyValue(c.netPayable, curr)}</strong>
                    </td>
                    <td><span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span></td>
                    <td>
                      <div class="action-btn-group">
                        ${c.status === 'Pending' ? `
                          <button type="button" class="btn btn-xs btn-gold btn-approve" data-id="${c.id}">Approve</button>
                        ` : c.status === 'Approved' ? `
                          <button type="button" class="btn btn-xs btn-secondary btn-make-payable" data-id="${c.id}">Mark Payable</button>
                        ` : c.status === 'Payable' ? `
                          <button type="button" class="btn btn-xs btn-gold btn-pay-now" data-id="${c.id}">Disburse</button>
                        ` : `
                          <span class="text-muted text-xs">Settled (${c.paidDate || 'Paid'})</span>
                        `}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.tab;
        render();
      };
    });

    container.querySelectorAll('.btn-approve').forEach(btn => {
      btn.onclick = () => {
        platformStore.approveCommission(btn.dataset.id);
        render();
      };
    });

    container.querySelectorAll('.btn-make-payable').forEach(btn => {
      btn.onclick = () => {
        platformStore.markCommissionPayable(btn.dataset.id);
        render();
      };
    });

    container.querySelectorAll('.btn-pay-now').forEach(btn => {
      btn.onclick = () => {
        navigateTo('payments', { action: 'disburse', commissionId: btn.dataset.id });
      };
    });
  }

  render();
}
