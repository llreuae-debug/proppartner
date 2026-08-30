// Ledgers Manager - Super Admin Triple Financial Ledger (Master, Project-Wise, Affiliate-Wise) & Immutable Audit Adjustments

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

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
        const scopeTitle = activeLedger === 'master' ? 'Master System Financial Ledger' : activeLedger === 'project' ? `Project Ledger — ${selectedProj ? selectedProj.name : 'All Projects'}` : `Affiliate Ledger — ${selectedAff ? selectedAff.name : 'All Affiliates'}`;
        printLedgerPDF(transactions, scopeTitle, curr);
      };
    }

    const adjBtn = container.querySelector('#btn-add-adj-modal');
    if (adjBtn) adjBtn.onclick = () => showAdjustmentModal();

    const exportBtn = container.querySelector('#btn-export-ledger-csv');
    if (exportBtn) exportBtn.onclick = () => exportLedgerCSV(transactions);
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
              <label class="form-label">Target Affiliate <span class="req">*</span></label>
              <select id="adj-aff-select" class="form-select" required>
                ${platformStore.affiliates.map(a => `
                  <option value="${a.id}">${a.name} (${a.id})</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Target Project <span class="req">*</span></label>
              <select id="adj-proj-select" class="form-select" required>
                ${platformStore.projects.map(p => `
                  <option value="${p.id}">${p.name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Adjustment Amount (PKR) <span class="req">*</span></label>
              <input type="number" id="adj-amount-input" class="form-input" placeholder="e.g. -25000 or +50000" required>
              <span class="text-xs text-muted">Use negative (-) for deductions/penalties, positive (+) for bonuses/corrections</span>
            </div>
            <div class="form-group">
              <label class="form-label">Reference ID / Ticket #</label>
              <input type="text" id="adj-ref-input" class="form-input" placeholder="e.g. AUDIT-CORR-2026-04" required value="AUDIT-CORR-2026-04">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mandatory Business Justification / Audit Reason <span class="req">*</span></label>
            <textarea id="adj-reason-text" class="form-textarea" rows="3" required placeholder="Describe reason for financial adjustment..."></textarea>
          </div>

          <button type="submit" class="btn btn-gold w-full btn-lg">
            <i data-lucide="check-circle-2"></i>
            <span>POST IMMUTABLE AUDIT TRANSACTION</span>
          </button>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const close = () => modal.classList.remove('active');
    modal.querySelector('#adj-close-btn').onclick = close;

    modal.querySelector('#adj-form').onsubmit = (e) => {
      e.preventDefault();
      const affId = modal.querySelector('#adj-aff-select').value;
      const projId = modal.querySelector('#adj-proj-select').value;
      const amount = modal.querySelector('#adj-amount-input').value;
      const reference = modal.querySelector('#adj-ref-input').value;
      const reason = modal.querySelector('#adj-reason-text').value;

      platformStore.addLedgerAdjustment({
        affiliateId: affId,
        projectId: projId,
        amount: Number(amount),
        reference,
        reason
      });

      close();
      render();
    };
  }

  function exportLedgerCSV(transactions) {
    const headers = ['Tx ID', 'Date', 'Type', 'Project', 'Unit', 'Affiliate', 'Customer', 'Amount', 'Net Commission', 'Reference', 'Audited By'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      t.projectId,
      t.unitId,
      `"${t.affiliateName || t.affiliateId}"`,
      `"${t.customerName}"`,
      t.amount,
      t.netCommission,
      t.reference,
      `"${t.createdBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PropPartner_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printLedgerPDF(transactions, title, curr) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PropPartner — Official Financial Ledger Statement</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0F172A; background: #FFF; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { height: 60px; object-fit: contain; }
          .meta { text-align: right; font-size: 12px; color: #64748B; }
          .title { font-size: 22px; font-weight: 800; color: #1E3A8A; margin: 0 0 6px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 10px 8px; text-align: left; font-weight: 700; color: #1E293B; }
          td { border: 1px solid #E2E8F0; padding: 8px; color: #334155; }
          tr:nth-child(even) { background: #F8FAFC; }
          .text-right { text-align: right; }
          .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="/assets/proppartner-logo.png" alt="PropPartner" class="logo">
          </div>
          <div class="meta">
            <div><strong>PropPartner Network Financial Ledger</strong></div>
            <div>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div>Document Ref: STMT-${Date.now()}</div>
          </div>
        </div>
        <h1 class="title">${title}</h1>
        <p style="font-size: 13px; color: #64748B; margin: 0 0 16px 0;">Official double-entry immutable audit statement of commission accruals, escrow disbursements, and balance journals.</p>
        <table>
          <thead>
            <tr>
              <th>Tx ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Project</th>
              <th>Unit</th>
              <th>Affiliate</th>
              <th>Gross Amount</th>
              <th class="text-right">Net Commission</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td><code>${t.id}</code></td>
                <td>${t.date}</td>
                <td><strong>${t.type}</strong></td>
                <td>${t.projectId}</td>
                <td>${t.unitId || '-'}</td>
                <td>${t.affiliateName || t.affiliateId}</td>
                <td>${formatCurrencyValue(t.amount, curr)}</td>
                <td class="text-right"><strong>${formatCurrencyValue(t.netCommission, curr)}</strong></td>
                <td><code>${t.reference || 'REF-STD'}</code></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <span>PropPartner Real Estate Affiliate Partner Network · Confidential Financial Record</span>
          <span>Verified Double-Entry Escrow Ledger</span>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  render();
}
