// Security Center Module - Global Security Policies, 2FA Enforcement & Emergency Lockdown Controls

import { authStore } from '../../store/authStore.js';

export function renderSecurityCenter(container) {
  function render() {
    const policies = authStore.securityPolicies;
    const admin = authStore.getUser();

    container.innerHTML = `
      <div class="admin-module-view">
        <div class="module-header-row">
          <div>
            <h2 class="module-title">Security Governance & Emergency Control Center</h2>
            <p class="module-subtitle">Manage platform password policies, brute-force mitigation, session timeouts and high-security lockdown</p>
          </div>
        </div>

        <!-- Emergency Control Center Banner -->
        <div class="emergency-center-box glass-card">
          <div class="emergency-header">
            <div class="emergency-title-row">
              <i data-lucide="alert-triangle" class="text-danger"></i>
              <div>
                <h3 class="text-danger">Emergency Security Control Center</h3>
                <p class="text-muted text-xs">High-priority protective actions. Execute only during security incident response.</p>
              </div>
            </div>
          </div>

          <div class="emergency-actions-grid">
            <div class="em-action-card glass-card">
              <div class="em-text">
                <strong>Terminate All Active Sessions</strong>
                <p class="text-muted text-xs">Force log out every active device on the platform immediately (except this current Super Admin session).</p>
              </div>
              <button type="button" class="btn btn-secondary btn-sm text-danger" id="em-btn-revoke-all">
                <i data-lucide="log-out"></i> REVOKE ALL SESSIONS
              </button>
            </div>

            <div class="em-action-card glass-card">
              <div class="em-text">
                <strong>Lock All Non-Admin Accounts</strong>
                <p class="text-muted text-xs">Prevent any affiliate, staff or sales agent from accessing portals during an active investigation.</p>
              </div>
              <button type="button" class="btn btn-secondary btn-sm text-danger" id="em-btn-lock-all">
                <i data-lucide="lock"></i> LOCK NON-ADMINS
              </button>
            </div>

            <div class="em-action-card glass-card">
              <div class="em-text">
                <strong>Disable Partner Registrations</strong>
                <p class="text-muted text-xs">Halt incoming affiliate onboarding and prevent new signups temporarily.</p>
              </div>
              <button type="button" class="btn ${policies.registrationsDisabled ? 'btn-secondary text-green' : 'btn-secondary text-warning'} btn-sm" id="em-btn-toggle-reg">
                <i data-lucide="user-x"></i> ${policies.registrationsDisabled ? 'ENABLE REGISTRATIONS' : 'DISABLE REGISTRATIONS'}
              </button>
            </div>

            <div class="em-action-card glass-card">
              <div class="em-text">
                <strong>System Maintenance Mode</strong>
                <p class="text-muted text-xs">Direct public landing traffic to a maintenance screen; only Super Admin can authenticate.</p>
              </div>
              <button type="button" class="btn ${policies.maintenanceMode ? 'btn-secondary text-green' : 'btn-secondary text-warning'} btn-sm" id="em-btn-toggle-maint">
                <i data-lucide="power"></i> ${policies.maintenanceMode ? 'DEACTIVATE MAINTENANCE' : 'ACTIVATE MAINTENANCE'}
              </button>
            </div>
          </div>
        </div>

        <!-- Global Security Policies Form -->
        <div class="settings-grid-2">
          <!-- Password & Login Policies -->
          <div class="glass-card settings-card">
            <h4 class="card-sec-title"><i data-lucide="key-round"></i> Password & Brute-Force Policies</h4>
            <div class="form-group">
              <label class="form-label">Minimum Password Length</label>
              <select id="sec-min-pass" class="form-select">
                <option value="12" ${policies.minPasswordLength === 12 ? 'selected' : ''}>12 Characters (NIST Recommended)</option>
                <option value="14" ${policies.minPasswordLength === 14 ? 'selected' : ''}>14 Characters (High Security)</option>
                <option value="16" ${policies.minPasswordLength === 16 ? 'selected' : ''}>16 Characters (Maximum Security)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Max Failed Login Attempts Before Lockout</label>
              <select id="sec-max-attempts" class="form-select">
                <option value="3" ${policies.maxLoginAttempts === 3 ? 'selected' : ''}>3 Attempts</option>
                <option value="5" ${policies.maxLoginAttempts === 5 ? 'selected' : ''}>5 Attempts (Standard)</option>
                <option value="10" ${policies.maxLoginAttempts === 10 ? 'selected' : ''}>10 Attempts</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Account Lockout Duration</label>
              <select id="sec-lockout-duration" class="form-select">
                <option value="15" ${policies.lockoutDurationMinutes === 15 ? 'selected' : ''}>15 Minutes</option>
                <option value="30" ${policies.lockoutDurationMinutes === 30 ? 'selected' : ''}>30 Minutes</option>
                <option value="60" ${policies.lockoutDurationMinutes === 60 ? 'selected' : ''}>1 Hour</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Password Reset Token Expiration</label>
              <select id="sec-token-expiry" class="form-select">
                <option value="15" ${policies.passwordResetExpiryMinutes === 15 ? 'selected' : ''}>15 Minutes (Single Use)</option>
                <option value="30" ${policies.passwordResetExpiryMinutes === 30 ? 'selected' : ''}>30 Minutes</option>
                <option value="60" ${policies.passwordResetExpiryMinutes === 60 ? 'selected' : ''}>1 Hour</option>
              </select>
            </div>
          </div>

          <!-- Session & Multi-Factor Policies -->
          <div class="glass-card settings-card">
            <h4 class="card-sec-title"><i data-lucide="shield-check"></i> Session & 2FA Enforcement</h4>
            <div class="form-group">
              <label class="form-label">Inactivity Session Timeout</label>
              <select id="sec-session-timeout" class="form-select">
                <option value="4" ${policies.sessionTimeoutHours === 4 ? 'selected' : ''}>4 Hours</option>
                <option value="12" ${policies.sessionTimeoutHours === 12 ? 'selected' : ''}>12 Hours</option>
                <option value="24" ${policies.sessionTimeoutHours === 24 ? 'selected' : ''}>24 Hours</option>
                <option value="168" ${policies.sessionTimeoutHours === 168 ? 'selected' : ''}>7 Days</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Two-Factor Authentication (2FA) Requirement</label>
              <select id="sec-2fa-policy" class="form-select">
                <option value="SUPER_ADMIN" ${policies.require2FAForSuperAdmin ? 'selected' : ''}>Mandatory for Super Admin & Privileged Roles</option>
                <option value="OPTIONAL" ${!policies.require2FAForSuperAdmin ? 'selected' : ''}>Optional for All Roles</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cryptographic Hashing Algorithm</label>
              <input type="text" class="form-input" value="PBKDF2-SHA256 (100,000 Salted Iterations)" readonly>
              <p class="text-muted text-xs" style="margin-top:4px;">Web Crypto API hardware-accelerated cryptographic standard.</p>
            </div>

            <button type="button" class="btn btn-gold btn-sm w-full" id="btn-save-sec-policies" style="margin-top:16px;">
              <i data-lucide="save"></i> SAVE SECURITY POLICIES
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Emergency Buttons
    const revokeAllBtn = container.querySelector('#em-btn-revoke-all');
    if (revokeAllBtn) {
      revokeAllBtn.onclick = () => {
        if (confirm('🚨 HIGH SECURITY ACTION: Are you sure you want to terminate all active sessions across the platform?')) {
          const res = authStore.executeEmergencyAction('REVOKE_ALL_SESSIONS', admin.id);
          alert(res.message);
        }
      };
    }

    const lockAllBtn = container.querySelector('#em-btn-lock-all');
    if (lockAllBtn) {
      lockAllBtn.onclick = () => {
        if (confirm('🚨 LOCKDOWN CONFIRMATION: Are you sure you want to immediately lock all non-admin accounts?')) {
          const res = authStore.executeEmergencyAction('LOCK_NON_ADMIN_ACCOUNTS', admin.id);
          alert(res.message);
        }
      };
    }

    const toggleRegBtn = container.querySelector('#em-btn-toggle-reg');
    if (toggleRegBtn) {
      toggleRegBtn.onclick = () => {
        const res = authStore.executeEmergencyAction('DISABLE_REGISTRATIONS', admin.id);
        alert(res.message);
        render();
      };
    }

    const toggleMaintBtn = container.querySelector('#em-btn-toggle-maint');
    if (toggleMaintBtn) {
      toggleMaintBtn.onclick = () => {
        const res = authStore.executeEmergencyAction('MAINTENANCE_MODE', admin.id);
        alert(res.message);
        render();
      };
    }

    // Save Policies
    const savePoliciesBtn = container.querySelector('#btn-save-sec-policies');
    if (savePoliciesBtn) {
      savePoliciesBtn.onclick = () => {
        const minPass = Number(container.querySelector('#sec-min-pass').value);
        const maxAttempts = Number(container.querySelector('#sec-max-attempts').value);
        const lockoutMins = Number(container.querySelector('#sec-lockout-duration').value);
        const tokenExpiry = Number(container.querySelector('#sec-token-expiry').value);
        const sessionHours = Number(container.querySelector('#sec-session-timeout').value);
        const require2FA = container.querySelector('#sec-2fa-policy').value === 'SUPER_ADMIN';

        authStore.updateSecurityPolicies({
          minPasswordLength: minPass,
          maxLoginAttempts: maxAttempts,
          lockoutDurationMinutes: lockoutMins,
          passwordResetExpiryMinutes: tokenExpiry,
          sessionTimeoutHours: sessionHours,
          require2FAForSuperAdmin: require2FA
        });

        alert('✅ Global platform security policies saved successfully.');
      };
    }
  }

  render();
}
