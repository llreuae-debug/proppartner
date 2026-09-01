// Logout Confirmation Modal - Professional, Secure & Accessible Sign Out Dialog

import { authStore } from '../../store/authStore.js';
import { evaluateRouting } from '../../main.js';

/**
 * Opens the Logout Confirmation Modal
 * @param {Object} options
 * @param {HTMLElement} [options.triggerElement] - The button or element that triggered the modal for focus restoration
 * @param {Function} [options.onConfirmed] - Optional callback after signout
 * @param {Function} [options.onCancelled] - Optional callback on cancellation
 */
export function openLogoutConfirmationModal(options = {}) {
  const { triggerElement = null, onConfirmed = null, onCancelled = null } = options;

  let modal = document.getElementById('logout-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'logout-confirm-modal';
    modal.className = 'auth-modal-backdrop active';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'logout-modal-title');
    modal.setAttribute('aria-describedby', 'logout-modal-desc');
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card logout-modal-dialog" style="max-width: 420px; text-align: center; padding: 32px 28px; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.25); box-shadow: 0 25px 60px rgba(0,0,0,0.7); position: relative; animation: modalFadeIn 0.2s ease-out;">
      <button type="button" class="auth-modal-close" id="btn-logout-cancel-x" aria-label="Close dialog" style="position: absolute; top: 14px; right: 14px; background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
        <i data-lucide="x" style="width: 20px; height: 20px;"></i>
      </button>
      
      <!-- Icon Badge -->
      <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 18px;">
        <i data-lucide="log-out" style="width: 28px; height: 28px; color: #EF4444;"></i>
      </div>

      <!-- Title & Message -->
      <h3 id="logout-modal-title" style="font-size: 1.35rem; font-weight: 700; color: #FFFFFF; margin: 0 0 8px 0; letter-spacing: -0.01em;">
        Sign out?
      </h3>
      <p id="logout-modal-desc" style="font-size: 0.92rem; color: #94A3B8; margin: 0 0 28px 0; line-height: 1.5;">
        Are you sure you want to sign out of your PropPartner account?
      </p>

      <!-- Action Buttons -->
      <div class="logout-actions-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <button type="button" class="btn btn-secondary" id="btn-logout-cancel" style="min-height: 46px; font-weight: 600; font-size: 0.95rem; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          Cancel
        </button>
        <button type="button" class="btn" id="btn-logout-confirm" style="min-height: 46px; font-weight: 600; font-size: 0.95rem; background: #EF4444; color: #FFFFFF; border: none; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s ease;">
          <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const cancelBtn = modal.querySelector('#btn-logout-cancel');
  const cancelXBtn = modal.querySelector('#btn-logout-cancel-x');
  const confirmBtn = modal.querySelector('#btn-logout-confirm');

  // Focus Cancel button by default for safety
  setTimeout(() => {
    if (cancelBtn) cancelBtn.focus();
  }, 50);

  function closeModal() {
    modal.classList.remove('active');
    document.removeEventListener('keydown', handleKeyDown);
    if (triggerElement && typeof triggerElement.focus === 'function') {
      triggerElement.focus();
    }
  }

  function handleCancel() {
    closeModal();
    if (typeof onCancelled === 'function') {
      onCancelled();
    }
  }

  function handleConfirm() {
    // 1. Disable the button temporarily to prevent duplicate clicks
    confirmBtn.disabled = true;
    confirmBtn.style.opacity = '0.7';
    confirmBtn.style.cursor = 'not-allowed';
    confirmBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" style="display: inline-block; width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></span>
      <span>Signing out...</span>
    `;

    // 2. Set flash message for login page
    try {
      sessionStorage.setItem('proppartner_logout_msg', 'You have been signed out successfully.');
    } catch (e) {}

    // 3. Securely invalidate authentication session
    setTimeout(() => {
      authStore.logout();
      closeModal();

      // 4. Update route & view to login
      window.location.hash = '#login';
      if (typeof evaluateRouting === 'function') {
        evaluateRouting();
      }

      if (typeof onConfirmed === 'function') {
        onConfirmed();
      }
    }, 250);
  }

  // Keyboard accessibility and focus trap
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = [cancelXBtn, cancelBtn, confirmBtn].filter(Boolean);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  // Click handlers
  if (cancelBtn) cancelBtn.onclick = handleCancel;
  if (cancelXBtn) cancelXBtn.onclick = handleCancel;
  if (confirmBtn) confirmBtn.onclick = handleConfirm;

  // Backdrop click closes safely without logging out
  modal.onclick = (e) => {
    if (e.target === modal) {
      handleCancel();
    }
  };
}
