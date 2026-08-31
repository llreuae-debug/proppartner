// Auth Modal Component - Google OAuth, Super Admin (llre.uae@gmail.com), Partner Registration, Forgot/Reset Pass & First Login Password Change

import { authStore } from '../../store/authStore.js';
import { platformStore } from '../../store/platformStore.js';
import { evaluatePasswordStrength } from '../../store/cryptoUtils.js';

export function openAuthModal(initialTab = 'login', onAuthSuccess, initialData = {}) {
  let modalEl = document.getElementById('app-auth-modal-wrap');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'app-auth-modal-wrap';
    modalEl.className = 'auth-modal-backdrop';
    document.body.appendChild(modalEl);
  }

  let currentTab = initialTab; // 'login' | 'register' | 'forgot' | 'reset' | 'force_change'
  let resetToken = initialData.token || '';
  let pendingUser = initialData.user || null;

  function render() {
    modalEl.innerHTML = `
      <div class="auth-modal-dialog glass-card">
        <button type="button" class="auth-modal-close" id="auth-close-btn" aria-label="Close">
          <i data-lucide="x"></i>
        </button>

        <div class="auth-modal-header">
          <div class="auth-brand-badge">
            <img src="/assets/proppartner-icon.svg" alt="PropPartner" width="44" height="44">
          </div>
          <h3 class="auth-modal-title">PropPartner <span class="gradient-text-gold">Partner Network</span></h3>
          <p class="auth-modal-subtitle">
            ${currentTab === 'login' ? 'Access your partner dashboard, project ledgers & commission portal' : 
              currentTab === 'register' ? 'Join elite wealth advisors, consultants & real estate partners' : 
              currentTab === 'forgot' ? 'Request a secure single-use password reset link' :
              currentTab === 'force_change' ? 'For your security, you must update your password before continuing' :
              'Create a new secure password for your account'}
          </p>
        </div>

        ${currentTab === 'login' ? renderLoginForm() : ''}
        ${currentTab === 'register' ? renderRegisterForm() : ''}
        ${currentTab === 'forgot' ? renderForgotForm() : ''}
        ${currentTab === 'reset' ? renderResetForm(resetToken) : ''}
        ${currentTab === 'force_change' ? renderForceChangeForm(pendingUser) : ''}
      </div>
    `;

    modalEl.classList.add('active');
    if (window.lucide) window.lucide.createIcons();

    // Close Handler
    const closeBtn = modalEl.querySelector('#auth-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => modalEl.classList.remove('active');
    }
    modalEl.onclick = (e) => {
      if (e.target === modalEl && currentTab !== 'force_change') modalEl.classList.remove('active');
    };

    // Attach form handlers
    attachAuthHandlers();
  }

  function renderLoginForm() {
    return `
      <!-- Quick Demo Logins Banner -->
      <div class="quick-demo-accounts">
        <div class="demo-bar-title"><i data-lucide="zap"></i> 1-CLICK INSTANT DEMO ACCESS</div>
        <div class="demo-buttons-row">
          <button type="button" class="demo-pill-btn admin" id="demo-login-admin">
            <span class="role-icon">👑</span>
            <span class="role-text"><strong>Super Admin</strong> (llre.uae@gmail.com)</span>
          </button>
          <button type="button" class="demo-pill-btn partner" id="demo-login-tariq">
            <span class="role-icon">💼</span>
            <span class="role-text"><strong>Tariq M.</strong> (Platinum Partner)</span>
          </button>
          <button type="button" class="demo-pill-btn partner" id="demo-login-sarah">
            <span class="role-icon">💼</span>
            <span class="role-text"><strong>Sarah J.</strong> (Gold Partner)</span>
          </button>
        </div>
      </div>

      <div class="auth-divider"><span>OR SIGN IN WITH EMAIL</span></div>

      <!-- Email / Password Form -->
      <form id="email-login-form" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="login-email">Registered Email Address</label>
          <input type="email" id="login-email" class="form-input" placeholder="e.g. llre.uae@gmail.com" required>
        </div>

        <div class="form-group">
          <div class="label-split">
            <label class="form-label" for="login-password">Password</label>
            <a href="#forgot-password" class="forgot-link" id="link-forgot-pass">Forgot Password?</a>
          </div>
          <input type="password" id="login-password" class="form-input" placeholder="••••••••••••" required>
        </div>

        <div class="form-group-checkbox" style="margin-bottom:14px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="remember-me" checked>
            <span class="text-xs text-muted">Remember this workstation session</span>
          </label>
        </div>

        <button type="submit" class="btn btn-gold w-full" id="btn-submit-login">
          <i data-lucide="log-in"></i> <span>SECURE LOGIN</span>
        </button>
      </form>

      <!-- Google OAuth Button -->
      <div style="margin-top: 14px;">
        <button type="button" class="btn-google-auth w-full" id="google-auth-btn">
          <svg class="google-svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <div class="auth-switch-footer">
        <span>New partner?</span>
        <button type="button" class="btn-text-link switch-link" id="link-switch-register">Register as Partner →</button>
      </div>
    `;
  }

  function renderRegisterForm() {
    return `
      <form id="partner-register-form" class="auth-form">
        <div class="form-group">
          <label class="form-label">Full Legal Name <span class="text-gold">*</span></label>
          <input type="text" id="reg-fullname" class="form-input" placeholder="e.g. Tariq Mansoor" required>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address (Login ID) <span class="text-gold">*</span></label>
          <input type="email" id="reg-email" class="form-input" placeholder="e.g. tariq@apexwealth.com" required>
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number / WhatsApp <span class="text-gold">*</span></label>
          <input type="tel" id="reg-phone" class="form-input" placeholder="+971 50 123 4567" required>
        </div>

        <div class="form-group">
          <label class="form-label">Create Password (Minimum 8 Characters) <span class="text-gold">*</span></label>
          <input type="password" id="reg-pass" class="form-input" placeholder="••••••••••••" required>
          <div class="password-strength-container" id="reg-pass-strength" style="margin-top:6px;">
            <div class="strength-bar-track"><div class="strength-bar-fill" id="reg-strength-bar" style="width:0%; background:#EF4444;"></div></div>
            <span class="text-xs text-muted">Strength: <strong id="reg-strength-label" style="color:#EF4444;">Weak</strong></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password <span class="text-gold">*</span></label>
          <input type="password" id="reg-confirm-pass" class="form-input" placeholder="Re-enter password" required>
        </div>

        <div class="form-group">
          <label class="form-label">Organization / Wealth Advisory Firm (Optional)</label>
          <input type="text" id="reg-company" class="form-input" placeholder="e.g. Apex Wealth Advisors">
        </div>

        <div class="form-group-checkbox" style="margin: 12px 0 16px 0;">
          <label style="display:flex; align-items:flex-start; gap:8px; cursor:pointer; font-size:0.78rem; color:#CBD5E1;">
            <input type="checkbox" id="reg-terms-check" required style="margin-top:2px;">
            <span>I agree to the <a href="#affiliate-agreement" target="_blank" style="color:#D4AF37;">Partner Agreement</a>, <a href="#commission-policy" target="_blank" style="color:#D4AF37;">Commission Policy</a> and strict anti-spam compliance guidelines.</span>
          </label>
        </div>

        <button type="submit" class="btn btn-gold w-full" id="btn-submit-register">
          <i data-lucide="user-plus"></i> <span>CREATE PARTNER ACCOUNT & GET QR</span>
        </button>
      </form>

      <div class="auth-switch-footer">
        <span>Already registered partner?</span>
        <button type="button" class="btn-text-link switch-link" id="link-switch-login">Log In →</button>
      </div>
    `;
  }

  function renderForgotForm() {
    return `
      <form id="forgot-pass-form" class="auth-form">
        <div class="sec-info-banner">
          <i data-lucide="info"></i>
          <span>Enter your registered email address. We will generate a cryptographically secure, single-use reset token valid for 15 minutes.</span>
        </div>

        <div class="form-group">
          <label class="form-label">Registered Account Email</label>
          <input type="email" id="forgot-email" class="form-input" placeholder="e.g. llre.uae@gmail.com" required>
        </div>

        <button type="submit" class="btn btn-gold w-full" style="margin-top:10px;">
          <i data-lucide="send"></i> <span>DISPATCH PASSWORD RESET LINK</span>
        </button>

        <div id="forgot-result-box" style="display:none; margin-top:16px;"></div>
      </form>

      <div class="auth-switch-footer">
        <button type="button" class="btn-text-link switch-link" id="link-back-login">← Back to Secure Login</button>
      </div>
    `;
  }

  function renderResetForm(token) {
    return `
      <form id="reset-token-form" class="auth-form">
        <div class="sec-info-banner">
          <i data-lucide="shield-check"></i>
          <span>Single-use reset token verified. Please configure your new secure password.</span>
        </div>

        <input type="hidden" id="reset-token-val" value="${token}">

        <div class="form-group">
          <label class="form-label">New Secure Password</label>
          <input type="password" id="reset-new-pass" class="form-input" placeholder="Minimum 12 characters" required>
          <div class="password-strength-container" style="margin-top:6px;">
            <div class="strength-bar-track"><div class="strength-bar-fill" id="reset-strength-bar" style="width:0%; background:#EF4444;"></div></div>
            <span class="text-xs text-muted">Strength: <strong id="reset-strength-label" style="color:#EF4444;">Weak</strong></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input type="password" id="reset-confirm-pass" class="form-input" placeholder="Re-enter password" required>
        </div>

        <button type="submit" class="btn btn-gold w-full" style="margin-top:10px;">
          <i data-lucide="lock"></i> <span>RESET PASSWORD & SIGN IN</span>
        </button>
      </form>
    `;
  }

  function renderForceChangeForm(user) {
    return `
      <form id="force-change-form" class="auth-form">
        <div class="sec-info-banner warning">
          <i data-lucide="alert-triangle"></i>
          <span>Welcome, <strong>${user ? user.name : 'User'}</strong>! For your account security, you must create a new personal password before accessing the platform.</span>
        </div>

        <div class="form-group">
          <label class="form-label">New Secure Password</label>
          <input type="password" id="force-new-pass" class="form-input" placeholder="Minimum 12 characters" required>
          <div class="password-strength-container" style="margin-top:6px;">
            <div class="strength-bar-track"><div class="strength-bar-fill" id="force-strength-bar" style="width:0%; background:#EF4444;"></div></div>
            <span class="text-xs text-muted">Strength: <strong id="force-strength-label" style="color:#EF4444;">Weak</strong></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input type="password" id="force-confirm-pass" class="form-input" placeholder="Re-enter password" required>
        </div>

        <button type="submit" class="btn btn-gold w-full" style="margin-top:10px;">
          <i data-lucide="check-circle"></i> <span>UPDATE PASSWORD & ENTER PORTAL</span>
        </button>
      </form>
    `;
  }

  function attachAuthHandlers() {
    // Switch links
    const switchReg = modalEl.querySelector('#link-switch-register');
    if (switchReg) switchReg.onclick = () => { currentTab = 'register'; render(); };

    const switchLog = modalEl.querySelector('#link-switch-login') || modalEl.querySelector('#link-back-login');
    if (switchLog) switchLog.onclick = () => { currentTab = 'login'; render(); };

    const forgotLink = modalEl.querySelector('#link-forgot-pass');
    if (forgotLink) forgotLink.onclick = (e) => { e.preventDefault(); currentTab = 'forgot'; render(); };

    // Quick Demo Buttons
    const demoAdmin = modalEl.querySelector('#demo-login-admin');
    if (demoAdmin) demoAdmin.onclick = () => {
      const res = authStore.loginAs('admin');
      if (res.success) {
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
    };

    const demoTariq = modalEl.querySelector('#demo-login-tariq');
    if (demoTariq) demoTariq.onclick = () => {
      const res = authStore.loginAs('partnerPlatinum');
      if (res.success) {
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
    };

    const demoSarah = modalEl.querySelector('#demo-login-sarah');
    if (demoSarah) demoSarah.onclick = () => {
      const res = authStore.loginAs('partnerGold');
      if (res.success) {
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
    };

    // Google Login
    const googleBtn = modalEl.querySelector('#google-auth-btn');
    if (googleBtn) {
      googleBtn.onclick = () => {
        const res = authStore.loginWithGoogle('tariq.mansoor@apexwealth.com');
        if (res.success) {
          modalEl.classList.remove('active');
          if (onAuthSuccess) onAuthSuccess(res.user);
        }
      };
    }

    // Email Login Form
    const emailForm = modalEl.querySelector('#email-login-form');
    if (emailForm) {
      emailForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = modalEl.querySelector('#login-email').value;
        const pass = modalEl.querySelector('#login-password').value;
        const remember = modalEl.querySelector('#remember-me').checked;

        const res = await authStore.loginWithEmail(email, pass, remember);
        if (res.success) {
          if (res.mustChangePassword) {
            currentTab = 'force_change';
            pendingUser = res.user;
            render();
          } else {
            modalEl.classList.remove('active');
            if (onAuthSuccess) onAuthSuccess(res.user);
          }
        } else {
          alert(`❌ Login Failed: ${res.message}`);
        }
      };
    }

    // Partner Registration Form
    const registerForm = modalEl.querySelector('#partner-register-form');
    if (registerForm) {
      const regPassInput = modalEl.querySelector('#reg-pass');
      regPassInput.oninput = (e) => {
        const str = evaluatePasswordStrength(e.target.value);
        const bar = modalEl.querySelector('#reg-strength-bar');
        const lbl = modalEl.querySelector('#reg-strength-label');
        if (bar) { bar.style.width = `${str.percent}%`; bar.style.background = str.color; }
        if (lbl) { lbl.textContent = str.label; lbl.style.color = str.color; }
      };

      registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = modalEl.querySelector('#reg-fullname').value;
        const email = modalEl.querySelector('#reg-email').value;
        const phone = modalEl.querySelector('#reg-phone').value;
        const pass = modalEl.querySelector('#reg-pass').value;
        const confirmPass = modalEl.querySelector('#reg-confirm-pass').value;
        const company = modalEl.querySelector('#reg-company').value;
        const termsAccepted = modalEl.querySelector('#reg-terms-check').checked;

        if (pass !== confirmPass) {
          alert('❌ Passwords do not match. Please re-enter your password.');
          return;
        }

        const res = await authStore.registerPartner({
          name,
          email,
          phone,
          password: pass,
          termsAccepted,
          referralSource: company || 'Direct Partner Registration'
        });

        if (!res.success) {
          alert(`❌ Registration Error: ${res.message}`);
          return;
        }

        platformStore.addAffiliate({
          id: res.partnerId,
          referralCode: res.referralCode,
          name,
          email,
          phone,
          company,
          tier: 'Platinum',
          status: 'Approved',
          commissionRate: 3.5,
          notes: 'Self-registered partner.'
        });

        alert(`🎉 Welcome to PropPartner Network, ${name}!\n\nYour Unique Partner ID: ${res.partnerId}\nReferral Code: ${res.referralCode}\nYour Referral URL: ${res.referralUrl}\n\nYour live scannable QR Code and Partner Dashboard are now active!`);
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(res.user);
      };
    }

    // Forgot Password Form
    const forgotForm = modalEl.querySelector('#forgot-pass-form');
    if (forgotForm) {
      forgotForm.onsubmit = (e) => {
        e.preventDefault();
        const email = modalEl.querySelector('#forgot-email').value;
        const res = authStore.requestPasswordReset(email);

        const resBox = modalEl.querySelector('#forgot-result-box');
        if (resBox) {
          resBox.style.display = 'block';
          resBox.innerHTML = `
            <div class="sec-info-banner highlight-green">
              <i data-lucide="check-circle"></i>
              <div>
                <strong>${res.message}</strong>
                <p class="text-xs text-muted" style="margin-top:4px;">Demo Simulation: Click below to test password reset directly with the single-use token:</p>
                <button type="button" class="btn btn-gold btn-xs" id="btn-demo-test-reset" style="margin-top:6px;">
                  Open Password Reset Page (${res.token.substring(0, 8)}...)
                </button>
              </div>
            </div>
          `;
          if (window.lucide) window.lucide.createIcons();

          const testBtn = modalEl.querySelector('#btn-demo-test-reset');
          if (testBtn) {
            testBtn.onclick = () => {
              currentTab = 'reset';
              resetToken = res.token;
              render();
            };
          }
        }
      };
    }

    // Reset Token Password Form
    const resetForm = modalEl.querySelector('#reset-token-form');
    if (resetForm) {
      const resetPassInput = modalEl.querySelector('#reset-new-pass');
      resetPassInput.oninput = (e) => {
        const str = evaluatePasswordStrength(e.target.value);
        const bar = modalEl.querySelector('#reset-strength-bar');
        const lbl = modalEl.querySelector('#reset-strength-label');
        if (bar) { bar.style.width = `${str.percent}%`; bar.style.background = str.color; }
        if (lbl) { lbl.textContent = str.label; lbl.style.color = str.color; }
      };

      resetForm.onsubmit = async (e) => {
        e.preventDefault();
        const token = modalEl.querySelector('#reset-token-val').value;
        const newPass = modalEl.querySelector('#reset-new-pass').value;
        const confirmPass = modalEl.querySelector('#reset-confirm-pass').value;

        if (newPass !== confirmPass) {
          alert('❌ Error: Passwords do not match.');
          return;
        }

        const res = await authStore.resetPasswordWithToken(token, newPass);
        if (res.success) {
          alert(`✅ ${res.message}`);
          currentTab = 'login';
          render();
        } else {
          alert(`❌ ${res.message}`);
        }
      };
    }

    // Force Change Form (First Login)
    const forceForm = modalEl.querySelector('#force-change-form');
    if (forceForm) {
      const forcePassInput = modalEl.querySelector('#force-new-pass');
      forcePassInput.oninput = (e) => {
        const str = evaluatePasswordStrength(e.target.value);
        const bar = modalEl.querySelector('#force-strength-bar');
        const lbl = modalEl.querySelector('#force-strength-label');
        if (bar) { bar.style.width = `${str.percent}%`; bar.style.background = str.color; }
        if (lbl) { lbl.textContent = str.label; lbl.style.color = str.color; }
      };

      forceForm.onsubmit = async (e) => {
        e.preventDefault();
        const newPass = modalEl.querySelector('#force-new-pass').value;
        const confirmPass = modalEl.querySelector('#force-confirm-pass').value;

        if (newPass !== confirmPass) {
          alert('❌ Error: Passwords do not match.');
          return;
        }

        const res = await authStore.changePassword(pendingUser.id, '', newPass);
        if (res.success) {
          alert('✅ Password updated successfully! Access granted.');
          modalEl.classList.remove('active');
          if (onAuthSuccess) onAuthSuccess(pendingUser);
        } else {
          alert(`❌ ${res.message}`);
        }
      };
    }
  }

  render();
}
