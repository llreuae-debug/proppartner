// Documents Manager - Super Admin Secured Commercial Real Estate Document Vault

import { platformStore } from '../../store/platformStore.js';
import { authStore } from '../../store/authStore.js';

export function renderDocumentsManager(container, navigateTo) {
  let categoryFilter = 'all';
  let projectFilter = 'all';

  function render() {
    const user = authStore.getUser() || authStore.getSuperAdmin();
    let docs = platformStore.getDocuments(user);

    if (categoryFilter !== 'all') {
      docs = docs.filter(d => d.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (projectFilter !== 'all') {
      docs = docs.filter(d => d.projectId === projectFilter);
    }

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Secured Commercial Real Estate Document Vault</h2>
            <p class="module-subtitle">Manage approved building plans, FDA NOC titles, escrow agreements, and affiliate agreements</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-upload-doc">
              <i data-lucide="upload-cloud"></i> <span>Upload Legal Document</span>
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="module-filter-bar glass-card">
          <div class="filter-controls" style="display: flex; gap: 10px; width: 100%; flex-wrap: wrap;">
            <select id="doc-cat-select" class="form-select-sm">
              <option value="all" ${categoryFilter === 'all' ? 'selected' : ''}>All Document Categories</option>
              <option value="agreement" ${categoryFilter === 'agreement' ? 'selected' : ''}>Sale & Partnership Agreements</option>
              <option value="floorplan" ${categoryFilter === 'floorplan' ? 'selected' : ''}>Floor Plans & Layouts</option>
              <option value="statement" ${categoryFilter === 'statement' ? 'selected' : ''}>Financial & Escrow Statements</option>
              <option value="brochure" ${categoryFilter === 'brochure' ? 'selected' : ''}>Brochures & Factsheets</option>
            </select>

            <select id="doc-proj-select" class="form-select-sm">
              <option value="all" ${projectFilter === 'all' ? 'selected' : ''}>All Developments</option>
              <option value="gatwala-commercial-hub" ${projectFilter === 'gatwala-commercial-hub' ? 'selected' : ''}>Gatwala Commercial Hub</option>
              <option value="dragon-souk-plaza" ${projectFilter === 'dragon-souk-plaza' ? 'selected' : ''}>Dragon Souk Market</option>
              <option value="luminary-towers" ${projectFilter === 'luminary-towers' ? 'selected' : ''}>Luminary Towers</option>
            </select>
          </div>
        </div>

        <!-- Documents Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px;">
          ${docs.length === 0 ? `
            <div class="glass-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #94A3B8;">
              <i data-lucide="file-x" style="width: 48px; height: 48px; margin: 0 auto 12px auto; opacity: 0.4;"></i>
              <p>No documents found matching the filter criteria.</p>
            </div>
          ` : docs.map(d => `
            <div class="glass-card" style="padding: 18px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.08);">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                  <span class="badge badge-${d.category === 'Agreement' ? 'gold' : d.category === 'FloorPlan' ? 'cyan' : 'purple'} text-xs">
                    ${d.category}
                  </span>
                  <span class="text-xs text-muted"><code>${d.accessLevel}</code></span>
                </div>
                <h3 style="font-size: 0.95rem; color: #FFFFFF; margin: 0 0 6px 0; line-height: 1.35;">${d.title}</h3>
                <p style="font-size: 0.8rem; color: #94A3B8; margin: 0 0 12px 0;">${d.description || 'Verified authentic legal documentation.'}</p>
              </div>

              <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div class="text-xs text-muted">
                  <span>${d.fileSize}</span> · <span>${d.uploadDate}</span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn btn-secondary btn-xs" data-action="download-doc" data-id="${d.id}">
                    <i data-lucide="download"></i> <span>Download</span>
                  </button>
                  <button type="button" class="btn-icon" data-action="delete-doc" data-id="${d.id}" title="Delete Document">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#doc-cat-select').onchange = (e) => {
      categoryFilter = e.target.value;
      render();
    };

    container.querySelector('#doc-proj-select').onchange = (e) => {
      projectFilter = e.target.value;
      render();
    };

    container.querySelector('#btn-upload-doc').onclick = () => {
      showUploadDocModal(() => render());
    };

    container.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      btn.onclick = () => {
        if (action === 'download-doc') {
          alert(`📥 Document #${id} downloaded securely.`);
        } else if (action === 'delete-doc') {
          if (confirm(`Delete document #${id}?`)) {
            platformStore.deleteDocument(id);
            render();
          }
        }
      };
    });
  }

  render();
}

/**
 * Modal: Upload Document
 */
function showUploadDocModal(onRefresh) {
  let modal = document.getElementById('admin-doc-upload-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-doc-upload-modal';
    modal.className = 'auth-modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card" style="max-width: 540px;">
      <button type="button" class="auth-modal-close" id="upload-doc-close"><i data-lucide="x"></i></button>
      <div class="auth-modal-header">
        <h3 class="auth-modal-title">Upload Legal / Architectural Document</h3>
        <p class="auth-modal-subtitle">Securely store contracts, floor plans, and NOCs</p>
      </div>

      <form id="admin-doc-upload-form" class="auth-form">
        <div class="form-group">
          <label class="form-label text-xs">Document Title</label>
          <input type="text" id="upload-doc-title" class="form-input" placeholder="e.g. Gatwala Commercial Hub - Phase 1 Master NOC" required>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label text-xs">Category</label>
            <select id="upload-doc-category" class="form-input">
              <option value="Agreement">Sale & Partnership Agreement</option>
              <option value="FloorPlan">Floor Plan & Architecture</option>
              <option value="Statement">Financial / Escrow Statement</option>
              <option value="Brochure">Brochure & Factsheet</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Access Permission</label>
            <select id="upload-doc-access" class="form-input">
              <option value="ALL">All Authenticated Users</option>
              <option value="PARTNER">Partners & Super Admin Only</option>
              <option value="ADMIN_ONLY">Super Admin Only</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label text-xs">Associated Project</label>
          <select id="upload-doc-project" class="form-input">
            <option value="">Global / Platform Level</option>
            <option value="gatwala-commercial-hub">Gatwala Commercial Hub</option>
            <option value="dragon-souk-plaza">Dragon Souk Market</option>
            <option value="luminary-towers">The Luminary Sky Residences</option>
            <option value="elysium-waterfront">Elysium Waterfront Villas</option>
          </select>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn btn-secondary" id="upload-doc-cancel">Cancel</button>
          <button type="submit" class="btn btn-gold">Publish Document</button>
        </div>
      </form>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const close = () => modal.classList.remove('active');
  modal.querySelector('#upload-doc-close').onclick = close;
  modal.querySelector('#upload-doc-cancel').onclick = close;

  modal.querySelector('#admin-doc-upload-form').onsubmit = (e) => {
    e.preventDefault();
    const title = modal.querySelector('#upload-doc-title').value;
    const category = modal.querySelector('#upload-doc-category').value;
    const accessLevel = modal.querySelector('#upload-doc-access').value;
    const projectId = modal.querySelector('#upload-doc-project').value || null;

    platformStore.addDocument({
      title,
      category,
      accessLevel,
      projectId,
      fileSize: '3.4 MB'
    });

    alert(`✅ Document "${title}" uploaded to secure vault.`);
    close();
    onRefresh();
  };
}
