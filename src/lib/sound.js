/**
 * Sound — procedural sound effects via Web Audio API.
 * No external files. Volume and per-type toggles stored in localStorage.
 */

const STORAGE_KEY_ENABLED = 'kanam-sound-enabled';
const STORAGE_KEY_VOLUME = 'kanam-sound-volume';
const STORAGE_KEY_TYPES = 'kanam-sound-types';

let audioCtx = null;
let _enabled = null;
let _volume = null;
let _typeSettings = null;

const DEFAULT_VOLUME = 0.5;
const DEFAULT_TYPES = {
  click: true,
  slide: true,
  flip: true,
  foundation: true,
  victory: true,
};
const SOUND_TYPES = Object.keys(DEFAULT_TYPES);

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  if (_enabled === null) {
    const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
    _enabled = stored === null ? false : stored === 'true';
  }
  return _enabled;
}

export function setSoundEnabled(enabled) {
  _enabled = enabled;
  localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
}

export function getVolume() {
  if (_volume === null) {
    const stored = localStorage.getItem(STORAGE_KEY_VOLUME);
    const parsed = stored === null ? Number.NaN : Number.parseFloat(stored);
    _volume = Number.isNaN(parsed) ? DEFAULT_VOLUME : Math.max(0, Math.min(1, parsed));
  }
  return _volume;
}

export function setVolume(value) {
  _volume = Math.max(0, Math.min(1, value));
  localStorage.setItem(STORAGE_KEY_VOLUME, String(_volume));
}

export function isSoundTypeEnabled(type) {
  const settings = getTypeSettings();
  return settings[type] ?? DEFAULT_TYPES[type] ?? true;
}

export function setSoundTypeEnabled(type, enabled) {
  const settings = getTypeSettings();
  settings[type] = enabled;
  _typeSettings = settings;
  localStorage.setItem(STORAGE_KEY_TYPES, JSON.stringify(settings));
}

export function getTypeSettings() {
  if (_typeSettings === null) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TYPES);
      const parsed = stored ? JSON.parse(stored) : {};
      _typeSettings = { ...DEFAULT_TYPES, ...parsed };
    } catch {
      _typeSettings = { ...DEFAULT_TYPES };
    }
  }
  return { ..._typeSettings };
}

export function resetSoundSettings() {
  _enabled = false;
  _volume = DEFAULT_VOLUME;
  _typeSettings = { ...DEFAULT_TYPES };
  localStorage.setItem(STORAGE_KEY_ENABLED, 'false');
  localStorage.setItem(STORAGE_KEY_VOLUME, String(DEFAULT_VOLUME));
  localStorage.setItem(STORAGE_KEY_TYPES, JSON.stringify(DEFAULT_TYPES));
}

export { SOUND_TYPES, DEFAULT_VOLUME, DEFAULT_TYPES };

function play(type, fn) {
  if (!isSoundEnabled()) return;
  if (!isSoundTypeEnabled(type)) return;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const master = ctx.createGain();
    master.gain.setValueAtTime(getVolume(), ctx.currentTime);
    master.connect(ctx.destination);
    fn(ctx, master);
  } catch {
    // Silently fail — audio is not critical
  }
}

/**
 * Short click sound.
 */
export function playClick() {
  play('click', (ctx, master) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  });
}

/**
 * Card slide sound.
 */
export function playSlide() {
  play('slide', (ctx, master) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  });
}

/**
 * Card flip sound.
 */
export function playFlip() {
  play('flip', (ctx, master) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.setValueAtTime(900, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain).connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  });
}

/**
 * Card placed on foundation (pleasant chime).
 */
export function playFoundation() {
  play('foundation', (ctx, master) => {
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.3);
      osc.connect(gain).connect(master);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.3);
    });
  });
}

/**
 * Victory fanfare.
 */
export function playVictory() {
  play('victory', (ctx, master) => {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
      osc.connect(gain).connect(master);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  });
}
