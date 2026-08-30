// Settings Center - Super Admin System Configuration & Control Center

import { platformStore } from '../../store/platformStore.js';

export function renderSettingsCenter(container, showToast) {
  function render() {
    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">System Control Center & Platform Settings</h2>
            <p class="module-subtitle">Configure global commission thresholds, multi-currency engines, duplicate collision policies, and data storage</p>
          </div>
          <div class="module-actions">
            <button type="button" class="btn btn-gold btn-sm" id="btn-save-settings">
              <i data-lucide="save"></i> <span>Save Configuration</span>
            </button>
          </div>
        </div>

        <div class="settings-grid-2">
          <!-- Platform Identity & Multi-Currency -->
          <div class="glass-card settings-card">
            <h4 class="card-sec-title"><i data-lucide="globe"></i> Platform Identity & Currencies</h4>
            <div class="form-group">
              <label class="form-label">Platform Name</label>
              <input type="text" class="form-input" value="PropPartner 3D Real Estate Affiliate Network" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">Default Base Ledger Currency</label>
              <select id="setting-currency" class="form-select">
                <option value="PKR" ${platformStore.currency === 'PKR' ? 'selected' : ''}>PKR (₨) - Pakistani Rupee</option>
                <option value="USD" ${platformStore.currency === 'USD' ? 'selected' : ''}>USD ($) - US Dollar</option>
                <option value="AED" ${platformStore.currency === 'AED' ? 'selected' : ''}>AED (د.إ) - UAE Dirham</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Affiliate Support Concierge Email</label>
              <input type="email" class="form-input" value="partners@proppartner.network">
            </div>
          </div>

          <!-- Commission Engine Rules -->
          <div class="glass-card settings-card">
            <h4 class="card-sec-title"><i data-lucide="percent"></i> Commission Defaults & Policies</h4>
            <div class="form-group">
              <label class="form-label">Default Network Commission Rate (%)</label>
              <input type="number" step="0.1" class="form-input" value="3.5">
            </div>
            <div class="form-group">
              <label class="form-label">Minimum Payout Threshold</label>
              <input type="text" class="form-input" value="PKR 250,000">
            </div>
            <div class="form-group">
              <label class="form-label">Payout Cycle Timing</label>
              <select class="form-select">
                <option value="weekly" selected>Weekly (Every Friday)</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly (1st of month)</option>
              </select>
            </div>
          </div>

          <!-- Duplicate Lead Collision Engine -->
          <div class="glass-card settings-card">
            <h4 class="card-sec-title"><i data-lucide="shield-alert"></i> Duplicate Lead Collision Protection</h4>
            <div class="form-group">
              <label class="form-checkbox-row">
                <input type="checkbox" checked>
                <span><strong>Phone Collision Checking:</strong> Flag duplicate if phone matches existing lead.</span>
              </label>
            </div>
            <div class="form-group">
              <label class="form-checkbox-row">
                <input type="checkbox" checked>
                <span><strong>Email Collision Checking:</strong> Flag duplicate if email matches existing lead.</span>
              </label>
            </div>
            <div class="form-group">
              <label class="form-label">Attribution Expiration Window</label>
              <select class="form-select">
                <option value="90">90 Days Protection</option>
                <option value="180" selected>180 Days Protection (Standard)</option>
                <option value="365">365 Days Protection (High-End HNW)</option>
              </select>
            </div>
          </div>

          <!-- Demo Data & Storage Reset -->
          <div class="glass-card settings-card">
            <h4 class="card-sec-title"><i data-lucide="database"></i> Demo Data & Reset Controls</h4>
            <p class="text-muted text-sm">
              Quickly reset the local platform store to clean initial state with 5 premier developments, 20+ affiliates, verified sales, and financial ledgers.
            </p>
            <div style="margin-top: 20px;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-reset-demo-data">
                <i data-lucide="rotate-ccw"></i> Reset Local Data to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const saveBtn = container.querySelector('#btn-save-settings');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const curr = container.querySelector('#setting-currency').value;
        platformStore.setCurrency(curr);
        if (showToast) showToast('Platform configuration saved successfully!');
      };
    }

    const resetBtn = container.querySelector('#btn-reset-demo-data');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Reset all platform demo data to fresh initial state?')) {
          platformStore.resetToDefaults();
          if (showToast) showToast('Platform reset to default relational dataset!');
          render();
        }
      };
    }
  }

  render();
}
