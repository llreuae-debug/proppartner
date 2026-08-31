// Inventory Manager - Super Admin Commercial Shops, Retail Units & Floor Plan ERP

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

export function renderInventoryManager(container, navigateTo) {
  let projectFilter = 'all';
  let statusFilter = 'all';
  let searchQuery = '';

  function render() {
    const curr = platformStore.currency;
    let units = platformStore.getInventory(projectFilter, statusFilter);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      units = units.filter(u => 
        (u.unitNumber && u.unitNumber.toLowerCase().includes(q)) ||
        (u.unitId && u.unitId.toLowerCase().includes(q)) ||
        (u.type && u.type.toLowerCase().includes(q)) ||
        (u.buyer && u.buyer.toLowerCase().includes(q)) ||
        (u.block && u.block.toLowerCase().includes(q))
      );
    }

    const availableCount = platformStore.inventory.filter(u => u.status === 'Available').length;
    const reservedCount = platformStore.inventory.filter(u => u.status === 'Reserved' || u.status === 'Booked').length;
    const soldCount = platformStore.inventory.filter(u => u.status === 'Sold').length;

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Commercial Shop & Unit Inventory Matrix</h2>
            <p class="module-subtitle">Manage commercial shops, anchor stores, wholesale pavilions, and corporate suites across Gatwala Commercial Hub & Dragon Souk</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-add-unit">
              <i data-lucide="plus-circle"></i> <span>Add New Unit / Shop</span>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-inventory">
              <i data-lucide="download"></i> <span>Export Inventory CSV</span>
            </button>
          </div>
        </div>

        <!-- Inventory KPI Bar -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div class="p-stat-box" style="padding: 12px;">
            <span style="font-size:0.75rem;">Total Inventory Units</span>
            <strong style="font-size:1.3rem;">${platformStore.inventory.length} Units</strong>
          </div>
          <div class="p-stat-box" style="padding: 12px;">
            <span style="font-size:0.75rem;">Available Units</span>
            <strong style="font-size:1.3rem;" class="text-green">${availableCount} Open</strong>
          </div>
          <div class="p-stat-box" style="padding: 12px;">
            <span style="font-size:0.75rem;">Reserved Pipeline</span>
            <strong style="font-size:1.3rem;" class="text-yellow">${reservedCount} Booked</strong>
          </div>
          <div class="p-stat-box" style="padding: 12px;">
            <span style="font-size:0.75rem;">Sold Units</span>
            <strong style="font-size:1.3rem;" class="text-gold">${soldCount} Closed</strong>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="module-filter-bar glass-card">
          <div class="filter-controls" style="width: 100%; display: flex; gap: 10px; flex-wrap: wrap;">
            <div class="search-input-wrap" style="flex: 1; min-width: 240px;">
              <i data-lucide="search"></i>
              <input type="text" id="inv-search" placeholder="Search by Unit #, Floor, Shop Type, Buyer..." value="${searchQuery}">
            </div>
            <select id="inv-proj-select" class="form-select-sm">
              <option value="all" ${projectFilter === 'all' ? 'selected' : ''}>All Developments</option>
              <option value="gatwala-commercial-hub" ${projectFilter === 'gatwala-commercial-hub' ? 'selected' : ''}>Gatwala Commercial Hub</option>
              <option value="dragon-souk-plaza" ${projectFilter === 'dragon-souk-plaza' ? 'selected' : ''}>Dragon Souk Market</option>
              <option value="luminary-towers" ${projectFilter === 'luminary-towers' ? 'selected' : ''}>The Luminary Towers</option>
              <option value="elysium-waterfront" ${projectFilter === 'elysium-waterfront' ? 'selected' : ''}>Elysium Waterfront</option>
            </select>
            <select id="inv-status-select" class="form-select-sm">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="available" ${statusFilter === 'available' ? 'selected' : ''}>Available Only</option>
              <option value="reserved" ${statusFilter === 'reserved' ? 'selected' : ''}>Reserved Only</option>
              <option value="sold" ${statusFilter === 'sold' ? 'selected' : ''}>Sold Only</option>
            </select>
          </div>
        </div>

        <!-- Inventory Table -->
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Unit Number</th>
                  <th>Project & Block</th>
                  <th>Floor & Space Type</th>
                  <th>Area / Size</th>
                  <th>List Price</th>
                  <th>Status</th>
                  <th>Assigned Buyer / Partner</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${units.length === 0 ? `
                  <tr><td colspan="8" class="text-center py-6 text-muted">No inventory units found matching criteria.</td></tr>
                ` : units.map(u => `
                  <tr>
                    <td>
                      <strong class="text-gold" style="font-size: 0.95rem;">${u.unitNumber || u.unitId}</strong>
                      <div class="text-xs text-muted"><code>${u.unitId}</code></div>
                    </td>
                    <td>
                      <strong>${u.projectId === 'gatwala-commercial-hub' ? 'Gatwala Commercial Hub' : u.projectId === 'dragon-souk-plaza' ? 'Dragon Souk Market' : u.projectId}</strong>
                      <div class="text-xs text-muted">${u.block || 'Main Wing'}</div>
                    </td>
                    <td>
                      <div>${u.type}</div>
                      <div class="text-xs text-muted">${u.floor}</div>
                    </td>
                    <td><strong>${u.size}</strong></td>
                    <td>
                      <strong class="text-green">${formatCurrencyValue(u.finalPrice || u.price, curr)}</strong>
                    </td>
                    <td>
                      <span class="status-pill status-${(u.status || 'available').toLowerCase()}">
                        ${u.status}
                      </span>
                    </td>
                    <td>
                      ${u.buyer ? `
                        <div><strong>${u.buyer}</strong></div>
                        <div class="text-xs text-muted">Partner: <code>${u.affiliateId || 'Direct'}</code></div>
                      ` : `
                        <span class="text-muted text-xs">Unassigned</span>
                      `}
                    </td>
                    <td style="text-align: right;">
                      <div class="action-btn-group" style="justify-content: flex-end;">
                        ${u.status === 'Available' ? `
                          <button type="button" class="btn btn-secondary btn-xs" data-action="reserve" data-id="${u.unitId}">
                            Reserve
                          </button>
                          <button type="button" class="btn btn-gold btn-xs" data-action="sell" data-id="${u.unitId}">
                            Sell Deal
                          </button>
                        ` : u.status === 'Reserved' ? `
                          <button type="button" class="btn btn-gold btn-xs" data-action="sell" data-id="${u.unitId}">
                            Complete Sale
                          </button>
                          <button type="button" class="btn btn-secondary btn-xs" data-action="make-available" data-id="${u.unitId}">
                            Release
                          </button>
                        ` : `
                          <span class="text-xs text-muted" style="padding: 4px 8px;">Closed Deed</span>
                        `}
                        <button type="button" class="btn-icon" data-action="edit" data-id="${u.unitId}" title="Edit Unit Specifications">
                          <i data-lucide="edit-3"></i>
                        </button>
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

    // Event listeners
    container.querySelector('#inv-search').oninput = (e) => {
      searchQuery = e.target.value;
      render();
    };

    container.querySelector('#inv-proj-select').onchange = (e) => {
      projectFilter = e.target.value;
      render();
    };

    container.querySelector('#inv-status-select').onchange = (e) => {
      statusFilter = e.target.value;
      render();
    };

    container.querySelector('#btn-add-unit').onclick = () => {
      showAddUnitModal(() => render());
    };

    container.querySelector('#btn-export-inventory').onclick = () => {
      exportInventoryCSV();
    };

    // Table button actions
    container.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      btn.onclick = () => {
        if (action === 'reserve') {
          showReserveUnitModal(id, () => render());
        } else if (action === 'sell') {
          showSellUnitModal(id, () => render());
        } else if (action === 'make-available') {
          if (confirm(`Release reservation for unit ${id} back to Available inventory?`)) {
            platformStore.updateInventoryUnit(id, { status: 'Available', buyer: null, affiliateId: null });
            render();
          }
        } else if (action === 'edit') {
          showEditUnitModal(id, () => render());
        }
      };
    });
  }

  render();
}

/**
 * Modal: Add New Unit / Shop
 */
function showAddUnitModal(onRefresh) {
  let modal = document.getElementById('admin-inv-add-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-inv-add-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 600px;">
      <button type="button" class="auth-modal-close" id="add-unit-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="section-eyebrow"><i data-lucide="plus-circle"></i> ERP INVENTORY PROVISIONING</div>
        <h3 class="auth-modal-title">Add Commercial Shop / Unit</h3>
        <p class="auth-modal-subtitle">Add a commercial inventory unit to Gatwala Commercial Hub or Dragon Souk</p>
      </div>

      <form id="admin-add-unit-form" class="auth-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Project Development</label>
            <select id="new-unit-proj" class="form-input" required>
              <option value="gatwala-commercial-hub">Gatwala Commercial Hub</option>
              <option value="dragon-souk-plaza">Dragon Souk Commercial Market</option>
              <option value="luminary-towers">The Luminary Sky Residences</option>
              <option value="elysium-waterfront">Elysium Waterfront Villas</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Unit Number / Shop Tag</label>
            <input type="text" id="new-unit-num" class="form-input" placeholder="e.g. G-24 or Shop 108" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Block / Promenade Wing</label>
            <input type="text" id="new-unit-block" class="form-input" placeholder="e.g. Ground Floor Main Promenade" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Floor Level</label>
            <input type="text" id="new-unit-floor" class="form-input" placeholder="e.g. Ground Floor, 1st Floor" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Space Type</label>
            <input type="text" id="new-unit-type" class="form-input" placeholder="e.g. Flagship Retail Shop, Food Court Unit" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Size / Covered Area</label>
            <input type="text" id="new-unit-size" class="form-input" placeholder="e.g. 550 sq.ft" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">List Price (PKR)</label>
            <input type="number" id="new-unit-price" class="form-input" placeholder="18500000" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Initial Status</label>
            <select id="new-unit-status" class="form-input">
              <option value="Available" selected>Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="add-unit-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Save & Publish Unit</button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#add-unit-close').onclick = close;
  modal.querySelector('#add-unit-cancel').onclick = close;

  modal.querySelector('#admin-add-unit-form').onsubmit = (e) => {
    e.preventDefault();
    const projectId = modal.querySelector('#new-unit-proj').value;
    const unitNumber = modal.querySelector('#new-unit-num').value;
    const block = modal.querySelector('#new-unit-block').value;
    const floor = modal.querySelector('#new-unit-floor').value;
    const type = modal.querySelector('#new-unit-type').value;
    const size = modal.querySelector('#new-unit-size').value;
    const price = Number(modal.querySelector('#new-unit-price').value);
    const status = modal.querySelector('#new-unit-status').value;

    const unitId = `UNT-${projectId.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    platformStore.addInventoryUnit({
      unitId,
      projectId,
      unitNumber,
      block,
      floor,
      type,
      size,
      price,
      status
    });

    alert(`✅ Unit ${unitNumber} added to ${projectId} inventory.`);
    close();
    onRefresh();
  };
}

/**
 * Modal: Reserve Unit
 */
function showReserveUnitModal(unitId, onRefresh) {
  const unit = platformStore.inventory.find(u => u.unitId === unitId);
  if (!unit) return;

  let modal = document.getElementById('admin-inv-reserve-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-inv-reserve-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 520px;">
      <button type="button" class="auth-modal-close" id="reserve-unit-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="badge-count yellow"><i data-lucide="bookmark"></i></div>
        <h3 class="auth-modal-title">Reserve Commercial Unit</h3>
        <p class="auth-modal-subtitle">Unit <strong>${unit.unitNumber}</strong> (${unit.projectId}) · Price: <strong>${formatCurrencyValue(unit.price)}</strong></p>
      </div>

      <form id="admin-reserve-unit-form" class="auth-form">
        <div class="form-group">
          <label class="form-label text-xs">Buyer / Investor Name</label>
          <input type="text" id="reserve-buyer-name" class="form-input" placeholder="e.g. M. Zubair Chaudhry" required>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Assigned Affiliate Partner</label>
          <select id="reserve-aff-select" class="form-input">
            <option value="">Direct House Deal (No Affiliate)</option>
            ${platformStore.affiliates.map(a => `
              <option value="${a.id}">${a.name} (${a.id})</option>
            `).join('')}
          </select>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="reserve-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Confirm Reservation</button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#reserve-unit-close').onclick = close;
  modal.querySelector('#reserve-cancel').onclick = close;

  modal.querySelector('#admin-reserve-unit-form').onsubmit = (e) => {
    e.preventDefault();
    const buyer = modal.querySelector('#reserve-buyer-name').value;
    const affId = modal.querySelector('#reserve-aff-select').value;

    const res = platformStore.reserveInventoryUnit(unitId, buyer, affId);
    if (!res.success) {
      alert(`⚠️ ${res.message}`);
      return;
    }

    alert(`✅ Unit ${unit.unitNumber} reserved for ${buyer}.`);
    close();
    onRefresh();
  };
}

/**
 * Modal: Sell Unit & Close Deal
 */
function showSellUnitModal(unitId, onRefresh) {
  const unit = platformStore.inventory.find(u => u.unitId === unitId);
  if (!unit) return;

  let modal = document.getElementById('admin-inv-sell-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-inv-sell-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 540px;">
      <button type="button" class="auth-modal-close" id="sell-unit-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="badge-count gold"><i data-lucide="check-check"></i></div>
        <h3 class="auth-modal-title">Close Commercial Property Deal</h3>
        <p class="auth-modal-subtitle">Unit <strong>${unit.unitNumber}</strong> · List Price: <strong>${formatCurrencyValue(unit.price)}</strong></p>
      </div>

      <form id="admin-sell-unit-form" class="auth-form">
        <div class="form-group">
          <label class="form-label text-xs">Investor / Buyer Legal Name</label>
          <input type="text" id="sell-buyer-name" class="form-input" value="${unit.buyer || ''}" placeholder="e.g. Ali Reza Merchant" required>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Agreed Sale Value (PKR)</label>
            <input type="number" id="sell-sale-price" class="form-input" value="${unit.finalPrice || unit.price}" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Attributed Partner</label>
            <select id="sell-aff-select" class="form-input">
              <option value="">Direct House Deal</option>
              ${platformStore.affiliates.map(a => `
                <option value="${a.id}" ${unit.affiliateId === a.id ? 'selected' : ''}>${a.name} (${a.id})</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="sell-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">
            <i data-lucide="award"></i> <span>Execute Closed Sale</span>
          </button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#sell-unit-close').onclick = close;
  modal.querySelector('#sell-cancel').onclick = close;

  modal.querySelector('#admin-sell-unit-form').onsubmit = (e) => {
    e.preventDefault();
    const buyer = modal.querySelector('#sell-buyer-name').value;
    const salePrice = Number(modal.querySelector('#sell-sale-price').value);
    const affId = modal.querySelector('#sell-aff-select').value;

    const res = platformStore.sellInventoryUnit(unitId, buyer, affId, salePrice);
    if (!res.success) {
      alert(`⚠️ ${res.message}`);
      return;
    }

    alert(`🎉 Sale completed successfully! Unit ${unit.unitNumber} marked as SOLD to ${buyer} for PKR ${salePrice.toLocaleString()}. Commission records and ledgers updated.`);
    close();
    onRefresh();
  };
}

/**
 * Modal: Edit Unit Details
 */
function showEditUnitModal(unitId, onRefresh) {
  const unit = platformStore.inventory.find(u => u.unitId === unitId);
  if (!unit) return;

  let modal = document.getElementById('admin-inv-edit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-inv-edit-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 560px;">
      <button type="button" class="auth-modal-close" id="edit-unit-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <h3 class="auth-modal-title">Edit Unit: ${unit.unitNumber}</h3>
        <p class="auth-modal-subtitle"><code>${unit.unitId}</code> · Project: <strong>${unit.projectId}</strong></p>
      </div>

      <form id="admin-edit-unit-form" class="auth-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Unit Number</label>
            <input type="text" id="edit-unit-num" class="form-input" value="${unit.unitNumber}" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Size / Area</label>
            <input type="text" id="edit-unit-size" class="form-input" value="${unit.size}" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Space Type</label>
            <input type="text" id="edit-unit-type" class="form-input" value="${unit.type}" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Floor Level</label>
            <input type="text" id="edit-unit-floor" class="form-input" value="${unit.floor}" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Price (PKR)</label>
            <input type="number" id="edit-unit-price" class="form-input" value="${unit.price}" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Status</label>
            <select id="edit-unit-status" class="form-input">
              <option value="Available" ${unit.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Reserved" ${unit.status === 'Reserved' ? 'selected' : ''}>Reserved</option>
              <option value="Sold" ${unit.status === 'Sold' ? 'selected' : ''}>Sold</option>
            </select>
          </div>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="edit-unit-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#edit-unit-close').onclick = close;
  modal.querySelector('#edit-unit-cancel').onclick = close;

  modal.querySelector('#admin-edit-unit-form').onsubmit = (e) => {
    e.preventDefault();
    const unitNumber = modal.querySelector('#edit-unit-num').value;
    const size = modal.querySelector('#edit-unit-size').value;
    const type = modal.querySelector('#edit-unit-type').value;
    const floor = modal.querySelector('#edit-unit-floor').value;
    const price = Number(modal.querySelector('#edit-unit-price').value);
    const status = modal.querySelector('#edit-unit-status').value;

    platformStore.updateInventoryUnit(unitId, {
      unitNumber,
      size,
      type,
      floor,
      price,
      finalPrice: price,
      status
    });

    alert('✅ Unit specifications updated.');
    close();
    onRefresh();
  };
}

/**
 * Export Inventory to CSV
 */
function exportInventoryCSV() {
  const headers = ['Unit ID', 'Unit Number', 'Project', 'Block', 'Floor', 'Type', 'Size', 'Price', 'Status', 'Buyer', 'Affiliate ID'];
  const rows = platformStore.inventory.map(u => [
    u.unitId,
    `"${u.unitNumber}"`,
    u.projectId,
    `"${u.block || ''}"`,
    `"${u.floor || ''}"`,
    `"${u.type || ''}"`,
    `"${u.size || ''}"`,
    u.finalPrice || u.price,
    u.status,
    `"${u.buyer || ''}"`,
    u.affiliateId || ''
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Gatwala_DragonSouk_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
