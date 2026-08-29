// Live Admin & CMS Simulation Control Drawer

export function initCMSDrawer(containerElement, onUpdateCallback) {
  if (!containerElement) return;

  let isOpen = false;

  let cmsState = {
    heroProjectValue: "PKR 850 Million+",
    heroMaxCommission: "Up to 5.5%",
    heroActiveProjects: "24+",
    heroPartnerNetwork: "3,450+",
    luminaryPrice: 38500000,
    luminaryRate: 3.5,
    elysiumPrice: 65000000,
    elysiumRate: 4.5,
    currency: 'PKR'
  };

  function render() {
    containerElement.innerHTML = `
      <!-- Floating CMS Toggle Trigger -->
      <button type="button" class="cms-trigger-btn" id="cms-toggle-btn" title="Open CMS & Admin Controls">
        <i data-lucide="settings" class="cms-gear-icon"></i>
        <span>ADMIN / CMS CONTROL</span>
      </button>

      <!-- Slide-in Drawer -->
      <div class="cms-drawer-panel ${isOpen ? 'open' : ''}" id="cms-drawer-panel">
        <div class="cms-drawer-header">
          <div class="cms-header-title">
            <i data-lucide="sliders-horizontal" class="accent-gold"></i>
            <div>
              <h4>ADMIN CMS LIVE EDITOR</h4>
              <span>Tweak rates, prices & stats in real-time</span>
            </div>
          </div>
          <button type="button" class="cms-close-btn" id="cms-close-btn">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="cms-drawer-body">
          <!-- Currency Switcher -->
          <div class="cms-section">
            <label class="cms-label"><i data-lucide="globe"></i> Display Currency</label>
            <div class="cms-btn-group">
              <button type="button" class="cms-curr-btn ${cmsState.currency === 'PKR' ? 'active' : ''}" data-curr="PKR">PKR (₨)</button>
              <button type="button" class="cms-curr-btn ${cmsState.currency === 'USD' ? 'active' : ''}" data-curr="USD">USD ($)</button>
              <button type="button" class="cms-curr-btn ${cmsState.currency === 'AED' ? 'active' : ''}" data-curr="AED">AED (د.إ)</button>
            </div>
          </div>

          <!-- Hero Metrics Editor -->
          <div class="cms-section">
            <label class="cms-label"><i data-lucide="bar-chart-3"></i> Hero Stats Customizer</label>
            <div class="cms-input-row">
              <span>Project Value:</span>
              <input type="text" id="cms-stat-val" value="${cmsState.heroProjectValue}" class="cms-input">
            </div>
            <div class="cms-input-row">
              <span>Partner Network:</span>
              <input type="text" id="cms-stat-network" value="${cmsState.heroPartnerNetwork}" class="cms-input">
            </div>
            <div class="cms-input-row">
              <span>Max Commission:</span>
              <input type="text" id="cms-stat-comm" value="${cmsState.heroMaxCommission}" class="cms-input">
            </div>
          </div>

          <!-- Pricing & Commission Rates -->
          <div class="cms-section">
            <label class="cms-label"><i data-lucide="badge-percent"></i> Project Rates & Commissions</label>
            
            <div class="cms-project-edit-box">
              <strong>The Luminary Towers</strong>
              <div class="cms-input-row">
                <span>Price (PKR):</span>
                <input type="number" id="cms-luminary-price" value="${cmsState.luminaryPrice}" step="500000" class="cms-input">
              </div>
              <div class="cms-input-row">
                <span>Commission %:</span>
                <input type="number" id="cms-luminary-rate" value="${cmsState.luminaryRate}" step="0.1" min="1" max="10" class="cms-input">
              </div>
            </div>

            <div class="cms-project-edit-box">
              <strong>Elysium Waterfront</strong>
              <div class="cms-input-row">
                <span>Price (PKR):</span>
                <input type="number" id="cms-elysium-price" value="${cmsState.elysiumPrice}" step="500000" class="cms-input">
              </div>
              <div class="cms-input-row">
                <span>Commission %:</span>
                <input type="number" id="cms-elysium-rate" value="${cmsState.elysiumRate}" step="0.1" min="1" max="10" class="cms-input">
              </div>
            </div>
          </div>

          <div class="cms-actions">
            <button type="button" class="btn btn-gold w-full" id="cms-apply-btn">
              <i data-lucide="check"></i>
              <span>APPLY CHANGES INSTANTLY</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event Listeners
    containerElement.querySelector('#cms-toggle-btn')?.addEventListener('click', () => {
      isOpen = !isOpen;
      render();
    });

    containerElement.querySelector('#cms-close-btn')?.addEventListener('click', () => {
      isOpen = false;
      render();
    });

    // Currency button listeners
    containerElement.querySelectorAll('.cms-curr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cmsState.currency = btn.getAttribute('data-curr');
        render();
        if (onUpdateCallback) onUpdateCallback(cmsState);
      });
    });

    // Apply Changes Listener
    containerElement.querySelector('#cms-apply-btn')?.addEventListener('click', () => {
      cmsState.heroProjectValue = containerElement.querySelector('#cms-stat-val')?.value || cmsState.heroProjectValue;
      cmsState.heroPartnerNetwork = containerElement.querySelector('#cms-stat-network')?.value || cmsState.heroPartnerNetwork;
      cmsState.heroMaxCommission = containerElement.querySelector('#cms-stat-comm')?.value || cmsState.heroMaxCommission;
      cmsState.luminaryPrice = parseFloat(containerElement.querySelector('#cms-luminary-price')?.value) || cmsState.luminaryPrice;
      cmsState.luminaryRate = parseFloat(containerElement.querySelector('#cms-luminary-rate')?.value) || cmsState.luminaryRate;
      cmsState.elysiumPrice = parseFloat(containerElement.querySelector('#cms-elysium-price')?.value) || cmsState.elysiumPrice;
      cmsState.elysiumRate = parseFloat(containerElement.querySelector('#cms-elysium-rate')?.value) || cmsState.elysiumRate;

      if (onUpdateCallback) {
        onUpdateCallback(cmsState);
      }
      isOpen = false;
      render();
    });
  }

  render();
}
