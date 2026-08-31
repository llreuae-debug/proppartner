// Investors Manager - Super Admin Commercial Real Estate Investors & Buyers CRM

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

export function renderInvestorsManager(container, navigateTo) {
  let searchQuery = '';

  function render() {
    const curr = platformStore.currency;
    let investors = platformStore.getInvestors();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      investors = investors.filter(i => 
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.company && i.company.toLowerCase().includes(q)) ||
        (i.email && i.email.toLowerCase().includes(q)) ||
        (i.phone && i.phone.includes(q)) ||
        (i.city && i.city.toLowerCase().includes(q)) ||
        (i.cnicOrPassport && i.cnicOrPassport.toLowerCase().includes(q))
      );
    }

    const totalPortfolio = investors.reduce((sum, i) => sum + Number(i.totalInvested || 0), 0);
    const totalUnitsCount = investors.reduce((sum, i) => sum + (i.unitsOwned ? i.unitsOwned.length : 0), 0);

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Investors & Commercial Buyers CRM</h2>
            <p class="module-subtitle">Manage high-net-worth commercial buyers, institutional funds, overseas expatriates, and investment portfolios</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-add-investor">
              <i data-lucide="user-plus"></i> <span>Register Investor</span>
            </button>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
          <div class="p-stat-box" style="padding: 14px;">
            <span style="font-size:0.75rem;">Registered Investors</span>
            <strong style="font-size:1.3rem;">${investors.length} Profiles</strong>
          </div>
          <div class="p-stat-box" style="padding: 14px;">
            <span style="font-size:0.75rem;">Total Portfolio Value</span>
            <strong style="font-size:1.3rem;" class="text-gold">${formatCurrencyValue(totalPortfolio, curr)}</strong>
          </div>
          <div class="p-stat-box" style="padding: 14px;">
            <span style="font-size:0.75rem;">Total Units Purchased</span>
            <strong style="font-size:1.3rem;" class="text-green">${totalUnitsCount} Units</strong>
          </div>
          <div class="p-stat-box" style="padding: 14px;">
            <span style="font-size:0.75rem;">KYC Compliance</span>
            <strong style="font-size:1.3rem;" class="text-cyan">100% Verified</strong>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="module-filter-bar glass-card">
          <div class="search-input-wrap" style="width: 100%;">
            <i data-lucide="search"></i>
            <input type="text" id="inv-crm-search" placeholder="Search by Investor Name, Company, Phone, CNIC / Passport, City..." value="${searchQuery}">
          </div>
        </div>

        <!-- Table -->
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Investor / Company</th>
                  <th>Contact Details</th>
                  <th>Location</th>
                  <th>CNIC / Passport</th>
                  <th>Portfolio Value</th>
                  <th>Units Owned</th>
                  <th>Assigned Partner</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${investors.length === 0 ? `
                  <tr><td colspan="8" class="text-center py-6 text-muted">No investor profiles found.</td></tr>
                ` : investors.map(i => `
                  <tr>
                    <td>
                      <strong style="font-size: 0.95rem;">${i.name}</strong>
                      <div class="text-xs text-muted">${i.company || 'Private Investor'}</div>
                    </td>
                    <td>
                      <div>${i.phone}</div>
                      <div class="text-xs text-muted">${i.email}</div>
                    </td>
                    <td>${i.city}</td>
                    <td><code>${i.cnicOrPassport || 'Verified KYC'}</code></td>
                    <td><strong class="text-gold">${formatCurrencyValue(i.totalInvested, curr)}</strong></td>
                    <td>
                      ${(i.unitsOwned && i.unitsOwned.length > 0) ? `
                        <div style="display:flex; gap: 4px; flex-wrap: wrap;">
                          ${i.unitsOwned.map(u => `<span class="badge badge-gold text-xs" style="padding: 2px 6px;">${u}</span>`).join('')}
                        </div>
                      ` : `
                        <span class="text-muted text-xs">No Units</span>
                      `}
                    </td>
                    <td>
                      <span class="text-xs">${i.affiliateName || 'Direct'}</span>
                      <div class="text-xs text-muted"><code>${i.affiliateId || ''}</code></div>
                    </td>
                    <td style="text-align: right;">
                      <div class="action-btn-group" style="justify-content: flex-end;">
                        <button type="button" class="btn-icon" data-action="view-portfolio" data-id="${i.id}" title="View Portfolio & Ledger">
                          <i data-lucide="eye"></i>
                        </button>
                        <button type="button" class="btn-icon" data-action="edit-investor" data-id="${i.id}" title="Edit Details">
                          <i data-lucide="edit-3"></i>
                        </button>
                        <button type="button" class="btn-icon" data-action="delete-investor" data-id="${i.id}" title="Delete Record">
                          <i data-lucide="trash-2"></i>
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

    container.querySelector('#inv-crm-search').oninput = (e) => {
      searchQuery = e.target.value;
      render();
    };

    container.querySelector('#btn-add-investor').onclick = () => {
      showAddInvestorModal(() => render());
    };

    container.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      btn.onclick = () => {
        if (action === 'view-portfolio') {
          showInvestorPortfolioModal(id);
        } else if (action === 'edit-investor') {
          showEditInvestorModal(id, () => render());
        } else if (action === 'delete-investor') {
          if (confirm(`Remove investor ${id}?`)) {
            platformStore.deleteInvestor(id);
            render();
          }
        }
      };
    });
  }

  render();
}

/**
 * Modal: Add New Investor
 */
function showAddInvestorModal(onRefresh) {
  let modal = document.getElementById('admin-investor-add-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-investor-add-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 580px;">
      <button type="button" class="auth-modal-close" id="add-investor-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="section-eyebrow"><i data-lucide="user-plus"></i> INVESTOR KYC PROVISIONING</div>
        <h3 class="auth-modal-title">Register Commercial Real Estate Investor</h3>
      </div>

      <form id="admin-add-investor-form" class="auth-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Full Name / Primary Contact</label>
            <input type="text" id="add-inv-name" class="form-input" placeholder="e.g. M. Zubair Chaudhry" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Corporate / Entity Name</label>
            <input type="text" id="add-inv-company" class="form-input" placeholder="e.g. Chaudhry Holdings Pvt Ltd">
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Email Address</label>
            <input type="email" id="add-inv-email" class="form-input" placeholder="investor@domain.com">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Mobile / WhatsApp</label>
            <input type="text" id="add-inv-phone" class="form-input" placeholder="+92 300 1234567" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">City & Country</label>
            <input type="text" id="add-inv-city" class="form-input" placeholder="Faisalabad / Dubai" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">CNIC / Passport Number</label>
            <input type="text" id="add-inv-cnic" class="form-input" placeholder="33100-1234567-1">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Assigned Wealth Partner</label>
          <select id="add-inv-aff" class="form-input">
            <option value="">Direct House Client</option>
            ${platformStore.affiliates.map(a => `
              <option value="${a.id}">${a.name} (${a.id})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Investor Background / Notes</label>
          <textarea id="add-inv-notes" class="form-input" rows="2" placeholder="Key interest in food court, anchor shops, or wholesale trade units..."></textarea>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="add-inv-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Save Investor Profile</button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#add-investor-close').onclick = close;
  modal.querySelector('#add-inv-cancel').onclick = close;

  modal.querySelector('#admin-add-investor-form').onsubmit = (e) => {
    e.preventDefault();
    const name = modal.querySelector('#add-inv-name').value;
    const company = modal.querySelector('#add-inv-company').value;
    const email = modal.querySelector('#add-inv-email').value;
    const phone = modal.querySelector('#add-inv-phone').value;
    const city = modal.querySelector('#add-inv-city').value;
    const cnicOrPassport = modal.querySelector('#add-inv-cnic').value;
    const affId = modal.querySelector('#add-inv-aff').value;
    const notes = modal.querySelector('#add-inv-notes').value;

    const aff = platformStore.affiliates.find(a => a.id === affId);

    const res = platformStore.addInvestor({
      name,
      company,
      email,
      phone,
      city,
      cnicOrPassport,
      affiliateId: affId || null,
      affiliateName: aff ? aff.name : 'Direct',
      notes
    });

    if (!res.success) {
      alert(`⚠️ ${res.message}`);
      return;
    }

    alert(`✅ Investor ${name} registered successfully.`);
    close();
    onRefresh();
  };
}

/**
 * Modal: Edit Investor
 */
function showEditInvestorModal(id, onRefresh) {
  const inv = platformStore.investors.find(i => i.id === id);
  if (!inv) return;

  let modal = document.getElementById('admin-investor-edit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-investor-edit-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 580px;">
      <button type="button" class="auth-modal-close" id="edit-investor-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <h3 class="auth-modal-title">Edit Investor: ${inv.name}</h3>
        <p class="auth-modal-subtitle"><code>${inv.id}</code> · Portfolio: <strong>${formatCurrencyValue(inv.totalInvested)}</strong></p>
      </div>

      <form id="admin-edit-investor-form" class="auth-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Full Name</label>
            <input type="text" id="edit-inv-name" class="form-input" value="${inv.name}" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Company Name</label>
            <input type="text" id="edit-inv-company" class="form-input" value="${inv.company || ''}">
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Email</label>
            <input type="email" id="edit-inv-email" class="form-input" value="${inv.email || ''}">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Phone</label>
            <input type="text" id="edit-inv-phone" class="form-input" value="${inv.phone}" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">City</label>
            <input type="text" id="edit-inv-city" class="form-input" value="${inv.city || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">CNIC / Passport</label>
            <input type="text" id="edit-inv-cnic" class="form-input" value="${inv.cnicOrPassport || ''}">
          </div>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="edit-inv-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Update Investor Profile</button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#edit-investor-close').onclick = close;
  modal.querySelector('#edit-inv-cancel').onclick = close;

  modal.querySelector('#admin-edit-investor-form').onsubmit = (e) => {
    e.preventDefault();
    const name = modal.querySelector('#edit-inv-name').value;
    const company = modal.querySelector('#edit-inv-company').value;
    const email = modal.querySelector('#edit-inv-email').value;
    const phone = modal.querySelector('#edit-inv-phone').value;
    const city = modal.querySelector('#edit-inv-city').value;
    const cnicOrPassport = modal.querySelector('#edit-inv-cnic').value;

    platformStore.updateInvestor(id, { name, company, email, phone, city, cnicOrPassport });
    alert('✅ Investor updated.');
    close();
    onRefresh();
  };
}

/**
 * Modal: View Investor Portfolio
 */
function showInvestorPortfolioModal(id) {
  const inv = platformStore.investors.find(i => i.id === id);
  if (!inv) return;

  let modal = document.getElementById('admin-investor-portfolio-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-investor-portfolio-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  const ownedUnits = platformStore.inventory.filter(u => (inv.unitsOwned || []).includes(u.unitId) || u.buyer === inv.name);

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 650px;">
      <button type="button" class="auth-modal-close" id="portfolio-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <div class="badge-count gold"><i data-lucide="folder-check"></i></div>
        <h3 class="auth-modal-title">${inv.name} — Asset Portfolio</h3>
        <p class="auth-modal-subtitle">Total Investment: <strong class="text-gold">${formatCurrencyValue(inv.totalInvested)}</strong> · Assigned Partner: <strong>${inv.affiliateName || 'Direct'}</strong></p>
      </div>

      <div style="margin: 20px 0;">
        <h4 style="font-size: 0.9rem; color: #D4AF37; margin-bottom: 8px;">Units & Commercial Properties Owned</h4>
        <div class="table-responsive">
          <table class="portal-table">
            <thead>
              <tr>
                <th>Unit #</th>
                <th>Project</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${ownedUnits.length === 0 ? `
                <tr><td colspan="5" class="text-center py-4 text-muted">No units currently assigned to this investor.</td></tr>
              ` : ownedUnits.map(u => `
                <tr>
                  <td><strong class="text-gold">${u.unitNumber || u.unitId}</strong></td>
                  <td>${u.projectId}</td>
                  <td>${u.type} (${u.size})</td>
                  <td><strong>${formatCurrencyValue(u.finalPrice || u.price)}</strong></td>
                  <td><span class="status-pill status-${u.status.toLowerCase()}">${u.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-actions-row">
        <button type="button" class="btn btn-secondary" id="portfolio-btn-close">Close Portfolio View</button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#portfolio-close').onclick = close;
  modal.querySelector('#portfolio-btn-close').onclick = close;
}
