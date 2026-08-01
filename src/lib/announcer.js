/**
 * A11y live-region announcer.
 */

export function announce(message, priority = 'polite') {
  const announcer = document.getElementById('announcer');
  if (!announcer) return;

  // Change to assertive temporarily if needed
  if (priority === 'assertive') {
    announcer.setAttribute('aria-live', 'assertive');
  }

  announcer.textContent = message;

  // Reset to polite after a short delay
  if (priority === 'assertive') {
    setTimeout(() => announcer.setAttribute('aria-live', 'polite'), 1000);
  }
}
