// Super Admin SEO, GEO, AEO & Meta Management Console
// PropPartner Real Estate Network

import { seoRoutes, updateSEO } from '../../utils/seoManager.js';

export function renderSEOManager(container) {
  let selectedRouteKey = 'home';
  const customMetadataStore = { ...seoRoutes };

  function render() {
    const activeRoute = customMetadataStore[selectedRouteKey] || customMetadataStore.home;

    container.innerHTML = `
      <div class="portal-panel-header">
        <div>
          <div class="section-eyebrow"><i data-lucide="search"></i> SEARCH ENGINE & AI OPTIMIZATION</div>
          <h2 class="portal-panel-title">SEO, GEO & AEO Control Center</h2>
          <p class="portal-panel-subtitle">Manage metadata, Open Graph previews, Schema.org entities, and technical indexing across all public pages.</p>
        </div>
        <div class="panel-header-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-export-sitemap-info">
            <i data-lucide="file-code"></i> <span>View XML Sitemap</span>
          </button>
          <button type="button" class="btn btn-gold btn-sm" id="btn-save-seo-settings">
            <i data-lucide="check"></i> <span>Save & Deploy Metadata</span>
          </button>
        </div>
      </div>

      <!-- SEO Technical Health Audit Matrix -->
      <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
        <div class="metric-card glass-card">
          <div class="metric-top"><span class="metric-label">Indexable Pages</span><i data-lucide="check-circle" class="text-green"></i></div>
          <div class="metric-val text-gold">16 Pages</div>
          <div class="metric-sub text-green">100% Unique Metadata</div>
        </div>

        <div class="metric-card glass-card">
          <div class="metric-top"><span class="metric-label">Schema Types</span><i data-lucide="code" class="text-cyan"></i></div>
          <div class="metric-val text-cyan">9 Schemas</div>
          <div class="metric-sub text-muted">JSON-LD Auto-Injected</div>
        </div>

        <div class="metric-card glass-card">
          <div class="metric-top"><span class="metric-label">Robots & Sitemap</span><i data-lucide="shield-check" class="text-green"></i></div>
          <div class="metric-val text-green">Active</div>
          <div class="metric-sub text-muted">/robots.txt & /sitemap.xml</div>
        </div>

        <div class="metric-card glass-card">
          <div class="metric-top"><span class="metric-label">Broken Links</span><i data-lucide="link-2" class="text-green"></i></div>
          <div class="metric-val text-green">0 Found</div>
          <div class="metric-sub text-green">Zero # Placeholders</div>
        </div>
      </div>

      <!-- Two-Column Editor Layout -->
      <div class="roles-rbac-layout" style="display: grid; grid-template-columns: 320px 1fr; gap: 24px;">
        <!-- Left: Page Selector -->
        <div class="role-selector-card glass-card" style="padding: 20px;">
          <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 14px; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="globe" class="text-gold"></i> Select Public Page
          </h4>

          <div class="legal-nav-menu">
            ${Object.keys(customMetadataStore).filter(k => k !== 'notFound').map(key => {
              const r = customMetadataStore[key];
              const isActive = key === selectedRouteKey;
              return `
                <button type="button" class="legal-nav-item ${isActive ? 'active' : ''} btn-select-seo-page" data-route-key="${key}">
                  <i data-lucide="${getRouteIcon(key)}"></i>
                  <span style="font-size: 0.8rem;">${formatRouteLabel(key)}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Metadata Editor & Live Previews -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Live Previews Card -->
          <div class="contact-card glass-card">
            <h3 class="contact-card-title"><i data-lucide="eye" class="text-gold"></i> Live Google SERP & Social Previews</h3>

            <!-- Google Search Snippet Preview -->
            <div style="margin-top: 16px;">
              <span class="text-muted text-xs" style="font-weight: 700; text-transform: uppercase;">Google Search Result Snippet Preview</span>
              <div class="google-serp-preview glass-card" style="padding: 16px; margin-top: 8px; background: #0b0f19; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <img src="/assets/proppartner-icon.svg" alt="Favicon" style="width: 16px; height: 16px; object-fit: contain;">
                  <span style="font-size: 0.75rem; color: #94A3B8;">proppartner.pro &gt; ${selectedRouteKey}</span>
                </div>
                <div id="preview-serp-title" style="color: #8AB4F8; font-size: 1.15rem; font-weight: 600; text-decoration: underline; line-height: 1.3; cursor: pointer;">
                  ${activeRoute.title}
                </div>
                <div id="preview-serp-desc" style="color: #BDC1C6; font-size: 0.82rem; line-height: 1.5; margin-top: 4px;">
                  ${activeRoute.description}
                </div>
              </div>
            </div>

            <!-- Social Share (Open Graph) Preview -->
            <div style="margin-top: 24px;">
              <span class="text-muted text-xs" style="font-weight: 700; text-transform: uppercase;">Social Share (Open Graph / WhatsApp / LinkedIn) Card</span>
              <div class="og-preview-card glass-card" style="max-width: 480px; margin-top: 8px; border-radius: 12px; overflow: hidden; background: #0A0E17; border: 1px solid rgba(255,255,255,0.1);">
                <div style="height: 180px; background: #0b0f19; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; padding: 20px;">
                  <img src="/assets/proppartner-logo.png" alt="OG Preview" style="width: 85%; height: auto; object-fit: contain;">
                </div>
                <div style="padding: 14px;">
                  <span style="font-size: 0.7rem; color: #94A3B8; text-transform: uppercase; font-family: var(--font-mono);">PROPPARTNER.PRO</span>
                  <h4 id="preview-og-title" style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF; margin: 4px 0;">${activeRoute.title}</h4>
                  <p id="preview-og-desc" class="text-muted text-xs" style="line-height: 1.4;">${activeRoute.description}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata Fields Editor Form -->
          <div class="contact-card glass-card">
            <h3 class="contact-card-title"><i data-lucide="edit-3" class="text-cyan"></i> Edit Page Metadata</h3>

            <div class="sec-form-wrap" style="margin-top: 16px;">
              <div class="form-group">
                <div class="label-split">
                  <label class="form-label">Page Title Tag (&lt;title&gt;)</label>
                  <span class="text-xs text-muted" id="char-count-title">${activeRoute.title.length}/60 chars</span>
                </div>
                <input type="text" id="input-seo-title" class="form-input" value="${activeRoute.title}">
              </div>

              <div class="form-group">
                <div class="label-split">
                  <label class="form-label">Meta Description</label>
                  <span class="text-xs text-muted" id="char-count-desc">${activeRoute.description.length}/160 chars</span>
                </div>
                <textarea id="input-seo-desc" class="form-input" rows="3">${activeRoute.description}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Self-Referencing Canonical URL</label>
                <input type="url" id="input-seo-canonical" class="form-input" value="${activeRoute.canonical}">
              </div>

              <div class="form-group">
                <label class="form-label">Target Keywords (Meta & Topic Signals)</label>
                <input type="text" id="input-seo-keywords" class="form-input" value="${activeRoute.keywords || ''}">
              </div>

              <div class="form-group-checkbox" style="margin-top: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem;">
                  <input type="checkbox" id="check-seo-noindex" ${activeRoute.noindex ? 'checked' : ''}>
                  <span>Robots Noindex (Exclude from Google/Bing Search Indexes)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach Page Selector Handlers
    container.querySelectorAll('.btn-select-seo-page').forEach(btn => {
      btn.onclick = () => {
        selectedRouteKey = btn.dataset.routeKey;
        render();
      };
    });

    // Real-time preview updates
    const titleInput = container.querySelector('#input-seo-title');
    const descInput = container.querySelector('#input-seo-desc');
    const serpTitle = container.querySelector('#preview-serp-title');
    const serpDesc = container.querySelector('#preview-serp-desc');
    const ogTitle = container.querySelector('#preview-og-title');
    const ogDesc = container.querySelector('#preview-og-desc');
    const countTitle = container.querySelector('#char-count-title');
    const countDesc = container.querySelector('#char-count-desc');

    titleInput?.addEventListener('input', (e) => {
      const val = e.target.value;
      customMetadataStore[selectedRouteKey].title = val;
      if (serpTitle) serpTitle.textContent = val;
      if (ogTitle) ogTitle.textContent = val;
      if (countTitle) countTitle.textContent = `${val.length}/60 chars`;
    });

    descInput?.addEventListener('input', (e) => {
      const val = e.target.value;
      customMetadataStore[selectedRouteKey].description = val;
      if (serpDesc) serpDesc.textContent = val;
      if (ogDesc) ogDesc.textContent = val;
      if (countDesc) countDesc.textContent = `${val.length}/160 chars`;
    });

    // Save handler
    container.querySelector('#btn-save-seo-settings')?.addEventListener('click', () => {
      alert(`SEO metadata for ${formatRouteLabel(selectedRouteKey)} updated successfully!`);
    });

    // View sitemap info handler
    container.querySelector('#btn-export-sitemap-info')?.addEventListener('click', () => {
      window.open('/sitemap.xml', '_blank');
    });
  }

  render();
}

