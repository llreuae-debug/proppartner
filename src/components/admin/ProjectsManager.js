// Projects Manager - Super Admin Comprehensive Real Estate Project ERP & 12-Tab Ledger

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

export function renderProjectsManager(container, navigateTo, initialProjectId = null) {
  let selectedProjectId = initialProjectId || null;
  let activeTab = 'overview'; // 12 Tabs: 'overview', 'inventory', 'affiliates', 'leads', 'sales', 'commission', 'ledger', 'payments', 'documents', 'marketing', 'analytics', 'audit'

  function renderList() {
    const curr = platformStore.currency;
    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Real Estate Projects & Developments</h2>
            <p class="module-subtitle">Complete project-wise inventory, financial ledgers, commission tiers and channel operations</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-add-project-modal">
              <i data-lucide="plus-circle"></i> <span>Add New Project</span>
            </button>
          </div>
        </div>

        <div class="projects-admin-grid">
          ${platformStore.projects.map(p => {
            const stats = platformStore.getProjectStats(p.id);
            return `
              <div class="admin-project-card glass-card">
                <div class="proj-card-media" style="background-image: url('${p.image}');">
                  <div class="proj-card-badges">
                    <span class="status-pill status-${p.status.toLowerCase()}">${p.status}</span>
                    <span class="badge-comm-rate">${p.commissionRate}% Base Comm.</span>
                  </div>
                  <div class="proj-media-overlay">
                    <h3 class="proj-media-title">${p.name}</h3>
                    <p class="proj-media-loc"><i data-lucide="map-pin"></i> ${p.location}, ${p.city}</p>
                  </div>
                </div>

                <div class="proj-card-body">
                  <div class="proj-meta-row">
                    <span>Developer: <strong>${p.developer}</strong></span>
                    <span>Type: <strong>${p.type}</strong></span>
                  </div>

                  <div class="proj-kpis-3">
                    <div class="p-kpi">
                      <span>Starting Price</span>
                      <strong class="text-gold">${formatCurrencyValue(p.startingPrice, curr)}</strong>
                    </div>
                    <div class="p-kpi">
                      <span>Inventory</span>
                      <strong>${p.unitsAvailable} / ${p.unitsTotal}</strong>
                    </div>
                    <div class="p-kpi">
                      <span>Gross Sales</span>
                      <strong class="text-green">${formatCurrencyValue(stats.grossSales, curr)}</strong>
                    </div>
                  </div>

                  <div class="proj-actions-row">
                    <button type="button" class="btn btn-gold btn-sm w-full btn-open-project-erp" data-id="${p.id}">
                      <i data-lucide="book-open"></i> <span>Open Project Ledger & ERP</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach listeners
    container.querySelectorAll('.btn-open-project-erp').forEach(btn => {
      btn.onclick = () => {
        selectedProjectId = btn.dataset.id;
        activeTab = 'overview';
        renderProjectERP();
      };
    });

    const addBtn = container.querySelector('#btn-add-project-modal');
    if (addBtn) addBtn.onclick = () => showAddProjectModal();
  }

  function renderProjectERP() {
    const proj = platformStore.projects.find(p => p.id === selectedProjectId);
    if (!proj) {
      renderList();
      return;
    }
    const curr = platformStore.currency;
    const stats = platformStore.getProjectStats(proj.id);
    const projInventory = platformStore.inventory.filter(u => u.projectId === proj.id);
    const projLeads = platformStore.leads.filter(l => l.projectId === proj.id);
    const projSales = platformStore.sales.filter(s => s.projectId === proj.id);
    const projLedger = platformStore.ledger.filter(tx => tx.projectId === proj.id);
    const projPayments = platformStore.payments.filter(pay => pay.projectId === proj.id);
    const projMarketing = platformStore.marketing.filter(m => m.projectId === proj.id);

    container.innerHTML = `
      <div class="admin-module-view project-erp-view">
        <!-- ERP Breadcrumb & Header -->
        <div class="erp-top-bar">
          <button type="button" class="btn-text-link" id="btn-back-to-projects">
            <i data-lucide="arrow-left"></i> Back to All Projects
          </button>
          <div class="erp-status-badge">
            <span class="status-pill status-${proj.status.toLowerCase()}">${proj.status}</span>
            <span>Project ID: <code>${proj.id}</code></span>
          </div>
        </div>

        <div class="erp-header-card glass-card">
          <div class="erp-header-content">
            <img src="${proj.image}" alt="${proj.name}" class="erp-header-thumb">
            <div>
              <div class="erp-type-pill">${proj.type}</div>
              <h2 class="erp-title">${proj.name}</h2>
              <p class="erp-sub"><i data-lucide="map-pin"></i> ${proj.location}, ${proj.city}, ${proj.country} • Developer: <strong>${proj.developer}</strong></p>
            </div>
          </div>
          <div class="erp-header-stats">
            <div class="erp-stat-box">
              <span>Gross Sales</span>
              <strong class="text-green">${formatCurrencyValue(stats.grossSales, curr)}</strong>
            </div>
            <div class="erp-stat-box">
              <span>Commission Paid</span>
              <strong class="text-gold">${formatCurrencyValue(stats.commissionPaid, curr)}</strong>
            </div>
            <div class="erp-stat-box">
              <span>Available Units</span>
              <strong>${stats.availableUnits} / ${stats.totalUnits}</strong>
            </div>
          </div>
        </div>

        <!-- 12-Tab ERP Navigation -->
        <div class="erp-tabs-nav glass-card">
          <button type="button" class="erp-tab ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview"><i data-lucide="info"></i> Overview</button>
          <button type="button" class="erp-tab ${activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory"><i data-lucide="layers"></i> Inventory (${projInventory.length})</button>
          <button type="button" class="erp-tab ${activeTab === 'leads' ? 'active' : ''}" data-tab="leads"><i data-lucide="target"></i> Leads (${projLeads.length})</button>
          <button type="button" class="erp-tab ${activeTab === 'sales' ? 'active' : ''}" data-tab="sales"><i data-lucide="award"></i> Sales (${projSales.length})</button>
          <button type="button" class="erp-tab ${activeTab === 'commission' ? 'active' : ''}" data-tab="commission"><i data-lucide="percent"></i> Commission Rules</button>
          <button type="button" class="erp-tab ${activeTab === 'ledger' ? 'active' : ''}" data-tab="ledger"><i data-lucide="book-open"></i> Project Ledger (${projLedger.length})</button>
          <button type="button" class="erp-tab ${activeTab === 'payments' ? 'active' : ''}" data-tab="payments"><i data-lucide="wallet"></i> Payments (${projPayments.length})</button>
          <button type="button" class="erp-tab ${activeTab === 'marketing' ? 'active' : ''}" data-tab="marketing"><i data-lucide="folder"></i> Marketing (${projMarketing.length})</button>
          <button type="button" class="erp-tab ${activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics"><i data-lucide="bar-chart-2"></i> Analytics</button>
        </div>

        <!-- Tab Content Body -->
        <div class="erp-tab-content">
          ${activeTab === 'overview' ? `
            <div class="tab-pane-overview">
              <div class="overview-grid-2">
                <div class="glass-card overview-card">
                  <h4 class="card-sec-title">Project Specifications & Timeline</h4>
                  <div class="details-list">
                    <div class="d-row"><span>Developer</span> <strong>${proj.developer}</strong></div>
                    <div class="d-row"><span>Launch Date</span> <strong>${proj.launchDate}</strong></div>
                    <div class="d-row"><span>Handover Date</span> <strong>${proj.completionDate}</strong></div>
                    <div class="d-row"><span>Starting Price</span> <strong class="text-gold">${formatCurrencyValue(proj.startingPrice, curr)}</strong></div>
                    <div class="d-row"><span>Base Commission</span> <strong class="text-green">${proj.commissionRate}%</strong></div>
                    <div class="d-row"><span>Sales Desk Contact</span> <strong>${proj.contactPerson} (${proj.contactPhone})</strong></div>
                    <div class="d-row"><span>Project Website</span> <a href="${proj.website}" target="_blank" class="accent-gold">${proj.website}</a></div>
                  </div>
                </div>

                <div class="glass-card overview-card">
                  <h4 class="card-sec-title">Project Description</h4>
                  <p class="proj-long-desc">${proj.description}</p>
                  <div class="overview-actions-row">
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-project"><i data-lucide="edit"></i> Edit Project</button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-add-unit"><i data-lucide="plus"></i> Add Unit</button>
                  </div>
                </div>
              </div>
            </div>
          ` : activeTab === 'inventory' ? `
            <div class="tab-pane-inventory">
              <div class="table-card glass-card">
                <div class="table-card-header">
                  <h4>Unit Inventory Roster (${projInventory.length} Units)</h4>
                  <button type="button" class="btn btn-gold btn-sm" id="btn-add-inventory-unit"><i data-lucide="plus"></i> Add Unit</button>
                </div>
                <div class="table-responsive">
                  <table class="portal-table">
                    <thead>
                      <tr>
                        <th>Unit ID</th>
                        <th>Block / Floor</th>
                        <th>Type & Size</th>
                        <th>Base Price</th>
                        <th>Discount</th>
                        <th>Final Price</th>
                        <th>Status</th>
                        <th>Buyer / Affiliate</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${projInventory.map(u => `
                        <tr>
                          <td><code>${u.unitId}</code></td>
                          <td>${u.block}<br><span class="text-muted">${u.floor}</span></td>
                          <td><strong>${u.type}</strong><br><span class="text-muted">${u.size}</span></td>
                          <td>${formatCurrencyValue(u.price, curr)}</td>
                          <td>${u.discount ? formatCurrencyValue(u.discount, curr) : '—'}</td>
                          <td><strong class="text-gold">${formatCurrencyValue(u.finalPrice, curr)}</strong></td>
                          <td><span class="status-pill status-${u.status.toLowerCase()}">${u.status}</span></td>
                          <td>${u.buyer ? `<strong>${u.buyer}</strong><br><span class="text-muted">${u.affiliateId || 'Direct'}</span>` : '<span class="text-muted">Unallocated</span>'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ` : activeTab === 'commission' ? `
            <div class="tab-pane-commission">
              <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                <div class="comm-config-header">
                  <div>
                    <h3 class="card-sec-title">Project Commission Tier Architecture</h3>
                    <p class="text-muted">Set progressive milestone commission rates for this development.</p>
                  </div>
                  <button type="button" class="btn btn-gold btn-sm" id="btn-save-comm-rules">Save Rules</button>
                </div>

                <div class="commission-tiers-table">
                  <table class="portal-table">
                    <thead>
                      <tr>
                        <th>Sales Milestone Tier</th>
                        <th>Qualifying Sales Count</th>
                        <th>Effective Commission Rate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(proj.commissionTiers || []).map((t, idx) => `
                        <tr>
                          <td><strong>Tier ${idx + 1}</strong></td>
                          <td>${t.minSales} – ${t.maxSales >= 999 ? 'Unlimited' : t.maxSales} Closed Deals</td>
                          <td><strong class="text-gold" style="font-size: 1.1rem;">${t.rate}%</strong></td>
                          <td><span class="status-pill status-approved">Active</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

                <div class="comm-impact-warning" style="margin-top: 20px;">
                  <i data-lucide="alert-circle" class="accent-gold"></i>
                  <span><strong>Audit Policy Notice:</strong> Modifying project commission rates applies exclusively to subsequent new transactions. Existing approved commissions remain strictly immutable.</span>
                </div>
              </div>
            </div>
          ` : activeTab === 'ledger' ? `
            <div class="tab-pane-ledger">
              <div class="table-card glass-card">
                <div class="table-card-header">
                  <h4>Project Financial & Referral Ledger</h4>
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-add-proj-adjustment"><i data-lucide="plus-circle"></i> Add Adjustment</button>
                </div>
                <div class="table-responsive">
                  <table class="portal-table">
                    <thead>
                      <tr>
                        <th>Tx ID</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Unit / Customer</th>
                        <th>Affiliate</th>
                        <th>Tx Amount</th>
                        <th>Commission</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${projLedger.map(tx => `
                        <tr>
                          <td><code>${tx.id}</code></td>
                          <td>${tx.date}</td>
                          <td><span class="tx-type-pill tx-${tx.type.toLowerCase()}">${tx.type}</span></td>
                          <td>${tx.customerName}<br><span class="text-muted">${tx.unitId}</span></td>
                          <td><span class="badge-tier">${tx.affiliateName || tx.affiliateId}</span></td>
                          <td><strong>${formatCurrencyValue(tx.amount, curr)}</strong></td>
                          <td class="${tx.netCommission >= 0 ? 'text-gold' : 'text-green'}">
                            ${tx.netCommission !== 0 ? formatCurrencyValue(tx.netCommission, curr) : '—'}
                          </td>
                          <td><span class="status-pill status-${tx.status.toLowerCase()}">${tx.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ` : `
            <div class="glass-card" style="padding: 30px;">
              <h4 class="card-sec-title">Project Data & Records</h4>
              <p class="text-muted">Viewing active live records for ${proj.name}.</p>
            </div>
          `}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Tab switcher
    container.querySelectorAll('.erp-tab').forEach(t => {
      t.onclick = () => {
        activeTab = t.dataset.tab;
        renderProjectERP();
      };
    });

    const backBtn = container.querySelector('#btn-back-to-projects');
    if (backBtn) backBtn.onclick = () => renderList();

    const addUnitBtn = container.querySelector('#btn-add-inventory-unit') || container.querySelector('#btn-add-unit');
    if (addUnitBtn) {
      addUnitBtn.onclick = () => {
        const unitNum = prompt('Enter Unit Number (e.g. A-1402):');
        if (unitNum) {
          platformStore.addInventoryUnit({
            projectId: proj.id,
            unitNumber: unitNum,
            type: 'Luxury Suite',
            price: proj.startingPrice,
            block: 'Main Tower'
          });
          renderProjectERP();
        }
      };
    }
  }

  function showAddProjectModal() {
    const name = prompt('Enter New Project Name:');
    if (!name) return;
    const developer = prompt('Enter Developer Name:', 'Premier Developments');
    const price = prompt('Starting Price in PKR:', '35000000');
    const rate = prompt('Base Commission Rate %:', '3.5');

    platformStore.addProject({
      name,
      developer,
      startingPrice: Number(price) || 35000000,
      commissionRate: Number(rate) || 3.5,
      type: 'Luxury Residential'
    });

    renderList();
  }

  if (selectedProjectId) {
    renderProjectERP();
  } else {
    renderList();
  }
}
