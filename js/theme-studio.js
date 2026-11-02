/**
 * =====================================================
 * WEDDING THEME STUDIO — theme-studio.js
 * 3 Themes · 3 Font pairs · Midnight dark mode
 * Shanmugasundaram × Srimathi | 16 November 2026
 * =====================================================
 *
 * Provides:
 *  - Three colour themes (Burgundy / Midnight dark / Sage)
 *  - Three font pairs applied via data-font attribute
 *  - Floating FAB button + animated panel
 *  - localStorage persistence
 *  - Smooth cross-fade transitions
 *  - Reset to defaults
 */

'use strict';

(function initThemeStudio() {

  /* ── Config ────────────────────────────────────────── */
  const DEFAULT_THEME = 'burgundy';
  const DEFAULT_FONT  = 'classic';
  const LS_THEME      = 'weddingTheme';
  const LS_FONT       = 'weddingFont';

  const THEMES = [
    {
      id:   'burgundy',
      name: 'Royal Burgundy',
      desc: 'Burgundy · Cream · Antique Gold',
      dots: ['#701E32', '#F8F0DF', '#B79555'],
    },
    {
      id:   'midnight',
      name: 'Midnight',
      desc: 'Deep Navy · Charcoal · Violet',
      dots: ['#1A1D2E', '#7B6CF0', '#8A9BB8'],
    },
    {
      id:   'sage',
      name: 'Sage Romance',
      desc: 'Sage Green · Ivory · Champagne Gold',
      dots: ['#3E6B38', '#F4F2EC', '#B0A060'],
    },
  ];

  const FONTS = [
    {
      id:     'classic',
      name:   'Classic',
      pair:   'Cormorant Garamond + Lato',
      glyph:  'Aa',
    },
    {
      id:     'romantic',
      name:   'Romantic',
      pair:   'Playfair Display + EB Garamond',
      glyph:  'Aa',
    },
    {
      id:     'modern',
      name:   'Modern',
      pair:   'Libre Baskerville + DM Sans',
      glyph:  'Aa',
    },
  ];

  /* ── SVG icons (inline, no external deps) ─────────── */
  const ICON_PALETTE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/>
    <circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>`;

  const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;

  const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;

  const ICON_RESET = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
  </svg>`;

  /* ── State ─────────────────────────────────────────── */
  const VALID_THEMES = ['burgundy', 'midnight', 'sage'];
  const VALID_FONTS  = ['classic', 'romantic', 'modern'];

  let currentTheme = localStorage.getItem(LS_THEME) || DEFAULT_THEME;
  let currentFont  = localStorage.getItem(LS_FONT)  || DEFAULT_FONT;

  // Guard against stale localStorage values (e.g. 'rose' or 'violet' from old version)
  if (!VALID_THEMES.includes(currentTheme)) { currentTheme = DEFAULT_THEME; localStorage.setItem(LS_THEME, currentTheme); }
  if (!VALID_FONTS.includes(currentFont))   { currentFont  = DEFAULT_FONT;  localStorage.setItem(LS_FONT,  currentFont); }

  let panelOpen = false;

  /* ── Build panel HTML ──────────────────────────────── */
  function buildPanel() {
    // Theme rows
    const themeRows = THEMES.map(t => `
      <button class="ts-theme-row${t.id === currentTheme ? ' ts-active' : ''}"
              data-theme-id="${t.id}"
              aria-pressed="${t.id === currentTheme}"
              aria-label="Apply ${t.name} theme"
              type="button">
        <div class="ts-swatches" aria-hidden="true">
          ${t.dots.map(c => `<span class="ts-dot" style="background:${c}"></span>`).join('')}
        </div>
        <div class="ts-theme-info">
          <span class="ts-theme-name">${t.name}</span>
          <span class="ts-theme-desc">${t.desc}</span>
        </div>
        <span class="ts-check" aria-hidden="true">${ICON_CHECK}</span>
      </button>`).join('');

    // Font rows
    const fontRows = FONTS.map(f => `
      <button class="ts-font-row${f.id === currentFont ? ' ts-active' : ''}"
              data-font-id="${f.id}"
              data-font="${f.id}"
              aria-pressed="${f.id === currentFont}"
              aria-label="Apply ${f.name} font"
              type="button">
        <div class="ts-font-glyph" aria-hidden="true"><span>${f.glyph}</span></div>
        <div class="ts-font-info">
          <span class="ts-font-name">${f.name}</span>
          <span class="ts-font-pair">${f.pair}</span>
        </div>
        <span class="ts-check" aria-hidden="true">${ICON_CHECK}</span>
      </button>`).join('');

    return `
    <!-- Theme backdrop -->
    <div id="theme-backdrop" role="presentation"></div>

    <!-- Floating FAB -->
    <button id="theme-fab" aria-label="Open Wedding Theme Studio" aria-expanded="false" type="button">
      ${ICON_PALETTE}
      <span>Theme</span>
    </button>

    <!-- Theme panel -->
    <div id="theme-panel" role="dialog" aria-modal="true" aria-label="Wedding Theme Studio">
      <div class="ts-header">
        <div class="ts-header-left">
          <div class="ts-header-icon" aria-hidden="true">${ICON_PALETTE}</div>
          <div class="ts-header-text">
            <span class="ts-title">Theme Studio</span>
            <span class="ts-subtitle">Wedding Customiser</span>
          </div>
        </div>
        <button class="ts-close" id="ts-close-btn" aria-label="Close Theme Studio" type="button">
          ${ICON_CLOSE}
        </button>
      </div>

      <div class="ts-body">
        <div>
          <p class="ts-group-label">Colour Theme</p>
          <div class="ts-themes">${themeRows}</div>
        </div>
        <div>
          <p class="ts-group-label">Font Style</p>
          <div class="ts-fonts">${fontRows}</div>
        </div>
      </div>

      <div class="ts-panel-footer">
        <div class="ts-divider"></div>
        <button class="ts-reset" id="ts-reset-btn" type="button" aria-label="Reset to default theme and font">
          ${ICON_RESET} Reset to Default
        </button>
      </div>
    </div>`;
  }

  /* ── Inject into DOM ───────────────────────────────── */
  function inject() {
    const wrapper = document.createElement('div');
    wrapper.id = 'theme-studio-root';
    wrapper.innerHTML = buildPanel();
    document.body.appendChild(wrapper);
  }

  /* ── Apply theme ───────────────────────────────────── */
  function applyTheme(id, save) {
    const html = document.documentElement;

    // Brief transition class so colours glide
    html.classList.add('ts-transitioning');
    clearTimeout(applyTheme._tid);
    applyTheme._tid = setTimeout(() => html.classList.remove('ts-transitioning'), 460);

    html.setAttribute('data-theme', id);
    currentTheme = id;

    if (save) localStorage.setItem(LS_THEME, id);

    // Update FAB colour immediately to match new theme
    const fab = document.getElementById('theme-fab');
    if (fab) {
      // The FAB uses CSS var(--burgundy) which updates via data-theme — no extra JS needed
    }

    // Re-sync active states
    syncActive();
  }

  /* ── Apply font ────────────────────────────────────── */
  function applyFont(id, save) {
    document.documentElement.setAttribute('data-font', id);
    currentFont = id;
    if (save) localStorage.setItem(LS_FONT, id);
    syncActive();
  }

  /* ── Sync active indicators ─────────────────────────── */
  function syncActive() {
    document.querySelectorAll('.ts-theme-row').forEach(btn => {
      const active = btn.dataset.themeId === currentTheme;
      btn.classList.toggle('ts-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    document.querySelectorAll('.ts-font-row').forEach(btn => {
      const active = btn.dataset.fontId === currentFont;
      btn.classList.toggle('ts-active', active);
      btn.setAttribute('aria-pressed', active);
    });
  }

  /* ── Panel open / close ────────────────────────────── */
  function openPanel() {
    panelOpen = true;
    const panel    = document.getElementById('theme-panel');
    const backdrop = document.getElementById('theme-backdrop');
    const fab      = document.getElementById('theme-fab');
    if (panel)    panel.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    if (fab)      fab.setAttribute('aria-expanded', 'true');
    document.body.classList.add('ts-open');
    // focus first theme row
    const first = panel && panel.querySelector('.ts-theme-row');
    if (first) setTimeout(() => first.focus(), 80);
  }

  function closePanel() {
    panelOpen = false;
    const panel    = document.getElementById('theme-panel');
    const backdrop = document.getElementById('theme-backdrop');
    const fab      = document.getElementById('theme-fab');
    if (panel)    panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    if (fab) {
      fab.setAttribute('aria-expanded', 'false');
      fab.focus();
    }
    document.body.classList.remove('ts-open');
  }

  /* ── Wire events ────────────────────────────────────── */
  function wireEvents() {
    // FAB
    document.getElementById('theme-fab').addEventListener('click', () => {
      panelOpen ? closePanel() : openPanel();
    });

    // Close button
    document.getElementById('ts-close-btn').addEventListener('click', closePanel);

    // Backdrop click
    document.getElementById('theme-backdrop').addEventListener('click', closePanel);

    // Theme rows
    document.querySelectorAll('.ts-theme-row').forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.themeId, true));
    });

    // Font rows
    document.querySelectorAll('.ts-font-row').forEach(btn => {
      btn.addEventListener('click', () => applyFont(btn.dataset.fontId, true));
    });

    // Reset
    document.getElementById('ts-reset-btn').addEventListener('click', () => {
      applyTheme(DEFAULT_THEME, true);
      applyFont(DEFAULT_FONT, true);
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panelOpen) closePanel();
    });

    // Trap focus inside panel when open
    document.getElementById('theme-panel').addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const panel      = document.getElementById('theme-panel');
      const focusable  = Array.from(panel.querySelectorAll(
        'button, [tabindex="0"]'
      )).filter(el => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ── Load additional Google Fonts for Romantic & Modern ── */
  function loadExtraFonts() {
    const existing = document.querySelector('link[data-ts-fonts]');
    if (existing) return;
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.setAttribute('data-ts-fonts', '1');
    link.href = 'https://fonts.googleapis.com/css2?'
      + 'family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400'
      + '&family=Pinyon+Script'
      + '&family=EB+Garamond:ital,wght@0,400;0,500;1,400'
      + '&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400'
      + '&family=DM+Sans:wght@300;400;500;700'
      + '&display=swap';
    document.head.appendChild(link);
  }

  /* ── Initialise ─────────────────────────────────────── */
  function init() {
    // Apply saved prefs immediately (before first paint flicker)
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-font',  currentFont);

    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  function setup() {
    loadExtraFonts();
    inject();
    wireEvents();
    // Already applied theme/font attrs above; just ensure sync
    syncActive();
  }

  init();

})();