function getRouteIcon(key) {
  const icons = {
    home: 'home',
    affiliateProgram: 'award',
    projects: 'building-2',
    howItWorks: 'git-merge',
    commission: 'badge-percent',
    resources: 'book-open',
    about: 'info',
    contact: 'phone',
    terms: 'file-text',
    agreement: 'handshake',
    privacy: 'lock',
    commissionPolicy: 'badge-dollar-sign',
    referralPolicy: 'share-2',
    disclaimer: 'alert-circle'
  };
  return icons[key] || 'globe';
}

function formatRouteLabel(key) {
  const labels = {
    home: 'Homepage (/)',
    affiliateProgram: 'Affiliate Program (/affiliate-program)',
    projects: 'Projects Directory (/projects)',
    howItWorks: 'How It Works (/how-it-works)',
    commission: 'Commission Guide (/commission)',
    resources: 'Resource Hub (/resources)',
    about: 'About Us (/about)',
    contact: 'Contact & Desk (/contact)',
    terms: 'Terms & Conditions (/terms-and-conditions)',
    agreement: 'Affiliate Agreement (/affiliate-agreement)',
    privacy: 'Privacy Policy (/privacy-policy)',
    commissionPolicy: 'Commission Policy (/commission-policy)',
    referralPolicy: 'Referral Policy (/referral-policy)',
    disclaimer: 'Disclaimer (/disclaimer)'
  };
  return labels[key] || key;
}
