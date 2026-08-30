// Sales Manager - Super Admin Sales Transactions, Property Closings & Automatic Commission Generation

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

export function renderSalesManager(container, navigateTo, initialAction = null) {
  function render() {
    const curr = platformStore.currency;
    const totalSalesVol = platformStore.sales.reduce((sum, s) => sum + s.salePrice, 0);
    const totalCommVol = platformStore.sales.reduce((sum, s) => sum + s.grossCommission, 0);

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Verified Sales & Property Transactions</h2>
            <p class="module-subtitle">Manage executed contracts, track buyer milestones, and automatically calculate qualifying commissions</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-create-sale-modal">
              <i data-lucide="plus-circle"></i> <span>Record New Sale</span>
            </button>
          </div>
        </div>

        <!-- Sales Summary Ribbon -->
        <div class="summary-ribbon-grid">
          <div class="ribbon-card glass-card">
            <span>Total Closed Deals</span>
            <strong class="text-white">${platformStore.sales.length} Transactions</strong>
          </div>
          <div class="ribbon-card glass-card">
            <span>Gross Sales Volume</span>
            <strong class="text-gold">${formatCurrencyValue(totalSalesVol, curr)}</strong>
          </div>
          <div class="ribbon-card glass-card">
            <span>Commission Incurred</span>
            <strong class="text-green">${formatCurrencyValue(totalCommVol, curr)}</strong>
          </div>
        </div>

        <!-- Sales Table -->
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Customer & Unit</th>
                  <th>Project</th>
                  <th>Referring Partner</th>
                  <th>Sale Price</th>
                  <th>Commission Rate & Amount</th>
                  <th>Transaction Status</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                ${platformStore.sales.length === 0 ? `
                  <tr><td colspan="8" class="text-center py-6 text-muted">No sales records found.</td></tr>
                ` : platformStore.sales.map(s => `
                  <tr>
                    <td><code>${s.id}</code><br><span class="text-muted">${s.bookingDate}</span></td>
                    <td>
                      <strong>${s.customerName}</strong>
                      <div class="text-muted">${s.unitNumber}</div>
                    </td>
                    <td>${s.projectName}</td>
                    <td>
                      <span class="badge-tier">${s.affiliateName}</span>
                      <div class="text-muted"><code>${s.affiliateId}</code></div>
                    </td>
                    <td><strong class="text-white">${formatCurrencyValue(s.salePrice, curr)}</strong></td>
                    <td>
                      <strong class="text-gold">${formatCurrencyValue(s.grossCommission, curr)}</strong>
                      <div class="text-muted">${s.commissionRate}% Qualifying Rate</div>
                    </td>
                    <td><span class="status-pill status-${s.status.toLowerCase()}">${s.status}</span></td>
                    <td><span class="status-pill status-${s.paymentStatus.toLowerCase()}">${s.paymentStatus}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const createBtn = container.querySelector('#btn-create-sale-modal');
    if (createBtn) createBtn.onclick = () => showCreateSaleModal();
  }

  function showCreateSaleModal() {
    let modal = document.getElementById('admin-create-sale-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-create-sale-modal';
      modal.className = 'auth-modal-backdrop active';
      document.body.appendChild(modal);
    } else {
      modal.classList.add('active');
    }

    modal.innerHTML = `
      <div class="auth-modal-dialog glass-card" style="max-width: 620px;">
        <button type="button" class="auth-modal-close" id="sale-close-btn"><i data-lucide="x"></i></button>
        <div class="auth-modal-header">
          <div class="badge-count green"><i data-lucide="award"></i></div>
          <h3 class="auth-modal-title">Record Verified Property Sale</h3>
          <p class="auth-modal-subtitle">Recording a sale triggers automatic tiered commission calculation and ledger posting.</p>
        </div>

        <form id="record-sale-form" class="auth-form">
          <div class="form-group">
            <label class="form-label">Select Project <span class="req">*</span></label>
            <select id="sale-proj-select" class="form-select" required>
              ${platformStore.projects.map(p => `
                <option value="${p.id}" data-rate="${p.commissionRate}" data-price="${p.startingPrice}">${p.name} (Base: ${p.commissionRate}%)</option>
              `).join('')}
            </select>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Customer Legal Name <span class="req">*</span></label>
              <input type="text" id="sale-customer-name" class="form-input" placeholder="e.g. M. Zubair Chaudhry" required>
            </div>
            <div class="form-group">
              <label class="form-label">Unit Number / Description <span class="req">*</span></label>
              <input type="text" id="sale-unit-number" class="form-input" placeholder="e.g. Tower A / Unit A-1204" required>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Attributed Affiliate Partner <span class="req">*</span></label>
              <select id="sale-aff-select" class="form-select" required>
                ${platformStore.affiliates.map(a => `
                  <option value="${a.id}">${a.name} (${a.id}) - ${a.tier}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Agreed Sale Price (PKR) <span class="req">*</span></label>
              <input type="number" id="sale-price-input" class="form-input" value="38500000" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Sale Notes & Contract Reference</label>
            <input type="text" id="sale-notes-input" class="form-input" placeholder="e.g. 100% token verified, contract signed on March 28">
          </div>

          <button type="submit" class="btn btn-gold w-full btn-lg">
            <i data-lucide="check-circle-2"></i>
            <span>EXECUTE SALE & POST COMMISSION</span>
          </button>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const close = () => modal.classList.remove('active');
    modal.querySelector('#sale-close-btn').onclick = close;

    modal.querySelector('#record-sale-form').onsubmit = (e) => {
      e.preventDefault();
      const projId = modal.querySelector('#sale-proj-select').value;
      const customer = modal.querySelector('#sale-customer-name').value;
      const unit = modal.querySelector('#sale-unit-number').value;
      const affiliateId = modal.querySelector('#sale-aff-select').value;
      const price = modal.querySelector('#sale-price-input').value;
      const notes = modal.querySelector('#sale-notes-input').value;

      platformStore.recordSale({
        projectId: projId,
        customerName: customer,
        unitNumber: unit,
        affiliateId,
        salePrice: Number(price),
        notes
      });

      close();
      render();
    };
  }

  if (initialAction === 'add-sale') {
    showCreateSaleModal();
  }

  render();
}
