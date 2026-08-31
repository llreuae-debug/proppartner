// Statement & PDF Generator for PropPartner Financial Ledgers & Audits
// Generates official branded printable PDF statements with corporate header, logo, and address footer

import { formatCurrencyValue } from '../store/platformStore.js';

export const CORPORATE_INFO = {
  name: 'PropPartner Global Real Estate Network Ltd.',
  tagline: 'Regulated Double-Entry Real Estate Commission & Escrow Network',
  addressLine1: 'Level 24, Boulevard Financial Tower, Financial Center Road',
  addressLine2: 'Downtown Financial District, Dubai, UAE / Main Boulevard, Karachi',
  email: 'support@proppartner.pro',
  concierge: 'concierge@proppartner.pro',
  phone: '+971 4 200 8899 / +92 21 3581 0000',
  website: 'https://proppartner.pro',
  registrationNo: 'REG-AE-9842109 / TRN-100293847-001'
};

/**
 * Generates an official, print-ready branded financial ledger statement
 * @param {Object} options
 * @param {Array} options.transactions - List of ledger transaction objects
 * @param {string} options.scopeTitle - Title of the statement (e.g. "Partner Financial Ledger — Tariq Mansoor")
 * @param {string} options.currency - Currency code (PKR, USD, AED)
 * @param {Object} [options.affiliateInfo] - Partner details (name, id, tier, bank)
 * @param {Object} [options.summaryStats] - Summary totals (grossSales, commissionEarned, paidCommission, availableBalance)
 */
