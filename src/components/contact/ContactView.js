// Contact & Affiliate Desk Dedicated Page View - PropPartner

export function renderContactView(container, onNavigateHome) {
  container.innerHTML = `
    <div class="legal-page-layout contact-page-layout">
      <!-- Top Navigation Header -->
      <header class="legal-page-header glass-card">
        <div class="legal-header-inner container">
          <a href="#hero" class="brand-logo brand-logo-img" id="contact-home-logo-btn" title="PropPartner">
            <img src="/assets/proppartner-icon.jpg" alt="PropPartner" class="logo-img-icon" width="36" height="36">
            <div class="logo-text">PROP<span>PARTNER</span></div>
          </a>

          <div class="legal-header-nav">
            <a href="#hero" class="btn btn-secondary btn-sm" id="btn-contact-back-home">
              <i data-lucide="arrow-left"></i> <span>Back to Home</span>
            </a>
            <a href="#register" class="btn btn-gold btn-sm" id="btn-contact-join-now">
              <i data-lucide="user-plus"></i> <span>Become an Affiliate</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Breadcrumb Bar -->
      <div class="legal-breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="#hero" id="crumb-contact-home"><i data-lucide="home"></i> Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">Affiliate Desk & Contact</span>
          </nav>
        </div>
      </div>

      <!-- Main Contact Container -->
      <main class="legal-main-container container">
        <!-- Hero Header -->
        <div class="contact-hero-banner glass-card">
          <span class="doc-category-badge"><i data-lucide="headphones"></i> DIRECT AFFILIATE SUPPORT</span>
          <h1 class="contact-main-title">PropPartner <span class="gradient-text-gold">Affiliate Desk</span></h1>
          <p class="contact-lead-text">
            Connect directly with our dedicated real estate partner consultants, developer sales liaisons, and commission settlement desk.
          </p>

          <!-- Quick Action Buttons -->
          <div class="contact-quick-actions-row">
            <a href="tel:+923228654411" class="btn btn-gold btn-lg">
              <i data-lucide="phone-call"></i> <span>CALL +92 322 865 4411</span>
            </a>
            <a href="https://wa.me/923228654411?text=Hello%20PropPartner%2C%20I%20would%20like%20information%20about%20the%20Real%20Estate%20Affiliate%20Partner%20Program." target="_blank" rel="noopener" class="btn btn-secondary btn-lg highlight-green">
              <i data-lucide="message-circle"></i> <span>WHATSAPP US</span>
            </a>
            <a href="https://www.google.com/maps/search/?api=1&query=Gatwala+Chowk+Canal+Expressway+Sheikhupura+Road+Faisalabad" target="_blank" rel="noopener" class="btn btn-secondary btn-lg">
              <i data-lucide="map-pin"></i> <span>GET DIRECTIONS</span>
            </a>
          </div>
        </div>

        <!-- Contact Grid -->
        <div class="contact-grid-2">
          <!-- Information Cards & Map -->
          <div class="contact-info-column">
            <div class="contact-card glass-card">
              <h3 class="contact-card-title"><i data-lucide="map-pin" class="text-gold"></i> Physical Headquarters</h3>
              <p class="text-muted" style="margin-top: 6px; line-height: 1.6;">
                <strong>PropPartner Regional Affiliate Desk</strong><br>
                Gatwala Chowk, Canal Expressway, Sheikhupura Road,<br>
                Faisalabad, Pakistan
              </p>
              <div style="margin-top: 14px;">
                <a href="https://www.google.com/maps/search/?api=1&query=Gatwala+Chowk+Canal+Expressway+Sheikhupura+Road+Faisalabad" target="_blank" rel="noopener" class="btn btn-secondary btn-xs">
                  <i data-lucide="external-link"></i> Open in Google Maps
                </a>
              </div>
            </div>

            <div class="contact-card glass-card">
              <h3 class="contact-card-title"><i data-lucide="phone" class="text-cyan"></i> Direct Phone & WhatsApp</h3>
              <div class="contact-line-item">
                <span class="line-label">Affiliate Helpline:</span>
                <a href="tel:+923228654411" class="line-val"><strong>+92 322 865 4411</strong></a>
              </div>
              <div class="contact-line-item">
                <span class="line-label">WhatsApp Channel:</span>
                <a href="https://wa.me/923228654411" target="_blank" rel="noopener" class="line-val text-green"><strong>+92 322 865 4411 (24/7 Verified)</strong></a>
              </div>
              <div class="contact-line-item">
                <span class="line-label">Executive Email:</span>
                <a href="mailto:llre.uae@gmail.com" class="line-val"><strong>llre.uae@gmail.com</strong></a>
              </div>
            </div>

            <!-- Map Location Card -->
            <div class="contact-card glass-card location-map-card">
              <h3 class="contact-card-title"><i data-lucide="navigation" class="text-gold"></i> Office Location</h3>
              <div class="map-preview-box">
                <div class="map-pin-indicator">
                  <i data-lucide="map-pin" class="pin-icon"></i>
                  <span>Gatwala Chowk, Faisalabad</span>
                </div>
                <p class="text-xs text-muted" style="text-align: center; margin-top: 8px;">
                  Canal Expressway & Sheikhupura Road Junction
                </p>
                <a href="https://www.google.com/maps/search/?api=1&query=Gatwala+Chowk+Canal+Expressway+Sheikhupura+Road+Faisalabad" target="_blank" rel="noopener" class="btn btn-gold btn-xs w-full" style="margin-top: 12px;">
                  <i data-lucide="map"></i> Open Interactive Map Navigation
                </a>
              </div>
            </div>
          </div>

          <!-- Contact Inquiry Form -->
          <div class="contact-form-column glass-card">
            <h3 class="contact-card-title"><i data-lucide="mail" class="text-gold"></i> Send Desk an Inquiry</h3>
            <p class="text-muted text-xs" style="margin-bottom: 20px;">
              Submit your inquiry and our affiliate relationship manager will respond within 4 business hours.
            </p>

            <form id="desk-inquiry-form" class="sec-form-wrap">
              <div class="form-group">
                <label class="form-label">Your Legal / Business Name</label>
                <input type="text" id="inq-name" class="form-input" placeholder="e.g. Tariq Mansoor" required>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="inq-email" class="form-input" placeholder="e.g. tariq@apexwealth.com" required>
              </div>

              <div class="form-group">
                <label class="form-label">WhatsApp / Contact Phone</label>
                <input type="tel" id="inq-phone" class="form-input" placeholder="+92 300 1234567" required>
              </div>

              <div class="form-group">
                <label class="form-label">Inquiry Subject</label>
                <select id="inq-subject" class="form-select">
                  <option value="AFFILIATE_PROGRAM">New Affiliate Partnership Program</option>
                  <option value="COMMISSION_PAYOUT">Commission Settlement & Payout Schedule</option>
                  <option value="PROJECT_INFO">Flagship Developments & Project Specs</option>
                  <option value="LEGAL_COMPLIANCE">Legal, Escrow & Compliance Verification</option>
                  <option value="OTHER">Other General Business Inquiries</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Your Message / Questions</label>
                <textarea id="inq-message" class="form-input" rows="4" placeholder="Describe your inquiry, prospective buyer portfolio, or required marketing kits..." required></textarea>
              </div>

              <button type="submit" class="btn btn-gold w-full" id="btn-submit-inquiry">
                <i data-lucide="send"></i> <span>SUBMIT INQUIRY TO AFFILIATE DESK</span>
              </button>
            </form>

            <div id="inquiry-success-alert" style="display: none; margin-top: 16px;">
              <div class="sec-info-banner highlight-green">
                <i data-lucide="check-circle"></i>
                <div>
                  <strong>Inquiry Dispatched Successfully!</strong>
                  <p class="text-xs text-muted" style="margin-top: 4px;">Thank you! Our relationship desk has received your request and will contact you via WhatsApp and email.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Legal Page Footer -->
      <footer class="legal-page-footer">
        <div class="container footer-bottom-bar">
          <span>© 2026 PropPartner Real Estate Affiliate Network. All rights reserved.</span>
          <div class="footer-legal-inline">
            <a href="#terms-and-conditions" class="btn-text-link">Terms & Conditions</a> •
            <a href="#affiliate-agreement" class="btn-text-link">Affiliate Agreement</a> •
            <a href="#privacy-policy" class="btn-text-link">Privacy Policy</a> •
            <a href="#commission-policy" class="btn-text-link">Commission Policy</a> •
            <a href="#referral-policy" class="btn-text-link">Referral Policy</a> •
            <a href="#disclaimer" class="btn-text-link">Disclaimer</a>
          </div>
        </div>
      </footer>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach navigation events
  const homeLogo = container.querySelector('#contact-home-logo-btn');
  const homeBtn = container.querySelector('#btn-contact-back-home');
  const crumbHome = container.querySelector('#crumb-contact-home');

  const goHome = (e) => {
    if (e) e.preventDefault();
    if (onNavigateHome) onNavigateHome();
  };

  if (homeLogo) homeLogo.onclick = goHome;
  if (homeBtn) homeBtn.onclick = goHome;
  if (crumbHome) crumbHome.onclick = goHome;

  // Form submission handler
  const form = container.querySelector('#desk-inquiry-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const successAlert = container.querySelector('#inquiry-success-alert');
      if (successAlert) {
        successAlert.style.display = 'block';
        form.reset();
        if (window.lucide) window.lucide.createIcons();
      }
    };
  }
}
