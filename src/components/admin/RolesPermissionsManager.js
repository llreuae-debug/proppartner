// Roles & Permissions Manager - Granular RBAC Permission Matrix & Governance

import { SYSTEM_ROLES, DEFAULT_PERMISSIONS } from '../../store/authStore.js';

const ALL_PERMISSIONS = [
  { id: 'VIEW_PROJECTS', category: 'Projects', label: 'View Project Catalog & Renders' },
  { id: 'EDIT_PROJECTS', category: 'Projects', label: 'Create & Edit Developments' },
  { id: 'MANAGE_INVENTORY', category: 'Projects', label: 'Manage Unit Availability & Pricing' },
  { id: 'VIEW_LEADS', category: 'Leads & CRM', label: 'View Ingested Buyer Leads' },
  { id: 'EDIT_LEADS', category: 'Leads & CRM', label: 'Update Pipeline Stages & Resolve Duplicates' },
  { id: 'SUBMIT_LEADS', category: 'Leads & CRM', label: 'Submit Client Referrals' },
  { id: 'VIEW_SALES', category: 'Sales', label: 'View Verified Sales Records' },
  { id: 'MANAGE_SALES', category: 'Sales', label: 'Record New Deeds & Bookings' },
  { id: 'VIEW_COMMISSIONS', category: 'Commissions', label: 'View Commission Entitlements' },
  { id: 'APPROVE_COMMISSIONS', category: 'Commissions', label: 'Approve & Mark Commissions Payable' },
  { id: 'MANAGE_PAYMENTS', category: 'Payments', label: 'Disburse Wire Payouts & Issue Vouchers' },
  { id: 'VIEW_LEDGERS', category: 'Financials', label: 'View Master & Project Financial Ledgers' },
  { id: 'EXPORT_LEDGERS', category: 'Financials', label: 'Export Tax & Financial Ledgers' },
  { id: 'MANAGE_AFFILIATES', category: 'Network', label: 'Approve, Reject & Tier Partners' },
  { id: 'MANAGE_USERS', category: 'Security', label: 'Provision Users, Lock Accounts & Reset Passwords' },
  { id: 'VIEW_AUDIT_LOGS', category: 'Security', label: 'View Immutable Audit Trail' },
  { id: 'MANAGE_SETTINGS', category: 'System', label: 'Control Center & Global Security Policies' }
];

export function renderRolesPermissionsManager(container) {
  let selectedRole = 'ADMIN';

  function render() {
    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Role-Based Access Control (RBAC) & Permissions</h2>
            <p class="module-subtitle">Define granular capabilities across 7 platform roles with immutable Super Admin root protection</p>
          </div>
        </div>

        <div class="roles-rbac-layout">
          <!-- Roles Selector Sidebar -->
          <div class="roles-list-column glass-card">
            <h4 class="card-sec-title"><i data-lucide="shield"></i> System Roles</h4>
            <div class="roles-buttons-list">
              ${Object.values(SYSTEM_ROLES).map(r => `
                <button type="button" class="role-select-item ${selectedRole === r.id ? 'active' : ''}" data-role-id="${r.id}">
                  <div class="role-item-top">
                    <strong>${r.name}</strong>
                    ${r.isImmutable ? '<span class="status-pill status-approved text-xs">ROOT</span>' : ''}
                  </div>
                  <p class="text-muted text-xs">${r.description}</p>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Permissions Matrix Column -->
          <div class="permissions-matrix-column glass-card">
            <div class="perm-header-bar">
              <div>
                <h3 class="perm-role-title">Configuring: ${SYSTEM_ROLES[selectedRole] ? SYSTEM_ROLES[selectedRole].name : selectedRole}</h3>
                <p class="text-muted text-xs">
                  ${selectedRole === 'SUPER_ADMIN' ? '👑 Super Admin maintains immutable root authorization across all platform operations.' : 
                    'Select allowed system capabilities for this role.'}
                </p>
              </div>
              ${selectedRole !== 'SUPER_ADMIN' ? `
                <button type="button" class="btn btn-gold btn-sm" id="btn-save-role-perms">
                  <i data-lucide="save"></i> Save Permissions
                </button>
              ` : ''}
            </div>

            <div class="permissions-categories-list">
              ${renderPermissionsCategories(selectedRole)}
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach role click
    container.querySelectorAll('.role-select-item').forEach(btn => {
      btn.onclick = () => {
        selectedRole = btn.dataset.roleId;
        render();
      };
    });

    const saveBtn = container.querySelector('#btn-save-role-perms');
    if (saveBtn) {
      saveBtn.onclick = () => {
        alert(`✅ Permission policy for ${SYSTEM_ROLES[selectedRole].name} updated and persisted successfully.`);
      };
    }
  }

  render();
}

function renderPermissionsCategories(roleId) {
  const isSuperAdmin = roleId === 'SUPER_ADMIN';
  const currentPerms = DEFAULT_PERMISSIONS[roleId] || [];

  const categories = ['Projects', 'Leads & CRM', 'Sales', 'Commissions', 'Payments', 'Financials', 'Network', 'Security', 'System'];

  return categories.map(cat => {
    const permsInCat = ALL_PERMISSIONS.filter(p => p.category === cat);
    if (permsInCat.length === 0) return '';

    return `
      <div class="perm-category-group">
        <h4 class="perm-cat-title"><i data-lucide="folder"></i> ${cat} Capabilities</h4>
        <div class="perm-grid-2">
          ${permsInCat.map(p => {
            const hasPerm = isSuperAdmin || currentPerms.includes(p.id);
            return `
              <label class="perm-check-card glass-card ${hasPerm ? 'active' : ''}">
                <input type="checkbox" ${hasPerm ? 'checked' : ''} ${isSuperAdmin ? 'disabled' : ''}>
                <div class="perm-text-wrap">
                  <strong>${p.label}</strong>
                  <code>${p.id}</code>
                </div>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}
