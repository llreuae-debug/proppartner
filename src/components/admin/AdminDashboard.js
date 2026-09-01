// Admin Dashboard - Super Admin Executive ERP BI Metrics & Commercial Ecosystem Center

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let activeCharts = [];

export function renderAdminDashboard(container, navigateTo) {
  const erp = platformStore.getERPOverviewMetrics();
  const curr = platformStore.currency;
  const recentSales = platformStore.sales.slice(0, 5);
  const pendingComms = platformStore.commissions.filter(c => ['Pending', 'Approved', 'Payable'].includes(c.status)).slice(0, 5);
  const inventorySummary = platformStore.inventory.slice(0, 6);

  // Clean existing charts
  activeCharts.forEach(c => c.destroy());
  activeCharts = [];

  container.innerHTML = `
    <div class="admin-dashboard-view">
      <!-- Ecosystem Banner -->
      <div class="admin-banner-alert" style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(8, 11, 17, 0.9)); border: 1px solid rgba(212, 175, 55, 0.3); margin-bottom: 20px;">
        <div class="banner-left">
          <i data-lucide="building-2" style="color: #D4AF37;"></i>
          <div>
            <strong style="color: #D4AF37; font-size: 1rem;">Gatwala Commercial Hub & Dragon Souk Trade Corridor</strong>
            <p style="margin: 2px 0 0 0; color: #CBD5E1; font-size: 0.82rem;">Super Admin Real Estate ERP · Commercial Shops, Wholesale Pavilions & Corporate Suites Management</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-sm btn-gold" id="btn-quick-inventory">
            <i data-lucide="layout-grid"></i> <span>Manage Inventory</span>
          </button>
          <button type="button" class="btn btn-sm btn-secondary" id="btn-quick-add-partner">
            <i data-lucide="user-plus"></i> <span>Add Partner</span>
          </button>
        </div>
      </div>

      <!-- Real Database ERP KPI Cards Grid -->
      <div class="admin-kpi-grid">
        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">COMMERCIAL INVENTORY</span>
            <div class="kpi-badge"><i data-lucide="layout-grid"></i></div>
          </div>
          <div class="kpi-number">${erp.totalInventory} Units</div>
          <div class="kpi-footer green">
            <i data-lucide="check-circle-2"></i>
            <span>${erp.availableUnits} Available · ${erp.reservedUnits} Reserved · ${erp.soldUnits} Sold</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">ACTIVE PROJECTS</span>
            <div class="kpi-badge cyan"><i data-lucide="building"></i></div>
          </div>
          <div class="kpi-number">${erp.totalProjects}</div>
          <div class="kpi-footer cyan">
            <span>Gatwala Hub, Dragon Souk & High-Rises</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">PARTNER NETWORK</span>
            <div class="kpi-badge purple"><i data-lucide="users"></i></div>
          </div>
          <div class="kpi-number">${erp.totalPartners}</div>
          <div class="kpi-footer purple">
            <span>${erp.activePartners} Active Wealth Advisors & Brokers</span>
          </div>
        </div>

        <div class="kpi-card glass-card highlight-gold">
          <div class="kpi-header">
            <span class="kpi-title">TRANSACTED SALES VOLUME</span>
            <div class="kpi-badge gold"><i data-lucide="landmark"></i></div>
          </div>
          <div class="kpi-number gold-text">${formatCurrencyValue(erp.totalSalesValue, curr)}</div>
          <div class="kpi-footer">
            <span>Total Verified Closed Sales Value</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">PENDING COMMISSIONS</span>
            <div class="kpi-badge yellow"><i data-lucide="clock"></i></div>
          </div>
          <div class="kpi-number text-yellow">${formatCurrencyValue(erp.pendingCommissions, curr)}</div>
          <div class="kpi-footer yellow">
            <span>Milestone Escrow Pending Approval</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">PAID COMMISSIONS</span>
            <div class="kpi-badge green"><i data-lucide="check-check"></i></div>
          </div>
          <div class="kpi-number text-green">${formatCurrencyValue(erp.paidCommissions, curr)}</div>
          <div class="kpi-footer green">
            <span>Disbursed via RTGS Bank Wires</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">ESCROW PAYMENTS</span>
            <div class="kpi-badge cyan"><i data-lucide="wallet"></i></div>
          </div>
          <div class="kpi-number text-cyan">${formatCurrencyValue(erp.paidPayments, curr)}</div>
          <div class="kpi-footer cyan">
            <span>Cleared Investor Token Deposits</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-title">RESERVED INVENTORY VALUE</span>
            <div class="kpi-badge gold"><i data-lucide="trending-up"></i></div>
          </div>
          <div class="kpi-number text-gold">${formatCurrencyValue(erp.totalInvestmentValue, curr)}</div>
          <div class="kpi-footer gold">
            <span>Active Pipeline Valuation</span>
          </div>
        </div>
      </div>

      <!-- Commercial Inventory Live Status & Charts Row -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <!-- Left: Commercial Inventory Quick Matrix -->
        <div class="glass-card" style="padding: 18px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 1.05rem; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="store" style="color: #D4AF37;"></i> Commercial Shops & Unit Inventory
            </h3>
            <button type="button" class="btn btn-secondary btn-xs" id="btn-view-all-inventory">
              View All (${platformStore.inventory.length}) →
            </button>
          </div>

          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Unit #</th>
                  <th>Project</th>
                  <th>Type & Size</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${inventorySummary.map(u => `
                  <tr>
                    <td><strong class="text-gold">${u.unitNumber || u.unitId}</strong></td>
                    <td class="text-xs text-muted">${u.projectId === 'gatwala-commercial-hub' ? 'Gatwala Hub' : u.projectId === 'dragon-souk-plaza' ? 'Dragon Souk' : u.projectId}</td>
                    <td><span class="text-xs">${u.type} (${u.size})</span></td>
                    <td><strong>${formatCurrencyValue(u.finalPrice || u.price, curr)}</strong></td>
                    <td>
                      <span class="status-pill status-${(u.status || 'available').toLowerCase()}">
                        ${u.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Real-time Sales & Performance Chart -->
        <div class="glass-card" style="padding: 18px; border-radius: 12px;">
          <h3 style="margin: 0 0 14px 0; font-size: 1.05rem; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="line-chart" style="color: #00F2FE;"></i> Commercial Sales Velocity & Commissions
          </h3>
          <div style="height: 220px; position: relative;">
            <canvas id="admin-erp-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Sales & Commission Approvals Row -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Recent Deals Closed -->
        <div class="glass-card" style="padding: 18px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 1.05rem; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="award" style="color: #10B981;"></i> Recent Closed Sales
            </h3>
            <button type="button" class="btn btn-secondary btn-xs" id="btn-view-all-sales">
              View All →
            </button>
          </div>
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Client</th>
                  <th>Unit</th>
                  <th>Sale Value</th>
                  <th>Partner</th>
                </tr>
              </thead>
              <tbody>
                ${recentSales.map(s => `
                  <tr>
                    <td><code>${s.id}</code></td>
                    <td><strong>${s.customerName}</strong></td>
                    <td>${s.unitNumber || s.unitId}</td>
                    <td><strong class="text-gold">${formatCurrencyValue(s.salePrice, curr)}</strong></td>
                    <td><span class="text-xs text-muted">${s.affiliateName || s.affiliateId}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pending Commission Authorizations -->
        <div class="glass-card" style="padding: 18px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 1.05rem; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="badge-percent" style="color: #F59E0B;"></i> Commission Authorizations
            </h3>
            <button type="button" class="btn btn-secondary btn-xs" id="btn-view-all-commissions">
              Manage Approvals →
            </button>
          </div>
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Comm ID</th>
                  <th>Partner</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${pendingComms.map(c => `
                  <tr>
                    <td><code>${c.id}</code></td>
                    <td><strong>${c.affiliateName}</strong></td>
                    <td><strong class="text-green">${formatCurrencyValue(c.netPayable, curr)}</strong></td>
                    <td><span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span></td>
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

  // Navigation handlers
  container.querySelector('#btn-quick-inventory')?.addEventListener('click', () => navigateTo('inventory'));
  container.querySelector('#btn-quick-add-partner')?.addEventListener('click', () => navigateTo('affiliates'));
  container.querySelector('#btn-view-all-inventory')?.addEventListener('click', () => navigateTo('inventory'));
  container.querySelector('#btn-view-all-sales')?.addEventListener('click', () => navigateTo('sales'));
  container.querySelector('#btn-view-all-commissions')?.addEventListener('click', () => navigateTo('commissions'));

  // Render Chart
  const ctx = container.querySelector('#admin-erp-chart');
  if (ctx) {
    const existing = Chart.getChart(ctx);
    if (existing) existing.destroy();
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales Volume (PKR M)',
            data: [35, 68, 125, 95, 140, 185],
            backgroundColor: 'rgba(212, 175, 55, 0.7)',
            borderColor: '#D4AF37',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Commission Paid (PKR M)',
            data: [1.2, 2.4, 4.8, 3.6, 5.2, 7.4],
            backgroundColor: 'rgba(0, 242, 254, 0.7)',
            borderColor: '#00F2FE',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94A3B8', font: { size: 11 } }
          }
        },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
    activeCharts.push(chart);
  }
}
