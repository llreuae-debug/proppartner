// PropPartner Inbound Referral Tracking & Attribution Engine
// Detects, validates, attributes, and persists member referral traffic with 90-day window

import { platformStore } from '../store/platformStore.js';

const REFERRAL_STORAGE_KEY = 'proppartner_referral_attribution';
const ATTRIBUTION_WINDOW_DAYS = 90;

export class ReferralTracker {
  static init() {
    this.processInboundReferral();
    this.bindAutoFillToForms();
  }

  /**
   * Inspect current URL for referral query parameter or path segment
   * Handles: ?ref=AFF-000101, ?referral=AFF-000101, #ref=AFF-000101, and /ref/AFF-000101
   */
  static processInboundReferral() {
    let rawRefCode = null;

    // 1. Check Query Parameters (?ref=... or ?referral=...)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('ref')) {
      rawRefCode = urlParams.get('ref');
    } else if (urlParams.has('referral')) {
      rawRefCode = urlParams.get('referral');
    }

    // 2. Check Hash (?ref=... inside hash router or #ref=...)
    if (!rawRefCode && window.location.hash) {
      const hash = window.location.hash;
      const match = hash.match(/[?&#]ref=([^&#]+)/i);
      if (match && match[1]) {
        rawRefCode = decodeURIComponent(match[1]);
      }
    }

    // 3. Check Path Segment (/ref/AFF-000101)
    if (!rawRefCode && window.location.pathname.includes('/ref/')) {
      const parts = window.location.pathname.split('/ref/');
      if (parts[1]) {
        rawRefCode = parts[1].split('/')[0].split('?')[0];
      }
    }

    if (!rawRefCode) return;

    const cleanCode = rawRefCode.trim().toUpperCase();
    this.recordReferralAttribution(cleanCode);
  }

  /**
   * Validate and record the referral attribution
   * @param {string} referralCode 
   */
  static recordReferralAttribution(referralCode) {
    // Lookup affiliate in store
    const affiliate = platformStore.affiliates.find(
      a => (a.id && a.id.toUpperCase() === referralCode) ||
           (a.referralCode && a.referralCode.toUpperCase() === referralCode)
    );

    if (!affiliate) {
      console.warn(`[ReferralTracker] Inbound referral code "${referralCode}" is invalid or inactive.`);
      return;
    }

    // Check if affiliate is approved
    if (affiliate.status !== 'Approved') {
      console.warn(`[ReferralTracker] Affiliate "${affiliate.id}" is not approved (${affiliate.status}). Referral ignored.`);
      return;
    }

    const now = Date.now();
    const expiresAt = now + (ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const attributionData = {
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
      referralCode: affiliate.referralCode || affiliate.id,
      capturedAt: now,
      expiresAt: expiresAt,
      landingUrl: window.location.href,
      referrer: document.referrer || 'Direct / QR Scan'
    };

    // Save to LocalStorage
    try {
      localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(attributionData));
    } catch (e) {
      console.warn('[ReferralTracker] Could not save attribution to localStorage', e);
    }

    // Increment click/visit analytics in platformStore
    platformStore.recordReferralVisit(affiliate.id, {
      landingUrl: window.location.pathname + window.location.search,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });

    // Notify UI with luxury verified badge
    this.showAttributionBadge(affiliate);
  }

  /**
   * Retrieve active stored referral attribution if valid and unexpired
   * @returns {Object|null}
   */
  static getActiveAttribution() {
    try {
      const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(REFERRAL_STORAGE_KEY);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  /**
   * Display floating verification toast for user
   * @param {Object} affiliate 
   */
  static showAttributionBadge(affiliate) {
    // Avoid duplicate toast if already shown in this session
    if (sessionStorage.getItem('proppartner_ref_toast_shown')) return;
    sessionStorage.setItem('proppartner_ref_toast_shown', '1');

    const toast = document.createElement('div');
    toast.className = 'ref-attribution-toast glass-card';
    toast.innerHTML = `
      <div class="ref-toast-icon"><i data-lucide="shield-check"></i></div>
      <div class="ref-toast-content">
        <div class="ref-toast-title">Verified Partner Introduction</div>
        <div class="ref-toast-sub">Referred by <strong>${affiliate.name}</strong> (${affiliate.id}). 90-day institutional escrow attribution active.</div>
      </div>
      <button type="button" class="ref-toast-close" aria-label="Dismiss">&times;</button>
    `;

    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => toast.classList.add('visible'), 200);

    const closeBtn = toast.querySelector('.ref-toast-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
      };
    }

    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
      }
    }, 8000);
  }

  /**
   * Automatically pre-fill referral code input fields across forms
   */
  static bindAutoFillToForms() {
    const applyAttribution = () => {
      const active = this.getActiveAttribution();
      if (!active) return;

      const codeInputs = document.querySelectorAll('#reg-code, [name="referralCode"], .referral-code-input');
      codeInputs.forEach(input => {
        if (!input.value) {
          input.value = active.referralCode || active.affiliateId;
          input.classList.add('auto-attributed');
        }
      });
    };

    applyAttribution();
    window.addEventListener('hashchange', () => setTimeout(applyAttribution, 100));
  }
}
