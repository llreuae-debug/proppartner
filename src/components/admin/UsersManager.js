// Users Manager Module - Super Admin User Governance, Account Status, Session Revocation & Password Reset

import { authStore, SYSTEM_ROLES } from '../../store/authStore.js';

export function renderUsersManager(container, onNavigate) {
  let statusFilter = 'ALL'; // 'ALL' | 'ACTIVE' | 'PENDING' | 'LOCKED' | 'SUSPENDED'
  let roleFilter = 'ALL';
  let searchQuery = '';

  function render() {
    const users = authStore.users;
    const currentAdmin = authStore.getUser();

    // Filter users
    const filtered = users.filter(u => {
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const activeCount = users.filter(u => u.status === 'ACTIVE').length;
    const pendingCount = users.filter(u => u.status === 'PENDING').length;
    const lockedCount = users.filter(u => u.status === 'LOCKED' || u.status === 'SUSPENDED').length;
    const twoFACount = users.filter(u => u.twoFactorEnabled).length;

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">User Accounts & Access Governance</h2>
            <p class="module-subtitle">Manage platform identities, credential policies, session status and account locks</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-open-add-user-modal">
              <i data-lucide="user-plus"></i> <span>Add New User</span>
            </button>
          </div>
        </div>

        <!-- Metric Ribbons -->
        <div class="admin-kpi-grid">
          <div class="kpi-card glass-card">
            <div class="kpi-header"><span class="kpi-title">TOTAL USERS</span><div class="kpi-badge"><i data-lucide="users"></i></div></div>
            <div class="kpi-number">${users.length}</div>
            <div class="kpi-footer"><span>Platform Accounts</span></div>
          </div>
          <div class="kpi-card glass-card highlight-green">
            <div class="kpi-header"><span class="kpi-title">ACTIVE ACCOUNTS</span><div class="kpi-badge green"><i data-lucide="check-circle"></i></div></div>
            <div class="kpi-number text-green">${activeCount}</div>
            <div class="kpi-footer green"><span>Verified & Operational</span></div>
          </div>
          <div class="kpi-card glass-card">
            <div class="kpi-header"><span class="kpi-title">PENDING APPROVAL</span><div class="kpi-badge yellow"><i data-lucide="clock"></i></div></div>
            <div class="kpi-number text-yellow">${pendingCount}</div>
            <div class="kpi-footer"><span>New Registrations</span></div>
          </div>
          <div class="kpi-card glass-card highlight-cyan">
            <div class="kpi-header"><span class="kpi-title">2FA ENABLED</span><div class="kpi-badge cyan"><i data-lucide="shield-check"></i></div></div>
            <div class="kpi-number text-cyan">${twoFACount}</div>
            <div class="kpi-footer cyan"><span>Multi-Factor Protected</span></div>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="module-filter-bar glass-card">
          <div class="filter-tabs">
            <button type="button" class="filter-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}" data-status="ALL">All (${users.length})</button>
            <button type="button" class="filter-tab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}" data-status="ACTIVE">Active (${activeCount})</button>
            <button type="button" class="filter-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}" data-status="PENDING">Pending (${pendingCount})</button>
            <button type="button" class="filter-tab-btn ${statusFilter === 'LOCKED' ? 'active' : ''}" data-status="LOCKED">Locked / Suspended (${lockedCount})</button>
          </div>

          <div class="search-input-wrap">
            <i data-lucide="search"></i>
            <input type="text" id="users-search-input" placeholder="Search by name, email, role or ID..." value="${searchQuery}">
          </div>
        </div>

        <!-- Users Table Card -->
        <div class="table-card glass-card">
          <div class="table-card-header">
            <h4><i data-lucide="shield"></i> Authenticated Users Roster (${filtered.length})</h4>
          </div>

          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Assigned Role</th>
                  <th>Auth Method</th>
                  <th>Status</th>
                  <th>2FA Status</th>
                  <th>Last Login</th>
                  <th>Actions & Security</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(u => `
                  <tr>
                    <td>
                      <div class="table-user-cell">
                        <img src="${u.avatar}" alt="${u.name}" class="table-avatar">
                        <div>
                          <strong>${u.name}</strong>
                          ${u.mustChangePassword ? '<span class="dup-alert-pill" style="margin-left:6px;"><i data-lucide="key"></i> Must Reset Pass</span>' : ''}
                          <br><span class="text-muted text-xs">${u.email} • <code>${u.id}</code></span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge-role-${u.role === 'SUPER_ADMIN' ? 'admin' : 'partner'}">
                        ${SYSTEM_ROLES[u.role] ? SYSTEM_ROLES[u.role].badge : u.role}
                      </span>
                    </td>
                    <td>
                      <span class="text-xs">
                        <i data-lucide="${u.authMethod === 'GOOGLE' ? 'chrome' : 'key'}"></i> 
                        ${u.authMethod || 'PASSWORD'}
                      </span>
                    </td>
                    <td>
                      <span class="status-pill status-${u.status.toLowerCase()}">${u.status}</span>
                    </td>
                    <td>
                      <span class="status-pill ${u.twoFactorEnabled ? 'status-approved' : 'status-pending'}">
                        ${u.twoFactorEnabled ? '✓ Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td><span class="text-muted text-xs">${u.lastLogin || 'Never'}</span></td>
                    <td>
                      <div class="table-action-btns">
                        ${u.role !== 'SUPER_ADMIN' ? `
                          ${u.status === 'LOCKED' ? `
                            <button type="button" class="btn btn-secondary btn-xs text-green btn-user-action" data-user-id="${u.id}" data-action="UNLOCK" title="Unlock Account">
                              <i data-lucide="unlock"></i> Unlock
                            </button>
                          ` : `
                            <button type="button" class="btn btn-secondary btn-xs text-warning btn-user-action" data-user-id="${u.id}" data-action="LOCK" title="Lock Account">
                              <i data-lucide="lock"></i> Lock
                            </button>
                          `}

                          ${u.status === 'SUSPENDED' ? `
                            <button type="button" class="btn btn-secondary btn-xs text-green btn-user-action" data-user-id="${u.id}" data-action="UNSUSPEND" title="Reactivate User">
                              <i data-lucide="user-check"></i> Unsuspend
                            </button>
                          ` : `
                            <button type="button" class="btn btn-secondary btn-xs text-danger btn-user-action" data-user-id="${u.id}" data-action="SUSPEND" title="Suspend User">
                              <i data-lucide="user-x"></i> Suspend
                            </button>
                          `}

                          <button type="button" class="btn btn-secondary btn-xs btn-user-action" data-user-id="${u.id}" data-action="FORCE_RESET" title="Force Password Reset on Next Login">
                            <i data-lucide="key-round"></i> Reset Pass
                          </button>

                          <button type="button" class="btn btn-secondary btn-xs text-danger btn-user-action" data-user-id="${u.id}" data-action="REVOKE_SESSIONS" title="Revoke All Active Sessions">
                            <i data-lucide="log-out"></i> End Sessions
                          </button>
                        ` : `
                          <span class="text-muted text-xs" style="font-weight:700;">👑 Root Administrator</span>
                        `}
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

    // Attach listeners
    container.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        statusFilter = btn.dataset.status;
        render();
      };
    });

    const searchInput = container.querySelector('#users-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        render();
      };
    }

    // User action buttons
    container.querySelectorAll('.btn-user-action').forEach(btn => {
      btn.onclick = () => {
        const uId = btn.dataset.userId;
        const action = btn.dataset.action;

        if (action === 'LOCK') {
          authStore.setUserAccountStatus(uId, 'LOCKED', 'Super Admin locked account');
          alert('🔒 User account locked successfully.');
          render();
        } else if (action === 'UNLOCK') {
          authStore.setUserAccountStatus(uId, 'ACTIVE', 'Super Admin unlocked account');
          alert('🔓 User account unlocked successfully.');
          render();
        } else if (action === 'SUSPEND') {
          if (confirm('Are you sure you want to suspend this user account? All their active sessions will be terminated.')) {
            authStore.setUserAccountStatus(uId, 'SUSPENDED', 'Super Admin suspended account');
            alert('🚫 User account suspended.');
            render();
          }
        } else if (action === 'UNSUSPEND') {
          authStore.setUserAccountStatus(uId, 'ACTIVE', 'Super Admin unsuspended account');
          alert('✅ User account restored to Active status.');
          render();
        } else if (action === 'FORCE_RESET') {
          const res = authStore.forcePasswordReset(uId, currentAdmin.id);
          alert(res.message);
          render();
        } else if (action === 'REVOKE_SESSIONS') {
          authStore.revokeAllSessions(uId);
          alert('✅ All active sessions for this user have been terminated.');
          render();
        }
      };
    });

    // Add User Modal
    const addBtn = container.querySelector('#btn-open-add-user-modal');
    if (addBtn) {
      addBtn.onclick = () => openAddUserModal(render);
    }
  }

  render();
}

function openAddUserModal(onSuccess) {
  let modalWrap = document.getElementById('add-user-modal-wrap');
  if (!modalWrap) {
    modalWrap = document.createElement('div');
    modalWrap.id = 'add-user-modal-wrap';
    modalWrap.className = 'auth-modal-backdrop active';
    document.body.appendChild(modalWrap);
  } else {
    modalWrap.classList.add('active');
  }

  modalWrap.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 500px;">
      <button type="button" class="auth-modal-close" id="add-user-close"><i data-lucide="x"></i></button>

      <div class="auth-modal-header">
        <h3 class="auth-modal-title">Provision New User Account</h3>
        <p class="auth-modal-subtitle">Create platform staff, finance auditors, sales reps or partner accounts</p>
      </div>

      <form id="add-user-form" class="sec-form-wrap">
        <div class="form-group">
          <label class="form-label">Full Legal Name</label>
          <input type="text" id="new-user-name" class="form-input" placeholder="e.g. Faisal Qureshi" required>
        </div>

        <div class="form-group">
          <label class="form-label">Corporate / Personal Email</label>
          <input type="email" id="new-user-email" class="form-input" placeholder="e.g. faisal.sales@proppartner.network" required>
        </div>

        <div class="form-group">
          <label class="form-label">Assigned Role</label>
          <select id="new-user-role" class="form-select">
            <option value="ADMIN">Platform Admin (🛡️ Admin)</option>
            <option value="SALES_MANAGER">Sales Manager (🎯 Sales Manager)</option>
            <option value="SALES_AGENT">Sales Representative (💼 Sales Agent)</option>
            <option value="FINANCE">Finance & Compliance (📊 Finance)</option>
            <option value="SUPPORT">Support Specialist (💬 Support)</option>
            <option value="AFFILIATE_PARTNER">Affiliate Partner (🤝 Partner)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Initial Temporary Password</label>
          <input type="text" id="new-user-pass" class="form-input" value="PropPartner2026!" required>
        </div>

        <div class="form-group-checkbox">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="new-user-force-reset" checked>
            <span class="text-xs" style="color:var(--gold-light); font-weight:700;">
              Require password change on first login (Recommended)
            </span>
          </label>
        </div>

        <button type="submit" class="btn btn-gold w-full" style="margin-top:10px;">
          <i data-lucide="user-check"></i> <span>PROVISION USER ACCOUNT</span>
        </button>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modalWrap.classList.remove('active');
  modalWrap.querySelector('#add-user-close').onclick = close;

  modalWrap.querySelector('#add-user-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = modalWrap.querySelector('#new-user-name').value;
    const email = modalWrap.querySelector('#new-user-email').value;
    const role = modalWrap.querySelector('#new-user-role').value;
    const initialPassword = modalWrap.querySelector('#new-user-pass').value;
    const mustChangePassword = modalWrap.querySelector('#new-user-force-reset').checked;

    const res = await authStore.createUser({
      name,
      email,
      role,
      initialPassword,
      mustChangePassword
    });

    if (res.success) {
      alert(`✅ Account for ${name} (${email}) created successfully!`);
      close();
      if (onSuccess) onSuccess();
    } else {
      alert(`❌ Error: ${res.message}`);
    }
  };
}
