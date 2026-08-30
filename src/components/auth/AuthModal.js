// Auth Modal Component - Google OAuth, Email/Pass, Quick Demo Logins & Onboarding

import { authStore } from '../../store/authStore.js';
import { platformStore } from '../../store/platformStore.js';

export function openAuthModal(initialTab = 'login', onAuthSuccess) {
  let modalEl = document.getElementById('app-auth-modal-wrap');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'app-auth-modal-wrap';
    modalEl.className = 'auth-modal-backdrop';
    document.body.appendChild(modalEl);
  }

  let currentTab = initialTab; // 'login' | 'register' | 'forgot'

  function render() {
    modalEl.innerHTML = `
      <div class="auth-modal-dialog glass-card">
        <button type="button" class="auth-modal-close" id="auth-close-btn" aria-label="Close">
          <i data-lucide="x"></i>
        </button>

        <div class="auth-modal-header">
          <div class="auth-brand-badge">
            <img src="/assets/proppartner-icon.jpg" alt="PropPartner" width="44" height="44">
          </div>
          <h3 class="auth-modal-title">PropPartner <span class="gradient-text-gold">Partner Network</span></h3>
          <p class="auth-modal-subtitle">
            ${currentTab === 'login' ? 'Access your partner dashboard, project ledgers & commission portal' : 
              currentTab === 'register' ? 'Join elite wealth advisors, consultants & real estate partners' : 
              'Reset your partner portal access password'}
          </p>
        </div>

        ${currentTab === 'login' ? `
          <!-- Quick Demo Logins Banner -->
          <div class="quick-demo-accounts">
            <div class="demo-bar-title"><i data-lucide="zap"></i> 1-CLICK INSTANT DEMO ACCESS</div>
            <div class="demo-buttons-row">
              <button type="button" class="demo-pill-btn admin" id="demo-login-admin">
                <span class="role-icon">👑</span>
                <span class="role-text"><strong>Super Admin</strong> (Full Control)</span>
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

          <div class="auth-divider"><span>OR SIGN IN WITH</span></div>

          <!-- Google OAuth Button -->
          <button type="button" class="btn-google-auth" id="google-auth-btn">
            <svg class="google-svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <!-- Email / Password Form -->
          <form id="email-login-form" class="auth-form">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="login-email" class="form-input" placeholder="admin@proppartner.network" required value="admin@proppartner.network">
            </div>
            <div class="form-group">
              <div class="label-split">
                <label class="form-label">Password</label>
                <a href="#" class="forgot-link" id="goto-forgot">Forgot?</a>
              </div>
              <input type="password" id="login-password" class="form-input" placeholder="••••••••••••" required value="PropPartner2026!">
            </div>
            <button type="submit" class="btn btn-gold w-full btn-lg" style="margin-top: 10px;">
              <i data-lucide="log-in"></i>
              <span>SIGN IN TO PORTAL</span>
            </button>
          </form>

          <div class="auth-switch-footer">
            <span>New affiliate partner?</span>
            <a href="#" class="switch-link" id="goto-register">Apply for Partner Access</a>
          </div>
        ` : currentTab === 'register' ? `
          <!-- Registration Form -->
          <form id="partner-register-form" class="auth-form">
            <div class="form-group">
              <label class="form-label">Full Legal Name <span class="req">*</span></label>
              <input type="text" id="reg-name" class="form-input" placeholder="e.g. Tariq Mansoor" required>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Email Address <span class="req">*</span></label>
                <input type="email" id="reg-email" class="form-input" placeholder="name@domain.com" required>
              </div>
              <div class="form-group">
                <label class="form-label">Phone / WhatsApp <span class="req">*</span></label>
                <input type="tel" id="reg-phone" class="form-input" placeholder="+92 300 1234567" required>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Country</label>
                <select id="reg-country" class="form-select">
                  <option value="Pakistan" selected>Pakistan</option>
                  <option value="UAE">United Arab Emirates</option>
                  <option value="UK">United Kingdom</option>
                  <option value="USA">United States</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Profession / Company</label>
                <input type="text" id="reg-company" class="form-input" placeholder="e.g. Apex Wealth Management">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Create Secure Password <span class="req">*</span></label>
              <input type="password" id="reg-password" class="form-input" placeholder="Min. 8 characters" required minlength="6">
            </div>
            <div class="form-group">
              <label class="form-checkbox-row">
                <input type="checkbox" id="reg-terms-check" required checked>
                <span>I accept the <a href="#" class="accent-gold">Affiliate Agreement</a> and compliance policies.</span>
              </label>
            </div>
            <button type="submit" class="btn btn-gold w-full btn-lg">
              <i data-lucide="user-plus"></i>
              <span>SUBMIT PARTNER APPLICATION</span>
            </button>
          </form>

          <div class="auth-switch-footer">
            <span>Already have an approved account?</span>
            <a href="#" class="switch-link" id="goto-login">Sign in here</a>
          </div>
        ` : `
          <!-- Forgot Password View -->
          <form id="forgot-password-form" class="auth-form">
            <div class="form-group">
              <label class="form-label">Registered Partner Email</label>
              <input type="email" id="forgot-email" class="form-input" placeholder="name@company.com" required>
            </div>
            <p class="auth-helper-text">
              We'll send a secure password recovery code to your registered email address.
            </p>
            <button type="submit" class="btn btn-gold w-full btn-lg">
              <i data-lucide="send"></i>
              <span>SEND RECOVERY LINK</span>
            </button>
          </form>

          <div class="auth-switch-footer">
            <a href="#" class="switch-link" id="back-to-login">← Back to Sign In</a>
          </div>
        `}
      </div>
    `;

    modalEl.classList.add('active');
    if (window.lucide) window.lucide.createIcons();

    // Attach listeners
    const closeBtn = document.getElementById('auth-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modalEl.classList.remove('active');
      });
    }

    modalEl.onclick = (e) => {
      if (e.target === modalEl) modalEl.classList.remove('active');
    };

    // Quick demo logins
    const adminBtn = document.getElementById('demo-login-admin');
    if (adminBtn) {
      adminBtn.onclick = () => {
        authStore.loginAs('admin');
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(authStore.getUser());
      };
    }

    const tariqBtn = document.getElementById('demo-login-tariq');
    if (tariqBtn) {
      tariqBtn.onclick = () => {
        authStore.loginAs('partnerPlatinum');
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(authStore.getUser());
      };
    }

    const sarahBtn = document.getElementById('demo-login-sarah');
    if (sarahBtn) {
      sarahBtn.onclick = () => {
        authStore.loginAs('partnerGold');
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(authStore.getUser());
      };
    }

    // Google Auth
    const googleBtn = document.getElementById('google-auth-btn');
    if (googleBtn) {
      googleBtn.onclick = () => {
        authStore.loginWithGoogle();
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(authStore.getUser());
      };
    }

    // Email Login form
    const loginForm = document.getElementById('email-login-form');
    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        authStore.loginWithEmail(email, pass);
        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(authStore.getUser());
      };
    }

    // Registration Form
    const regForm = document.getElementById('partner-register-form');
    if (regForm) {
      regForm.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const country = document.getElementById('reg-country').value;
        const company = document.getElementById('reg-company').value;

        const res = authStore.registerPartner({
          fullName: name,
          email,
          phone,
          country,
          company,
          profession: company || 'Property Consultant'
        });

        // Also add affiliate entry to platformStore
        platformStore.affiliates.unshift({
          id: res.affiliateId,
          name,
          email,
          phone,
          whatsapp: phone,
          country,
          city: 'Karachi',
          profession: company || 'Real Estate Partner',
          company,
          tier: 'Silver',
          status: 'Pending',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          bankName: 'Pending Setup',
          accountNumber: 'N/A',
          accountTitle: name,
          taxId: 'Pending',
          registeredDate: new Date().toISOString().split('T')[0],
          totalReferrals: 0,
          qualifiedLeads: 0,
          successfulSales: 0,
          conversionRate: '0.0%'
        });
        platformStore.save();

        modalEl.classList.remove('active');
        if (onAuthSuccess) onAuthSuccess(authStore.getUser());
      };
    }

    // Navigation switches
    const gotoReg = document.getElementById('goto-register');
    if (gotoReg) {
      gotoReg.onclick = (e) => {
        e.preventDefault();
        currentTab = 'register';
        render();
      };
    }

    const gotoLogin = document.getElementById('goto-login');
    if (gotoLogin) {
      gotoLogin.onclick = (e) => {
        e.preventDefault();
        currentTab = 'login';
        render();
      };
    }

    const gotoForgot = document.getElementById('goto-forgot');
    if (gotoForgot) {
      gotoForgot.onclick = (e) => {
        e.preventDefault();
        currentTab = 'forgot';
        render();
      };
    }

    const backToLogin = document.getElementById('back-to-login');
    if (backToLogin) {
      backToLogin.onclick = (e) => {
        e.preventDefault();
        currentTab = 'login';
        render();
      };
    }
  }

  render();
}
