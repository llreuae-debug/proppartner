// Audit Logs Viewer - Super Admin Immutable Security & Financial Action Audit Trail

import { platformStore } from '../../store/platformStore.js';

export function renderAuditLogs(container) {
  let searchQuery = '';

  function render() {
    let logs = platformStore.auditLogs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(l =>
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">System & Financial Audit Trail</h2>
            <p class="module-subtitle">Immutable chronological audit log capturing all administrative status updates, commission overrides, and ledger events</p>
          </div>
          <div class="module-actions">
            <span class="audit-security-badge"><i data-lucide="shield-check"></i> SOC-2 & ISO Audit Ready</span>
          </div>
        </div>

        <div class="module-filter-bar glass-card">
          <div class="search-input-wrap" style="width: 100%;">
            <i data-lucide="search"></i>
            <input type="text" id="audit-search" placeholder="Search by user, action type, entity ID, or description..." value="${searchQuery}">
          </div>
        </div>

        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / User</th>
                  <th>Action Type</th>
                  <th>Target Entity</th>
                  <th>Before → After</th>
                  <th>Audit Rationale & Context</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-6 text-muted">No audit records found.</td></tr>
                ` : logs.map(l => `
                  <tr>
                    <td><code>${l.timestamp}</code></td>
                    <td><strong>${l.user}</strong></td>
                    <td><span class="badge-tier">${l.action}</span></td>
                    <td><strong>${l.entity}</strong></td>
                    <td>
                      <span class="text-muted">${l.oldValue}</span>
                      <span class="accent-gold"> → </span>
                      <strong class="text-white">${l.newValue}</strong>
                    </td>
                    <td><span class="text-muted">${l.details}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const searchInput = container.querySelector('#audit-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        render();
      };
    }
  }

  render();
}
