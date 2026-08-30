// High-Converting Affiliate Registration Form with Validation and Confetti Celebration

import confetti from 'canvas-confetti';

export function initRegistrationForm(formElement, successContainer, showToastCallback) {
  if (!formElement) return;

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = formElement.querySelector('#reg-fullname')?.value.trim();
    const email = formElement.querySelector('#reg-email')?.value.trim();
    const phone = formElement.querySelector('#reg-phone')?.value.trim();
    const terms = formElement.querySelector('#reg-terms')?.checked;

    if (!fullName || !email || !phone) {
      if (showToastCallback) showToastCallback('Please complete all required fields.', 'error');
      return;
    }

    if (!terms) {
      if (showToastCallback) showToastCallback('Please accept the Affiliate Terms & Privacy Policy to proceed.', 'error');
      return;
    }

    // Submit state animation
    const submitBtn = formElement.querySelector('#reg-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> <span>PROCESSING APPLICATION...</span>`;

    setTimeout(() => {
      // Trigger Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#00F2FE', '#10B981', '#FFFFFF']
      });

      const partnerId = `NX-${Math.floor(100000 + Math.random() * 900000)}`;

      if (successContainer) {
        formElement.style.display = 'none';
        successContainer.style.display = 'block';
        successContainer.innerHTML = `
          <div class="registration-success-card glass-card">
            <div class="success-brand-logo">
              <img src="/assets/proppartner-logo.png" alt="PropPartner" class="success-logo-img" width="220" loading="lazy">
            </div>
            <div class="success-icon-badge">
              <i data-lucide="check-circle-2"></i>
            </div>
            <span class="success-eyebrow">APPLICATION CONFIRMED</span>
            <h3 class="success-title">Welcome to the PropPartner Network, ${fullName}!</h3>
            <p class="success-desc">
              Your application has been received and prioritized. Your provisional Affiliate Partner ID is <strong>${partnerId}</strong>.
            </p>

            <div class="success-steps-box">
              <div class="s-step">
                <div class="s-step-num">1</div>
                <div>
                  <strong>Verification in Progress</strong>
                  <p>Our affiliate desk will review your profile within 12–24 hours.</p>
                </div>
              </div>
              <div class="s-step">
                <div class="s-step-num">2</div>
                <div>
                  <strong>Dashboard Access Sent</strong>
                  <p>Check your inbox at <strong>${email}</strong> for activation credentials.</p>
                </div>
              </div>
              <div class="s-step">
                <div class="s-step-num">3</div>
                <div>
                  <strong>Dedicated Concierge</strong>
                  <p>An assigned Partner Manager will contact you via WhatsApp (+${phone}).</p>
                </div>
              </div>
            </div>

            <div class="success-actions">
              <a href="#projects" class="btn btn-gold" id="explore-projects-after-reg">
                <i data-lucide="compass"></i>
                <span>EXPLORE ACTIVE PROJECTS</span>
              </a>
              <button type="button" class="btn btn-secondary" id="reset-reg-form-btn">
                <i data-lucide="refresh-cw"></i>
                <span>Submit Another Application</span>
              </button>
            </div>
          </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        successContainer.querySelector('#reset-reg-form-btn')?.addEventListener('click', () => {
          formElement.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          formElement.style.display = 'block';
          successContainer.style.display = 'none';
        });

        successContainer.querySelector('#explore-projects-after-reg')?.addEventListener('click', () => {
          document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
        });
      }

      if (showToastCallback) {
        showToastCallback('Application submitted successfully! Check your email.');
      }
    }, 1200);
  });
}
