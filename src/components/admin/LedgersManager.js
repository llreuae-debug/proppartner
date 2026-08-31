// Ledgers Manager - Super Admin Triple Financial Ledger (Master, Project-Wise, Affiliate-Wise) & Immutable Audit Adjustments

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';
import { printLedgerStatement, exportLedgerCSV } from '../../utils/statementGenerator.js';

export function renderLedgersManager(container, navigateTo, initialParams = {}) {
  let activeLedger = initialParams.affiliateId ? 'affiliate' : initialParams.projectId ? 'project' : 'master';
  let selectedProjectId = initialParams.projectId || platformStore.projects[0].id;
  let selectedAffiliateId = initialParams.affiliateId || platformStore.affiliates[0].id;

  function render() {
    const curr = platformStore.currency;
    let transactions = [];

    if (activeLedger === 'master') {
      transactions = platformStore.ledger;
    } else if (activeLedger === 'project') {
      transactions = platformStore.ledger.filter(tx => tx.projectId === selectedProjectId);
    } else if (activeLedger === 'affiliate') {
      transactions = platformStore.ledger.filter(tx => tx.affiliateId === selectedAffiliateId);
    }

    const selectedAff = platformStore.affiliates.find(a => a.id === selectedAffiliateId);
    const selectedProj = platformStore.projects.find(p => p.id === selectedProjectId);

    // Calculate Running Balances
    let totalCredits = 0;
    let totalDebits = 0;
    let totalAdjustments = 0;

    transactions.forEach(tx => {
      if (tx.type === 'Payment') totalDebits += Math.abs(tx.netCommission);
      else if (tx.type === 'Sale' || tx.type === 'Commission') totalCredits += tx.netCommission;
      else if (tx.type === 'Adjustment') totalAdjustments += tx.netCommission;
    });

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Financial & Referral Ledgers</h2>
            <p class="module-subtitle">Immutable double-entry transaction journals, project ledgers, affiliate balances, and audit adjustments</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-print-ledger-pdf">
              <i data-lucide="printer"></i> <span>Print / PDF Statement</span>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-ledger-csv">
              <i data-lucide="download"></i> <span>Export CSV</span>
            </button>
            <button type="button" class="btn btn-gold btn-sm" id="btn-add-adj-modal">
              <i data-lucide="plus-circle"></i> <span>Post Audit Adjustment</span>
            </button>
          </div>
        </div>

        <!-- Ledger Selector Bar -->
        <div class="module-filter-bar glass-card">
          <div class="filter-tabs">
            <button type="button" class="filter-tab-btn ${activeLedger === 'master' ? 'active' : ''}" data-ledger="master">
              <i data-lucide="book-open"></i> Master System Ledger (${platformStore.ledger.length})
            </button>
            <button type="button" class="filter-tab-btn ${activeLedger === 'project' ? 'active' : ''}" data-ledger="project">
              <i data-lucide="building"></i> Project-Wise Ledger
            </button>
            <button type="button" class="filter-tab-btn ${activeLedger === 'affiliate' ? 'active' : ''}" data-ledger="affiliate">
              <i data-lucide="user"></i> Affiliate-Wise Ledger
            </button>
          </div>

          <div class="filter-controls">
            ${activeLedger === 'project' ? `
              <select id="select-project-ledger" class="form-select-sm">
                ${platformStore.projects.map(p => `
                  <option value="${p.id}" ${p.id === selectedProjectId ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            ` : activeLedger === 'affiliate' ? `
              <select id="select-affiliate-ledger" class="form-select-sm">
                ${platformStore.affiliates.map(a => `
                  <option value="${a.id}" ${a.id === selectedAffiliateId ? 'selected' : ''}>${a.name} (${a.id})</option>
                `).join('')}
              </select>
            ` : ''}
          </div>
        </div>

        <!-- Summary Metric Ribbon -->
        <div class="summary-ribbon-grid">
          <div class="ribbon-card glass-card">
            <span>Journal Scope</span>
            <strong>${activeLedger === 'master' ? 'All Developments & Partners' : activeLedger === 'project' ? (selectedProj ? selectedProj.name : 'Project') : (selectedAff ? `${selectedAff.name} (${selectedAff.id})` : 'Affiliate')}</strong>
          </div>
          <div class="ribbon-card glass-card">
            <span>Total Accrued Commissions</span>
            <strong class="text-gold">${formatCurrencyValue(totalCredits, curr)}</strong>
          </div>
          <div class="ribbon-card glass-card">
            <span>Total Disbursed Payouts</span>
            <strong class="text-green">${formatCurrencyValue(totalDebits, curr)}</strong>
          </div>
          <div class="ribbon-card glass-card">
            <span>Adjustments & Retentions</span>
            <strong class="${totalAdjustments < 0 ? 'text-red' : 'text-cyan'}">${totalAdjustments !== 0 ? formatCurrencyValue(totalAdjustments, curr) : '₨ 0'}</strong>
          </div>
        </div>

        <!-- Ledger Table -->
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Tx ID / Date</th>
                  <th>Transaction Type</th>
                  <th>Project / Unit</th>
                  <th>Affiliate</th>
                  <th>Party / Customer</th>
                  <th>Gross Transaction</th>
                  <th>Comm / Net Impact</th>
                  <th>Reference #</th>
                  <th>Audited By</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.length === 0 ? `
                  <tr><td colspan="9" class="text-center py-6 text-muted">No journal transactions recorded for this selection.</td></tr>
                ` : transactions.map(tx => `
                  <tr>
                    <td>
                      <code>${tx.id}</code>
                      <div class="text-muted">${tx.date}</div>
                    </td>
                    <td><span class="tx-type-pill tx-${tx.type.toLowerCase()}">${tx.type}</span></td>
                    <td>
                      <strong>${tx.projectId}</strong>
                      <div class="text-muted">${tx.unitId}</div>
                    </td>
                    <td>
                      <span class="badge-tier">${tx.affiliateName || tx.affiliateId}</span>
                    </td>
                    <td><strong>${tx.customerName}</strong></td>
                    <td><strong>${formatCurrencyValue(tx.amount, curr)}</strong></td>
                    <td>
                      <strong class="${tx.netCommission < 0 ? 'text-green' : tx.netCommission > 0 ? 'text-gold' : 'text-muted'}">
                        ${tx.netCommission > 0 ? '+' : ''}${formatCurrencyValue(tx.netCommission, curr)}
                      </strong>
                    </td>
                    <td><code>${tx.reference || 'REF-STD'}</code></td>
                    <td><span class="text-muted">${tx.createdBy || 'System'}</span></td>
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
        activeLedger = btn.dataset.ledger;
        render();
      };
    });

    const projSelect = container.querySelector('#select-project-ledger');
    if (projSelect) {
      projSelect.onchange = (e) => {
        selectedProjectId = e.target.value;
        render();
      };
    }

    const affSelect = container.querySelector('#select-affiliate-ledger');
    if (affSelect) {
      affSelect.onchange = (e) => {
        selectedAffiliateId = e.target.value;
        render();
      };
    }

    const printBtn = container.querySelector('#btn-print-ledger-pdf');
    if (printBtn) {
      printBtn.onclick = () => {
        const scopeTitle = activeLedger === 'master' 
          ? 'Master System Financial Ledger' 
          : activeLedger === 'project' 
            ? `Project Ledger — ${selectedProj ? selectedProj.name : 'All Projects'}` 
            : `Affiliate Partner Financial Statement — ${selectedAff ? selectedAff.name : 'All Affiliates'}`;
        
        printLedgerStatement({
          transactions,
          scopeTitle,
          currency: curr,
          affiliateInfo: activeLedger === 'affiliate' ? selectedAff : null
        });
      };
    }

    const adjBtn = container.querySelector('#btn-add-adj-modal');
    if (adjBtn) adjBtn.onclick = () => showAdjustmentModal();

    const exportBtn = container.querySelector('#btn-export-ledger-csv');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const scopeName = activeLedger === 'master' ? 'Master_Ledger' : activeLedger === 'project' ? `Project_${selectedProjectId}` : `Affiliate_${selectedAffiliateId}`;
        exportLedgerCSV({ transactions, filename: `PropPartner_${scopeName}` });
      };
    }
  }

  function showAdjustmentModal() {
    let modal = document.getElementById('admin-adj-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-adj-modal';
      modal.className = 'auth-modal-backdrop active';
      document.body.appendChild(modal);
    } else {
      modal.classList.add('active');
    }

    modal.innerHTML = `
      <div class="auth-modal-dialog glass-card" style="max-width: 600px;">
        <button type="button" class="auth-modal-close" id="adj-close-btn"><i data-lucide="x"></i></button>
        <div class="auth-modal-header">
          <div class="badge-count gold"><i data-lucide="edit-3"></i></div>
          <h3 class="auth-modal-title">Post Audit-Ready Ledger Adjustment</h3>
          <p class="auth-modal-subtitle">Per financial data principles, historical entries are immutable. Errors are corrected via audited adjustments.</p>
        </div>

        <form id="adj-form" class="auth-form">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label text-xs">Target Project</label>
              <select class="form-input" id="adj-project">
                ${platformStore.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Target Affiliate</label>
              <select class="form-input" id="adj-affiliate">
                ${platformStore.affiliates.map(a => `<option value="${a.id}">${a.name} (${a.id})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label text-xs">Adjustment Amount in PKR (Negative for Deductions)</label>
              <input type="number" class="form-input" id="adj-amount" placeholder="e.g. 50000 or -25000" required>
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Adjustment Reason</label>
              <select class="form-input" id="adj-reason">
                <option value="Commission Correction">Commission Correction</option>
                <option value="Bonus Credit">Bonus Credit</option>
                <option value="Clawback / Withholding">Clawback / Withholding</option>
                <option value="Tax Deduction">Tax Deduction</option>
                <option value="Manual Reconciliation">Manual Reconciliation</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label text-xs">Detailed Audit Notes</label>
            <textarea class="form-input" id="adj-notes" rows="3" placeholder="Provide reason and authorization details for compliance audit..." required></textarea>
          </div>

          <div class="modal-actions-row">
            <button type="button" class="btn btn-secondary" id="adj-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-gold">Post Immutable Adjustment</button>
          </div>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const close = () => modal.classList.remove('active');
    modal.querySelector('#adj-close-btn').onclick = close;
    modal.querySelector('#adj-cancel-btn').onclick = close;

    modal.querySelector('#adj-form').onsubmit = (e) => {
      e.preventDefault();
      const pId = modal.querySelector('#adj-project').value;
      const aId = modal.querySelector('#adj-affiliate').value;
      const amt = Number(modal.querySelector('#adj-amount').value);
      const reason = modal.querySelector('#adj-reason').value;
      const notes = modal.querySelector('#adj-notes').value;

      const aff = platformStore.affiliates.find(a => a.id === aId);
      const proj = platformStore.projects.find(p => p.id === pId);

      platformStore.addLedgerEntry({
        type: 'Adjustment',
        projectId: pId,
        unitId: 'ADJ-MANUAL',
        affiliateId: aId,
        affiliateName: aff ? aff.name : aId,
        customerName: `Adjustment: ${reason}`,
        amount: 0,
        netCommission: amt,
        reference: `ADJ-${Date.now().toString().slice(-6)}`,
        status: 'Completed',
        createdBy: 'Super Admin',
        notes: notes
      });

      alert(`Adjustment of PKR ${amt.toLocaleString()} recorded to ledger successfully.`);
      close();
      render();
    };
  }

  render();
}
