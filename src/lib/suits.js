/**
 * SVG suit symbols for card rendering.
 * Each is a clean SVG string, ~200-300 bytes, designed to look great at 2rem size.
 */

export const SUIT_SVGS = {
  '♠': `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false" role="img">
    <path d="M12 2C12 2 4 10 4 15C4 18.5 7 20 10 18L9 22H15L14 18C17 20 20 18.5 20 15C20 10 12 2 12 2Z"/>
    <rect x="10.5" y="20" width="3" height="2" rx="0.5"/>
  </svg>`,

  '♥': `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false" role="img">
    <path d="M12 21C12 21 4 14 4 8.5C4 5.5 6.5 3 9.5 3C11 3 12.5 4 12.5 4C12.5 4 14 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14 13 21 12 21Z"/>
  </svg>`,

  '♦': `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false" role="img">
    <path d="M12 2L18 12L12 22L6 12L12 2Z"/>
  </svg>`,

  '♣': `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false" role="img">
    <circle cx="12" cy="7" r="4.5"/>
    <circle cx="6" cy="15" r="4.5"/>
    <circle cx="18" cy="15" r="4.5"/>
    <rect x="10.5" y="17" width="3" height="5" rx="0.5"/>
  </svg>`,
};

export function getSuitSVG(suit) {
  return SUIT_SVGS[suit] || '';
}
