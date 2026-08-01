/**
 * Modal — reusable confirmation dialog.
 *
 * Usage:
 *   showModal({
 *     title: 'New Game',
 *     message: 'Start a new game? Current progress will be lost.',
 *     confirmText: 'New Game',
 *     cancelText: 'Cancel',
 *     onConfirm: () => { ... },
 *   });
 */

import { getRules } from './rules.js';

/**
 * Show a help modal with the rules of the current game.
 */
export function showHelpModal(gameName) {
  const rules = getRules(gameName);
  if (!rules) return Promise.resolve(false);

  const sections = [];
  sections.push(`<p><strong>Goal:</strong> ${rules.goal}</p>`);
  sections.push(`<ul>${rules.rules.map((r) => `<li>${r}</li>`).join('')}</ul>`);
  if (rules.scoring) {
    sections.push(`<h3>Scoring</h3><ul>${rules.scoring.map((s) => `<li>${s}</li>`).join('')}</ul>`);
  }
  if (rules.variants) {
    sections.push(`<h3>Variants</h3><ul>${rules.variants.map((v) => `<li>${v}</li>`).join('')}</ul>`);
  }

  return showModal({
    title: `❓ ${rules.title} — Help`,
    message: `<div class="help-content">${sections.join('')}</div>`,
    confirmText: 'Got it',
    cancelText: null,
  });
}

export function showModal({ title, message, confirmText = 'OK', cancelText = 'Cancel', onConfirm, onCancel }) {
  // Remove any existing modal
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const box = document.createElement('div');
  box.className = 'modal-box';

  box.innerHTML = `
    <h2 class="modal-title">${title}</h2>
    <p class="modal-message">${message}</p>
    <div class="modal-actions">
      <button class="modal-btn modal-cancel">${cancelText}</button>
      <button class="modal-btn modal-confirm">${confirmText}</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    box.classList.add('visible');
  });

  // Focus confirm button
  const confirmBtn = box.querySelector('.modal-confirm');
  const cancelBtn = box.querySelector('.modal-cancel');
  confirmBtn.focus();

  return new Promise((resolve) => {
    const close = (result) => {
      overlay.classList.remove('visible');
      box.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
      if (result && onConfirm) onConfirm();
      if (!result && onCancel) onCancel();
      resolve(result);
    };

    confirmBtn.addEventListener('click', () => close(true));
    cancelBtn.addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });

    // Keyboard: Enter confirms, Escape cancels
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handler);
        close(false);
      }
      if (e.key === 'Enter' && document.activeElement === confirmBtn) {
        document.removeEventListener('keydown', handler);
        close(true);
      }
    });
  });
}
