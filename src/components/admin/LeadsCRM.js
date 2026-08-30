// Leads CRM - Customer Relationship Management, Pipeline Stages & Duplicate Collision Protection

import { platformStore, formatCurrencyValue } from '../../store/platformStore.js';

export function renderLeadsCRM(container, navigateTo) {
  let activeFilter = 'all'; // 'all' | 'duplicates' | 'qualified' | 'converted'
  let searchQuery = '';

  function render() {
    const curr = platformStore.currency;
    let filtered = platformStore.leads.filter(l => {
      if (activeFilter === 'duplicates') return l.duplicateFlag;
      if (activeFilter === 'qualified') return ['Qualified', 'Site Visit', 'Negotiation', 'Booked', 'Converted'].includes(l.status);
      if (activeFilter === 'converted') return l.status === 'Converted';
      return true;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.affiliateId.toLowerCase().includes(q)
      );
    }

    const duplicateCount = platformStore.leads.filter(l => l.duplicateFlag).length;

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Lead & Customer Management (CRM)</h2>
            <p class="module-subtitle">Track referred prospects, advance sales stages and resolve duplicate attribution claims</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-add-lead-modal">
              <i data-lucide="user-plus"></i> <span>Add New Lead</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="module-filter-bar glass-card">
          <div class="filter-tabs">
            <button type="button" class="filter-tab-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
              All Leads (${platformStore.leads.length})
            </button>
            <button type="button" class="filter-tab-btn ${activeFilter === 'duplicates' ? 'active' : ''}" data-filter="duplicates">
              Duplicate Alerts ${duplicateCount > 0 ? `<span class="badge-count warning">${duplicateCount}</span>` : ''}
            </button>
            <button type="button" class="filter-tab-btn ${activeFilter === 'qualified' ? 'active' : ''}" data-filter="qualified">
              Qualified Pipeline
            </button>
            <button type="button" class="filter-tab-btn ${activeFilter === 'converted' ? 'active' : ''}" data-filter="converted">
              Converted / Sales
            </button>
          </div>

          <div class="filter-controls">
            <div class="search-input-wrap">
              <i data-lucide="search"></i>
              <input type="text" id="lead-search-input" placeholder="Search by client name, phone, email, or affiliate..." value="${searchQuery}">
            </div>
          </div>
        </div>

        <!-- Leads Table -->
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Client Name & Contact</th>
                  <th>Project & Budget</th>
                  <th>Referred By</th>
                  <th>Stage Pipeline</th>
                  <th>Duplicate Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr><td colspan="7" class="text-center py-6 text-muted">No leads found matching criteria.</td></tr>
                ` : filtered.map(l => {
                  const proj = platformStore.projects.find(p => p.id === l.projectId);
                  const aff = platformStore.affiliates.find(a => a.id === l.affiliateId);
                  return `
                    <tr class="${l.duplicateFlag ? 'row-duplicate-alert' : ''}">
                      <td><code>${l.id}</code></td>
                      <td>
                        <div>
                          <strong>${l.name}</strong>
                          <div class="text-muted"><i data-lucide="phone"></i> ${l.phone}</div>
                          <div class="text-muted"><i data-lucide="mail"></i> ${l.email}</div>
                        </div>
                      </td>
                      <td>
                        <strong>${proj ? proj.name : l.projectId}</strong>
                        <div class="text-gold">Budget: ${formatCurrencyValue(l.budget, curr)}</div>
                        <div class="text-muted">${l.unitInterested}</div>
                      </td>
                      <td>
                        <span class="badge-tier">${aff ? aff.name : l.affiliateId}</span>
                        <div class="text-muted"><code>${l.referralCode}</code></div>
                      </td>
                      <td>
                        <select class="lead-stage-select form-select-sm" data-id="${l.id}">
                          <option value="New" ${l.status === 'New' ? 'selected' : ''}>New Lead</option>
                          <option value="Contacted" ${l.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                          <option value="Qualified" ${l.status === 'Qualified' ? 'selected' : ''}>Qualified</option>
                          <option value="Site Visit" ${l.status === 'Site Visit' ? 'selected' : ''}>Site Visit</option>
                          <option value="Negotiation" ${l.status === 'Negotiation' ? 'selected' : ''}>In Negotiation</option>
                          <option value="Booked" ${l.status === 'Booked' ? 'selected' : ''}>Token Booked</option>
                          <option value="Converted" ${l.status === 'Converted' ? 'selected' : ''}>Converted (Sale)</option>
                          <option value="Lost" ${l.status === 'Lost' ? 'selected' : ''}>Lost</option>
                        </select>
                      </td>
                      <td>
                        ${l.duplicateFlag ? `
                          <div class="dup-alert-pill">
                            <i data-lucide="alert-triangle"></i>
                            <span>Collision (${l.duplicateMatches.join(', ')})</span>
                          </div>
                        ` : `
                          <span class="status-pill status-approved">Original</span>
                        `}
                      </td>
                      <td>
                        <div class="action-btn-group">
                          ${l.duplicateFlag ? `
                            <button type="button" class="btn btn-xs btn-gold btn-resolve-dup" data-id="${l.id}">
                              Resolve
                            </button>
                          ` : ''}
                          <button type="button" class="btn-icon btn-record-sale-from-lead" title="Record Verified Sale" data-id="${l.id}">
                            <i data-lucide="shopping-bag"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
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
        activeFilter = btn.dataset.filter;
        render();
      };
    });

    const searchInput = container.querySelector('#lead-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        render();
      };
    }

    container.querySelectorAll('.lead-stage-select').forEach(sel => {
      sel.onchange = (e) => {
        platformStore.updateLeadStatus(sel.dataset.id, e.target.value);
      };
    });

    container.querySelectorAll('.btn-resolve-dup').forEach(btn => {
      btn.onclick = () => showDuplicateResolutionModal(btn.dataset.id);
    });

    container.querySelectorAll('.btn-record-sale-from-lead').forEach(btn => {
      btn.onclick = () => {
        const lead = platformStore.leads.find(l => l.id === btn.dataset.id);
        if (lead) {
          navigateTo('sales', { action: 'add-sale', leadId: lead.id });
        }
      };
    });

    const addBtn = container.querySelector('#btn-add-lead-modal');
    if (addBtn) addBtn.onclick = () => showAddLeadModal();
  }

  function showDuplicateResolutionModal(leadId) {
    const lead = platformStore.leads.find(l => l.id === leadId);
    if (!lead) return;

    let modal = document.getElementById('admin-dup-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-dup-modal';
      modal.className = 'auth-modal-backdrop active';
      document.body.appendChild(modal);
    } else {
      modal.classList.add('active');
    }

    modal.innerHTML = `
      <div class="auth-modal-dialog glass-card" style="max-width: 620px;">
        <button type="button" class="auth-modal-close" id="dup-close-btn"><i data-lucide="x"></i></button>
        <div class="auth-modal-header">
          <div class="badge-count warning"><i data-lucide="shield-alert"></i></div>
          <h3 class="auth-modal-title">Duplicate Lead Attribution Review</h3>
          <p class="auth-modal-subtitle">Resolve attribution for ${lead.name} (${lead.phone}) between competing affiliate partners.</p>
        </div>

        <form id="dup-resolve-form" class="auth-form">
          <div class="form-group">
            <label class="form-label">Attribution Decision</label>
            <select id="dup-decision-select" class="form-select" required>
              <option value="Attributed to Original" selected>Attribute to Original Submitting Partner</option>
              <option value="Split Commission (50/50)">Split Commission (50/50 Joint Referral)</option>
              <option value="Attributed to Current">Attribute to Current Secondary Partner (Verified Engagement)</option>
              <option value="Rejected Invalid">Reject Duplicate Submission</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Primary Commission Recipient</label>
            <select id="dup-primary-aff" class="form-select">
              ${platformStore.affiliates.map(a => `
                <option value="${a.id}" ${a.id === lead.affiliateId ? 'selected' : ''}>${a.name} (${a.id}) - ${a.tier}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Administrative Resolution Reason / Audit Justification <span class="req">*</span></label>
            <textarea id="dup-reason-text" class="form-textarea" rows="3" required placeholder="State rationale for attribution decision according to program terms..."></textarea>
          </div>

          <button type="submit" class="btn btn-gold w-full btn-lg">
            <span>CONFIRM ATTRIBUTION & RECORD AUDIT</span>
          </button>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const close = () => modal.classList.remove('active');
    modal.querySelector('#dup-close-btn').onclick = close;

    modal.querySelector('#dup-resolve-form').onsubmit = (e) => {
      e.preventDefault();
      const decision = modal.querySelector('#dup-decision-select').value;
      const primaryAff = modal.querySelector('#dup-primary-aff').value;
      const reason = modal.querySelector('#dup-reason-text').value;

      platformStore.resolveDuplicateAttribution(leadId, decision, primaryAff, reason);
      close();
      render();
    };
  }

  function showAddLeadModal() {
    const name = prompt('Enter Client Name:');
    if (!name) return;
    const phone = prompt('Enter Phone / WhatsApp:', '+92 300 1234567');
    const email = prompt('Enter Email Address:', 'client@domain.com');
    const budget = prompt('Budget in PKR:', '35000000');

    const result = platformStore.submitLead({
      name,
      phone,
      email,
      budget: Number(budget) || 35000000,
      projectId: platformStore.projects[0].id,
      affiliateId: platformStore.affiliates[0].id
    });

    if (result.isDuplicate) {
      alert(`⚠️ Duplicate detected! Phone/email matches an existing lead. A duplicate collision alert has been logged.`);
    }
    render();
  }

  render();
}
