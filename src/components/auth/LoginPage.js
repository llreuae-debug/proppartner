// Private Authenticated ERP & Partner Portal Login Gateway

import { authStore } from '../../store/authStore.js';
import { evaluatePasswordStrength } from '../../store/cryptoUtils.js';

export function renderLoginPage(container, onLoginSuccess) {
  let viewState = 'login'; // 'login' | 'forgot' | 'reset' | 'force_change'
  let resetToken = '';
  let pendingUser = null;
  let errorMessage = '';
  let successMessage = '';

  // Check for logout flash confirmation
  try {
    const flashLogout = sessionStorage.getItem('proppartner_logout_msg');
    if (flashLogout) {
      successMessage = flashLogout;
      sessionStorage.removeItem('proppartner_logout_msg');
    }
  } catch (e) {}

  function render() {
    container.innerHTML = `
      <div class="private-login-wrapper" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 10%, rgba(212, 175, 55, 0.08), #080B11 75%); padding: 24px;">
        <div class="login-card-dialog glass-card" style="width: 100%; max-width: 480px; padding: 36px; border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.25); box-shadow: 0 20px 50px rgba(0,0,0,0.6); position: relative;">
          
          <!-- Brand Badge -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 16px; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); margin-bottom: 12px;">
              <img src="/assets/proppartner-icon.svg" alt="PropPartner" width="40" height="40">
            </div>
            <h1 style="font-size: 1.4rem; font-weight: 700; color: #FFFFFF; margin: 0 0 4px 0; letter-spacing: -0.02em;">
              PropPartner <span class="gradient-text-gold">Private ERP</span>
            </h1>
            <p style="font-size: 0.85rem; color: #94A3B8; margin: 0;">
              Commercial Real Estate Management & Partner Portal
            </p>
            <div style="display: inline-block; margin-top: 8px; font-size: 0.72rem; color: #D4AF37; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; background: rgba(212, 175, 55, 0.1); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.2);">
              Authorized Access Only
            </div>
          </div>

          <!-- Alert Messages -->
          ${errorMessage ? `
            <div class="auth-feedback error" style="display: block; margin-bottom: 16px; padding: 10px; border-radius: 8px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #FCA5A5; font-size: 0.85rem;">
              <i data-lucide="alert-circle"></i> ${errorMessage}
            </div>
          ` : ''}

          ${successMessage ? `
            <div class="auth-feedback success" style="display: block; margin-bottom: 16px; padding: 10px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #6EE7B7; font-size: 0.85rem;">
              <i data-lucide="check-circle-2"></i> ${successMessage}
            </div>
          ` : ''}

          <!-- View Body -->
          ${viewState === 'login' ? renderLoginForm() : ''}
          ${viewState === 'forgot' ? renderForgotForm() : ''}
          ${viewState === 'reset' ? renderResetForm() : ''}
          ${viewState === 'force_change' ? renderForceChangeForm() : ''}

          <!-- Footer Note -->
          <div style="text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; font-size: 0.75rem; color: #64748B;">
            PropPartner ERP · Gatwala Commercial Hub & Dragon Souk Ecosystem
            <div style="margin-top: 4px;">Accounts are provisioned by Super Admin · No public registration</div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    attachListeners();
  }

  function renderLoginForm() {
    return `
      <!-- Fast 1-Click Demo Accounts -->
      <div class="quick-demo-accounts" style="margin-bottom: 20px;">
        <div class="demo-bar-title" style="font-size: 0.75rem; font-weight: 600; color: #D4AF37; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="zap" style="width: 14px; height: 14px;"></i> QUICK SELECT ACCOUNT FOR TESTING
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <button type="button" class="demo-pill-btn admin" id="btn-demo-admin" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; color: #FFFFFF; cursor: pointer; text-align: left;">
            <span style="font-size: 1.1rem;">👑</span>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.85rem; color: #D4AF37;">Super Admin ERP</div>
              <div style="font-size: 0.75rem; color: #94A3B8;">llre.uae@gmail.com</div>
            </div>
            <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #94A3B8;"></i>
          </button>
          <button type="button" class="demo-pill-btn partner" id="btn-demo-partner" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.25); border-radius: 8px; color: #FFFFFF; cursor: pointer; text-align: left;">
            <span style="font-size: 1.1rem;">💼</span>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.85rem; color: #00F2FE;">Tariq Mansoor (Platinum Partner)</div>
              <div style="font-size: 0.75rem; color: #94A3B8;">tariq.mansoor@apexwealth.com · AFF-000101</div>
            </div>
            <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #94A3B8;"></i>
          </button>
        </div>
      </div>

      <div class="auth-divider" style="display: flex; align-items: center; text-align: center; color: #64748B; font-size: 0.75rem; margin: 16px 0;">
        <span style="flex: 1; border-bottom: 1px solid rgba(255,255,255,0.08);"></span>
        <span style="padding: 0 10px;">OR SIGN IN WITH CREDENTIALS</span>
        <span style="flex: 1; border-bottom: 1px solid rgba(255,255,255,0.08);"></span>
      </div>

      <form id="erp-login-form" class="auth-form">
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="display: block; font-size: 0.8rem; color: #CBD5E1; margin-bottom: 6px;">Email Address / Username</label>
          <input type="email" id="login-email-input" class="form-input" placeholder="e.g. llre.uae@gmail.com" required style="width: 100%;">
        </div>

        <div class="form-group" style="margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="form-label" style="font-size: 0.8rem; color: #CBD5E1; margin: 0;">Password</label>
            <button type="button" class="btn-link" id="link-goto-forgot" style="background: none; border: none; color: #D4AF37; font-size: 0.78rem; cursor: pointer; padding: 0;">Forgot Password?</button>
          </div>
          <input type="password" id="login-pass-input" class="form-input" placeholder="••••••••••••" required style="width: 100%;">
        </div>

        <button type="submit" class="btn btn-gold" id="btn-submit-login" style="width: 100%; justify-content: center; padding: 12px; font-weight: 600; letter-spacing: 0.05em;">
          <i data-lucide="lock"></i> <span>SECURE SIGN IN</span>
        </button>
      </form>
    `;
  }

  function renderForgotForm() {
    return `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 1.1rem; color: #FFFFFF; margin: 0 0 6px 0;">Reset ERP Password</h2>
        <p style="font-size: 0.82rem; color: #94A3B8; margin: 0;">Enter your verified account email to request a secure 15-minute reset token.</p>
      </div>

      <form id="erp-forgot-form" class="auth-form">
        <div class="form-group" style="margin-bottom: 18px;">
          <label class="form-label" style="display: block; font-size: 0.8rem; color: #CBD5E1; margin-bottom: 6px;">Account Email</label>
          <input type="email" id="forgot-email-input" class="form-input" placeholder="e.g. llre.uae@gmail.com" required style="width: 100%;">
        </div>

        <button type="submit" class="btn btn-gold" style="width: 100%; justify-content: center; padding: 12px; margin-bottom: 10px;">
          <span>Generate Reset Token</span>
        </button>

        <button type="button" class="btn btn-secondary" id="btn-back-to-login" style="width: 100%; justify-content: center;">
          <span>Back to Sign In</span>
        </button>
      </form>
    `;
  }

  function renderResetForm() {
    return `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 1.1rem; color: #FFFFFF; margin: 0 0 6px 0;">Set New Secure Password</h2>
        <p style="font-size: 0.82rem; color: #94A3B8; margin: 0;">Token: <code>${resetToken || 'ACTIVE-SESSION'}</code></p>
      </div>

      <form id="erp-reset-form" class="auth-form">
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="display: block; font-size: 0.8rem; color: #CBD5E1; margin-bottom: 6px;">New Password</label>
          <input type="password" id="reset-new-pass" class="form-input" placeholder="Min. 8 chars with mixed case & numbers" required style="width: 100%;">
        </div>

        <div class="form-group" style="margin-bottom: 18px;">
          <label class="form-label" style="display: block; font-size: 0.8rem; color: #CBD5E1; margin-bottom: 6px;">Confirm New Password</label>
          <input type="password" id="reset-confirm-pass" class="form-input" placeholder="Re-type new password" required style="width: 100%;">
        </div>

        <button type="submit" class="btn btn-gold" style="width: 100%; justify-content: center; padding: 12px; margin-bottom: 10px;">
          <span>Update Password & Enter ERP</span>
        </button>
      </form>
    `;
  }

  function renderForceChangeForm() {
    return `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 1.1rem; color: #D4AF37; margin: 0 0 6px 0;">First-Time Login Security Setup</h2>
        <p style="font-size: 0.82rem; color: #94A3B8; margin: 0;">You are signing in with a temporary administrative password. Please establish a private password to continue.</p>
      </div>

      <form id="erp-force-change-form" class="auth-form">
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="display: block; font-size: 0.8rem; color: #CBD5E1; margin-bottom: 6px;">New Password</label>
          <input type="password" id="force-new-pass" class="form-input" placeholder="Min 8 characters" required style="width: 100%;">
        </div>

        <div class="form-group" style="margin-bottom: 18px;">
          <label class="form-label" style="display: block; font-size: 0.8rem; color: #CBD5E1; margin-bottom: 6px;">Confirm New Password</label>
          <input type="password" id="force-confirm-pass" class="form-input" placeholder="Re-type password" required style="width: 100%;">
        </div>

        <button type="submit" class="btn btn-gold" style="width: 100%; justify-content: center; padding: 12px;">
          <span>Establish Password & Open Portal</span>
        </button>
      </form>
    `;
  }

  function attachListeners() {
    // Quick Demo Buttons
    const demoAdmin = container.querySelector('#btn-demo-admin');
    if (demoAdmin) {
      demoAdmin.onclick = async () => {
        errorMessage = '';
        const res = await authStore.loginWithEmail('llre.uae@gmail.com', '786Pro786');
        if (res.success) {
          onLoginSuccess(res.user);
        } else {
          errorMessage = res.message || 'Login failed';
          render();
        }
      };
    }

    const demoPartner = container.querySelector('#btn-demo-partner');
    if (demoPartner) {
      demoPartner.onclick = async () => {
        errorMessage = '';
        const res = await authStore.loginWithEmail('tariq.mansoor@apexwealth.com', 'Partner2026!');
        if (res.success) {
          onLoginSuccess(res.user);
        } else {
          errorMessage = res.message || 'Partner login failed';
          render();
        }
      };
    }

    // Forgot Password navigation
    const forgotLink = container.querySelector('#link-goto-forgot');
    if (forgotLink) {
      forgotLink.onclick = () => {
        errorMessage = '';
        successMessage = '';
        viewState = 'forgot';
        render();
      };
    }

    const backToLogin = container.querySelector('#btn-back-to-login');
    if (backToLogin) {
      backToLogin.onclick = () => {
        errorMessage = '';
        successMessage = '';
        viewState = 'login';
        render();
      };
    }

    // Login Form Submit
    const loginForm = container.querySelector('#erp-login-form');
    if (loginForm) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        errorMessage = '';
        successMessage = '';
        const email = container.querySelector('#login-email-input').value.trim();
        const pass = container.querySelector('#login-pass-input').value;

        const res = await authStore.loginWithEmail(email, pass);
        if (res.success) {
          if (res.mustChangePassword) {
            pendingUser = res.user;
            viewState = 'force_change';
            render();
          } else {
            onLoginSuccess(res.user);
          }
        } else {
          errorMessage = res.message || 'Invalid email or password.';
          render();
        }
      };
    }

    // Forgot Form Submit
    const forgotForm = container.querySelector('#erp-forgot-form');
    if (forgotForm) {
      forgotForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = container.querySelector('#forgot-email-input').value.trim();
        const res = await authStore.requestPasswordReset(email);
        if (res.success) {
          successMessage = `Reset token issued: ${res.token}. Please set a new password below.`;
          resetToken = res.token;
          viewState = 'reset';
          render();
        } else {
          errorMessage = res.message || 'Email not recognized.';
          render();
        }
      };
    }

    // Reset Form Submit
    const resetForm = container.querySelector('#erp-reset-form');
    if (resetForm) {
      resetForm.onsubmit = async (e) => {
        e.preventDefault();
        const newPass = container.querySelector('#reset-new-pass').value;
        const confirmPass = container.querySelector('#reset-confirm-pass').value;

        if (newPass !== confirmPass) {
          errorMessage = 'Passwords do not match.';
          render();
          return;
        }

        const res = await authStore.resetPasswordWithToken(resetToken, newPass);
        if (res.success) {
          successMessage = 'Password updated successfully! Please sign in.';
          viewState = 'login';
          render();
        } else {
          errorMessage = res.message || 'Password reset failed.';
          render();
        }
      };
    }

    // Force Change Form Submit
    const forceForm = container.querySelector('#erp-force-change-form');
    if (forceForm) {
      forceForm.onsubmit = async (e) => {
        e.preventDefault();
        const newPass = container.querySelector('#force-new-pass').value;
        const confirmPass = container.querySelector('#force-confirm-pass').value;

        if (newPass !== confirmPass) {
          errorMessage = 'Passwords do not match.';
          render();
          return;
        }

        const res = await authStore.forcePasswordChange(pendingUser.id, newPass);
        if (res.success) {
          onLoginSuccess(res.user);
        } else {
          errorMessage = res.message || 'Password change failed.';
          render();
        }
      };
    }
  }

  render();
}
