// Interactive Marketing Toolkit Component with 1-Click Copy and Asset Previews

import { marketingAssets } from '../data/affiliateData.js';

export function initMarketingToolkit(containerElement, showToastCallback) {
  if (!containerElement) return null;

  let activeCategory = 'All';
  const categories = ['All', 'WhatsApp', 'Email', 'Brochures', 'Social', 'Video'];

  function getFilteredAssets() {
    if (activeCategory === 'All') return marketingAssets;
    return marketingAssets.filter(a => a.category === activeCategory);
  }

  function render() {
    const assets = getFilteredAssets();

    containerElement.innerHTML = `
      <div class="toolkit-container">
        <!-- Toolkit Filter Tabs -->
        <div class="toolkit-category-nav">
          ${categories.map(cat => `
            <button type="button" class="toolkit-tab ${activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat === 'WhatsApp' ? '<i data-lucide="message-circle"></i>' : ''}
              ${cat === 'Email' ? '<i data-lucide="mail"></i>' : ''}
              ${cat === 'Brochures' ? '<i data-lucide="file-text"></i>' : ''}
              ${cat === 'Social' ? '<i data-lucide="image"></i>' : ''}
              ${cat === 'Video' ? '<i data-lucide="video"></i>' : ''}
              <span>${cat} ${cat === 'All' ? 'Collateral' : ''}</span>
            </button>
          `).join('')}
        </div>

        <!-- Asset Cards Grid -->
        <div class="toolkit-grid">
          ${assets.map(asset => {
            const isCopyable = asset.copyContent !== undefined;
            return `
              <div class="toolkit-card glass-card">
                <div class="toolkit-card-header">
                  <div class="toolkit-icon-badge">
                    <i data-lucide="${asset.icon || 'file'}"></i>
                  </div>
                  <div class="toolkit-header-text">
                    <span class="toolkit-cat-badge">${asset.category}</span>
                    <h4 class="toolkit-asset-title">${asset.title}</h4>
                    <span class="toolkit-type-sub">${asset.type} ${asset.fileSize ? `• ${asset.fileSize}` : ''}</span>
                  </div>
                </div>

                <div class="toolkit-card-body">
                  ${isCopyable ? `
                    <div class="toolkit-snippet-box">
                      <pre class="toolkit-pre"><code>${asset.copyContent}</code></pre>
                    </div>
                  ` : `
                    <p class="toolkit-desc-text">${asset.previewText || 'High-conversion marketing asset pre-configured with your unique affiliate identifier.'}</p>
                  `}
                </div>

                <div class="toolkit-card-footer">
                  ${isCopyable ? `
                    <button type="button" class="btn btn-gold btn-sm copy-asset-btn" data-content="${encodeURIComponent(asset.copyContent)}">
                      <i data-lucide="copy"></i>
                      <span>COPY TEMPLATE</span>
                    </button>
                  ` : `
                    <button type="button" class="btn btn-secondary btn-sm download-sim-btn" data-name="${asset.downloadName || 'asset.zip'}">
                      <i data-lucide="download"></i>
                      <span>PREVIEW & DOWNLOAD</span>
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Category Tabs
    containerElement.querySelectorAll('.toolkit-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        render();
      });
    });

    // Copy Content Listener
    containerElement.querySelectorAll('.copy-asset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.getAttribute('data-content'));
        navigator.clipboard.writeText(text).then(() => {
          btn.innerHTML = `<i data-lucide="check"></i> <span>COPIED TO CLIPBOARD!</span>`;
          if (window.lucide) window.lucide.createIcons();
          if (showToastCallback) {
            showToastCallback('Template copied to clipboard successfully!');
          }
          setTimeout(() => {
            btn.innerHTML = `<i data-lucide="copy"></i> <span>COPY TEMPLATE</span>`;
            if (window.lucide) window.lucide.createIcons();
          }, 2500);
        });
      });
    });

    // Download Simulator Listener
    containerElement.querySelectorAll('.download-sim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        if (showToastCallback) {
          showToastCallback(`Downloading ${name}...`);
        }
      });
    });
  }

  render();
}
