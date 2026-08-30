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
            <p class="module-subtitle">Complete project-wise inventory, public URL slugs, financial ledgers, commission tiers and channel operations</p>
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
            const publicSlug = p.slug || p.id;
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
                    <span>Slug: <code>/projects/${publicSlug}</code></span>
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

                  <div class="proj-actions-row" style="display:flex; gap:8px;">
                    <button type="button" class="btn btn-gold btn-sm w-full btn-open-project-erp" data-id="${p.id}">
                      <i data-lucide="book-open"></i> <span>Open ERP</span>
                    </button>
                    <a href="/projects/${publicSlug}" target="_blank" class="btn btn-secondary btn-sm" title="Preview Public Page">
                      <i data-lucide="external-link"></i>
                    </a>
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
    const projPayments = platformStore.payments.filter(pm => pm.projectId === proj.id);
    const projMarketing = platformStore.marketingAssets.filter(m => m.projectId === proj.id);
    const publicSlug = proj.slug || proj.id;
    const publicUrl = `https://proppartner.pro/projects/${publicSlug}`;

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="erp-top-header">
          <div class="erp-header-left">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-back-to-projects">
              <i data-lucide="arrow-left"></i> <span>All Developments</span>
            </button>
            <div>
              <div class="project-eyebrow"><i data-lucide="building-2"></i> ${proj.type} • <code>${proj.id}</code></div>
              <h2 class="module-title">${proj.name}</h2>
              <p class="module-subtitle">${proj.location}, ${proj.city}, ${proj.country} • Developer: <strong>${proj.developer}</strong></p>
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
          <button type="button" class="erp-tab ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview"><i data-lucide="info"></i> Overview & Slug</button>
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
                  <h4 class="card-sec-title">Project Specifications & Public URL Routing</h4>
                  <div class="details-list">
                    <div class="d-row"><span>Public URL Slug</span> <code>${publicSlug}</code></div>
                    <div class="d-row"><span>Canonical Production URL</span> <a href="/projects/${publicSlug}" target="_blank" class="accent-gold">${publicUrl}</a></div>
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
                  <h4 class="card-sec-title">Project Description & Routing Controls</h4>
                  <p class="proj-long-desc">${proj.description}</p>
                  
                  <div style="background: rgba(212,175,55,0.06); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
                    <strong style="color: #FFFFFF; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
                      <i data-lucide="globe" style="width: 15px; height: 15px; color: var(--gold-light);"></i> Public Routing Status: Active
                    </strong>
                    <p style="font-size: 0.8rem; color: #94A3B8; margin-top: 4px;">
                      Direct hits and affiliate referral scans (<code>/projects/${publicSlug}?ref=...</code>) are routed to this live page without requiring login.
                    </p>
                  </div>

                  <div class="overview-actions-row" style="display:flex; gap:10px; flex-wrap:wrap;">
                    <a href="/projects/${publicSlug}" target="_blank" class="btn btn-gold btn-sm" id="btn-preview-public-proj">
                      <i data-lucide="external-link"></i> Preview Public Page
                    </a>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-project"><i data-lucide="edit"></i> Edit Project & Slug</button>
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
              </div>
            </div>
          ` : activeTab === 'ledger' ? `
            <div class="tab-pane-ledger">
              <div class="table-card glass-card">
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

    const editBtn = container.querySelector('#btn-edit-project');
    if (editBtn) editBtn.onclick = () => showEditProjectModal(proj);

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

  function showEditProjectModal(proj) {
    let modal = document.getElementById('admin-edit-proj-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-edit-proj-modal';
      modal.className = 'auth-modal-backdrop active';
      document.body.appendChild(modal);
    } else {
      modal.classList.add('active');
    }

    modal.innerHTML = `
      <div class="auth-modal-dialog glass-card" style="max-width: 600px;">
        <button type="button" class="auth-modal-close" id="modal-edit-proj-close"><i data-lucide="x"></i></button>
        
        <div class="auth-modal-header">
          <div class="section-eyebrow"><i data-lucide="edit"></i> PROJECT SETTINGS</div>
          <h3 class="auth-modal-title">Edit ${proj.name}</h3>
        </div>

        <form id="form-edit-proj" style="display:flex; flex-direction:column; gap:14px; margin-top:16px;">
          <div class="form-group">
            <label class="form-label text-xs">Project Name</label>
            <input type="text" class="form-input" id="edit-proj-name" value="${proj.name}" required>
          </div>

          <div class="form-group">
            <label class="form-label text-xs">Developer</label>
            <input type="text" class="form-input" id="edit-proj-dev" value="${proj.developer}" required>
          </div>

          <div class="form-group">
            <label class="form-label text-xs">Public URL Slug (e.g. <code>luminary-towers</code>)</label>
            <input type="text" class="form-input" id="edit-proj-slug" value="${proj.slug || proj.id}" required style="font-family: var(--font-mono); color: var(--gold-light);">
            <span class="text-xs text-muted">Public URL: <code>https://proppartner.pro/projects/{slug}</code></span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label text-xs">Starting Price (PKR)</label>
              <input type="number" class="form-input" id="edit-proj-price" value="${proj.startingPrice}">
            </div>
            <div class="form-group">
              <label class="form-label text-xs">Base Commission Rate (%)</label>
              <input type="number" step="0.1" class="form-input" id="edit-proj-rate" value="${proj.commissionRate}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label text-xs">Status</label>
            <select class="form-input" id="edit-proj-status">
              <option value="Active" ${proj.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Under Construction" ${proj.status === 'Under Construction' ? 'selected' : ''}>Under Construction</option>
              <option value="Launching Soon" ${proj.status === 'Launching Soon' ? 'selected' : ''}>Launching Soon</option>
              <option value="Sold Out" ${proj.status === 'Sold Out' ? 'selected' : ''}>Sold Out</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label text-xs">Description</label>
            <textarea class="form-input" id="edit-proj-desc" rows="3">${proj.description}</textarea>
          </div>

          <div style="display:flex; gap:10px; margin-top:8px;">
            <button type="submit" class="btn btn-gold w-full">Save Changes</button>
            <button type="button" class="btn btn-secondary" id="btn-cancel-edit-proj">Cancel</button>
          </div>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const close = () => modal.classList.remove('active');
    modal.querySelector('#modal-edit-proj-close').onclick = close;
    modal.querySelector('#btn-cancel-edit-proj').onclick = close;

    modal.querySelector('#form-edit-proj').onsubmit = (e) => {
      e.preventDefault();
      const updates = {
        name: modal.querySelector('#edit-proj-name').value.trim(),
        developer: modal.querySelector('#edit-proj-dev').value.trim(),
        slug: modal.querySelector('#edit-proj-slug').value.trim(),
        startingPrice: Number(modal.querySelector('#edit-proj-price').value),
        commissionRate: Number(modal.querySelector('#edit-proj-rate').value),
        status: modal.querySelector('#edit-proj-status').value,
        description: modal.querySelector('#edit-proj-desc').value.trim()
      };

      const res = platformStore.updateProject(proj.id, updates);
      if (!res.success) {
        alert(`⚠️ ${res.message}`);
      } else {
        alert(`✅ Project "${updates.name}" updated successfully.`);
        close();
        renderProjectERP();
      }
    };
  }

  function showAddProjectModal() {
    const name = prompt('Enter New Project Name:');
    if (!name) return;
    const developer = prompt('Enter Developer Name:', 'Premier Developments');
    const slug = prompt('Enter Public URL Slug (e.g. ocean-villas):', name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const price = prompt('Starting Price in PKR:', '35000000');
    const rate = prompt('Base Commission Rate %:', '3.5');

    platformStore.addProject({
      name,
      developer,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
