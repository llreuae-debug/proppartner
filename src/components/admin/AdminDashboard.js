// Admin Dashboard - Executive BI Metrics, Interactive Charts & Quick Actions

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let activeCharts = [];

export function renderAdminDashboard(container, navigateTo) {
  const stats = platformStore.getGlobalStats();
  const curr = platformStore.currency;
  const recentSales = platformStore.sales.slice(0, 5);
  const pendingComms = platformStore.commissions.filter(c => ['Pending', 'Approved', 'Payable'].includes(c.status)).slice(0, 5);
  const duplicateAlerts = platformStore.leads.filter(l => l.duplicateFlag);

  // Clean existing charts
  activeCharts.forEach(c => c.destroy());
  activeCharts = [];

  container.innerHTML = `
    <div class="admin-dashboard-view">
      <!-- Top Alert if Duplicate Leads exist -->
      ${duplicateAlerts.length > 0 ? `
        <div class="admin-banner-alert warning">
          <div class="banner-left">
            <i data-lucide="alert-triangle"></i>
            <div>
              <strong>Duplicate Lead Collision Alert (${duplicateAlerts.length} Pending Investigation)</strong>
              <p>Multiple affiliates submitted leads with matching contact details. Review attribution to avoid commission disputes.</p>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-gold" id="btn-goto-duplicates">
            <span>RESOLVE DUPLICATES</span>
          </button>
        </div>
      ` : ''}

      <!-- Top 10 Executive KPI Cards Grid -->
      <div class="admin-kpi-grid">
        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">TOTAL AFFILIATES</span>
            <div class="kpi-badge"><i data-lucide="users"></i></div>
          </div>
          <div class="kpi-number">${stats.totalAffiliates}</div>
          <div class="kpi-footer green">
            <i data-lucide="user-check"></i>
            <span>${stats.activeAffiliates} Active / Approved</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">ACTIVE PROJECTS</span>
            <div class="kpi-badge cyan"><i data-lucide="building"></i></div>
          </div>
          <div class="kpi-number">${stats.totalProjects}</div>
          <div class="kpi-footer cyan">
            <span>24+ Active Inventory Developments</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">TOTAL LEADS</span>
            <div class="kpi-badge purple"><i data-lucide="target"></i></div>
          </div>
          <div class="kpi-number">${stats.totalLeads}</div>
          <div class="kpi-footer purple">
            <span>${stats.qualifiedLeads} Qualified (${((stats.qualifiedLeads / (stats.totalLeads || 1)) * 100).toFixed(0)}% conversion)</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">VERIFIED SALES</span>
            <div class="kpi-badge gold"><i data-lucide="award"></i></div>
          </div>
          <div class="kpi-number">${stats.totalSales}</div>
          <div class="kpi-footer gold">
            <span>Closed Partner Transactions</span>
          </div>
        </div>

        <div class="kpi-card glass-card highlight-gold">
          <div class="kpi-header">
            <span class="kpi-title">GROSS SALES VOLUME</span>
            <div class="kpi-badge gold"><i data-lucide="landmark"></i></div>
          </div>
          <div class="kpi-number gold-text">${formatCurrencyValue(stats.grossSales, curr)}</div>
          <div class="kpi-footer">
            <span>Total Transacted Property Value</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">PENDING COMMISSION</span>
            <div class="kpi-badge yellow"><i data-lucide="clock"></i></div>
          </div>
          <div class="kpi-number text-yellow">${formatCurrencyValue(stats.pendingCommission, curr)}</div>
          <div class="kpi-footer">
            <span>Awaiting Admin Verification</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">APPROVED COMMISSION</span>
            <div class="kpi-badge cyan"><i data-lucide="check-circle"></i></div>
          </div>
          <div class="kpi-number text-cyan">${formatCurrencyValue(stats.approvedCommission, curr)}</div>
          <div class="kpi-footer">
            <span>Verified & In Processing</span>
          </div>
        </div>

        <div class="kpi-card glass-card highlight-cyan">
          <div class="kpi-header">
            <span class="kpi-title">PAYABLE COMMISSION</span>
            <div class="kpi-badge cyan"><i data-lucide="wallet"></i></div>
          </div>
          <div class="kpi-number text-cyan">${formatCurrencyValue(stats.payableCommission, curr)}</div>
          <div class="kpi-footer">
            <span>Ready for Immediate Disbursement</span>
          </div>
        </div>

        <div class="kpi-card glass-card highlight-green">
          <div class="kpi-header">
            <span class="kpi-title">TOTAL PAID COMMISSION</span>
            <div class="kpi-badge green"><i data-lucide="badge-check"></i></div>
          </div>
          <div class="kpi-number text-green">${formatCurrencyValue(stats.paidCommission, curr)}</div>
          <div class="kpi-footer green">
            <span>Successfully Disbursed</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">COMMISSION LIABILITY</span>
            <div class="kpi-badge"><i data-lucide="pie-chart"></i></div>
          </div>
          <div class="kpi-number">${formatCurrencyValue(stats.totalCommissionsLiability, curr)}</div>
          <div class="kpi-footer">
            <span>Cumulative Network Commissions</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="admin-quick-actions glass-card">
        <span class="qa-label"><i data-lucide="zap"></i> Quick Operations:</span>
        <div class="qa-buttons">
          <button type="button" class="btn btn-sm btn-gold" id="qa-add-project"><i data-lucide="plus-circle"></i> Add Project</button>
          <button type="button" class="btn btn-sm btn-secondary" id="qa-record-sale"><i data-lucide="shopping-bag"></i> Record Sale</button>
          <button type="button" class="btn btn-sm btn-secondary" id="qa-approve-comms"><i data-lucide="badge-percent"></i> Review Commissions</button>
          <button type="button" class="btn btn-sm btn-secondary" id="qa-disburse-pay"><i data-lucide="send"></i> Disburse Payout</button>
          <button type="button" class="btn btn-sm btn-secondary" id="qa-view-ledger"><i data-lucide="book-open"></i> Master Ledger</button>
        </div>
      </div>

      <!-- Charts Row 1: Sales & Commission Breakdown -->
      <div class="admin-charts-grid">
        <div class="chart-card glass-card">
          <div class="chart-card-header">
            <div>
              <h4 class="chart-title">Gross Sales Volume by Project</h4>
              <span class="chart-subtitle">Contribution across active residential & commercial developments</span>
            </div>
            <div class="chart-badge">LIVE BI</div>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="chart-sales-by-project"></canvas>
          </div>
        </div>

        <div class="chart-card glass-card">
          <div class="chart-card-header">
            <div>
              <h4 class="chart-title">Commission Status Distribution</h4>
              <span class="chart-subtitle">Pending, Approved, Payable vs Disbursed Payouts</span>
            </div>
            <div class="chart-badge">LEDGER AUDIT</div>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="chart-commission-dist"></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2: Lead Funnel & Monthly Trajectory -->
      <div class="admin-charts-grid">
        <div class="chart-card glass-card">
          <div class="chart-card-header">
            <div>
              <h4 class="chart-title">Affiliate Lead Conversion Funnel</h4>
              <span class="chart-subtitle">Progression from Ingestion to Final Closed Sale</span>
            </div>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="chart-lead-funnel"></canvas>
          </div>
        </div>

        <div class="chart-card glass-card">
          <div class="chart-card-header">
            <div>
              <h4 class="chart-title">Monthly Referral Velocity & Closed Sales</h4>
              <span class="chart-subtitle">Trailing 6-month growth trajectory</span>
            </div>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="chart-monthly-trend"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom Split: Recent Sales & Commission Queue -->
      <div class="admin-tables-split">
        <!-- Recent Sales -->
        <div class="split-card glass-card">
          <div class="split-card-header">
            <h4 class="table-card-title"><i data-lucide="award"></i> Recent Closed Transactions</h4>
            <button type="button" class="btn-text-link" id="view-all-sales">View All Sales →</button>
          </div>
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Customer</th>
                  <th>Project / Unit</th>
                  <th>Affiliate</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recentSales.map(s => `
                  <tr>
                    <td><code>${s.id}</code></td>
                    <td><strong>${s.customerName}</strong></td>
                    <td>${s.projectName}<br><span class="text-muted">${s.unitNumber}</span></td>
                    <td><span class="badge-tier">${s.affiliateName}</span></td>
                    <td><strong>${formatCurrencyValue(s.salePrice, curr)}</strong></td>
                    <td class="text-gold">${formatCurrencyValue(s.grossCommission, curr)} (${s.commissionRate}%)</td>
                    <td><span class="status-pill status-${s.status.toLowerCase()}">${s.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pending Commissions Queue -->
        <div class="split-card glass-card">
          <div class="split-card-header">
            <h4 class="table-card-title"><i data-lucide="clock"></i> Active Commission Queue</h4>
            <button type="button" class="btn-text-link" id="view-all-comms">Manage Commissions →</button>
          </div>
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Comm ID</th>
                  <th>Affiliate</th>
                  <th>Project</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${pendingComms.map(c => `
                  <tr>
                    <td><code>${c.id}</code></td>
                    <td><strong>${c.affiliateName}</strong></td>
                    <td>${c.projectName}</td>
                    <td class="text-gold"><strong>${formatCurrencyValue(c.netPayable, curr)}</strong></td>
                    <td><span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span></td>
                    <td>
                      ${c.status === 'Pending' ? `
                        <button type="button" class="btn btn-xs btn-gold btn-approve-comm" data-id="${c.id}">Approve</button>
                      ` : c.status === 'Approved' ? `
                        <button type="button" class="btn btn-xs btn-secondary btn-mark-payable" data-id="${c.id}">Mark Payable</button>
                      ` : `
                        <button type="button" class="btn btn-xs btn-gold btn-disburse-direct" data-id="${c.id}">Pay Now</button>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Initialize Interactive Chart.js charts
  setTimeout(() => {
    initDashboardCharts(stats);
  }, 50);

  // Hook navigation buttons
  const dupBtn = document.getElementById('btn-goto-duplicates');
  if (dupBtn) dupBtn.onclick = () => navigateTo('leads');

  const addProjBtn = document.getElementById('qa-add-project');
  if (addProjBtn) addProjBtn.onclick = () => navigateTo('projects', { action: 'add-project' });

  const recordSaleBtn = document.getElementById('qa-record-sale');
  if (recordSaleBtn) recordSaleBtn.onclick = () => navigateTo('sales', { action: 'add-sale' });

  const approveCommsBtn = document.getElementById('qa-approve-comms');
  if (approveCommsBtn) approveCommsBtn.onclick = () => navigateTo('commissions');

  const disbursePayBtn = document.getElementById('qa-disburse-pay');
  if (disbursePayBtn) disbursePayBtn.onclick = () => navigateTo('payments', { action: 'disburse' });

  const viewLedgerBtn = document.getElementById('qa-view-ledger');
  if (viewLedgerBtn) viewLedgerBtn.onclick = () => navigateTo('ledgers');

  const allSalesBtn = document.getElementById('view-all-sales');
  if (allSalesBtn) allSalesBtn.onclick = () => navigateTo('sales');

  const allCommsBtn = document.getElementById('view-all-comms');
  if (allCommsBtn) allCommsBtn.onclick = () => navigateTo('commissions');

  // Inline commission approval handlers
  container.querySelectorAll('.btn-approve-comm').forEach(btn => {
    btn.onclick = () => {
      platformStore.approveCommission(btn.dataset.id);
      renderAdminDashboard(container, navigateTo);
    };
  });
  container.querySelectorAll('.btn-mark-payable').forEach(btn => {
    btn.onclick = () => {
      platformStore.markCommissionPayable(btn.dataset.id);
      renderAdminDashboard(container, navigateTo);
    };
  });
  container.querySelectorAll('.btn-disburse-direct').forEach(btn => {
    btn.onclick = () => {
      navigateTo('payments', { action: 'disburse', commissionId: btn.dataset.id });
    };
  });
}

function initDashboardCharts(stats) {
  // Chart 1: Sales by Project
  const ctxSales = document.getElementById('chart-sales-by-project');
  if (ctxSales) {
    const projLabels = platformStore.projects.map(p => p.name.split(' ')[1] || p.name);
    const projSales = platformStore.projects.map(p => {
      return platformStore.sales
        .filter(s => s.projectId === p.id)
        .reduce((sum, s) => sum + (s.salePrice / 10000000), 0); // In Crores
    });

    const c1 = new Chart(ctxSales, {
      type: 'bar',
      data: {
        labels: projLabels,
        datasets: [{
          label: 'Sales Volume (PKR Crores)',
          data: projSales.length ? projSales : [13.4, 9.3, 7.7, 4.2, 0],
          backgroundColor: [
            'rgba(212, 175, 55, 0.8)',
            'rgba(0, 242, 254, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
    activeCharts.push(c1);
  }

  // Chart 2: Commission Distribution Doughnut
  const ctxComm = document.getElementById('chart-commission-dist');
  if (ctxComm) {
    const c2 = new Chart(ctxComm, {
      type: 'doughnut',
      data: {
        labels: ['Paid Commissions', 'Payable Commission', 'Approved Processing', 'Pending Review'],
        datasets: [{
          data: [
            stats.paidCommission || 8296500,
            stats.payableCommission || 1015000,
            stats.approvedCommission || 0,
            stats.pendingCommission || 1557500
          ],
          backgroundColor: [
            '#10B981',
            '#00F2FE',
            '#D4AF37',
            '#F59E0B'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#E2E8F0', font: { family: 'Inter', size: 12 }, boxWidth: 14 }
          }
        }
      }
    });
    activeCharts.push(c2);
  }

  // Chart 3: Lead Conversion Funnel
  const ctxFunnel = document.getElementById('chart-lead-funnel');
  if (ctxFunnel) {
    const leadCount = platformStore.leads.length || 50;
    const qualified = platformStore.leads.filter(l => ['Qualified', 'Site Visit', 'Negotiation', 'Booked', 'Converted'].includes(l.status)).length;
    const siteVisits = platformStore.leads.filter(l => ['Site Visit', 'Negotiation', 'Booked', 'Converted'].includes(l.status)).length;
    const bookings = platformStore.leads.filter(l => ['Booked', 'Converted'].includes(l.status)).length;
    const sales = platformStore.sales.length;

    const c3 = new Chart(ctxFunnel, {
      type: 'bar',
      data: {
        labels: ['Ingested Leads', 'Qualified Leads', 'Site Inspections', 'Bookings', 'Closed Sales'],
        datasets: [{
          data: [leadCount, qualified, siteVisits, bookings, sales],
          backgroundColor: 'rgba(0, 242, 254, 0.7)',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
    activeCharts.push(c3);
  }

  // Chart 4: Monthly Trend Line
  const ctxMonthly = document.getElementById('chart-monthly-trend');
  if (ctxMonthly) {
    const c4 = new Chart(ctxMonthly, {
      type: 'line',
      data: {
        labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [
          {
            label: 'Referrals Ingested',
            data: [12, 18, 26, 38, 48, 56],
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            tension: 0.35,
            fill: true
          },
          {
            label: 'Closed Sales',
            data: [1, 2, 4, 7, 11, 15],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#E2E8F0', boxWidth: 12 } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
    activeCharts.push(c4);
  }
}
