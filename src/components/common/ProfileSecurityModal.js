// Profile & Security Modal - Centralized Password Management, 2FA, Active Sessions & User Profile

import { authStore } from '../../store/authStore.js';
import { evaluatePasswordStrength } from '../../store/cryptoUtils.js';

export function openProfileSecurityModal(activeTab = 'password', onUpdateSuccess) {
  let modalWrap = document.getElementById('profile-security-modal-wrap');
  if (!modalWrap) {
    modalWrap = document.createElement('div');
    modalWrap.id = 'profile-security-modal-wrap';
    modalWrap.className = 'auth-modal-backdrop active';
    document.body.appendChild(modalWrap);
  } else {
    modalWrap.classList.add('active');
  }

  let currentTab = activeTab; // 'profile' | 'password' | '2fa' | 'sessions'
  const user = authStore.getUser();
  if (!user) return;

  function render() {
    const liveUser = authStore.users.find(u => u.id === user.id) || user;
    const activeSessions = authStore.getActiveSessions(liveUser.id);

    modalWrap.innerHTML = `
      <div class="auth-modal-dialog glass-card profile-security-dialog" style="max-width: 620px;">
        <button type="button" class="auth-modal-close" id="profile-modal-close" aria-label="Close">
          <i data-lucide="x"></i>
        </button>

        <div class="profile-security-header">
          <img src="${liveUser.avatar}" alt="${liveUser.name}" class="profile-avatar-lg">
          <div>
            <h3 class="profile-name-title">${liveUser.name}</h3>
            <div class="profile-meta-sub">
              <code>${liveUser.email}</code> • <span class="badge-tier tier-${(liveUser.tier || 'platinum').toLowerCase()}">${liveUser.role}</span>
            </div>
          </div>
        </div>

        <!-- Tab Navigation Navigation Strip -->
        <div class="security-nav-tabs">
          <button type="button" class="sec-tab-btn ${currentTab === 'password' ? 'active' : ''}" data-sectab="password">
            <i data-lucide="key-round"></i>
            <span>Change Password</span>
          </button>
          <button type="button" class="sec-tab-btn ${currentTab === '2fa' ? 'active' : ''}" data-sectab="2fa">
            <i data-lucide="shield-check"></i>
            <span>2FA Security</span>
          </button>
          <button type="button" class="sec-tab-btn ${currentTab === 'sessions' ? 'active' : ''}" data-sectab="sessions">
            <i data-lucide="smartphone"></i>
            <span>Active Sessions (${activeSessions.length})</span>
          </button>
          <button type="button" class="sec-tab-btn ${currentTab === 'profile' ? 'active' : ''}" data-sectab="profile">
            <i data-lucide="user"></i>
            <span>My Profile</span>
          </button>
        </div>

        <div class="security-tab-body">
          ${currentTab === 'password' ? renderChangePasswordTab(liveUser) : ''}
          ${currentTab === '2fa' ? render2FATab(liveUser) : ''}
          ${currentTab === 'sessions' ? renderSessionsTab(liveUser, activeSessions) : ''}
          ${currentTab === 'profile' ? renderProfileTab(liveUser) : ''}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Close listener
    const closeBtn = modalWrap.querySelector('#profile-modal-close');
    if (closeBtn) closeBtn.onclick = () => modalWrap.classList.remove('active');
    modalWrap.onclick = (e) => { if (e.target === modalWrap) modalWrap.classList.remove('active'); };

    // Tab switching
    modalWrap.querySelectorAll('[data-sectab]').forEach(tabBtn => {
      tabBtn.onclick = () => {
        currentTab = tabBtn.dataset.sectab;
        render();
      };
    });

    // Attach sub-tab event handlers
    attachTabEvents(modalWrap, liveUser, render, onUpdateSuccess);
  }

  render();
}

function renderChangePasswordTab(user) {
  return `
    <form id="change-pass-form" class="sec-form-wrap">
      <div class="sec-info-banner">
        <i data-lucide="shield-alert"></i>
        <span>Changing your password will immediately invalidate all other active device sessions.</span>
      </div>

      <div class="form-group">
        <label class="form-label">Current Password</label>
        <div class="pass-input-wrapper">
          <input type="password" id="curr-password" class="form-input" placeholder="Enter current password" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">New Secure Password</label>
        <div class="pass-input-wrapper">
          <input type="password" id="new-password" class="form-input" placeholder="Minimum 12 characters" required>
        </div>

        <!-- Live Password Strength Meter -->
        <div class="password-strength-container" id="pass-strength-meter">
          <div class="strength-bar-track">
            <div class="strength-bar-fill" id="strength-bar" style="width: 0%; background: #EF4444;"></div>
          </div>
          <div class="strength-label-row">
            <span class="strength-text">Strength: <strong id="strength-label" style="color:#EF4444;">Weak</strong></span>
            <span class="text-xs text-muted">12+ chars, uppercase, lowercase, numbers & symbols</span>
          </div>
          <div class="strength-criteria-grid" id="strength-criteria">
            <span class="crit-item" id="crit-length"><i data-lucide="circle"></i> 12+ Characters</span>
            <span class="crit-item" id="crit-upper"><i data-lucide="circle"></i> Uppercase (A-Z)</span>
            <span class="crit-item" id="crit-lower"><i data-lucide="circle"></i> Lowercase (a-z)</span>
            <span class="crit-item" id="crit-number"><i data-lucide="circle"></i> Numbers (0-9)</span>
            <span class="crit-item" id="crit-special"><i data-lucide="circle"></i> Special Symbol</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Confirm New Password</label>
        <input type="password" id="confirm-new-password" class="form-input" placeholder="Re-enter new password" required>
        <div id="pass-match-msg" class="text-xs" style="margin-top: 4px; display: none;"></div>
      </div>

      <div class="form-actions-row">
        <button type="submit" class="btn btn-gold w-full" id="btn-submit-change-pass">
          <i data-lucide="lock"></i> <span>UPDATE PASSWORD & SECURE ACCOUNT</span>
        </button>
      </div>
    </form>
  `;
}

function render2FATab(user) {
  const isEnabled = user.twoFactorEnabled;

  return `
    <div class="sec-2fa-wrap">
      <div class="sec-status-card glass-card ${isEnabled ? 'highlight-green' : ''}">
        <div class="status-left">
          <div class="status-icon ${isEnabled ? 'green' : 'yellow'}">
            <i data-lucide="${isEnabled ? 'shield-check' : 'shield-alert'}"></i>
          </div>
          <div>
            <strong>Two-Factor Authentication (2FA) is ${isEnabled ? 'ACTIVE' : 'DISABLED'}</strong>
            <p class="text-muted text-xs">
              ${isEnabled ? 'Your account requires an authenticator code when signing in from unrecognized devices.' : 
                'Protect your platform earnings and financial records by requiring a 6-digit TOTP verification code.'}
            </p>
          </div>
        </div>
        <button type="button" class="btn ${isEnabled ? 'btn-secondary' : 'btn-gold'} btn-sm" id="btn-toggle-2fa">
          ${isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>

      ${isEnabled ? `
        <!-- Backup Recovery Codes -->
        <div class="backup-codes-box glass-card">
          <div class="split-card-header">
            <div>
              <strong>Single-Use Backup Recovery Codes</strong>
              <p class="text-muted text-xs">Store these in a secure password manager in case you lose access to your authenticator app.</p>
            </div>
            <button type="button" class="btn btn-secondary btn-xs" id="btn-regen-recovery-codes">
              <i data-lucide="refresh-cw"></i> Regenerate
            </button>
          </div>
          <div class="codes-grid">
            ${(user.backupCodes || []).map(code => `
              <div class="backup-code-pill"><code>${code}</code></div>
            `).join('')}
          </div>
        </div>
      ` : `
        <!-- Setup Simulation Guide -->
        <div class="setup-2fa-instructions glass-card">
          <h4><i data-lucide="smartphone"></i> How to set up Google Authenticator / Authy</h4>
          <ol class="setup-steps-list">
            <li>Download <strong>Google Authenticator</strong>, <strong>1Password</strong> or <strong>Authy</strong> on your smartphone.</li>
            <li>Click <strong>Enable 2FA</strong> above to link your authenticator app.</li>
            <li>Scan the generated QR code or enter the secret key: <code>${user.twoFactorSecret || 'PROPPARTNER-KEY'}</code></li>
            <li>Enter the 6-digit verification code to lock your account with enterprise MFA.</li>
          </ol>
        </div>
      `}
    </div>
  `;
}

function renderSessionsTab(user, activeSessions) {
  return `
    <div class="sec-sessions-wrap">
      <div class="sessions-header-row">
        <div>
          <h4>Active Device Sessions</h4>
          <p class="text-muted text-xs">These devices are currently authenticated and active on your account.</p>
        </div>
        <button type="button" class="btn btn-secondary btn-xs text-danger" id="btn-revoke-other-sessions">
          <i data-lucide="log-out"></i> Revoke Other Devices
        </button>
      </div>

      <div class="sessions-list">
        ${activeSessions.map(s => `
          <div class="session-card glass-card ${s.isCurrent ? 'current-session' : ''}">
            <div class="session-icon">
              <i data-lucide="${s.device.toLowerCase().includes('mobile') ? 'smartphone' : 'laptop'}"></i>
            </div>
            <div class="session-info">
              <div class="session-title-row">
                <strong>${s.device} • ${s.browser}</strong>
                ${s.isCurrent ? '<span class="status-pill status-approved">THIS DEVICE</span>' : ''}
              </div>
              <div class="session-meta text-muted text-xs">
                <span><i data-lucide="map-pin"></i> ${s.location}</span>
                <span>• IP: ${s.ipAddress}</span>
                <span>• Last Active: ${s.lastActive}</span>
              </div>
            </div>
            ${!s.isCurrent ? `
              <button type="button" class="btn btn-secondary btn-xs btn-revoke-single-session" data-session-id="${s.id}">
                Revoke
              </button>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProfileTab(user) {
  return `
    <div class="sec-profile-view">
      <div class="form-group">
        <label class="form-label">Full Legal Name</label>
        <input type="text" class="form-input" value="${user.name}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Registered Primary Email</label>
        <input type="email" class="form-input" value="${user.email}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Assigned Platform Role</label>
        <input type="text" class="form-input" value="${user.role}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Security & Account Status</label>
        <div style="margin-top: 6px;">
          <span class="status-pill status-approved">${user.status || 'ACTIVE'}</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Last Successful Login</label>
        <input type="text" class="form-input" value="${user.lastLogin || 'Recent'}" readonly>
      </div>
    </div>
  `;
}

function attachTabEvents(modalWrap, user, render, onUpdateSuccess) {
  // Live Password Strength Meter Handler
  const newPassInput = modalWrap.querySelector('#new-password');
  if (newPassInput) {
    newPassInput.addEventListener('input', (e) => {
      const val = e.target.value;
      const strength = evaluatePasswordStrength(val);

      const bar = modalWrap.querySelector('#strength-bar');
      const label = modalWrap.querySelector('#strength-label');

      if (bar) {
        bar.style.width = `${strength.percent}%`;
        bar.style.background = strength.color;
      }
      if (label) {
        label.textContent = strength.label;
        label.style.color = strength.color;
      }

      // Update criteria icons
      strength.checks.forEach(chk => {
        const el = modalWrap.querySelector(`#crit-${chk.key.replace('has', '').toLowerCase()}`);
        if (el) {
          el.className = `crit-item ${chk.passed ? 'passed' : ''}`;
          el.innerHTML = `<i data-lucide="${chk.passed ? 'check-circle' : 'circle'}"></i> ${chk.text}`;
        }
      });
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Change Password Submission
  const changePassForm = modalWrap.querySelector('#change-pass-form');
  if (changePassForm) {
    changePassForm.onsubmit = async (e) => {
      e.preventDefault();
      const curr = modalWrap.querySelector('#curr-password').value;
      const next = modalWrap.querySelector('#new-password').value;
      const confirm = modalWrap.querySelector('#confirm-new-password').value;

      if (next !== confirm) {
        alert('❌ Error: New password and confirmation password do not match.');
        return;
      }

      const res = await authStore.changePassword(user.id, curr, next);
      if (res.success) {
        alert(res.message);
        modalWrap.classList.remove('active');
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        alert(`❌ Error: ${res.message}`);
      }
    };
  }

  // 2FA Toggle
  const toggle2FABtn = modalWrap.querySelector('#btn-toggle-2fa');
  if (toggle2FABtn) {
    toggle2FABtn.onclick = () => {
      const newState = !user.twoFactorEnabled;
      const res = authStore.toggle2FA(user.id, newState);
      if (res.success) {
        alert(`✅ Two-Factor Authentication is now ${newState ? 'ENABLED' : 'DISABLED'}.`);
        render();
      }
    };
  }

  // Regenerate Backup Codes
  const regenCodesBtn = modalWrap.querySelector('#btn-regen-recovery-codes');
  if (regenCodesBtn) {
    regenCodesBtn.onclick = () => {
      const res = authStore.generate2FARecoveryCodes(user.id);
      if (res.success) {
        alert('✅ 8 new single-use recovery codes have been generated.');
        render();
      }
    };
  }

  // Revoke other sessions
  const revokeOtherBtn = modalWrap.querySelector('#btn-revoke-other-sessions');
  if (revokeOtherBtn) {
    revokeOtherBtn.onclick = () => {
      authStore.revokeOtherSessions(user.id);
      alert('✅ All other device sessions have been terminated.');
      render();
    };
  }

  // Revoke single session
  modalWrap.querySelectorAll('.btn-revoke-single-session').forEach(btn => {
    btn.onclick = () => {
      const sId = btn.dataset.sessionId;
      authStore.revokeSession(sId);
      render();
    };
  });
}