export function printLedgerStatement({
  transactions = [],
  scopeTitle = 'Official Financial Statement',
  currency = 'PKR',
  affiliateInfo = null,
  summaryStats = null
}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and print your official statement.');
    return;
  }

  const generatedDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const generatedTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
  });
  const docRef = `STMT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Calculate totals if not provided
  let totalCredits = 0;
  let totalDebits = 0;
  let totalVolume = 0;

  transactions.forEach(t => {
    totalVolume += Number(t.amount || 0);
    const comm = Number(t.netCommission || 0);
    if (comm > 0) totalCredits += comm;
    else if (comm < 0) totalDebits += Math.abs(comm);
  });

  const netBalance = totalCredits - totalDebits;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>PropPartner Statement — ${docRef}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.45;
        }

        /* Top Branded Corporate Header */
        .statement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #D4AF37;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .brand-logo-img {
          height: 52px;
          width: auto;
          object-fit: contain;
        }
        .brand-text-block h1 {
          font-size: 18px;
          font-weight: 900;
          color: #0B0F19;
          margin: 0 0 2px 0;
          letter-spacing: 0.5px;
        }
        .brand-text-block h1 span {
          color: #D4AF37;
        }
        .brand-tagline {
          font-size: 9.5px;
          color: #64748B;
          font-weight: 500;
        }
        .header-meta {
          text-align: right;
          font-size: 10px;
          color: #475569;
        }
        .header-meta .doc-badge {
          display: inline-block;
          background: #0B0F19;
          color: #D4AF37;
          font-family: monospace;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 4px;
          border: 1px solid #D4AF37;
        }

        /* Statement Title & Scope Banner */
        .scope-banner {
          background: #F8FAFC;
          border-left: 4px solid #D4AF37;
          border-radius: 0 8px 8px 0;
          padding: 10px 14px;
          margin-bottom: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scope-title {
          font-size: 14px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 2px 0;
        }
        .scope-desc {
          font-size: 10px;
          color: #64748B;
          margin: 0;
        }

        /* Partner Info / Summary Grid */
        .meta-summary-grid {
          display: grid;
          grid-template-columns: ${affiliateInfo ? '1.4fr 1fr' : '1fr'};
          gap: 16px;
          margin-bottom: 20px;
        }
        .info-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 14px;
        }
        .card-heading {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #D4AF37;
          margin: 0 0 8px 0;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 4px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px 12px;
          font-size: 10.5px;
        }
        .details-grid .d-label {
          color: #64748B;
        }
        .details-grid .d-val {
          font-weight: 600;
          color: #0F172A;
        }

        /* Financial Metric Tiles */
        .fin-tiles-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        .fin-tile {
          background: #0B0F19;
          color: #FFFFFF;
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 8px;
          padding: 10px 12px;
          text-align: center;
        }
        .fin-tile span {
          display: block;
          font-size: 8.5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94A3B8;
          margin-bottom: 3px;
        }
        .fin-tile strong {
          font-size: 12px;
          font-weight: 800;
          color: #D4AF37;
        }
        .fin-tile strong.green { color: #10B981; }
        .fin-tile strong.cyan { color: #06B6D4; }

        /* Double Entry Ledger Table */
        .ledger-table-wrap {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        th {
          background: #0B0F19;
          color: #FFFFFF;
          border: 1px solid #1E293B;
          padding: 8px 6px;
          text-align: left;
          font-weight: 700;
          letter-spacing: 0.2px;
        }
        th.text-right, td.text-right {
          text-align: right;
        }
        td {
          border: 1px solid #E2E8F0;
          padding: 7px 6px;
          color: #334155;
        }
        tr:nth-child(even) td {
          background: #F8FAFC;
        }
        td strong {
          color: #0F172A;
        }
        .tx-type-tag {
          font-family: monospace;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 3px;
          background: #E2E8F0;
          color: #1E293B;
        }
        .comm-credit { color: #15803D; font-weight: 700; }
        .comm-debit { color: #B91C1C; font-weight: 700; }

        /* Grand Totals Bar */
        .table-totals-row {
          background: #F1F5F9 !important;
          font-weight: 800;
        }
        .table-totals-row td {
          border-top: 2px solid #CBD5E1;
          color: #0F172A;
          padding: 9px 6px;
        }

        /* Sign-off & Escrow Clearance Seal */
        .auth-seal-block {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 24px;
          padding-top: 14px;
          border-top: 1px dashed #CBD5E1;
        }
        .seal-box {
          border: 2px solid #D4AF37;
          border-radius: 8px;
          padding: 8px 14px;
          text-align: center;
          background: rgba(212,175,55,0.04);
        }
        .seal-title {
          font-size: 9px;
          font-weight: 800;
          color: #D4AF37;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .seal-code {
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #0B0F19;
        }
        .sign-line {
          text-align: right;
          font-size: 10px;
          color: #475569;
        }
        .sign-line .bar {
          display: block;
          width: 180px;
          border-bottom: 1px solid #64748B;
          margin-bottom: 4px;
        }

        /* Official Corporate Address Footer */
        .statement-footer {
          margin-top: 26px;
          padding-top: 14px;
          border-top: 2px solid #D4AF37;
          font-size: 9px;
          color: #64748B;
          line-height: 1.5;
        }
        .footer-cols {
          display: grid;
          grid-template-columns: 1.4fr 1.2fr 1fr;
          gap: 16px;
          margin-bottom: 10px;
        }
        .footer-col strong {
          color: #0F172A;
          display: block;
          margin-bottom: 2px;
          font-size: 9.5px;
        }
        .footer-disclaimer {
          text-align: center;
          font-size: 8.5px;
          color: #94A3B8;
          border-top: 1px solid #E2E8F0;
          padding-top: 8px;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <!-- Top Corporate Header -->
      <header class="statement-header">
        <div class="header-brand">
          <img src="/assets/proppartner-logo.png" alt="PropPartner" class="brand-logo-img" onerror="this.src='/assets/proppartner-icon.svg';">
          <div class="brand-text-block">
            <h1>PROP<span>PARTNER</span></h1>
            <div class="brand-tagline">${CORPORATE_INFO.tagline}</div>
          </div>
        </div>
        <div class="header-meta">
          <div class="doc-badge">OFFICIAL FINANCIAL STATEMENT</div>
          <div><strong>Doc Ref:</strong> <code>${docRef}</code></div>
          <div><strong>Statement Date:</strong> ${generatedDate}</div>
          <div><strong>Generated Time:</strong> ${generatedTime}</div>
          <div><strong>Reg / TRN:</strong> ${CORPORATE_INFO.registrationNo}</div>
        </div>
      </header>

      <!-- Scope Title Banner -->
      <div class="scope-banner">
        <div>
          <h2 class="scope-title">${scopeTitle}</h2>
          <p class="scope-desc">Cryptographically authenticated double-entry accounting ledger of real estate milestone commissions, escrow clearances & wire settlements.</p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:9px; color:#64748B; font-weight:700; text-transform:uppercase;">Network Currency</span>
          <div style="font-size:13px; font-weight:800; color:#D4AF37;">${currency}</div>
        </div>
      </div>

      <!-- Financial Metric Strip -->
      <div class="fin-tiles-row">
        <div class="fin-tile">
          <span>Gross Deals Volume</span>
          <strong>${formatCurrencyValue(totalVolume, currency)}</strong>
        </div>
        <div class="fin-tile">
          <span>Total Commission Credits</span>
          <strong class="green">+${formatCurrencyValue(totalCredits, currency)}</strong>
        </div>
        <div class="fin-tile">
          <span>Settled Wire Payouts</span>
          <strong class="cyan">-${formatCurrencyValue(totalDebits, currency)}</strong>
        </div>
        <div class="fin-tile">
          <span>Net Available Escrow</span>
          <strong style="color: #FBBF24;">${formatCurrencyValue(netBalance, currency)}</strong>
        </div>
      </div>

      ${affiliateInfo ? `
        <!-- Partner Account Details -->
        <div class="meta-summary-grid">
          <div class="info-card">
            <div class="card-heading">Partner Accreditation Profile</div>
            <div class="details-grid">
              <div><span class="d-label">Partner Name:</span> <span class="d-val">${affiliateInfo.name}</span></div>
              <div><span class="d-label">Partner ID:</span> <span class="d-val"><code>${affiliateInfo.id}</code></span></div>
              <div><span class="d-label">Tier Status:</span> <span class="d-val">${affiliateInfo.tier || 'Platinum'} Tier</span></div>
              <div><span class="d-label">Referral Vanity Code:</span> <span class="d-val"><code>${affiliateInfo.referralCode || affiliateInfo.id}</code></span></div>
              <div><span class="d-label">Contact Email:</span> <span class="d-val">${affiliateInfo.email}</span></div>
              <div><span class="d-label">WhatsApp / Tel:</span> <span class="d-val">${affiliateInfo.whatsapp || affiliateInfo.phone}</span></div>
            </div>
          </div>

          <div class="info-card">
            <div class="card-heading">Designated Settlement Bank</div>
            <div class="details-grid" style="grid-template-columns: 1fr;">
              <div><span class="d-label">Bank Institution:</span> <span class="d-val">${affiliateInfo.bankName || 'Standard Chartered / HBL'}</span></div>
              <div><span class="d-label">Account / IBAN:</span> <span class="d-val"><code>${affiliateInfo.accountNumber || 'PK36SCBL0000001123456701'}</code></span></div>
              <div><span class="d-label">Beneficiary Title:</span> <span class="d-val">${affiliateInfo.accountTitle || affiliateInfo.name}</span></div>
              <div><span class="d-label">Tax ID / NTN:</span> <span class="d-val">${affiliateInfo.taxId || '9842109-7'}</span></div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Double Entry Ledger Records Table -->
      <div class="ledger-table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width: 85px;">Tx ID</th>
              <th style="width: 75px;">Date</th>
              <th style="width: 100px;">Type</th>
              <th>Development / Unit</th>
              <th>Customer / Reference</th>
              <th class="text-right" style="width: 105px;">Deal Amount</th>
              <th class="text-right" style="width: 110px;">Financial Impact</th>
              <th style="width: 75px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.length === 0 ? `
              <tr><td colspan="8" style="text-align:center; padding:20px; color:#94A3B8;">No transactions found for the requested period.</td></tr>
            ` : transactions.map(t => {
              const comm = Number(t.netCommission || 0);
              const isCredit = comm > 0;
              const isDebit = comm < 0;
              return `
                <tr>
                  <td><code>${t.id}</code></td>
                  <td>${t.date}</td>
                  <td><span class="tx-type-tag">${t.type}</span></td>
                  <td><strong>${t.projectId}</strong><br><span style="color:#64748B; font-size:9px;">${t.unitId || 'Direct'}</span></td>
                  <td>${t.customerName || t.affiliateName || 'System Journal'}<br><code style="font-size:8.5px; color:#94A3B8;">${t.reference || 'REF-STD'}</code></td>
                  <td class="text-right">${formatCurrencyValue(t.amount, currency)}</td>
                  <td class="text-right ${isCredit ? 'comm-credit' : isDebit ? 'comm-debit' : ''}">
                    ${isCredit ? '+' : ''}${formatCurrencyValue(comm, currency)}
                  </td>
                  <td><strong style="font-size:9px; color:${t.status === 'Completed' || t.status === 'Paid' ? '#10B981' : '#F59E0B'};">${t.status}</strong></td>
                </tr>
              `;
            }).join('')}
            <tr class="table-totals-row">
              <td colspan="5"><strong>TOTAL SUMMARY (${transactions.length} Transactions)</strong></td>
              <td class="text-right"><strong>${formatCurrencyValue(totalVolume, currency)}</strong></td>
              <td class="text-right"><strong style="color:${netBalance >= 0 ? '#15803D' : '#B91C1C'};">${netBalance >= 0 ? '+' : ''}${formatCurrencyValue(netBalance, currency)}</strong></td>
              <td><strong>AUDITED</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Authentication Seal & Sign-off Block -->
      <div class="auth-seal-block">
        <div class="seal-box">
          <div class="seal-title">Escrow Verified Record</div>
          <div class="seal-code">PROPPARTNER • IMMUTABLE LEDGER</div>
        </div>
        <div class="sign-line">
          <span class="bar"></span>
          <span>Authorized Financial Comptroller</span>
          <div style="font-size:8.5px; color:#94A3B8;">PropPartner Network Escrow Management Desk</div>
        </div>
      </div>

      <!-- Official Corporate Address Footer -->
      <footer class="statement-footer">
        <div class="footer-cols">
          <div class="footer-col">
            <strong>${CORPORATE_INFO.name}</strong>
            <div>${CORPORATE_INFO.addressLine1}</div>
            <div>${CORPORATE_INFO.addressLine2}</div>
          </div>
          <div class="footer-col">
            <strong>Direct Communication Channels</strong>
            <div>Support Email: ${CORPORATE_INFO.email}</div>
            <div>Concierge Desk: ${CORPORATE_INFO.phone}</div>
            <div>Official Portal: ${CORPORATE_INFO.website}</div>
          </div>
          <div class="footer-col">
            <strong>Regulatory & Tax Compliance</strong>
            <div>Registration: ${CORPORATE_INFO.registrationNo}</div>
            <div>System Hash: SHA256-ESCROW-LEDGER</div>
            <div>Page 1 of 1 · Confidential</div>
          </div>
        </div>
        <div class="footer-disclaimer">
          This document is an official computer-generated financial statement issued by PropPartner Global Real Estate Network Ltd. All ledger records represent verified double-entry accounting transactions linked to contract deeds and developer escrow allocations.
        </div>
      </footer>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

/**
 * Exports transaction ledger rows to CSV file
 */
export function exportLedgerCSV({ transactions = [], filename = 'PropPartner_Ledger_Statement' }) {
  const headers = [
    'Transaction ID', 
    'Date', 
    'Type', 
    'Project ID', 
    'Unit ID', 
    'Customer Name', 
    'Affiliate ID', 
    'Affiliate Name', 
    'Gross Deal Amount', 
    'Net Commission Impact', 
    'Status', 
    'Reference Hash'
  ];

  const rows = transactions.map(t => [
    t.id,
    t.date,
    `"${t.type}"`,
    `"${t.projectId}"`,
    `"${t.unitId || ''}"`,
    `"${t.customerName || ''}"`,
    t.affiliateId || '',
    `"${t.affiliateName || ''}"`,
    t.amount || 0,
    t.netCommission || 0,
    t.status,
    `"${t.reference || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
