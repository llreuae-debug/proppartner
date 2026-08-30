// Marketing Manager - Super Admin Marketing Library & Promotional Asset Management

import { platformStore } from '../../store/platformStore.js';

export function renderMarketingManager(container) {
  function render() {
    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Marketing & Promotional Asset Center</h2>
            <p class="module-subtitle">Manage official investor lookbooks, WhatsApp copy, video teasers, and high-converting creative packs</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-upload-asset-modal">
              <i data-lucide="upload-cloud"></i> <span>Upload Asset</span>
            </button>
          </div>
        </div>

        <div class="marketing-assets-grid">
          ${platformStore.marketing.map(m => `
            <div class="mkt-asset-card glass-card">
              <div class="mkt-card-header">
                <span class="mkt-category-pill">${m.category}</span>
                <span class="text-muted text-xs">${m.format}</span>
              </div>
              <h4 class="mkt-title">${m.title}</h4>
              <p class="mkt-project-label"><i data-lucide="building"></i> ${m.projectName}</p>
              <div class="mkt-footer">
                <span class="text-muted text-xs"><i data-lucide="download"></i> ${m.downloads} downloads</span>
                <button type="button" class="btn btn-secondary btn-xs" onclick="alert('Asset file ready for download: ${m.title}');">
                  <i data-lucide="download"></i> Download
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const uploadBtn = container.querySelector('#btn-upload-asset-modal');
    if (uploadBtn) {
      uploadBtn.onclick = () => {
        const title = prompt('Enter Asset Title:');
        if (!title) return;
        const category = prompt('Enter Category (Brochure / Social Media / WhatsApp Pitch / Video):', 'Brochure');

        platformStore.marketing.unshift({
          id: `MKT-${Date.now().toString().slice(-4)}`,
          projectId: platformStore.projects[0].id,
          projectName: platformStore.projects[0].name,
          category: category || 'Brochure',
          title,
          format: 'PDF / Media',
          url: '#',
          downloads: 0
        });
        platformStore.save();
        render();
      };
    }
  }

  render();
}
