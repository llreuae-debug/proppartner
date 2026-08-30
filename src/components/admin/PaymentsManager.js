// Payments Manager - Super Admin Pending Payment Center & Disbursement Engine

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

export function renderPaymentsManager(container, navigateTo, initialAction = null) {
  function render() {
    const curr = platformStore.currency;
    const payableComms = platformStore.commissions.filter(c => c.status === 'Payable');
    const totalPayableAmount = payableComms.reduce((sum, c) => sum + c.netPayable, 0);
    const totalPaidAmount = platformStore.payments.reduce((sum, p) => sum + p.amount, 0);

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Payment Disbursement & Pending Payment Center</h2>
            <p class="module-subtitle">Manage payout queues, execute bank transfers, record transaction reference numbers and upload proofs</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-manual-disburse">
              <i data-lucide="send"></i> <span>Execute New Payout</span>
            </button>
          </div>
        </div>

        <!-- Pending Payments Action Banner -->
        <div class="pending-payout-ribbon glass-card">
          <div class="payout-ribbon-info">
            <div class="badge-count cyan"><i data-lucide="wallet"></i></div>
            <div>
              <h3 style="margin:0; font-size:1.2rem;">Total Payable Balance: <span class="text-gold">${formatCurrencyValue(totalPayableAmount, curr)}</span></h3>
              <p class="text-muted" style="margin:4px 0 0 0;">${payableComms.length} approved commission records ready for immediate disbursement.</p>
            </div>
          </div>
          <div class="payout-ribbon-stats">
            <div class="r-stat"><span>Lifetime Disbursed</span> <strong class="text-green">${formatCurrencyValue(totalPaidAmount, curr)}</strong></div>
          </div>
        </div>

        <!-- Pending Payments Queue -->
        <div class="table-card glass-card" style="margin-bottom: 30px;">
          <div class="table-card-header">
            <h4><i data-lucide="clock"></i> Active Payable Payout Queue (${payableComms.length})</h4>
          </div>
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Comm ID</th>
                  <th>Affiliate</th>
                  <th>Project</th>
                  <th>Bank / IBAN Details</th>
                  <th>Payable Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${payableComms.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-6 text-muted">No pending payable disbursements. All commissions are settled!</td></tr>
                ` : payableComms.map(c => {
                  const aff = platformStore.affiliates.find(a => a.id === c.affiliateId);
                  return `
                    <tr>
                      <td><code>${c.id}</code></td>
                      <td>
                        <strong>${c.affiliateName}</strong>
                        <div class="text-muted"><code>${c.affiliateId}</code></div>
                      </td>
                      <td>${c.projectName}</td>
                      <td>
                        <strong>${aff ? aff.bankName : 'Direct Bank'}</strong>
                        <div class="text-muted"><code>${aff ? aff.accountNumber : 'N/A'}</code></div>
                      </td>
                      <td><strong class="text-gold" style="font-size: 1.1rem;">${formatCurrencyValue(c.netPayable, curr)}</strong></td>
                      <td>
                        <button type="button" class="btn btn-gold btn-xs btn-execute-disbursement" data-id="${c.id}" data-aff="${c.affiliateId}" data-amount="${c.netPayable}">
                          <i data-lucide="send"></i> Disburse Payout
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Historical Payments Ledger -->
        <div class="table-card glass-card">
          <div class="table-card-header">
            <h4><i data-lucide="check-circle-2"></i> Payout Disbursement History (${platformStore.payments.length})</h4>
          </div>
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Disbursement Date</th>
                  <th>Affiliate</th>
                  <th>Method & Reference</th>
                  <th>Amount Paid</th>
                  <th>Proof Receipt</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${platformStore.payments.map(p => `
                  <tr>
                    <td><code>${p.id}</code></td>
                    <td>${p.date}</td>
                    <td>
                      <strong>${p.affiliateName}</strong>
                      <div class="text-muted"><code>${p.affiliateId}</code></div>
                    </td>
                    <td>
                      <strong>${p.method}</strong>
                      <div><code>${p.reference}</code></div>
                    </td>
                    <td><strong class="text-green" style="font-size: 1.05rem;">${formatCurrencyValue(p.amount, curr)}</strong></td>
                    <td>
                      <button type="button" class="btn-text-link" onclick="alert('Viewing Bank Settlement Voucher #${p.reference}');">
                        <i data-lucide="file-text"></i> View Receipt
                      </button>
                    </td>
                    <td><span class="status-pill status-paid">${p.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll('.btn-execute-disbursement').forEach(btn => {
      btn.onclick = () => {
        showDisburseModal(btn.dataset.id, btn.dataset.aff, btn.dataset.amount);
      };
    });

    const manualBtn = container.querySelector('#btn-manual-disburse');
    if (manualBtn) {
      manualBtn.onclick = () => {
        if (payableComms.length > 0) {
          showDisburseModal(payableComms[0].id, payableComms[0].affiliateId, payableComms[0].netPayable);
        } else {
          showDisburseModal(null, platformStore.affiliates[0].id, 500000);
        }
      };
    }
  }

  function showDisburseModal(commId, affiliateId, defaultAmount) {
    const aff = platformStore.affiliates.find(a => a.id === affiliateId);
    let modal = document.getElementById('admin-disburse-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-disburse-modal';
      modal.className = 'auth-modal-backdrop active';
      document.body.appendChild(modal);
    } else {
      modal.classList.add('active');
    }

    modal.innerHTML = `
      <div class="auth-modal-dialog glass-card" style="max-width: 600px;">
        <button type="button" class="auth-modal-close" id="disburse-close-btn"><i data-lucide="x"></i></button>
        <div class="auth-modal-header">
          <div class="badge-count green"><i data-lucide="send"></i></div>
          <h3 class="auth-modal-title">Execute Commission Disbursement</h3>
          <p class="auth-modal-subtitle">Record banking transfer confirmation and generate immutable ledger payout entry.</p>
        </div>

        <form id="disburse-form" class="auth-form">
          <div class="form-group">
            <label class="form-label">Beneficiary Partner</label>
            <input type="text" class="form-input" value="${aff ? `${aff.name} (${aff.id})` : affiliateId}" disabled>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Payout Amount (PKR) <span class="req">*</span></label>
              <input type="number" id="payout-amount-input" class="form-input" value="${defaultAmount || 1000000}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Payment Method <span class="req">*</span></label>
              <select id="payout-method-select" class="form-select">
                <option value="Bank Transfer (RTGS / Wire)" selected>Bank Transfer (RTGS / Wire)</option>
                <option value="Online Direct Deposit">Online Direct Deposit</option>
                <option value="Corporate Cheque">Corporate Cheque</option>
                <option value="Cash Voucher">Cash Voucher</option>
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Bank Transaction Reference / Cheque # <span class="req">*</span></label>
              <input type="text" id="payout-ref-input" class="form-input" placeholder="e.g. HBL-FT-${Date.now().toString().slice(-6)}" required value="HBL-FT-${Date.now().toString().slice(-6)}">
            </div>
            <div class="form-group">
              <label class="form-label">Disbursement Date</label>
              <input type="date" id="payout-date-input" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Settlement Notes</label>
            <input type="text" id="payout-notes-input" class="form-input" placeholder="e.g. Commission settlement for verified residential tower closing">
          </div>

          <button type="submit" class="btn btn-gold w-full btn-lg">
            <i data-lucide="check-circle-2"></i>
            <span>CONFIRM DISBURSEMENT & POST TO LEDGER</span>
          </button>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const close = () => modal.classList.remove('active');
    modal.querySelector('#disburse-close-btn').onclick = close;

    modal.querySelector('#disburse-form').onsubmit = (e) => {
      e.preventDefault();
      const amount = modal.querySelector('#payout-amount-input').value;
      const method = modal.querySelector('#payout-method-select').value;
      const reference = modal.querySelector('#payout-ref-input').value;
      const date = modal.querySelector('#payout-date-input').value;
      const notes = modal.querySelector('#payout-notes-input').value;

      platformStore.disbursePayment({
        commissionId: commId,
        affiliateId,
        amount: Number(amount),
        method,
        reference,
        date,
        notes
      });

      close();
      render();
    };
  }

  if (initialAction === 'disburse') {
    const payable = platformStore.commissions.find(c => c.status === 'Payable');
    if (payable) {
      showDisburseModal(payable.id, payable.affiliateId, payable.netPayable);
    }
  }

  render();
}
